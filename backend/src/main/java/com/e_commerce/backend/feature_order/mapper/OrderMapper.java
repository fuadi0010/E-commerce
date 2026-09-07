package com.e_commerce.backend.feature_order.mapper;

import com.e_commerce.backend.feature_order.dto.response.OrderItemResponse;
import com.e_commerce.backend.feature_order.dto.response.OrderResponse;
import com.e_commerce.backend.feature_order.model.OrderEntity;
import com.e_commerce.backend.feature_order.model.OrderItemEntity;
import com.e_commerce.backend.feature_product.dto.response.ProductResponse;
import org.springframework.stereotype.Component;

import java.math.BigDecimal;
import java.util.List;
import java.util.stream.Collectors;

/**
 * Mapper untuk entitas Order dan OrderItem.
 * Rule 29: Mapping dilakukan di layer mapper, bukan di Controller.
 */
@Component
public class OrderMapper {

    public OrderResponse toResponse(OrderEntity entity) {
        if (entity == null) return null;
        List<OrderItemResponse> items = entity.getItems().stream()
                .map(this::toItemResponse)
                .collect(Collectors.toList());

        return OrderResponse.builder()
                .id(entity.getId())
                .userId(entity.getUser().getId())
                .status(entity.getStatus().name())
                .totalAmount(entity.getTotalAmount())
                .createdAt(entity.getCreatedAt())
                .items(items)
                .build();
    }

    public OrderItemResponse toItemResponse(OrderItemEntity item) {
        if (item == null) return null;
        ProductResponse productResponse = null;
        if (item.getProduct() != null) {
            productResponse = ProductResponse.builder()
                    .id(item.getProduct().getId())
                    .name(item.getProduct().getName())
                    .imageUrl(item.getProduct().getImageUrl())
                    .build();
        } else {
            productResponse = ProductResponse.builder()
                    .name("[Produk Tidak Aktif / Diarsipkan]")
                    .build();
        }
        return OrderItemResponse.builder()
                .id(item.getId())
                .product(productResponse)
                .quantity(item.getQuantity())
                .priceAtTime(item.getPriceAtTime())
                .subTotal(item.getPriceAtTime().multiply(BigDecimal.valueOf(item.getQuantity())))
                .build();
    }
}
