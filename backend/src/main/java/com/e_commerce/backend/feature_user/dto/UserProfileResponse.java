package com.e_commerce.backend.feature_user.dto;

import java.time.OffsetDateTime;
import java.time.ZonedDateTime;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class UserProfileResponse {
    private String email;
    private String fullName;
    private String phone;
    private String address;
    private ZonedDateTime joinedAt;
}
