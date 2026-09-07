package com.e_commerce.backend.feature_review.service;

import com.e_commerce.backend.feature_review.dto.request.CreateReviewRequest;
import com.e_commerce.backend.feature_review.dto.request.UpdateReviewRequest;
import com.e_commerce.backend.feature_review.dto.response.ProductRatingSummaryResponse;
import com.e_commerce.backend.feature_review.model.ReviewEntity;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import java.util.UUID;

public interface ReviewService {

    ReviewEntity createReview(UUID userId, CreateReviewRequest request);

    Page<ReviewEntity> getReviewsByProduct(UUID productId, Pageable pageable);

    Page<ReviewEntity> getMyReviews(UUID userId, Pageable pageable);

    ReviewEntity getReviewById(UUID id);

    ReviewEntity updateReview(UUID id, UUID userId, UpdateReviewRequest request, boolean isAdmin);

    void deleteReview(UUID id, UUID userId, boolean isAdmin);

    ProductRatingSummaryResponse getProductRatingSummary(UUID productId);
}
