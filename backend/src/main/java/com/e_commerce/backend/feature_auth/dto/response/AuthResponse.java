package com.e_commerce.backend.feature_auth.dto.response;

import java.util.List;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class AuthResponse {
    private String token;
    private String refreshToken;
    private String type;
    private String email;
    private List<String> roles;
}
