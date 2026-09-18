package com.e_commerce.backend.feature_payment.dto;

import com.e_commerce.backend.feature_payment.model.PaymentStatus;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.ZonedDateTime;
import java.util.UUID;

/**
 * Data Transfer Object untuk respon pembayaran.
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class PaymentResponse {
    private UUID id;
    private UUID orderId;
    private String transactionId;
    private String snapToken;
    private String redirectUrl;
    private String paymentType;
    private BigDecimal grossAmount;
    private String currency;
    private PaymentStatus status;
    private String fraudStatus;
    private ZonedDateTime expiryTime;
    private ZonedDateTime paidAt;
    private ZonedDateTime createdAt;
}
