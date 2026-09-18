package com.e_commerce.backend.feature_order.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;

/**
 * DTO respons untuk metrik agregasi statistik dashboard (Customer & Admin).
 * Sesuai FIX: ORDER-CANCEL-DASHBOARD-001.
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class DashboardStatsResponse {
    private Long totalOrders;
    private BigDecimal totalAmount;
    private Long pendingOrders;
}
