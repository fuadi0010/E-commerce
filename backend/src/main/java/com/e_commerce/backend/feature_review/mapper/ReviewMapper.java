package com.e_commerce.backend.feature_review.mapper;

import com.e_commerce.backend.feature_review.dto.response.ReviewResponse;
import com.e_commerce.backend.feature_review.model.ReviewEntity;
import org.springframework.stereotype.Component;

@Component
public class ReviewMapper {

    public ReviewResponse toResponse(ReviewEntity entity) {
        if (entity == null) {
            return null;
        }

        String userFullName = "Pengguna";
        if (entity.getUser() != null && entity.getUser().getEmail() != null) {
            userFullName = entity.getUser().getEmail();
        }

        return ReviewResponse.builder()
                .id(entity.getId())
                .productId(entity.getProduct() != null ? entity.getProduct().getId() : null)
                .productName(entity.getProduct() != null ? entity.getProduct().getName() : null)
                .userId(entity.getUser() != null ? entity.getUser().getId() : null)
                .userFullName(userFullName)
                .rating(entity.getRating())
                .comment(entity.getComment())
                .createdAt(entity.getCreatedAt())
                .updatedAt(entity.getUpdatedAt())
                .build();
    }
}
