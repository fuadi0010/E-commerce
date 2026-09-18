package com.e_commerce.backend.feature_payment.dto;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

/**
 * Respon dari API Midtrans Snap (/snap/v1/transactions).
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@JsonIgnoreProperties(ignoreUnknown = true)
public class MidtransSnapResponse {

    private String token;

    @JsonProperty("redirect_url")
    private String redirectUrl;

    @JsonProperty("error_messages")
    private List<String> errorMessages;
}
