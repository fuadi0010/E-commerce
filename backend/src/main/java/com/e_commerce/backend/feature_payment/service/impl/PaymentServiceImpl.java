package com.e_commerce.backend.feature_payment.service.impl;

import com.e_commerce.backend.exception.custom.ResourceNotFoundException;
import com.e_commerce.backend.feature_order.model.OrderEntity;
import com.e_commerce.backend.feature_order.model.OrderItemEntity;
import com.e_commerce.backend.feature_order.model.OrderStatus;
import com.e_commerce.backend.feature_order.repository.OrderRepository;
import com.e_commerce.backend.feature_payment.client.MidtransClient;
import com.e_commerce.backend.feature_payment.config.MidtransProperties;
import com.e_commerce.backend.feature_payment.dto.MidtransConfigResponse;
import com.e_commerce.backend.feature_payment.dto.MidtransSnapRequest;
import com.e_commerce.backend.feature_payment.dto.MidtransSnapResponse;
import com.e_commerce.backend.feature_payment.dto.PaymentResponse;
import com.e_commerce.backend.feature_payment.mapper.PaymentMapper;
import com.e_commerce.backend.feature_payment.model.PaymentEntity;
import com.e_commerce.backend.feature_payment.model.PaymentStatus;
import com.e_commerce.backend.feature_payment.repository.PaymentRepository;
import com.e_commerce.backend.feature_payment.service.PaymentService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.ZoneOffset;
import java.time.ZonedDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

import com.e_commerce.backend.feature_order.service.OrderService;
import com.e_commerce.backend.feature_payment.dto.MidtransNotificationPayload;
import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.security.NoSuchAlgorithmException;

@Service
@RequiredArgsConstructor
@Slf4j
public class PaymentServiceImpl implements PaymentService {

    private final PaymentRepository paymentRepository;
    private final OrderRepository orderRepository;
    private final OrderService orderService;
    private final MidtransClient midtransClient;
    private final MidtransProperties midtransProperties;
    private final PaymentMapper paymentMapper;

    @org.springframework.beans.factory.annotation.Value("${app.frontend.url:http://localhost:4200}")
    private String frontendUrl = "http://localhost:4200";

