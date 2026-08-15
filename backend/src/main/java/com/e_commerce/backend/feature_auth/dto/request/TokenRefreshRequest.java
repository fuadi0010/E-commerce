package com.e_commerce.backend.feature_auth.dto.request;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class TokenRefreshRequest {
    @NotBlank(message = "Refresh token tidak boleh kosong")
    private String refreshToken;
}
