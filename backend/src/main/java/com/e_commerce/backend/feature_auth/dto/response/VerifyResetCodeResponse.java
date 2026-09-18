package com.e_commerce.backend.feature_auth.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class VerifyResetCodeResponse {
    private String resetToken;
    private String email;
    private String message;
}