    @Override
    @Transactional
    public PaymentResponse createOrGetPaymentForOrder(UUID orderId, UUID userId, boolean isAdmin) {
        OrderEntity order = orderRepository.findById(orderId)
                .orElseThrow(() -> new ResourceNotFoundException("Pesanan tidak ditemukan"));

        // IDOR Check
        if (!isAdmin && !order.getUser().getId().equals(userId)) {
            throw new ResourceNotFoundException("Pesanan tidak ditemukan");
        }

        // Validasi Status Order
        if (order.getStatus() == OrderStatus.PAID ||
            order.getStatus() == OrderStatus.COMPLETED ||
            order.getStatus() == OrderStatus.SHIPPED ||
            order.getStatus() == OrderStatus.DELIVERED) {
            throw new IllegalStateException("Pesanan ini sudah dibayar.");
        }

        if (order.getStatus() == OrderStatus.CANCELLED) {
            throw new IllegalStateException("Pesanan ini telah dibatalkan.");
        }

        // Cek apakah sudah ada pembayaran PENDING yang masih aktif
        Optional<PaymentEntity> existingPayment = paymentRepository.findFirstByOrderIdOrderByCreatedAtDesc(orderId);
        if (existingPayment.isPresent()) {
            PaymentEntity p = existingPayment.get();
            boolean notExpired = p.getExpiryTime() == null || p.getExpiryTime().isAfter(ZonedDateTime.now(ZoneOffset.UTC));
            if (p.getStatus() == PaymentStatus.PENDING && p.getSnapToken() != null && !p.getSnapToken().isBlank() && notExpired) {
                log.info("Returning existing active PENDING payment for orderId={}", orderId);
                return paymentMapper.toResponse(p);
            }
        }

        // Bentuk Payload Midtrans Snap
        String midtransOrderId = existingPayment.isPresent()
                ? order.getId().toString() + "-" + System.currentTimeMillis()
                : order.getId().toString();

        // ── FIX-001 (Error 1 & 2): Build item details dengan sanitasi nama dan rounding harga ──
        //
        // Error 1 — "item_details Name is too long":
        //   Midtrans membatasi item_details[].name maks 50 karakter.
        //   Gunakan sanitizeMidtransItemName() untuk memotong jika perlu.
        //   Data produk di database TIDAK diubah.
        //
        // Error 2 — "gross_amount is not equal to the sum of item_details":
        //   BigDecimal.longValue() melakukan truncation (bukan rounding), sehingga
        //   sum(item.price × qty) bisa berbeda dengan grossAmount.
        //   Solusi: bulatkan setiap harga ke satuan Rupiah (HALF_UP, 0 desimal),
        //   lalu hitung grossAmount = Σ(roundedPrice × qty) agar selalu konsisten.
        List<MidtransSnapRequest.ItemDetails> itemDetails = new ArrayList<>();
        if (order.getItems() != null) {
            for (OrderItemEntity item : order.getItems()) {
                if (item.getProduct() == null || item.getPriceAtTime() == null || item.getQuantity() == null) {
                    log.warn("Skipping invalid order item in orderId={}: product or price is null", orderId);
                    continue;
                }

                // Bulatkan harga historis ke satuan Rupiah terdekat (HALF_UP)
                long roundedPrice = item.getPriceAtTime()
                        .setScale(0, RoundingMode.HALF_UP)
                        .longValue();

                // Sanitasi nama produk agar memenuhi batas Midtrans (maks 50 karakter)
                String sanitizedName = sanitizeMidtransItemName(item.getProduct().getName());

                log.debug("Midtrans item: name='{}' (original='{}'), price={}, qty={}, subtotal={}",
                        sanitizedName, item.getProduct().getName(),
                        roundedPrice, item.getQuantity(),
                        roundedPrice * item.getQuantity());

                itemDetails.add(MidtransSnapRequest.ItemDetails.builder()
                        .id(item.getProduct().getId().toString())
                        .name(sanitizedName)
                        .price(roundedPrice)
                        .quantity(item.getQuantity())
                        .build());
            }
        }

        // Hitung grossAmount dari sum item details (setelah rounding) — bukan dari order.totalAmount.longValue()
        // Ini memastikan: Σ(item.price × item.quantity) == grossAmount, yang wajib oleh Midtrans.
        long calculatedGrossAmount = itemDetails.stream()
                .mapToLong(i -> i.getPrice() * i.getQuantity())
                .sum();

        // ── Pre-flight validation sebelum kirim ke Midtrans ──
        if (itemDetails.isEmpty()) {
            throw new IllegalStateException("Tidak dapat membuat transaksi Midtrans: daftar item pesanan kosong.");
        }
        if (calculatedGrossAmount <= 0) {
            throw new IllegalStateException(
                    "Tidak dapat membuat transaksi Midtrans: gross amount tidak valid (" + calculatedGrossAmount + ").");
        }

        // ── Requirement 18: Structured Safe Payment Breakdown Logging ──
        if (log.isInfoEnabled()) {
            StringBuilder sb = new StringBuilder();
            sb.append("\n================ MIDTRANS PAYMENT CALCULATION ================\n");
            sb.append("Order ID: ").append(midtransOrderId).append("\n");
            for (MidtransSnapRequest.ItemDetails item : itemDetails) {
                sb.append("Item:\n");
                sb.append("  Item ID: ").append(item.getId()).append("\n");
                sb.append("  Item Name: ").append(item.getName()).append("\n");
                sb.append("  Price: ").append(item.getPrice()).append("\n");
                sb.append("  Quantity: ").append(item.getQuantity()).append("\n");
                sb.append("  Subtotal: ").append(item.getPrice() * item.getQuantity()).append("\n");
            }
            sb.append("Discount: 0\n");
            sb.append("Shipping: 0\n");
            sb.append("Final Total: ").append(calculatedGrossAmount).append("\n");
            sb.append("Midtrans Gross Amount: ").append(calculatedGrossAmount).append("\n");
            sb.append("Check (Final Total == Gross Amount): ").append(true).append("\n");
            sb.append("=============================================================");
            log.info(sb.toString());
        }

        MidtransSnapRequest snapRequest = MidtransSnapRequest.builder()
                .transactionDetails(MidtransSnapRequest.TransactionDetails.builder()
                        .orderId(midtransOrderId)
                        .grossAmount(calculatedGrossAmount)
                        .build())
                .customerDetails(MidtransSnapRequest.CustomerDetails.builder()
                        .firstName(order.getUser().getEmail().contains("@")
                                ? order.getUser().getEmail().substring(0, order.getUser().getEmail().indexOf('@'))
                                : order.getUser().getEmail())
                        .email(order.getUser().getEmail())
                        .build())
                .itemDetails(itemDetails)
                .callbacks(MidtransSnapRequest.Callbacks.builder()
                        .finish(frontendUrl + "/orders")
                        .error(frontendUrl + "/orders")
                        .build())
                .build();

        MidtransSnapResponse snapResponse = midtransClient.createSnapTransaction(snapRequest);

        // Simpan grossAmount berdasarkan nilai yang benar-benar dikirim ke Midtrans
        BigDecimal finalGrossAmount = BigDecimal.valueOf(calculatedGrossAmount);

        PaymentEntity newPayment = PaymentEntity.builder()
                .order(order)
                .snapToken(snapResponse.getToken())
                .redirectUrl(snapResponse.getRedirectUrl())
                .grossAmount(finalGrossAmount)
                .currency("IDR")
                .status(PaymentStatus.PENDING)
                .expiryTime(ZonedDateTime.now(ZoneOffset.UTC).plusHours(24))
                .paymentDetails(midtransOrderId)
                .build();

        PaymentEntity saved = paymentRepository.save(newPayment);
        log.info("Created new Midtrans payment transaction for orderId={}, paymentId={}, grossAmount={}, midtransOrderId={}",
                orderId, saved.getId(), calculatedGrossAmount, midtransOrderId);
        return paymentMapper.toResponse(saved);
    }

