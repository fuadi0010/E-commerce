package com.e_commerce.backend.feature_auth.controller;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.e_commerce.backend.common.dto.ApiResponse;
import com.e_commerce.backend.feature_auth.dto.request.LoginRequest;
import com.e_commerce.backend.feature_auth.dto.request.RegisterRequest;
import com.e_commerce.backend.feature_auth.dto.response.AuthResponse;
import com.e_commerce.backend.feature_auth.service.AuthService;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
public class AuthController {
    private final AuthService authService;

    @PostMapping("/register")
    public ResponseEntity<ApiResponse<Void>> registerUser(@Valid @RequestBody RegisterRequest request) {
        authService.register(request);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success(null, "Registrasi berhasil"));
    }

    @PostMapping("/login")
    public ResponseEntity<ApiResponse<AuthResponse>> authenticateUser(@Valid @RequestBody LoginRequest request) {
        AuthResponse response = authService.login(request);
        return ResponseEntity.ok(ApiResponse.success(response, "Login berhasil"));
    }

    @PostMapping("/logout")
    public ResponseEntity<ApiResponse<Void>> logoutUser(@Valid @RequestBody com.e_commerce.backend.feature_auth.dto.request.LogoutRequest request) {
        authService.logout(request.getRefreshToken());
        return ResponseEntity.ok(ApiResponse.success(null, "Logout berhasil"));
    }

    @PostMapping("/refresh-token")
    public ResponseEntity<ApiResponse<com.e_commerce.backend.feature_auth.dto.response.TokenRefreshResponse>> refreshToken(
            @Valid @RequestBody com.e_commerce.backend.feature_auth.dto.request.TokenRefreshRequest request) {
        com.e_commerce.backend.feature_auth.dto.response.TokenRefreshResponse response = authService.refreshToken(request.getRefreshToken());
        return ResponseEntity.ok(ApiResponse.success(response, "Token berhasil diperbarui"));
    }

    @PostMapping("/forgot-password")
    public ResponseEntity<ApiResponse<Void>> forgotPassword(@Valid @RequestBody com.e_commerce.backend.feature_auth.dto.request.ForgotPasswordRequest request) {
        authService.forgotPassword(request.getEmail());
        // Always return success message to prevent user enumeration
        return ResponseEntity.ok(ApiResponse.success(null, "Jika email terdaftar, instruksi reset password telah dikirimkan."));
    }

    @PostMapping("/reset-password")
    public ResponseEntity<ApiResponse<Void>> resetPassword(@Valid @RequestBody com.e_commerce.backend.feature_auth.dto.request.ResetPasswordRequest request) {
        authService.resetPassword(request);
        return ResponseEntity.ok(ApiResponse.success(null, "Password berhasil di-reset. Silakan login menggunakan password baru."));
    }
}
