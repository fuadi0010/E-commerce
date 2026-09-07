package com.e_commerce.backend.feature_review.repository;

import com.e_commerce.backend.feature_review.model.ReviewEntity;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.Optional;
import java.util.UUID;

@Repository
public interface ReviewRepository extends JpaRepository<ReviewEntity, UUID> {

    @EntityGraph(attributePaths = {"user", "product"})
    Page<ReviewEntity> findByProductId(UUID productId, Pageable pageable);

    @EntityGraph(attributePaths = {"user", "product"})
    Page<ReviewEntity> findByUserId(UUID userId, Pageable pageable);

    @Override
    @EntityGraph(attributePaths = {"user", "product"})
    Page<ReviewEntity> findAll(Pageable pageable);

    @Override
    @EntityGraph(attributePaths = {"user", "product"})
    Optional<ReviewEntity> findById(UUID id);

    @Query("SELECT AVG(r.rating) FROM ReviewEntity r WHERE r.product.id = :productId")
    Optional<Double> calculateAverageRatingByProductId(@Param("productId") UUID productId);

    Long countByProductId(UUID productId);

    boolean existsByUserIdAndProductId(UUID userId, UUID productId);
}