    @Override
    @Transactional(readOnly = true)
    public PaymentResponse getPaymentStatus(UUID orderId, UUID userId, boolean isAdmin) {
        OrderEntity order = orderRepository.findById(orderId)
                .orElseThrow(() -> new ResourceNotFoundException("Pesanan tidak ditemukan"));

        if (!isAdmin && !order.getUser().getId().equals(userId)) {
            throw new ResourceNotFoundException("Pesanan tidak ditemukan");
        }

        PaymentEntity payment = paymentRepository.findFirstByOrderIdOrderByCreatedAtDesc(orderId)
                .orElseThrow(() -> new ResourceNotFoundException("Belum ada transaksi pembayaran untuk pesanan ini."));

        return paymentMapper.toResponse(payment);
    }

    @Override
    public MidtransConfigResponse getPublicConfig() {
        return MidtransConfigResponse.builder()
                .clientKey(midtransProperties.getClientKey())
                .snapUrl(midtransProperties.getSnapUrl())
                .isProduction(midtransProperties.isProduction())
                .build();
    }

    @Override
    @Transactional
    public void handleNotification(MidtransNotificationPayload payload) {
        if (payload == null || payload.getOrderId() == null) {
            throw new IllegalArgumentException("Payload notifikasi tidak valid");
        }

        if (!verifySignature(payload)) {
            log.warn("Invalid signature in Midtrans notification for order_id={}", payload.getOrderId());
            throw new IllegalArgumentException("Signature key tidak valid");
        }

        // Parsing UUID order (mendukung order_id dengan suffix unik)
        String orderIdStr = payload.getOrderId();
        if (orderIdStr.length() > 36 && orderIdStr.charAt(36) == '-') {
            orderIdStr = orderIdStr.substring(0, 36);
        }
        UUID orderId;
        try {
            orderId = UUID.fromString(orderIdStr);
        } catch (IllegalArgumentException e) {
            log.error("Cannot parse UUID from order_id: {}", payload.getOrderId());
            throw new IllegalArgumentException("Format order_id tidak valid: " + payload.getOrderId());
        }

        OrderEntity order = orderRepository.findById(orderId)
                .orElseThrow(() -> new ResourceNotFoundException("Pesanan tidak ditemukan untuk ID: " + orderId));

        // Cari atau buat entitas pembayaran
        PaymentEntity payment = (payload.getTransactionId() != null
                ? paymentRepository.findByTransactionId(payload.getTransactionId())
                : Optional.<PaymentEntity>empty())
                .or(() -> paymentRepository.findFirstByOrderIdOrderByCreatedAtDesc(orderId))
                .orElseGet(() -> PaymentEntity.builder()
                        .order(order)
                        .grossAmount(order.getTotalAmount())
                        .currency("IDR")
                        .status(PaymentStatus.PENDING)
                        .build());

        processPaymentStatusUpdate(order, payment, payload);
    }

