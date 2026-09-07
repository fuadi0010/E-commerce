package com.e_commerce.backend.feature_review.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ProductRatingSummaryResponse {
    private Double averageRating;
    private Long totalReviews;
}
