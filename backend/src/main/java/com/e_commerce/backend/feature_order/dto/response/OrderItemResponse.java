package com.e_commerce.backend.feature_order.dto.response;

import com.e_commerce.backend.feature_product.dto.response.ProductResponse;
import lombok.Builder;
import lombok.Data;

import java.math.BigDecimal;
import java.util.UUID;

@Data
@Builder
public class OrderItemResponse {
    private UUID id;
    private ProductResponse product;
    private Integer quantity;
    private BigDecimal priceAtTime;
    private BigDecimal subTotal;
}
