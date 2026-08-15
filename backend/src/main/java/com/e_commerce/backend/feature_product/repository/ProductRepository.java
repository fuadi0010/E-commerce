package com.e_commerce.backend.feature_product.repository;

import com.e_commerce.backend.feature_product.model.ProductEntity;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;
import java.util.UUID;

import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

@Repository
public interface ProductRepository extends JpaRepository<ProductEntity, UUID> {
    // findByDeletedAtIsNull is not needed anymore, use findAll(Pageable)
    // findByIdAndDeletedAtIsNull is not needed, use findById(UUID)

    @Query("SELECT p FROM ProductEntity p WHERE " +
           "(:search IS NULL OR LOWER(p.name) LIKE LOWER(CONCAT('%', :search, '%'))) " +
           "AND (:categoryId IS NULL OR p.category.id = :categoryId)")
    Page<ProductEntity> findActiveProductsWithFilters(
            @Param("search") String search, 
            @Param("categoryId") UUID categoryId, 
            Pageable pageable);

    @org.springframework.data.jpa.repository.Lock(jakarta.persistence.LockModeType.PESSIMISTIC_WRITE)
    @Query("SELECT p FROM ProductEntity p WHERE p.id = :id")
    Optional<ProductEntity> findByIdWithPessimisticLock(@Param("id") UUID id);
}
