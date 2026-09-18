package com.e_commerce.backend.feature_payment.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * Respon konfigurasi publik Midtrans (Hanya client key publik & snap script url, TIDAK BOLEH mengandung server key).
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class MidtransConfigResponse {
    private String clientKey;
    private String snapUrl;
    private boolean isProduction;
}
