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
import com.e_commerce.backend.feature_product.model.ProductEntity;
import com.e_commerce.backend.feature_user.model.UserEntity;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.Spy;
import org.mockito.junit.jupiter.MockitoExtension;

import java.math.BigDecimal;
import java.time.ZoneOffset;
import java.time.ZonedDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
@DisplayName("PaymentServiceImpl Unit Tests")
class PaymentServiceImplTest {

    @Mock
    private PaymentRepository paymentRepository;

    @Mock
    private OrderRepository orderRepository;

    @Mock
    private com.e_commerce.backend.feature_order.service.OrderService orderService;

    @Mock
    private MidtransClient midtransClient;

    @Mock
    private MidtransProperties midtransProperties;

    @Spy
    private PaymentMapper paymentMapper = new PaymentMapper();

    @InjectMocks
    private PaymentServiceImpl paymentService;

    private UserEntity user;
    private OrderEntity order;
    private UUID userId;
    private UUID orderId;

    @BeforeEach
    void setUp() {
        userId = UUID.randomUUID();
        orderId = UUID.randomUUID();

        user = new UserEntity();
        user.setId(userId);
        user.setEmail("testuser@example.com");

        ProductEntity product = ProductEntity.builder()
                .id(UUID.randomUUID())
                .name("Kemeja Kasual")
                .price(BigDecimal.valueOf(150000))
                .build();

        OrderItemEntity item = new OrderItemEntity();
        item.setId(UUID.randomUUID());
        item.setProduct(product);
        item.setPriceAtTime(BigDecimal.valueOf(150000));
        item.setQuantity(2);

        order = OrderEntity.builder()
                .id(orderId)
                .user(user)
                .status(OrderStatus.PENDING)
                .totalAmount(BigDecimal.valueOf(300000))
                .items(new ArrayList<>(List.of(item)))
                .build();
    }

    @Test
    @DisplayName("createOrGetPayment: Berhasil membuat token Midtrans baru untuk order pending")
    void createOrGetPayment_Success_NewTransaction() {
        when(orderRepository.findById(orderId)).thenReturn(Optional.of(order));
        when(paymentRepository.findFirstByOrderIdOrderByCreatedAtDesc(orderId)).thenReturn(Optional.empty());

        MidtransSnapResponse snapResponse = MidtransSnapResponse.builder()
                .token("snap-token-abc-123")
                .redirectUrl("https://app.sandbox.midtrans.com/snap/v2/vtweb/snap-token-abc-123")
                .build();
        when(midtransClient.createSnapTransaction(any(MidtransSnapRequest.class))).thenReturn(snapResponse);

        when(paymentRepository.save(any(PaymentEntity.class))).thenAnswer(invocation -> {
            PaymentEntity entity = invocation.getArgument(0);
            entity.setId(UUID.randomUUID());
            return entity;
        });

        PaymentResponse response = paymentService.createOrGetPaymentForOrder(orderId, userId, false);

        assertNotNull(response);
        assertEquals("snap-token-abc-123", response.getSnapToken());
        assertEquals("https://app.sandbox.midtrans.com/snap/v2/vtweb/snap-token-abc-123", response.getRedirectUrl());
        assertEquals(PaymentStatus.PENDING, response.getStatus());
        assertEquals(BigDecimal.valueOf(300000), response.getGrossAmount());
        verify(midtransClient, times(1)).createSnapTransaction(any());
        verify(paymentRepository, times(1)).save(any());
    }

    @Test
    @DisplayName("createOrGetPayment: Mengembalikan pembayaran PENDING yang masih aktif tanpa memanggil ulang API Midtrans")
    void createOrGetPayment_ReturnsExistingActivePending() {
        PaymentEntity existing = PaymentEntity.builder()
                .id(UUID.randomUUID())
                .order(order)
                .snapToken("existing-snap-token")
                .redirectUrl("https://app.sandbox.midtrans.com/snap/v2/vtweb/existing")
                .grossAmount(order.getTotalAmount())
                .currency("IDR")
                .status(PaymentStatus.PENDING)
                .expiryTime(ZonedDateTime.now(ZoneOffset.UTC).plusHours(12))
                .build();

        when(orderRepository.findById(orderId)).thenReturn(Optional.of(order));
        when(paymentRepository.findFirstByOrderIdOrderByCreatedAtDesc(orderId)).thenReturn(Optional.of(existing));

        PaymentResponse response = paymentService.createOrGetPaymentForOrder(orderId, userId, false);

        assertNotNull(response);
        assertEquals("existing-snap-token", response.getSnapToken());
        assertEquals(PaymentStatus.PENDING, response.getStatus());
        verify(midtransClient, never()).createSnapTransaction(any());
        verify(paymentRepository, never()).save(any());
    }