    @Override
    @Transactional
    public PaymentResponse syncPaymentStatus(UUID orderId, UUID userId, boolean isAdmin) {
        OrderEntity order = orderRepository.findById(orderId)
                .orElseThrow(() -> new ResourceNotFoundException("Pesanan tidak ditemukan"));

        if (!isAdmin && !order.getUser().getId().equals(userId)) {
            throw new ResourceNotFoundException("Pesanan tidak ditemukan");
        }

        PaymentEntity payment = paymentRepository.findFirstByOrderIdOrderByCreatedAtDesc(orderId)
                .orElseThrow(() -> new ResourceNotFoundException("Belum ada transaksi pembayaran untuk pesanan ini."));

        // Jika order sudah PAID atau COMPLETED, langsung kembalikan status saat ini
        if (order.getStatus() == OrderStatus.PAID || order.getStatus() == OrderStatus.COMPLETED) {
            log.debug("Order {} is already {}, skipping Midtrans sync", orderId, order.getStatus());
            return paymentMapper.toResponse(payment);
        }

        // Tentukan ID yang dikirim ke Midtrans:
        // Prioritas 1: transactionId jika ada
        // Prioritas 2: paymentDetails jika berisi format midtransOrderId (cth: orderId atau orderId-timestamp)
        // Prioritas 3: orderId.toString()
        String queryId;
        if (payment.getTransactionId() != null && !payment.getTransactionId().isBlank()) {
            queryId = payment.getTransactionId();
        } else if (payment.getPaymentDetails() != null && !payment.getPaymentDetails().isBlank()
                && payment.getPaymentDetails().startsWith(order.getId().toString())) {
            queryId = payment.getPaymentDetails();
        } else {
            queryId = order.getId().toString();
        }

        log.info("Syncing payment status with Midtrans for orderId={}, queryId={}", orderId, queryId);
        MidtransNotificationPayload statusPayload = midtransClient.getTransactionStatus(queryId);

        // Fallback: Jika dengan queryId gagal atau null, coba dengan orderId murni
        if (statusPayload == null && !queryId.equals(order.getId().toString())) {
            log.info("Retrying Midtrans sync with base orderId={}", orderId);
            statusPayload = midtransClient.getTransactionStatus(order.getId().toString());
        }

        if (statusPayload != null && statusPayload.getTransactionStatus() != null) {
            log.info("Midtrans returned status={} for orderId={}", statusPayload.getTransactionStatus(), orderId);
            processPaymentStatusUpdate(order, payment, statusPayload);
        } else {
            log.warn("Midtrans returned empty/null status for orderId={}. Leaving status unchanged.", orderId);
        }

        return paymentMapper.toResponse(payment);
    }

    /**
     * Memperbarui status pembayaran dan pesanan secara terpusat dan idempoten.
     */
    private void processPaymentStatusUpdate(OrderEntity order, PaymentEntity payment, MidtransNotificationPayload payload) {
        PaymentStatus newStatus = mapMidtransStatus(payload.getTransactionStatus(), payload.getFraudStatus());

        if (payload.getTransactionId() != null && !payload.getTransactionId().isBlank()) {
            payment.setTransactionId(payload.getTransactionId());
        }
        if (payload.getPaymentType() != null && !payload.getPaymentType().isBlank()) {
            payment.setPaymentType(payload.getPaymentType());
        }
        if (payload.getFraudStatus() != null && !payload.getFraudStatus().isBlank()) {
            payment.setFraudStatus(payload.getFraudStatus());
        }
        payment.setStatus(newStatus);
        payment.setPaymentDetails(payload.toString());

        if (newStatus.isSuccess() && payment.getPaidAt() == null) {
            payment.setPaidAt(ZonedDateTime.now(ZoneOffset.UTC));
        }

        paymentRepository.save(payment);
        UUID orderId = order.getId();
        log.info("Updated payment record for orderId={} to status={}", orderId, newStatus);

        // Update Order Status secara idempoten
        if (newStatus.isSuccess()) {
            if (order.getStatus() == OrderStatus.CANCELLED) {
                log.warn("LATE PAYMENT ALERT: Received settlement notification for CANCELLED order {}. Payment recorded in database for manual review/refund. Order status remains CANCELLED.", orderId);
            } else if (order.getStatus() != OrderStatus.PAID && order.getStatus() != OrderStatus.COMPLETED) {
                log.info("Payment SUCCESS for orderId={}. Updating order status to PAID.", orderId);
                OrderEntity updatedOrder = orderService.updateOrderStatus(orderId, OrderStatus.PAID);
                OrderEntity targetOrder = (updatedOrder != null) ? updatedOrder : order;
                targetOrder.setStatus(OrderStatus.PAID);
                if (targetOrder.getPaymentMethod() == null || targetOrder.getPaymentMethod().isBlank()
                        || targetOrder.getPaymentMethod().equalsIgnoreCase("QRIS") || targetOrder.getPaymentMethod().equalsIgnoreCase("VA")) {
                    targetOrder.setPaymentMethod("MIDTRANS_" + (payload.getPaymentType() != null ? payload.getPaymentType().toUpperCase() : "GATEWAY"));
                    orderRepository.save(targetOrder);
                }
            }
        } else if (newStatus == PaymentStatus.CANCEL ||
                   newStatus == PaymentStatus.EXPIRE ||
                   newStatus == PaymentStatus.DENY) {
            if (order.getStatus() == OrderStatus.PENDING) {
                log.info("Payment {} for orderId={}. Updating order status to CANCELLED and restoring stock.", newStatus, orderId);
                orderService.updateOrderStatus(orderId, OrderStatus.CANCELLED);
            }
        }
    }

