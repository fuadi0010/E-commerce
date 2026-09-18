package com.e_commerce.backend.feature_auth.service;

import com.e_commerce.backend.feature_auth.dto.request.LoginRequest;
import com.e_commerce.backend.feature_auth.dto.request.RegisterRequest;
import com.e_commerce.backend.feature_auth.dto.request.ResendOtpRequest;
import com.e_commerce.backend.feature_auth.dto.request.ResetPasswordRequest;
import com.e_commerce.backend.feature_auth.dto.request.VerifyOtpRequest;
import com.e_commerce.backend.feature_auth.dto.request.VerifyResetCodeRequest;
import com.e_commerce.backend.feature_auth.dto.response.AuthResponse;
import com.e_commerce.backend.feature_auth.dto.response.TokenRefreshResponse;
import com.e_commerce.backend.feature_auth.dto.response.VerifyResetCodeResponse;

public interface AuthService {
    void register(RegisterRequest request);
    AuthResponse login(LoginRequest request);
    void logout(String refreshToken);
    TokenRefreshResponse refreshToken(String requestRefreshToken);
    void forgotPassword(String email);
    VerifyResetCodeResponse verifyResetCode(VerifyResetCodeRequest request);
    void resetPassword(ResetPasswordRequest request);
    void verifyOtp(VerifyOtpRequest request);
    void resendOtp(ResendOtpRequest request);
}