    @Test
    @DisplayName("createOrGetPayment: Pesanan tidak ditemukan melempar ResourceNotFoundException")
    void createOrGetPayment_OrderNotFound() {
        when(orderRepository.findById(orderId)).thenReturn(Optional.empty());

        assertThrows(ResourceNotFoundException.class,
                () -> paymentService.createOrGetPaymentForOrder(orderId, userId, false));
    }

    @Test
    @DisplayName("createOrGetPayment: IDOR Protection melempar ResourceNotFoundException jika diakses user lain")
    void createOrGetPayment_IdorProtection() {
        UUID otherUserId = UUID.randomUUID();
        when(orderRepository.findById(orderId)).thenReturn(Optional.of(order));

        assertThrows(ResourceNotFoundException.class,
                () -> paymentService.createOrGetPaymentForOrder(orderId, otherUserId, false));
    }

    @Test
    @DisplayName("createOrGetPayment: Admin dapat membuat pembayaran untuk pesanan user lain")
    void createOrGetPayment_AdminBypassesOwnership() {
        UUID adminId = UUID.randomUUID();
        when(orderRepository.findById(orderId)).thenReturn(Optional.of(order));
        when(paymentRepository.findFirstByOrderIdOrderByCreatedAtDesc(orderId)).thenReturn(Optional.empty());

        MidtransSnapResponse snapResponse = MidtransSnapResponse.builder()
                .token("admin-snap-token")
                .redirectUrl("https://app.sandbox.midtrans.com/snap/v2/vtweb/admin")
                .build();
        when(midtransClient.createSnapTransaction(any())).thenReturn(snapResponse);
        when(paymentRepository.save(any(PaymentEntity.class))).thenAnswer(inv -> inv.getArgument(0));

        PaymentResponse response = paymentService.createOrGetPaymentForOrder(orderId, adminId, true);

        assertNotNull(response);
        assertEquals("admin-snap-token", response.getSnapToken());
    }

    @Test
    @DisplayName("createOrGetPayment: Order sudah lunas melempar IllegalStateException")
    void createOrGetPayment_OrderAlreadyPaid() {
        order.setStatus(OrderStatus.PAID);
        when(orderRepository.findById(orderId)).thenReturn(Optional.of(order));

        IllegalStateException ex = assertThrows(IllegalStateException.class,
                () -> paymentService.createOrGetPaymentForOrder(orderId, userId, false));
        assertEquals("Pesanan ini sudah dibayar.", ex.getMessage());
    }

    @Test
    @DisplayName("createOrGetPayment: Order dibatalkan melempar IllegalStateException")
    void createOrGetPayment_OrderCancelled() {
        order.setStatus(OrderStatus.CANCELLED);
        when(orderRepository.findById(orderId)).thenReturn(Optional.of(order));

        IllegalStateException ex = assertThrows(IllegalStateException.class,
                () -> paymentService.createOrGetPaymentForOrder(orderId, userId, false));
        assertEquals("Pesanan ini telah dibatalkan.", ex.getMessage());
    }

    @Test
    @DisplayName("getPaymentStatus: Berhasil mengambil status pembayaran pesanan")
    void getPaymentStatus_Success() {
        PaymentEntity payment = PaymentEntity.builder()
                .id(UUID.randomUUID())
                .order(order)
                .snapToken("snap-123")
                .grossAmount(order.getTotalAmount())
                .status(PaymentStatus.SETTLEMENT)
                .build();

        when(orderRepository.findById(orderId)).thenReturn(Optional.of(order));
        when(paymentRepository.findFirstByOrderIdOrderByCreatedAtDesc(orderId)).thenReturn(Optional.of(payment));

        PaymentResponse response = paymentService.getPaymentStatus(orderId, userId, false);

        assertNotNull(response);
        assertEquals(PaymentStatus.SETTLEMENT, response.getStatus());
    }

