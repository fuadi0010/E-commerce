package com.e_commerce.backend.feature_payment.dto;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * Payload notifikasi webhook HTTP POST dari Midtrans saat status transaksi berubah.
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@JsonIgnoreProperties(ignoreUnknown = true)
public class MidtransNotificationPayload {

    @JsonProperty("order_id")
    private String orderId;

    @JsonProperty("status_code")
    private String statusCode;

    @JsonProperty("gross_amount")
    private String grossAmount;

    @JsonProperty("signature_key")
    private String signatureKey;

    @JsonProperty("transaction_status")
    private String transactionStatus;

    @JsonProperty("fraud_status")
    private String fraudStatus;

    @JsonProperty("payment_type")
    private String paymentType;

    @JsonProperty("transaction_id")
    private String transactionId;

    @JsonProperty("transaction_time")
    private String transactionTime;

    @JsonProperty("settlement_time")
    private String settlementTime;

    @JsonProperty("status_message")
    private String statusMessage;
}
