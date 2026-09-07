package com.e_commerce.backend.feature_voucher.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class VoucherCalculationResponse {
    private boolean valid;
    private String code;
    private String description;
    private BigDecimal discountAmount;
    private BigDecimal finalAmount;
    private String message;
}