    @Test
    @DisplayName("getPaymentStatus: Belum ada transaksi melempar ResourceNotFoundException")
    void getPaymentStatus_NoPaymentFound() {
        when(orderRepository.findById(orderId)).thenReturn(Optional.of(order));
        when(paymentRepository.findFirstByOrderIdOrderByCreatedAtDesc(orderId)).thenReturn(Optional.empty());

        assertThrows(ResourceNotFoundException.class,
                () -> paymentService.getPaymentStatus(orderId, userId, false));
    }

    @Test
    @DisplayName("getPublicConfig: Mengembalikan clientKey dan snapUrl tanpa serverKey")
    void getPublicConfig_Success() {
        when(midtransProperties.getClientKey()).thenReturn("SB-Mid-client-sample");
        when(midtransProperties.getSnapUrl()).thenReturn("https://app.sandbox.midtrans.com/snap/snap.js");
        when(midtransProperties.isProduction()).thenReturn(false);

        MidtransConfigResponse config = paymentService.getPublicConfig();

        assertNotNull(config);
        assertEquals("SB-Mid-client-sample", config.getClientKey());
        assertEquals("https://app.sandbox.midtrans.com/snap/snap.js", config.getSnapUrl());
        assertFalse(config.isProduction());
    }

    private String calculateSignature(String orderId, String statusCode, String grossAmount, String serverKey) throws Exception {
        java.security.MessageDigest md = java.security.MessageDigest.getInstance("SHA-512");
        byte[] hash = md.digest((orderId + statusCode + grossAmount + serverKey).getBytes(java.nio.charset.StandardCharsets.UTF_8));
        StringBuilder hexString = new StringBuilder();
        for (byte b : hash) {
            String hex = Integer.toHexString(0xff & b);
            if (hex.length() == 1) hexString.append('0');
            hexString.append(hex);
        }
        return hexString.toString();
    }

    @Test
    @DisplayName("handleNotification: Settlement berhasil memperbarui order ke PAID dan payment ke SETTLEMENT")
    void handleNotification_Settlement_UpdatesOrderToPaid() throws Exception {
        String serverKey = "SB-Mid-server-testkey123";
        when(midtransProperties.getServerKey()).thenReturn(serverKey);

        String orderIdStr = orderId.toString();
        String signature = calculateSignature(orderIdStr, "200", "300000.00", serverKey);

        com.e_commerce.backend.feature_payment.dto.MidtransNotificationPayload payload =
                com.e_commerce.backend.feature_payment.dto.MidtransNotificationPayload.builder()
                        .orderId(orderIdStr)
                        .statusCode("200")
                        .grossAmount("300000.00")
                        .signatureKey(signature)
                        .transactionStatus("settlement")
                        .paymentType("qris")
                        .transactionId("trx-settlement-123")
                        .build();

        PaymentEntity existingPayment = PaymentEntity.builder()
                .id(UUID.randomUUID())
                .order(order)
                .status(PaymentStatus.PENDING)
                .build();

        when(orderRepository.findById(orderId)).thenReturn(Optional.of(order));
        when(paymentRepository.findByTransactionId("trx-settlement-123")).thenReturn(Optional.of(existingPayment));

        paymentService.handleNotification(payload);

        assertEquals(PaymentStatus.SETTLEMENT, existingPayment.getStatus());
        assertEquals("trx-settlement-123", existingPayment.getTransactionId());
        assertEquals("qris", existingPayment.getPaymentType());
        assertNotNull(existingPayment.getPaidAt());
        verify(paymentRepository, times(1)).save(existingPayment);
        verify(orderService, times(1)).updateOrderStatus(orderId, OrderStatus.PAID);
    }

    @Test
    @DisplayName("handleNotification: Capture dengan fraud status accept memperbarui order ke PAID")
    void handleNotification_Capture_Accept_UpdatesOrderToPaid() throws Exception {
        String serverKey = "SB-Mid-server-testkey123";
        when(midtransProperties.getServerKey()).thenReturn(serverKey);

        String orderIdStr = orderId.toString();
        String signature = calculateSignature(orderIdStr, "200", "300000.00", serverKey);

        com.e_commerce.backend.feature_payment.dto.MidtransNotificationPayload payload =
                com.e_commerce.backend.feature_payment.dto.MidtransNotificationPayload.builder()
                        .orderId(orderIdStr)
                        .statusCode("200")
                        .grossAmount("300000.00")
                        .signatureKey(signature)
                        .transactionStatus("capture")
                        .fraudStatus("accept")
                        .paymentType("credit_card")
                        .transactionId("trx-cc-123")
                        .build();

        when(orderRepository.findById(orderId)).thenReturn(Optional.of(order));
        when(paymentRepository.findByTransactionId("trx-cc-123")).thenReturn(Optional.empty());
        when(paymentRepository.findFirstByOrderIdOrderByCreatedAtDesc(orderId)).thenReturn(Optional.empty());

        paymentService.handleNotification(payload);

        verify(orderService, times(1)).updateOrderStatus(orderId, OrderStatus.PAID);
    }

