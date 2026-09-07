package com.e_commerce.backend.feature_review.service.impl;

import com.e_commerce.backend.exception.custom.DuplicateResourceException;
import com.e_commerce.backend.exception.custom.ResourceNotFoundException;
import com.e_commerce.backend.feature_product.model.ProductEntity;
import com.e_commerce.backend.feature_product.repository.ProductRepository;
import com.e_commerce.backend.feature_review.dto.request.CreateReviewRequest;
import com.e_commerce.backend.feature_review.dto.request.UpdateReviewRequest;
import com.e_commerce.backend.feature_review.dto.response.ProductRatingSummaryResponse;
import com.e_commerce.backend.feature_review.model.ReviewEntity;
import com.e_commerce.backend.feature_review.repository.ReviewRepository;
import com.e_commerce.backend.feature_review.service.ReviewService;
import com.e_commerce.backend.feature_user.model.UserEntity;
import com.e_commerce.backend.feature_user.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class ReviewServiceImpl implements ReviewService {

    private final ReviewRepository reviewRepository;
    private final ProductRepository productRepository;
    private final UserRepository userRepository;

    @Override
    @Transactional
    public ReviewEntity createReview(UUID userId, CreateReviewRequest request) {
        UserEntity user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("Pengguna tidak ditemukan"));

        ProductEntity product = productRepository.findById(request.getProductId())
                .orElseThrow(() -> new ResourceNotFoundException("Produk tidak ditemukan"));

        if (reviewRepository.existsByUserIdAndProductId(userId, request.getProductId())) {
            throw new DuplicateResourceException("Anda sudah memberikan ulasan untuk produk ini. Silakan ubah ulasan yang sudah ada.");
        }

        ReviewEntity review = ReviewEntity.builder()
                .user(user)
                .product(product)
                .rating(request.getRating())
                .comment(request.getComment().trim())
                .build();

        return reviewRepository.save(review);
    }

    @Override
    @Transactional(readOnly = true)
    public Page<ReviewEntity> getReviewsByProduct(UUID productId, Pageable pageable) {
        if (!productRepository.existsById(productId)) {
            throw new ResourceNotFoundException("Produk tidak ditemukan");
        }
        return reviewRepository.findByProductId(productId, pageable);
    }

    @Override
    @Transactional(readOnly = true)
    public Page<ReviewEntity> getMyReviews(UUID userId, Pageable pageable) {
        return reviewRepository.findByUserId(userId, pageable);
    }

    @Override
    @Transactional(readOnly = true)
    public ReviewEntity getReviewById(UUID id) {
        return reviewRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Ulasan tidak ditemukan"));
    }

    @Override
    @Transactional
    public ReviewEntity updateReview(UUID id, UUID userId, UpdateReviewRequest request, boolean isAdmin) {
        ReviewEntity review = getReviewById(id);

        if (!isAdmin && !review.getUser().getId().equals(userId)) {
            throw new AccessDeniedException("Anda tidak memiliki akses untuk mengubah ulasan ini");
        }

        review.setRating(request.getRating());
        review.setComment(request.getComment().trim());

        return reviewRepository.save(review);
    }

    @Override
    @Transactional
    public void deleteReview(UUID id, UUID userId, boolean isAdmin) {
        ReviewEntity review = getReviewById(id);

        if (!isAdmin && !review.getUser().getId().equals(userId)) {
            throw new AccessDeniedException("Anda tidak memiliki akses untuk menghapus ulasan ini");
        }

        reviewRepository.delete(review);
    }

    @Override
    @Transactional(readOnly = true)
    public ProductRatingSummaryResponse getProductRatingSummary(UUID productId) {
        if (!productRepository.existsById(productId)) {
            throw new ResourceNotFoundException("Produk tidak ditemukan");
        }

        Double rawAverage = reviewRepository.calculateAverageRatingByProductId(productId).orElse(0.0);
        BigDecimal roundedAvg = BigDecimal.valueOf(rawAverage).setScale(1, RoundingMode.HALF_UP);
        Long count = reviewRepository.countByProductId(productId);

        return ProductRatingSummaryResponse.builder()
                .averageRating(roundedAvg.doubleValue())
                .totalReviews(count != null ? count : 0L)
                .build();
    }
}
