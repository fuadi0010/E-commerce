package com.e_commerce.backend.feature_user.mapper;

import com.e_commerce.backend.feature_user.Model.UserEntity;
import com.e_commerce.backend.feature_user.Model.UserProfileEntity;
import com.e_commerce.backend.feature_user.dto.UserProfileResponse;
import org.springframework.stereotype.Component;

/**
 * Mapper untuk entitas User dan UserProfile.
 * Rule 29: Mapping dilakukan di layer mapper, bukan di Controller.
 */
@Component
public class UserMapper {

    public UserProfileResponse toProfileResponse(UserEntity user, UserProfileEntity profile) {
        if (user == null || profile == null) return null;
        return UserProfileResponse.builder()
                .email(user.getEmail())
                .fullName(profile.getFullName())
                .phone(profile.getPhone())
                .address(profile.getAddress())
                .joinedAt(user.getCreatedAt())
                .build();
    }
}
