package com.e_commerce.backend.feature_user.controller;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.e_commerce.backend.common.dto.ApiResponse;
import com.e_commerce.backend.feature_user.dto.UpdateProfileRequest;
import com.e_commerce.backend.feature_user.dto.UserProfileResponse;
import com.e_commerce.backend.feature_user.dto.UserResponse;
import com.e_commerce.backend.feature_user.service.UserService;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;

import java.util.UUID;

/**
 * UserController — Rule 9, 50
 * Endpoint menggunakan "/me" (bukan "/{id}") untuk profil sendiri (mencegah IDOR).
 * Update profile menggunakan PATCH (partial update) sesuai Rule 9.
 * Menyediakan CRUD Admin untuk manajemen pengguna dan soft-delete.
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

    // GET /api/users — Admin: Paginated list of users
    @GetMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<Page<UserResponse>>> getAllUsers(
            @PageableDefault(size = 10) Pageable pageable) {
        Page<UserResponse> users = userService.getAllUsers(pageable);
        return ResponseEntity.ok(ApiResponse.success(users, "Daftar pengguna"));
    }

    // GET /api/users/{id} — Admin: User detail
    @GetMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<UserResponse>> getUserById(@PathVariable UUID id) {
        UserResponse user = userService.getUserById(id);
        return ResponseEntity.ok(ApiResponse.success(user, "Detail pengguna"));
    }

    // DELETE /api/users/{id} — Admin: Soft delete user
    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<Void>> deleteUser(@PathVariable UUID id) {
        userService.deleteUser(id);
        return ResponseEntity.ok(ApiResponse.success(null, "User berhasil dihapus (soft delete)"));
    }
}
