package com.e_commerce.backend.feature_review.controller;

import com.e_commerce.backend.common.dto.ApiResponse;
import com.e_commerce.backend.feature_review.dto.request.CreateReviewRequest;
import com.e_commerce.backend.feature_review.dto.request.UpdateReviewRequest;
import com.e_commerce.backend.feature_review.dto.response.ProductRatingSummaryResponse;
import com.e_commerce.backend.feature_review.dto.response.ReviewResponse;
import com.e_commerce.backend.feature_review.mapper.ReviewMapper;
import com.e_commerce.backend.feature_review.model.ReviewEntity;
import com.e_commerce.backend.feature_review.service.ReviewService;
import com.e_commerce.backend.security.UserDetailsImpl;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.UUID;

@RestController
@RequestMapping("/api/reviews")
@RequiredArgsConstructor
@Tag(name = "Review", description = "Endpoints untuk manajemen ulasan dan rating produk (Entitas Utama ke-5)")
public class ReviewController {

    private final ReviewService reviewService;
    private final ReviewMapper reviewMapper;

    @PostMapping
    @PreAuthorize("hasRole('CUSTOMER') or hasRole('ADMIN')")
    @Operation(summary = "Membuat ulasan dan rating baru untuk suatu produk")
    public ResponseEntity<ApiResponse<ReviewResponse>> createReview(
            @AuthenticationPrincipal UserDetailsImpl userDetails,
            @Valid @RequestBody CreateReviewRequest request) {

        ReviewEntity review = reviewService.createReview(userDetails.getId(), request);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success(HttpStatus.CREATED.value(), "Ulasan berhasil dibuat",
                        reviewMapper.toResponse(review)));
    }

    @GetMapping("/product/{productId}")
    @Operation(summary = "Mendapatkan daftar ulasan suatu produk secara berhalaman (publik)")
    public ResponseEntity<ApiResponse<Page<ReviewResponse>>> getReviewsByProduct(
            @PathVariable UUID productId,
            @PageableDefault(size = 10, sort = "createdAt", direction = Sort.Direction.DESC) Pageable pageable) {

        Page<ReviewResponse> page = reviewService.getReviewsByProduct(productId, pageable)
                .map(reviewMapper::toResponse);

        return ResponseEntity.ok(ApiResponse.success(HttpStatus.OK.value(), "Daftar ulasan produk", page));
    }

    @GetMapping("/product/{productId}/summary")
    @Operation(summary = "Mendapatkan ringkasan rating rata-rata dan total ulasan produk (publik)")
    public ResponseEntity<ApiResponse<ProductRatingSummaryResponse>> getProductRatingSummary(
            @PathVariable UUID productId) {

        ProductRatingSummaryResponse summary = reviewService.getProductRatingSummary(productId);
        return ResponseEntity.ok(ApiResponse.success(HttpStatus.OK.value(), "Ringkasan rating produk", summary));
    }

    @GetMapping("/my-reviews")
    @PreAuthorize("hasRole('CUSTOMER') or hasRole('ADMIN')")
    @Operation(summary = "Mendapatkan daftar ulasan yang ditulis oleh user yang sedang login")
    public ResponseEntity<ApiResponse<Page<ReviewResponse>>> getMyReviews(
            @AuthenticationPrincipal UserDetailsImpl userDetails,
            @PageableDefault(size = 10, sort = "createdAt", direction = Sort.Direction.DESC) Pageable pageable) {

        Page<ReviewResponse> page = reviewService.getMyReviews(userDetails.getId(), pageable)
                .map(reviewMapper::toResponse);

        return ResponseEntity.ok(ApiResponse.success(HttpStatus.OK.value(), "Daftar ulasan saya", page));
    }

    @GetMapping("/{id}")
    @Operation(summary = "Mendapatkan detail ulasan berdasarkan ID")
    public ResponseEntity<ApiResponse<ReviewResponse>> getReviewById(@PathVariable UUID id) {
        ReviewEntity review = reviewService.getReviewById(id);
        return ResponseEntity.ok(ApiResponse.success(HttpStatus.OK.value(), "Detail ulasan",
                reviewMapper.toResponse(review)));
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasRole('CUSTOMER') or hasRole('ADMIN')")
    @Operation(summary = "Mengubah ulasan yang sudah pernah dibuat")
    public ResponseEntity<ApiResponse<ReviewResponse>> updateReview(
            @PathVariable UUID id,
            @AuthenticationPrincipal UserDetailsImpl userDetails,
            @Valid @RequestBody UpdateReviewRequest request) {

        boolean isAdmin = userDetails.getAuthorities().stream()
                .anyMatch(a -> a.getAuthority().equals("ROLE_ADMIN"));

        ReviewEntity updated = reviewService.updateReview(id, userDetails.getId(), request, isAdmin);
        return ResponseEntity.ok(ApiResponse.success(HttpStatus.OK.value(), "Ulasan berhasil diperbarui",
                reviewMapper.toResponse(updated)));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('CUSTOMER') or hasRole('ADMIN')")
    @Operation(summary = "Menghapus ulasan (soft-delete)")
    public ResponseEntity<ApiResponse<Void>> deleteReview(
            @PathVariable UUID id,
            @AuthenticationPrincipal UserDetailsImpl userDetails) {

        boolean isAdmin = userDetails.getAuthorities().stream()
                .anyMatch(a -> a.getAuthority().equals("ROLE_ADMIN"));

        reviewService.deleteReview(id, userDetails.getId(), isAdmin);
        return ResponseEntity.ok(ApiResponse.success(HttpStatus.OK.value(), "Ulasan berhasil dihapus", null));
    }
}
