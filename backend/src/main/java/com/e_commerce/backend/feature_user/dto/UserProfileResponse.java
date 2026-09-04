package com.e_commerce.backend.feature_user.dto;

import java.time.OffsetDateTime;
import java.time.ZonedDateTime;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class UserProfileResponse {
    private String email;
    private String fullName;
    private String phone;
    private String address;
    private ZonedDateTime joinedAt;

    public String getName() {
        return fullName;
    }

    public String getPhoneNumber() {
        return phone;
    }
}
