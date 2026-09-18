package com.e_commerce.backend.feature_order.dto.request;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;
import java.util.UUID;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class OrderRequest {
    private List<OrderItemRequest> items;
    private String paymentMethod;
    private String paymentProofUrl;

    public OrderRequest(List<OrderItemRequest> items) {
        this.items = items;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class OrderItemRequest {
        private UUID productId;
        private Integer quantity;
    }
}
