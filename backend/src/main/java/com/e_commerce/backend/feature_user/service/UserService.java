package com.e_commerce.backend.feature_user.service;

import com.e_commerce.backend.feature_user.dto.UpdateProfileRequest;
import com.e_commerce.backend.feature_user.dto.UserProfileResponse;
import com.e_commerce.backend.feature_user.dto.UserResponse;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import java.util.UUID;

public interface UserService {
    UserProfileResponse getMyProfile();
    UserProfileResponse updateMyProfile(UpdateProfileRequest request);

    Page<UserResponse> getAllUsers(Pageable pageable);
    UserResponse getUserById(UUID id);
    void deleteUser(UUID id);
}
