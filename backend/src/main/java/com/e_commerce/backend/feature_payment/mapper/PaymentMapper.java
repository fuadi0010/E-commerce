package com.e_commerce.backend.feature_payment.mapper;

import com.e_commerce.backend.feature_payment.dto.PaymentResponse;
import com.e_commerce.backend.feature_payment.model.PaymentEntity;
import org.springframework.stereotype.Component;

@Component
public class PaymentMapper {

    public PaymentResponse toResponse(PaymentEntity entity) {
        if (entity == null) {
            return null;
        }

        return PaymentResponse.builder()
                .id(entity.getId())
                .orderId(entity.getOrder() != null ? entity.getOrder().getId() : null)
                .transactionId(entity.getTransactionId())
                .snapToken(entity.getSnapToken())
                .redirectUrl(entity.getRedirectUrl())
                .paymentType(entity.getPaymentType())
                .grossAmount(entity.getGrossAmount())
                .currency(entity.getCurrency())
                .status(entity.getStatus())
                .fraudStatus(entity.getFraudStatus())
                .expiryTime(entity.getExpiryTime())
                .paidAt(entity.getPaidAt())
                .createdAt(entity.getCreatedAt())
                .build();
    }
}
