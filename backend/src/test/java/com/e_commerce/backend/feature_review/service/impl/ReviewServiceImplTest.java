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
import com.e_commerce.backend.feature_user.model.UserEntity;
import com.e_commerce.backend.feature_user.repository.UserRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.security.access.AccessDeniedException;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
@DisplayName("ReviewServiceImpl Unit Tests")
class ReviewServiceImplTest {

    @Mock
    private ReviewRepository reviewRepository;

    @Mock
    private ProductRepository productRepository;

    @Mock
    private UserRepository userRepository;

    @InjectMocks
    private ReviewServiceImpl reviewService;

    private UUID userId;
    private UUID otherUserId;
    private UUID productId;
    private UUID reviewId;
    private UserEntity user;
    private ProductEntity product;
    private ReviewEntity review;

    @BeforeEach
    void setUp() {
        userId = UUID.randomUUID();
        otherUserId = UUID.randomUUID();
        productId = UUID.randomUUID();
        reviewId = UUID.randomUUID();

        user = new UserEntity();
        user.setId(userId);
        user.setEmail("test@example.com");

        product = ProductEntity.builder()
                .id(productId)
                .name("Keyboard Mechanical")
                .build();

        review = ReviewEntity.builder()
                .id(reviewId)
                .user(user)
                .product(product)
                .rating(5)
                .comment("Produk sangat memuaskan")
                .build();
    }

    @Test
    @DisplayName("createReview: sukses jika user, produk ada dan belum pernah review")
    void createReview_Success() {
        CreateReviewRequest request = CreateReviewRequest.builder()
                .productId(productId)
                .rating(5)
                .comment("Keren banget!")
                .build();

        when(userRepository.findById(userId)).thenReturn(Optional.of(user));
        when(productRepository.findById(productId)).thenReturn(Optional.of(product));
        when(reviewRepository.existsByUserIdAndProductId(userId, productId)).thenReturn(false);
        when(reviewRepository.save(any(ReviewEntity.class))).thenAnswer(inv -> inv.getArgument(0));

        ReviewEntity result = reviewService.createReview(userId, request);

        assertNotNull(result);
        assertEquals(5, result.getRating());
        assertEquals("Keren banget!", result.getComment());
        assertEquals(user, result.getUser());
        assertEquals(product, result.getProduct());
        verify(reviewRepository, times(1)).save(any(ReviewEntity.class));
    }

    @Test
    @DisplayName("createReview: gagal jika user tidak ditemukan")
    void createReview_ThrowsWhenUserNotFound() {
        CreateReviewRequest request = CreateReviewRequest.builder()
                .productId(productId)
                .rating(5)
                .comment("Keren banget!")
                .build();

        when(userRepository.findById(userId)).thenReturn(Optional.empty());

        assertThrows(ResourceNotFoundException.class, () -> reviewService.createReview(userId, request));
    }

    @Test
    @DisplayName("createReview: gagal jika produk tidak ditemukan")
    void createReview_ThrowsWhenProductNotFound() {
        CreateReviewRequest request = CreateReviewRequest.builder()
                .productId(productId)
                .rating(5)
                .comment("Keren banget!")
                .build();

        when(userRepository.findById(userId)).thenReturn(Optional.of(user));
        when(productRepository.findById(productId)).thenReturn(Optional.empty());

        assertThrows(ResourceNotFoundException.class, () -> reviewService.createReview(userId, request));
    }

    @Test
    @DisplayName("createReview: gagal jika user sudah pernah mengulas produk yang sama")
    void createReview_ThrowsWhenAlreadyReviewed() {
        CreateReviewRequest request = CreateReviewRequest.builder()
                .productId(productId)
                .rating(5)
                .comment("Keren banget!")
                .build();

        when(userRepository.findById(userId)).thenReturn(Optional.of(user));
        when(productRepository.findById(productId)).thenReturn(Optional.of(product));
        when(reviewRepository.existsByUserIdAndProductId(userId, productId)).thenReturn(true);

        assertThrows(DuplicateResourceException.class, () -> reviewService.createReview(userId, request));
    }

    @Test
    @DisplayName("getReviewsByProduct: berhasil mengambil ulasan berhalaman")
    void getReviewsByProduct_Success() {
        Pageable pageable = PageRequest.of(0, 10);
        Page<ReviewEntity> page = new PageImpl<>(List.of(review), pageable, 1);

        when(productRepository.existsById(productId)).thenReturn(true);
        when(reviewRepository.findByProductId(productId, pageable)).thenReturn(page);

        Page<ReviewEntity> result = reviewService.getReviewsByProduct(productId, pageable);

        assertNotNull(result);
        assertEquals(1, result.getTotalElements());
    }