    @Test
    @DisplayName("handleNotification: Capture dengan fraud status challenge mempertahankan status PENDING")
    void handleNotification_Capture_Challenge_KeepsPending() throws Exception {
        String serverKey = "SB-Mid-server-testkey123";
        when(midtransProperties.getServerKey()).thenReturn(serverKey);

        String orderIdStr = orderId.toString();
        String signature = calculateSignature(orderIdStr, "201", "300000.00", serverKey);

        com.e_commerce.backend.feature_payment.dto.MidtransNotificationPayload payload =
                com.e_commerce.backend.feature_payment.dto.MidtransNotificationPayload.builder()
                        .orderId(orderIdStr)
                        .statusCode("201")
                        .grossAmount("300000.00")
                        .signatureKey(signature)
                        .transactionStatus("capture")
                        .fraudStatus("challenge")
                        .paymentType("credit_card")
                        .transactionId("trx-challenge-123")
                        .build();

        when(orderRepository.findById(orderId)).thenReturn(Optional.of(order));
        when(paymentRepository.findByTransactionId("trx-challenge-123")).thenReturn(Optional.empty());
        when(paymentRepository.findFirstByOrderIdOrderByCreatedAtDesc(orderId)).thenReturn(Optional.empty());

        paymentService.handleNotification(payload);

        verify(orderService, never()).updateOrderStatus(any(), any());
    }

    @Test
    @DisplayName("handleNotification: Expire membatalkan pesanan (CANCELLED) dan mengembalikan stok")
    void handleNotification_Expire_CancelsOrder() throws Exception {
        String serverKey = "SB-Mid-server-testkey123";
        when(midtransProperties.getServerKey()).thenReturn(serverKey);

        String orderIdStr = orderId.toString();
        String signature = calculateSignature(orderIdStr, "202", "300000.00", serverKey);

        com.e_commerce.backend.feature_payment.dto.MidtransNotificationPayload payload =
                com.e_commerce.backend.feature_payment.dto.MidtransNotificationPayload.builder()
                        .orderId(orderIdStr)
                        .statusCode("202")
                        .grossAmount("300000.00")
                        .signatureKey(signature)
                        .transactionStatus("expire")
                        .paymentType("qris")
                        .transactionId("trx-expired-123")
                        .build();

        when(orderRepository.findById(orderId)).thenReturn(Optional.of(order));
        when(paymentRepository.findByTransactionId("trx-expired-123")).thenReturn(Optional.empty());
        when(paymentRepository.findFirstByOrderIdOrderByCreatedAtDesc(orderId)).thenReturn(Optional.empty());

        paymentService.handleNotification(payload);

        verify(orderService, times(1)).updateOrderStatus(orderId, OrderStatus.CANCELLED);
    }

    @Test
    @DisplayName("handleNotification: Cancel membatalkan pesanan (CANCELLED)")
    void handleNotification_Cancel_CancelsOrder() throws Exception {
        String serverKey = "SB-Mid-server-testkey123";
        when(midtransProperties.getServerKey()).thenReturn(serverKey);

        String orderIdStr = orderId.toString();
        String signature = calculateSignature(orderIdStr, "202", "300000.00", serverKey);

        com.e_commerce.backend.feature_payment.dto.MidtransNotificationPayload payload =
                com.e_commerce.backend.feature_payment.dto.MidtransNotificationPayload.builder()
                        .orderId(orderIdStr)
                        .statusCode("202")
                        .grossAmount("300000.00")
                        .signatureKey(signature)
                        .transactionStatus("cancel")
                        .paymentType("bank_transfer")
                        .transactionId("trx-cancel-123")
                        .build();

        when(orderRepository.findById(orderId)).thenReturn(Optional.of(order));
        when(paymentRepository.findByTransactionId("trx-cancel-123")).thenReturn(Optional.empty());
        when(paymentRepository.findFirstByOrderIdOrderByCreatedAtDesc(orderId)).thenReturn(Optional.empty());

        paymentService.handleNotification(payload);

        verify(orderService, times(1)).updateOrderStatus(orderId, OrderStatus.CANCELLED);
    }

