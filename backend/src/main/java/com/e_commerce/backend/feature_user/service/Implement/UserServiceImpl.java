package com.e_commerce.backend.feature_user.service.Implement;

import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.e_commerce.backend.feature_user.Model.UserEntity;
import com.e_commerce.backend.feature_user.Model.UserProfileEntity;
import com.e_commerce.backend.feature_user.dto.UpdateProfileRequest;
import com.e_commerce.backend.feature_user.dto.UserProfileResponse;
import com.e_commerce.backend.feature_user.repository.UserProfileRepository;
import com.e_commerce.backend.feature_user.repository.UserRepository;
import com.e_commerce.backend.feature_user.service.UserService;

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
                .orElseThrow(() -> new UsernameNotFoundException("User tidak ditemukan di database."));
    }

    @Override
    @Transactional(readOnly = true) // Optimasi performa untuk operasi SELECT
    public UserProfileResponse getMyProfile() {
        UserEntity user = getCurrentUser();
        
        // Asumsi relasi One-to-One. Jika menggunakan repository terpisah:
        UserProfileEntity profile = userProfileRepository.findByUser(user)
                .orElseThrow(() -> new RuntimeException("Profil tidak ditemukan"));

        return mapToResponse(user, profile);
    }

    @Override
    @Transactional // Wajib karena ada operasi UPDATE
    public UserProfileResponse updateMyProfile(UpdateProfileRequest request) {
        UserEntity user = getCurrentUser();
        
        // Gunakan Pessimistic Locking jika update profil sangat konkuren, 
        // tapi untuk e-commerce B2C, operasi standar sudah cukup.
        UserProfileEntity profile = userProfileRepository.findByUser(user)
                .orElseThrow(() -> new RuntimeException("Profil tidak ditemukan"));

        profile.setFullName(request.getFullName());
        profile.setPhone(request.getPhone());
        profile.setAddress(request.getAddress());
        
        UserProfileEntity updatedProfile = userProfileRepository.save(profile);

        return mapToResponse(user, updatedProfile);
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
}
