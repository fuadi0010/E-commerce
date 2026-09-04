package com.e_commerce.backend.feature_user.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.e_commerce.backend.common.dto.ApiResponse;
import com.e_commerce.backend.feature_user.dto.UpdateProfileRequest;
import com.e_commerce.backend.feature_user.dto.UserProfileResponse;
import com.e_commerce.backend.feature_user.service.UserService;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;

/**
 * UserController — Rule 9, 50
 * Endpoint menggunakan "/me" (bukan "/{id}") untuk mencegah IDOR.
 * Update profile menggunakan PATCH (partial update) sesuai Rule 9.
 */
@RestController
@RequestMapping("/api/users")
@RequiredArgsConstructor
public class UserController {
    private final UserService userService;

    // GET /api/users/me
    @GetMapping("/me")
    @PreAuthorize("hasRole('CUSTOMER') or hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<UserProfileResponse>> getMyProfile() {
        UserProfileResponse response = userService.getMyProfile();
        return ResponseEntity.ok(ApiResponse.success(response, "Profil berhasil diambil"));
    }

    // PATCH /api/users/me — Rule 9: Partial update menggunakan PATCH
    @PatchMapping("/me")
    @PreAuthorize("hasRole('CUSTOMER') or hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<UserProfileResponse>> updateMyProfile(
            @Valid @RequestBody UpdateProfileRequest request) {
        UserProfileResponse response = userService.updateMyProfile(request);
        return ResponseEntity.ok(ApiResponse.success(response, "Profil berhasil diperbarui"));
    }
}
