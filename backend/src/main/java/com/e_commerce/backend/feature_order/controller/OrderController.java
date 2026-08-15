package com.e_commerce.backend.feature_order.controller;

import com.e_commerce.backend.common.dto.ApiResponse;
import com.e_commerce.backend.feature_order.dto.request.OrderRequest;
import com.e_commerce.backend.feature_order.dto.request.OrderStatusRequest;
import com.e_commerce.backend.feature_order.dto.response.OrderItemResponse;
import com.e_commerce.backend.feature_order.dto.response.OrderResponse;
import com.e_commerce.backend.feature_order.model.OrderEntity;
import com.e_commerce.backend.feature_order.service.OrderService;
import com.e_commerce.backend.feature_product.dto.response.ProductResponse;
import com.e_commerce.backend.security.UserDetailsImpl;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.web.PageableDefault;

@RestController
@RequestMapping("/api/orders")
@RequiredArgsConstructor
public class OrderController {

    private final OrderService orderService;

    @PostMapping("/checkout")
    @PreAuthorize("hasAnyRole('CUSTOMER', 'ADMIN')")
    public ResponseEntity<ApiResponse<OrderResponse>> checkout(
            @AuthenticationPrincipal UserDetailsImpl userDetails,
            @Valid @RequestBody OrderRequest request) {
        
        OrderEntity order = orderService.createOrder(userDetails.getId(), request);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success(HttpStatus.CREATED.value(), "Checkout berhasil", mapToResponse(order)));
    }

    @GetMapping("/my-orders")
    @PreAuthorize("hasAnyRole('CUSTOMER', 'ADMIN')")
    public ResponseEntity<ApiResponse<Page<OrderResponse>>> getMyOrders(
            @AuthenticationPrincipal UserDetailsImpl userDetails,
            @PageableDefault(size = 10) Pageable pageable) {
        
        Page<OrderResponse> orders = orderService.getOrdersByUser(userDetails.getId(), pageable)
                .map(this::mapToResponse);
        
        return ResponseEntity.ok(ApiResponse.success(HttpStatus.OK.value(), "Riwayat Pesanan", orders));
    }

    @PutMapping("/{id}/status")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<OrderResponse>> updateStatus(
            @PathVariable UUID id,
            @Valid @RequestBody OrderStatusRequest request) {
        
        OrderEntity order = orderService.updateOrderStatus(id, request.getStatus());
        return ResponseEntity.ok(ApiResponse.success(HttpStatus.OK.value(), "Status berhasil diubah", mapToResponse(order)));
    }

    private OrderResponse mapToResponse(OrderEntity entity) {
        List<OrderItemResponse> items = entity.getItems().stream().map(item -> 
            OrderItemResponse.builder()
                .id(item.getId())
                .product(ProductResponse.builder()
                        .id(item.getProduct().getId())
                        .name(item.getProduct().getName())
                        .build()) // Simplified mapping for sub-object
                .quantity(item.getQuantity())
                .priceAtTime(item.getPriceAtTime())
                .subTotal(item.getPriceAtTime().multiply(BigDecimal.valueOf(item.getQuantity())))
                .build()
        ).collect(Collectors.toList());

        return OrderResponse.builder()
                .id(entity.getId())
                .userId(entity.getUser().getId())
                .status(entity.getStatus().name())
                .totalAmount(entity.getTotalAmount())
                .createdAt(entity.getCreatedAt())
                .items(items)
                .build();
    }
}