    @Test
    @DisplayName("handleNotification: Idempotensi - Notifikasi duplikat tidak memanggil ulang update order")
    void handleNotification_Idempotency_OrderAlreadyPaid() throws Exception {
        order.setStatus(OrderStatus.PAID);

        String serverKey = "SB-Mid-server-testkey123";
        when(midtransProperties.getServerKey()).thenReturn(serverKey);

        String orderIdStr = orderId.toString();
        String signature = calculateSignature(orderIdStr, "200", "300000.00", serverKey);

        com.e_commerce.backend.feature_payment.dto.MidtransNotificationPayload payload =
                com.e_commerce.backend.feature_payment.dto.MidtransNotificationPayload.builder()
                        .orderId(orderIdStr)
                        .statusCode("200")
                        .grossAmount("300000.00")
                        .signatureKey(signature)
                        .transactionStatus("settlement")
                        .paymentType("qris")
                        .transactionId("trx-dup-123")
                        .build();

        when(orderRepository.findById(orderId)).thenReturn(Optional.of(order));
        when(paymentRepository.findByTransactionId("trx-dup-123")).thenReturn(Optional.empty());
        when(paymentRepository.findFirstByOrderIdOrderByCreatedAtDesc(orderId)).thenReturn(Optional.empty());

        paymentService.handleNotification(payload);

        verify(orderService, never()).updateOrderStatus(any(), any());
    }

    @Test
    @DisplayName("handleNotification: Signature tidak valid melempar IllegalArgumentException")
    void handleNotification_InvalidSignature_ThrowsException() {
        when(midtransProperties.getServerKey()).thenReturn("SB-Mid-server-real-key");

        com.e_commerce.backend.feature_payment.dto.MidtransNotificationPayload payload =
                com.e_commerce.backend.feature_payment.dto.MidtransNotificationPayload.builder()
                        .orderId(orderId.toString())
                        .statusCode("200")
                        .grossAmount("300000.00")
                        .signatureKey("fake-invalid-signature")
                        .transactionStatus("settlement")
                        .build();

        assertThrows(IllegalArgumentException.class, () -> paymentService.handleNotification(payload));
        verify(orderRepository, never()).findById(any());
        verify(orderService, never()).updateOrderStatus(any(), any());
    }

    @Test
    @DisplayName("handleNotification: Settlement untuk order yang sudah CANCELLED tidak membangkitkan status order ke PAID")
    void handleNotification_SettlementForCancelledOrder_DoesNotResurrectOrder() throws Exception {
        order.setStatus(OrderStatus.CANCELLED);

        String serverKey = "SB-Mid-server-testkey123";
        when(midtransProperties.getServerKey()).thenReturn(serverKey);

        String orderIdStr = orderId.toString();
        String signature = calculateSignature(orderIdStr, "200", "300000.00", serverKey);

        com.e_commerce.backend.feature_payment.dto.MidtransNotificationPayload payload =
                com.e_commerce.backend.feature_payment.dto.MidtransNotificationPayload.builder()
                        .orderId(orderIdStr)
                        .statusCode("200")
                        .grossAmount("300000.00")
                        .signatureKey(signature)
                        .transactionStatus("settlement")
                        .paymentType("qris")
                        .transactionId("trx-late-cancelled-123")
                        .build();

        when(orderRepository.findById(orderId)).thenReturn(Optional.of(order));
        when(paymentRepository.findByTransactionId("trx-late-cancelled-123")).thenReturn(Optional.empty());
        when(paymentRepository.findFirstByOrderIdOrderByCreatedAtDesc(orderId)).thenReturn(Optional.empty());

        paymentService.handleNotification(payload);

        // Record pembayaran tetap disimpan ke database untuk rekonsiliasi/audit
        verify(paymentRepository, times(1)).save(any(PaymentEntity.class));
        // Status order TIDAK pernah diubah/dibangkitkan ke PAID
        verify(orderService, never()).updateOrderStatus(any(), any());
        assertEquals(OrderStatus.CANCELLED, order.getStatus());
    }
}

