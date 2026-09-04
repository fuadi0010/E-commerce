package com.e_commerce.backend.feature_order.controller;

import com.e_commerce.backend.common.dto.ApiResponse;
import com.e_commerce.backend.feature_order.dto.request.OrderRequest;
import com.e_commerce.backend.feature_order.dto.request.OrderStatusRequest;
import com.e_commerce.backend.feature_order.dto.response.OrderResponse;
import com.e_commerce.backend.feature_order.mapper.OrderMapper;
import com.e_commerce.backend.feature_order.model.OrderEntity;
import com.e_commerce.backend.feature_order.model.OrderStatus;
import com.e_commerce.backend.feature_order.service.OrderService;
import com.e_commerce.backend.security.UserDetailsImpl;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.web.PageableDefault;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.*;

import java.time.ZonedDateTime;
import java.util.UUID;

/**
 * OrderController — Rule 7, 9, 22, 50
 * Menyediakan CRUD lengkap: List, Detail, Create (checkout), Update Status (PATCH).
 * Response menggunakan ApiResponse<T>.
 * Mapping menggunakan OrderMapper (Rule 29).
 */
@RestController
@RequestMapping("/api/orders")
@RequiredArgsConstructor
public class OrderController {

    private final OrderService orderService;
    private final OrderMapper orderMapper;

    // POST /api/orders/checkout — Customer & Admin
    @PostMapping("/checkout")
    @PreAuthorize("hasAnyRole('CUSTOMER', 'ADMIN')")
    public ResponseEntity<ApiResponse<OrderResponse>> checkout(
            @AuthenticationPrincipal UserDetailsImpl userDetails,
            @Valid @RequestBody OrderRequest request) {

        OrderEntity order = orderService.createOrder(userDetails.getId(), request);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success(HttpStatus.CREATED.value(), "Checkout berhasil",
                        orderMapper.toResponse(order)));
    }

    // GET /api/orders/my-orders — Customer & Admin (with optional status filter)
    @GetMapping("/my-orders")
    @PreAuthorize("hasAnyRole('CUSTOMER', 'ADMIN')")
    @Transactional(readOnly = true)
    public ResponseEntity<ApiResponse<Page<OrderResponse>>> getMyOrders(
            @AuthenticationPrincipal UserDetailsImpl userDetails,
            @RequestParam(required = false) OrderStatus status,
            @PageableDefault(size = 10) Pageable pageable) {

        Page<OrderResponse> orders = orderService
                .getOrdersByUserAndStatus(userDetails.getId(), status, pageable)
                .map(orderMapper::toResponse);

        return ResponseEntity.ok(ApiResponse.success(HttpStatus.OK.value(), "Riwayat Pesanan", orders));
    }

    // GET /api/orders/{id} — Customer (own) or Admin
    @GetMapping("/{id}")
    @PreAuthorize("hasAnyRole('CUSTOMER', 'ADMIN')")
    @Transactional(readOnly = true)
    public ResponseEntity<ApiResponse<OrderResponse>> getOrderById(
            @PathVariable UUID id,
            @AuthenticationPrincipal UserDetailsImpl userDetails) {

        OrderEntity order = orderService.getOrderById(id);

        // IDOR check: customer hanya bisa lihat ordernya sendiri
        if (!userDetails.getAuthorities().stream()
                .anyMatch(a -> a.getAuthority().equals("ROLE_ADMIN"))) {
            if (!order.getUser().getId().equals(userDetails.getId())) {
                return ResponseEntity.status(HttpStatus.FORBIDDEN)
                        .body(ApiResponse.error(HttpStatus.FORBIDDEN.value(),
                                "Anda tidak memiliki akses ke pesanan ini", null));
            }
        }

        return ResponseEntity.ok(ApiResponse.success(HttpStatus.OK.value(), "Detail Pesanan",
                orderMapper.toResponse(order)));
    }

    // PATCH /api/orders/{id}/status — Admin only (Rule 9: PATCH untuk partial update)
    @PatchMapping("/{id}/status")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<OrderResponse>> updateStatus(
            @PathVariable UUID id,
            @Valid @RequestBody OrderStatusRequest request) {

        OrderEntity order = orderService.updateOrderStatus(id, request.getStatus());
        return ResponseEntity.ok(ApiResponse.success(HttpStatus.OK.value(), "Status berhasil diubah",
                orderMapper.toResponse(order)));
    }

    // GET /api/orders/admin — Admin only, semua order dengan filter
    @GetMapping("/admin")
    @PreAuthorize("hasRole('ADMIN')")
    @Transactional(readOnly = true)
    public ResponseEntity<ApiResponse<Page<OrderResponse>>> getAllOrders(
            @RequestParam(required = false) OrderStatus status,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) ZonedDateTime startDate,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) ZonedDateTime endDate,
            @PageableDefault(size = 10) Pageable pageable) {

        Page<OrderResponse> orders = orderService
                .getAllOrdersWithFilters(status, startDate, endDate, pageable)
                .map(orderMapper::toResponse);

        return ResponseEntity.ok(ApiResponse.success(HttpStatus.OK.value(), "Semua Pesanan", orders));
    }
}
