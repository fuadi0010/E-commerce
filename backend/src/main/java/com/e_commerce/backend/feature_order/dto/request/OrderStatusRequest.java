package com.e_commerce.backend.feature_order.dto.request;

import com.e_commerce.backend.feature_order.model.OrderStatus;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class OrderStatusRequest {
    @NotNull(message = "Status order wajib diisi")
    private OrderStatus status;
}
