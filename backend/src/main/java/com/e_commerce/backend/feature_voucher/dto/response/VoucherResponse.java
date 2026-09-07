package com.e_commerce.backend.feature_voucher.dto.response;

import com.e_commerce.backend.feature_voucher.model.DiscountType;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.ZonedDateTime;
import java.util.UUID;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class VoucherResponse {
    private UUID id;
    private String code;
    private String description;
    private DiscountType discountType;
    private BigDecimal discountValue;
    private BigDecimal minPurchase;
    private BigDecimal maxDiscount;
    private Integer quota;
    private Integer usedCount;
    private Boolean isActive;
    private ZonedDateTime validUntil;
    private ZonedDateTime createdAt;
    private ZonedDateTime updatedAt;
}
