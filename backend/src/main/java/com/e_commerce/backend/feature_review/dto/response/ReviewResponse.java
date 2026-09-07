package com.e_commerce.backend.feature_review.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.ZonedDateTime;
import java.util.UUID;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ReviewResponse {
    private UUID id;
    private UUID productId;
    private String productName;
    private UUID userId;
    private String userFullName;
    private Integer rating;
    private String comment;
    private ZonedDateTime createdAt;
    private ZonedDateTime updatedAt;
}
