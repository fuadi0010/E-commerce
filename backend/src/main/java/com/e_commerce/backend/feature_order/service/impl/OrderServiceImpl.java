package com.e_commerce.backend.feature_order.service.impl;

import com.e_commerce.backend.exception.custom.InsufficientStockException;
import com.e_commerce.backend.exception.custom.ResourceNotFoundException;
import com.e_commerce.backend.feature_order.dto.request.OrderRequest;
import com.e_commerce.backend.feature_order.model.OrderEntity;
import com.e_commerce.backend.feature_order.model.OrderItemEntity;
import com.e_commerce.backend.feature_order.model.OrderStatus;
import com.e_commerce.backend.feature_order.repository.OrderItemRepository;
import com.e_commerce.backend.feature_order.repository.OrderRepository;
import com.e_commerce.backend.feature_order.service.OrderService;
import com.e_commerce.backend.feature_order.specification.OrderSpecification;
import com.e_commerce.backend.feature_product.model.ProductEntity;
import com.e_commerce.backend.feature_product.repository.ProductRepository;
import com.e_commerce.backend.feature_user.model.UserEntity;
import com.e_commerce.backend.feature_user.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.ZonedDateTime;
import java.util.ArrayList;
import java.util.Collections;
import java.util.Comparator;
import java.util.List;
import java.util.UUID;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

@Slf4j
@Service
@RequiredArgsConstructor
public class OrderServiceImpl implements OrderService {

    private final OrderRepository orderRepository;
    private final OrderItemRepository orderItemRepository;
    private final ProductRepository productRepository;
    private final UserRepository userRepository;

    @Override
    @Transactional
    public OrderEntity createOrder(UUID userId, OrderRequest request) {
        UserEntity user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User tidak ditemukan"));

        if (request.getItems() == null || request.getItems().isEmpty()) {
            throw new IllegalArgumentException("Pesanan tidak boleh kosong");
        }

        // Rule 24 & Concurrency Fix:
        // Urutkan item berdasarkan productId sebelum memperoleh pessimistic lock untuk mencegah database deadlock.
        // Copy ke ArrayList terlebih dahulu untuk menghindari UnsupportedOperationException jika request.getItems() immutable (e.g. List.of()).
        List<OrderRequest.OrderItemRequest> sortedItems = new ArrayList<>(request.getItems());
        Collections.sort(sortedItems, Comparator.comparing(
                OrderRequest.OrderItemRequest::getProductId,
                Comparator.nullsLast(Comparator.naturalOrder())
        ));

        // Rule 25: Seluruh checkout dalam satu transaction
        // 1. Buat Order (Draft)
        OrderEntity order = new OrderEntity();
        order.setUser(user);
        order.setStatus(OrderStatus.PENDING);
        order.setTotalAmount(BigDecimal.ZERO);
        order.setPaymentMethod(request.getPaymentMethod());
        order.setPaymentProofUrl(request.getPaymentProofUrl());
        OrderEntity savedOrder = orderRepository.save(order);

        BigDecimal totalAmount = BigDecimal.ZERO;

        // 2. Proses tiap item dalam urutan productId yang deterministik
        for (OrderRequest.OrderItemRequest itemReq : sortedItems) {
            // Rule 24: Lock sebelum baca stok — mencegah TOCTOU race condition
            ProductEntity product = productRepository.findByIdWithPessimisticLock(itemReq.getProductId())
                    .orElseThrow(() -> new ResourceNotFoundException(
                        "Produk tidak ditemukan atau tidak aktif: " + itemReq.getProductId()));

            // Rule 24: Validasi SETELAH lock
            if (product.getStock() < itemReq.getQuantity()) {
                // Rule 8: InsufficientStockException → 409
                throw new InsufficientStockException(product.getName(), itemReq.getQuantity(), product.getStock());
            }

            // Kurangi stok
            product.setStock(product.getStock() - itemReq.getQuantity());
            productRepository.save(product);

            // Buat OrderItem
            OrderItemEntity orderItem = new OrderItemEntity();
            orderItem.setOrder(savedOrder);
            orderItem.setProduct(product);
            orderItem.setQuantity(itemReq.getQuantity());
            orderItem.setPriceAtTime(product.getPrice()); // Freeze harga

            orderItemRepository.save(orderItem);

            // Akumulasi total
            BigDecimal itemTotal = product.getPrice().multiply(BigDecimal.valueOf(itemReq.getQuantity()));
            totalAmount = totalAmount.add(itemTotal);

            savedOrder.getItems().add(orderItem);
        }

        // 3. Update total order
        savedOrder.setTotalAmount(totalAmount);
        return orderRepository.save(savedOrder);
    }

