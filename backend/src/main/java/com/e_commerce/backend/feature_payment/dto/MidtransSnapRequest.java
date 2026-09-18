package com.e_commerce.backend.feature_payment.dto;

import com.fasterxml.jackson.annotation.JsonInclude;
import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

/**
 * Payload request pembuatan transaksi ke API Midtrans Snap (/snap/v1/transactions).
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@JsonInclude(JsonInclude.Include.NON_NULL)
public class MidtransSnapRequest {

    @JsonProperty("transaction_details")
    private TransactionDetails transactionDetails;

    @JsonProperty("customer_details")
    private CustomerDetails customerDetails;

    @JsonProperty("item_details")
    private List<ItemDetails> itemDetails;

    @JsonProperty("callbacks")
    private Callbacks callbacks;

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    @JsonInclude(JsonInclude.Include.NON_NULL)
    public static class Callbacks {
        @JsonProperty("finish")
        private String finish;

        @JsonProperty("error")
        private String error;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class TransactionDetails {
        @JsonProperty("order_id")
        private String orderId;

        @JsonProperty("gross_amount")
        private long grossAmount;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    @JsonInclude(JsonInclude.Include.NON_NULL)
    public static class CustomerDetails {
        @JsonProperty("first_name")
        private String firstName;

        @JsonProperty("email")
        private String email;

        @JsonProperty("phone")
        private String phone;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class ItemDetails {
        @JsonProperty("id")
        private String id;

        @JsonProperty("price")
        private long price;

        @JsonProperty("quantity")
        private int quantity;

        @JsonProperty("name")
        private String name;
    }
}
