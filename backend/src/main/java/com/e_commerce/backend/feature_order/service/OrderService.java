package com.e_commerce.backend.feature_order.service;

import com.e_commerce.backend.feature_order.dto.request.OrderRequest;
import com.e_commerce.backend.feature_order.model.OrderEntity;
import com.e_commerce.backend.feature_order.model.OrderStatus;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import java.time.ZonedDateTime;
import java.util.UUID;

public interface OrderService {
    OrderEntity createOrder(UUID userId, OrderRequest request);
    OrderEntity updateOrderStatus(UUID orderId, OrderStatus newStatus);
    OrderEntity getOrderById(UUID orderId);
    Page<OrderEntity> getOrdersByUser(UUID userId, Pageable pageable);

    /** Rule 22: Filter orders by user + status */
    Page<OrderEntity> getOrdersByUserAndStatus(UUID userId, OrderStatus status, Pageable pageable);

    /** Rule 22: Admin — Get all orders with filters */
    Page<OrderEntity> getAllOrdersWithFilters(OrderStatus status, ZonedDateTime startDate, ZonedDateTime endDate, Pageable pageable);

    /** FINDING-003: Update payment proof URL for an order */
    OrderEntity updatePaymentProof(UUID orderId, UUID userId, String paymentProofUrl);

    /** ORDER-PAYMENT-FIX-001: Batalkan pesanan oleh customer sebelum pembayaran (hanya untuk PENDING) */
    OrderEntity cancelOrder(UUID orderId, UUID userId);

    /** ORDER-PAYMENT-FIX-001: Ubah metode pembayaran pada pesanan berstatus PENDING */
    OrderEntity updatePaymentMethod(UUID orderId, UUID userId, String paymentMethod);
}
