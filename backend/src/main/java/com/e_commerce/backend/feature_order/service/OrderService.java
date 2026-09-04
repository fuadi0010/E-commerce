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
}
