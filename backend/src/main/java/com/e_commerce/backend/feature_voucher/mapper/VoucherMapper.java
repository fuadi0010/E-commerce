package com.e_commerce.backend.feature_voucher.mapper;

import com.e_commerce.backend.feature_voucher.dto.response.VoucherResponse;
import com.e_commerce.backend.feature_voucher.model.VoucherEntity;
import org.springframework.stereotype.Component;

@Component
public class VoucherMapper {

    public VoucherResponse toResponse(VoucherEntity entity) {
        if (entity == null) {
            return null;
        }

        return VoucherResponse.builder()
                .id(entity.getId())
                .code(entity.getCode())
                .description(entity.getDescription())
                .discountType(entity.getDiscountType())
                .discountValue(entity.getDiscountValue())
                .minPurchase(entity.getMinPurchase())
                .maxDiscount(entity.getMaxDiscount())
                .quota(entity.getQuota())
                .usedCount(entity.getUsedCount())
                .isActive(entity.getIsActive())
                .validUntil(entity.getValidUntil())
                .createdAt(entity.getCreatedAt())
                .updatedAt(entity.getUpdatedAt())
                .build();
    }
}