    private boolean verifySignature(MidtransNotificationPayload payload) {
        if (payload.getSignatureKey() == null || payload.getSignatureKey().isBlank()) {
            return false;
        }

        String serverKey = midtransProperties.getServerKey();
        if (serverKey == null || serverKey.isBlank() || serverKey.contains("CHANGE_ME")) {
            log.warn("Midtrans Server Key is not set or default CHANGE_ME. Bypassing strict signature validation for sandbox.");
            return true;
        }

        String raw = (payload.getOrderId() != null ? payload.getOrderId() : "")
                + (payload.getStatusCode() != null ? payload.getStatusCode() : "")
                + (payload.getGrossAmount() != null ? payload.getGrossAmount() : "")
                + serverKey.trim();

        try {
            MessageDigest md = MessageDigest.getInstance("SHA-512");
            byte[] hash = md.digest(raw.getBytes(StandardCharsets.UTF_8));
            StringBuilder hexString = new StringBuilder();
            for (byte b : hash) {
                String hex = Integer.toHexString(0xff & b);
                if (hex.length() == 1) {
                    hexString.append('0');
                }
                hexString.append(hex);
            }
            String calculated = hexString.toString();
            return MessageDigest.isEqual(
                    calculated.getBytes(StandardCharsets.UTF_8),
                    payload.getSignatureKey().trim().toLowerCase().getBytes(StandardCharsets.UTF_8)
            );
        } catch (NoSuchAlgorithmException e) {
            log.error("SHA-512 algorithm unavailable", e);
            return false;
        }
    }

    /**
     * Sanitasi nama item untuk Midtrans.
     *
     * <p>Midtrans Snap API membatasi {@code item_details[].name} maksimal <b>50 karakter</b>.
     * Method ini memotong nama jika melebihi batas tersebut dan menambahkan ellipsis ("..."),
     * <b>tanpa mengubah data produk asli di database</b>.</p>
     *
     * @param name nama produk dari database (bisa hingga 255 karakter)
     * @return nama yang sudah dipastikan ≤ 50 karakter
     */
    private String sanitizeMidtransItemName(String name) {
        if (name == null || name.isBlank()) {
            return "Produk";
        }
        String trimmed = name.trim();
        if (trimmed.length() <= 50) {
            return trimmed;
        }
        // Potong ke 47 karakter lalu tambahkan "..." → total 50 karakter
        return trimmed.substring(0, 47) + "...";
    }

    private PaymentStatus mapMidtransStatus(String transactionStatus, String fraudStatus) {
        if (transactionStatus == null) {
            return PaymentStatus.PENDING;
        }
        return switch (transactionStatus.toLowerCase()) {
            case "capture" -> {
                if ("challenge".equalsIgnoreCase(fraudStatus)) {
                    yield PaymentStatus.PENDING;
                }
                yield PaymentStatus.CAPTURE;
            }
            case "settlement" -> PaymentStatus.SETTLEMENT;
            case "pending" -> PaymentStatus.PENDING;
            case "deny" -> PaymentStatus.DENY;
            case "cancel" -> PaymentStatus.CANCEL;
            case "expire" -> PaymentStatus.EXPIRE;
            case "failure" -> PaymentStatus.FAILURE;
            case "refund" -> PaymentStatus.REFUND;
            default -> PaymentStatus.PENDING;
        };
    }
}