    @Test
    @DisplayName("getMyReviews: berhasil mengambil ulasan milik user")
    void getMyReviews_Success() {
        Pageable pageable = PageRequest.of(0, 10);
        Page<ReviewEntity> page = new PageImpl<>(List.of(review), pageable, 1);

        when(reviewRepository.findByUserId(userId, pageable)).thenReturn(page);

        Page<ReviewEntity> result = reviewService.getMyReviews(userId, pageable);

        assertNotNull(result);
        assertEquals(1, result.getTotalElements());
    }

    @Test
    @DisplayName("getAllReviewsAdmin: sukses mengambil semua ulasan untuk admin")
    void getAllReviewsAdmin_Success() {
        Pageable pageable = PageRequest.of(0, 10);
        Page<ReviewEntity> page = new PageImpl<>(List.of(review), pageable, 1);

        when(reviewRepository.findAll(pageable)).thenReturn(page);

        Page<ReviewEntity> result = reviewService.getAllReviewsAdmin(pageable);

        assertNotNull(result);
        assertEquals(1, result.getTotalElements());
        verify(reviewRepository, times(1)).findAll(pageable);
    }

    @Test
    @DisplayName("updateReview: sukses jika dilakukan oleh pemilik ulasan")
    void updateReview_Success_WhenOwner() {
        UpdateReviewRequest request = UpdateReviewRequest.builder()
                .rating(4)
                .comment("Ulasan diubah menjadi lebih detail")
                .build();

        when(reviewRepository.findById(reviewId)).thenReturn(Optional.of(review));
        when(reviewRepository.save(any(ReviewEntity.class))).thenAnswer(inv -> inv.getArgument(0));

        ReviewEntity updated = reviewService.updateReview(reviewId, userId, request, false);

        assertNotNull(updated);
        assertEquals(4, updated.getRating());
        assertEquals("Ulasan diubah menjadi lebih detail", updated.getComment());
    }

    @Test
    @DisplayName("updateReview: sukses jika dilakukan oleh Admin")
    void updateReview_Success_WhenAdmin() {
        UpdateReviewRequest request = UpdateReviewRequest.builder()
                .rating(5)
                .comment("Moderasi komentar oleh admin")
                .build();

        when(reviewRepository.findById(reviewId)).thenReturn(Optional.of(review));
        when(reviewRepository.save(any(ReviewEntity.class))).thenAnswer(inv -> inv.getArgument(0));

        ReviewEntity updated = reviewService.updateReview(reviewId, otherUserId, request, true);

        assertNotNull(updated);
        assertEquals("Moderasi komentar oleh admin", updated.getComment());
    }

    @Test
    @DisplayName("updateReview: gagal (403) jika bukan pemilik dan bukan Admin")
    void updateReview_ThrowsWhenUnauthorized() {
        UpdateReviewRequest request = UpdateReviewRequest.builder()
                .rating(4)
                .comment("Mencoba ubah ulasan orang lain")
                .build();

        when(reviewRepository.findById(reviewId)).thenReturn(Optional.of(review));

        assertThrows(AccessDeniedException.class,
                () -> reviewService.updateReview(reviewId, otherUserId, request, false));
    }

    @Test
    @DisplayName("deleteReview: sukses jika dilakukan pemilik ulasan")
    void deleteReview_Success_WhenOwner() {
        when(reviewRepository.findById(reviewId)).thenReturn(Optional.of(review));
        doNothing().when(reviewRepository).delete(review);

        assertDoesNotThrow(() -> reviewService.deleteReview(reviewId, userId, false));
        verify(reviewRepository, times(1)).delete(review);
    }

    @Test
    @DisplayName("deleteReview: gagal jika bukan pemilik dan bukan Admin")
    void deleteReview_ThrowsWhenUnauthorized() {
        when(reviewRepository.findById(reviewId)).thenReturn(Optional.of(review));

        assertThrows(AccessDeniedException.class,
                () -> reviewService.deleteReview(reviewId, otherUserId, false));
        verify(reviewRepository, never()).delete(any());
    }

    @Test
    @DisplayName("getProductRatingSummary: mengembalikan rata-rata dan jumlah ulasan")
    void getProductRatingSummary_Success() {
        when(productRepository.existsById(productId)).thenReturn(true);
        when(reviewRepository.calculateAverageRatingByProductId(productId)).thenReturn(Optional.of(4.6666));
        when(reviewRepository.countByProductId(productId)).thenReturn(15L);

        ProductRatingSummaryResponse summary = reviewService.getProductRatingSummary(productId);

        assertNotNull(summary);
        assertEquals(4.7, summary.getAverageRating());
        assertEquals(15L, summary.getTotalReviews());
    }
}