    @Override
    @Transactional
    public OrderEntity updateOrderStatus(UUID orderId, OrderStatus newStatus) {
        OrderEntity order = getOrderById(orderId);
        OrderStatus oldStatus = order.getStatus();

        if (oldStatus == newStatus) {
            return order;
        }

        // Mencegah perubahan status dari pesanan yang sudah dibatalkan
        if (oldStatus == OrderStatus.CANCELLED) {
            throw new IllegalStateException("Pesanan yang sudah dibatalkan tidak dapat diubah statusnya.");
        }

        // FINDING-001: Jika pesanan dibatalkan (CANCELLED), kembalikan kuantitas stok ke produk
        if (newStatus == OrderStatus.CANCELLED) {
            restoreStockForOrder(order);
        }

        order.setStatus(newStatus);
        return orderRepository.save(order);
    }

    private void restoreStockForOrder(OrderEntity order) {
        if (order.getItems() == null || order.getItems().isEmpty()) {
            return;
        }

        // Urutkan item berdasarkan productId secara deterministik untuk mencegah deadlock
        List<OrderItemEntity> sortedItems = new ArrayList<>(order.getItems());
        Collections.sort(sortedItems, Comparator.comparing(
                item -> item.getProduct() != null ? item.getProduct().getId() : null,
                Comparator.nullsLast(Comparator.naturalOrder())
        ));

        for (OrderItemEntity item : sortedItems) {
            if (item.getProduct() == null || item.getQuantity() == null || item.getQuantity() <= 0) {
                continue;
            }

            ProductEntity product = productRepository.findByIdWithPessimisticLock(item.getProduct().getId())
                    .orElse(null);

            if (product != null) {
                int previousStock = product.getStock() != null ? product.getStock() : 0;
                int restoredStock = previousStock + item.getQuantity();
                product.setStock(restoredStock);
                productRepository.save(product);
                log.info("Restored stock for product {} ({}): {} -> {} (Order {} cancelled)",
                        product.getId(), product.getName(), previousStock, restoredStock, order.getId());
            } else {
                log.warn("Cannot restore stock for product {} in cancelled order {}: product not found",
                        item.getProduct().getId(), order.getId());
            }
        }
    }

    @Override
    @Transactional(readOnly = true)
    public OrderEntity getOrderById(UUID orderId) {
        return orderRepository.findById(orderId)
                .orElseThrow(() -> new ResourceNotFoundException("Order dengan ID " + orderId + " tidak ditemukan"));
    }

    @Override
    @Transactional(readOnly = true)
    public Page<OrderEntity> getOrdersByUser(UUID userId, Pageable pageable) {
        return orderRepository.findByUserId(userId, pageable);
    }

    @Override
    @Transactional(readOnly = true)
    public Page<OrderEntity> getOrdersByUserAndStatus(UUID userId, OrderStatus status, Pageable pageable) {
        if (status != null) {
            return orderRepository.findByUserIdAndStatus(userId, status, pageable);
        }
        return orderRepository.findByUserId(userId, pageable);
    }

    @Override
    @Transactional(readOnly = true)
    public Page<OrderEntity> getAllOrdersWithFilters(OrderStatus status, ZonedDateTime startDate,
                                                     ZonedDateTime endDate, Pageable pageable) {
        Specification<OrderEntity> spec = OrderSpecification.withFilters(status, startDate, endDate);
        return orderRepository.findAll(spec, pageable);
    }

    @Override
    @Transactional
    public OrderEntity updatePaymentProof(UUID orderId, UUID userId, String paymentProofUrl) {
        OrderEntity order = getOrderById(orderId);

        // IDOR check: hanya pemilik pesanan yang dapat memperbarui bukti bayar (kecuali admin, userId = null)
        if (userId != null && !order.getUser().getId().equals(userId)) {
            throw new AccessDeniedException("Anda tidak memiliki akses untuk mengubah pesanan ini.");
        }

        order.setPaymentProofUrl(paymentProofUrl);
        log.info("Updated payment proof URL for order {}: {}", orderId, paymentProofUrl);
        return orderRepository.save(order);
    }
}
