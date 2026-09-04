package com.e_commerce.backend.feature_product.repository;

import com.e_commerce.backend.feature_product.model.ProductEntity;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Lock;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import jakarta.persistence.LockModeType;
import java.util.Map;
import java.util.Optional;
import java.util.Set;
import java.util.UUID;

@Repository
public interface ProductRepository extends JpaRepository<ProductEntity, UUID> {

    /**
     * Rule 23: Whitelist field sorting yang diizinkan.
     * Key = nama property Java (yang dikirim frontend), Value = nama kolom database.
     */
    Set<String> ALLOWED_SORT_FIELDS = Set.of("name", "price", "stock", "createdAt", "updatedAt");

    /**
     * Mapping dari nama property Java ke nama kolom PostgreSQL.
     * Diperlukan karena native query menggunakan nama kolom database, bukan nama field Java.
     */
    Map<String, String> SORT_FIELD_TO_COLUMN = Map.of(
            "name", "name",
            "price", "price",
            "stock", "stock",
            "createdAt", "created_at",
            "updatedAt", "updated_at"
    );

    /**
     * Override findById dengan EntityGraph untuk eager-fetch category (mencegah N+1).
     */
    @Override
    @EntityGraph(attributePaths = {"category"})
    Optional<ProductEntity> findById(UUID id);

    /**
     * JPQL query dengan EntityGraph untuk eager-fetch category dalam satu query (mencegah N+1).
     * Kompatibel penuh dengan Hibernate 6.5.3 (tidak melempar HibernateException).
     * Filter soft-delete otomatis ditangani oleh @SQLRestriction("deleted_at IS NULL") pada ProductEntity.
     */
    @EntityGraph(attributePaths = {"category"})
    @Query("SELECT p FROM ProductEntity p WHERE " +
           "(:search IS NULL OR LOWER(p.name) LIKE LOWER(CONCAT('%', CAST(:search AS text), '%'))) " +
           "AND (:categoryId IS NULL OR p.category.id = :categoryId)")
    Page<ProductEntity> findActiveProductsWithFilters(
            @Param("search") String search,
            @Param("categoryId") UUID categoryId,
            Pageable pageable);

    @Lock(LockModeType.PESSIMISTIC_WRITE)
    @Query("SELECT p FROM ProductEntity p WHERE p.id = :id")
    Optional<ProductEntity> findByIdWithPessimisticLock(@Param("id") UUID id);

    /**
     * Mapping dari nama kolom database snake_case ke nama property Java (camelCase)
     * untuk menjaga kompatibilitas jika ada request lama yang mengirim nama kolom database.
     */
    Map<String, String> COLUMN_TO_PROPERTY = Map.of(
            "created_at", "createdAt",
            "updated_at", "updatedAt"
    );

    /**
     * Sanitize Pageable — hapus field sort yang tidak ada di whitelist dan
     * pastikan sort property menggunakan nama atribut Java entitas untuk JPQL.
     */
    static Pageable sanitizePageable(Pageable pageable) {
        if (pageable == null || pageable.isUnpaged()) {
            return PageRequest.of(0, 10, Sort.by(Sort.Direction.DESC, "createdAt"));
        }

        if (pageable.getSort().isUnsorted()) {
            return PageRequest.of(pageable.getPageNumber(), pageable.getPageSize(),
                    Sort.by(Sort.Direction.DESC, "createdAt"));
        }

        Sort sanitized = Sort.by(
            pageable.getSort().stream()
                .map(order -> {
                    String prop = COLUMN_TO_PROPERTY.getOrDefault(order.getProperty(), order.getProperty());
                    return ALLOWED_SORT_FIELDS.contains(prop) ? new Sort.Order(order.getDirection(), prop) : null;
                })
                .filter(java.util.Objects::nonNull)
                .toList()
        );

        if (sanitized.isUnsorted()) {
            sanitized = Sort.by(Sort.Direction.DESC, "createdAt");
        }

        return PageRequest.of(pageable.getPageNumber(), pageable.getPageSize(), sanitized);
    }
}
