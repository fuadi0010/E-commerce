package com.e_commerce.backend.feature_user.service.Implement;

import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.e_commerce.backend.exception.custom.ResourceNotFoundException;
import com.e_commerce.backend.feature_user.Model.Role;
import com.e_commerce.backend.feature_user.Model.UserEntity;
import com.e_commerce.backend.feature_user.Model.UserProfileEntity;
import com.e_commerce.backend.feature_user.dto.UpdateProfileRequest;
import com.e_commerce.backend.feature_user.dto.UserProfileResponse;
import com.e_commerce.backend.feature_user.dto.UserResponse;
import com.e_commerce.backend.feature_user.repository.UserProfileRepository;
import com.e_commerce.backend.feature_user.repository.UserRepository;
import com.e_commerce.backend.feature_user.service.UserService;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import java.util.Collections;
import java.util.Set;
import java.util.UUID;
import java.util.stream.Collectors;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class UserServiceImpl implements UserService{
    private final UserRepository userRepository;
    private final UserProfileRepository userProfileRepository;

    // PR REVIEW: Helper method krusial untuk mencegah IDOR.
    // Metode ini mengambil identitas user langsung dari memori Spring Security (bersumber dari JWT)
    private String getCurrentAuthenticatedEmail() {
        return SecurityContextHolder.getContext().getAuthentication().getName();
    }

    private UserEntity getCurrentUser() {
        String email = getCurrentAuthenticatedEmail();
        return userRepository.findByEmailAndDeletedAtIsNull(email)
                .orElseThrow(() -> new ResourceNotFoundException("User tidak ditemukan di database."));
    }

    @Override
    @Transactional(readOnly = true) // Optimasi performa untuk operasi SELECT
    public UserProfileResponse getMyProfile() {
        UserEntity user = getCurrentUser();
        
        // Asumsi relasi One-to-One. Jika menggunakan repository terpisah:
        UserProfileEntity profile = userProfileRepository.findByUser(user)
                .orElseThrow(() -> new ResourceNotFoundException("Profil tidak ditemukan"));

        return mapToResponse(user, profile);
    }

    @Override
    @Transactional // Wajib karena ada operasi UPDATE
    public UserProfileResponse updateMyProfile(UpdateProfileRequest request) {
        UserEntity user = getCurrentUser();
        
        // Gunakan Pessimistic Locking jika update profil sangat konkuren, 
        // tapi untuk e-commerce B2C, operasi standar sudah cukup.
        UserProfileEntity profile = userProfileRepository.findByUser(user)
                .orElseThrow(() -> new ResourceNotFoundException("Profil tidak ditemukan"));

        if (request.getFullName() != null && !request.getFullName().isBlank()) {
            profile.setFullName(request.getFullName().trim());
        }
        if (request.getPhone() != null) {
            profile.setPhone(request.getPhone().isBlank() ? null : request.getPhone().trim());
        }
        if (request.getAddress() != null) {
            profile.setAddress(request.getAddress().isBlank() ? null : request.getAddress().trim());
        }
        
        UserProfileEntity updatedProfile = userProfileRepository.save(profile);

        return mapToResponse(user, updatedProfile);
    }

    @Override
    @Transactional(readOnly = true)
    public Page<UserResponse> getAllUsers(Pageable pageable) {
        return userRepository.findAll(pageable)
                .map(user -> {
                    UserProfileEntity profile = userProfileRepository.findByUser(user).orElse(null);
                    return mapToUserResponse(user, profile);
                });
    }

    @Override
    @Transactional(readOnly = true)
    public UserResponse getUserById(UUID id) {
        UserEntity user = userRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("User tidak ditemukan dengan ID: " + id));
        UserProfileEntity profile = userProfileRepository.findByUser(user).orElse(null);
        return mapToUserResponse(user, profile);
    }

    @Override
    @Transactional
    public void deleteUser(UUID id) {
        UserEntity currentUser = getCurrentUser();
        if (currentUser.getId().equals(id)) {
            throw new IllegalArgumentException("Admin tidak dapat menghapus akunnya sendiri.");
        }

        UserEntity targetUser = userRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("User tidak ditemukan dengan ID: " + id));

        // Memanggil delete yang secara otomatis memicu @SQLDelete pada UserEntity (soft delete)
        userRepository.delete(targetUser);
    }

    private UserProfileResponse mapToResponse(UserEntity user, UserProfileEntity profile) {
        return UserProfileResponse.builder()
                .email(user.getEmail())
                .fullName(profile.getFullName())
                .phone(profile.getPhone())
                .address(profile.getAddress())
                .joinedAt(user.getCreatedAt())
                .build();
    }

    private UserResponse mapToUserResponse(UserEntity user, UserProfileEntity profile) {
        Set<String> roleNames = user.getRoles() != null
                ? user.getRoles().stream().map(Role::getName).collect(Collectors.toSet())
                : Collections.emptySet();

        return UserResponse.builder()
                .id(user.getId())
                .email(user.getEmail())
                .fullName(profile != null ? profile.getFullName() : null)
                .phone(profile != null ? profile.getPhone() : null)
                .address(profile != null ? profile.getAddress() : null)
                .roles(roleNames)
                .createdAt(user.getCreatedAt())
                .build();
    }
}
