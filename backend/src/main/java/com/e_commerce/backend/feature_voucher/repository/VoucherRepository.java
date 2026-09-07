package com.e_commerce.backend.feature_voucher.repository;

import com.e_commerce.backend.feature_voucher.model.VoucherEntity;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.ZonedDateTime;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface VoucherRepository extends JpaRepository<VoucherEntity, UUID> {

    Optional<VoucherEntity> findByCodeIgnoreCase(String code);

    boolean existsByCodeIgnoreCase(String code);

    @Query("SELECT v FROM VoucherEntity v WHERE v.isActive = true AND v.validUntil > :now AND v.usedCount < v.quota ORDER BY v.createdAt DESC")
    List<VoucherEntity> findAvailableVouchers(@Param("now") ZonedDateTime now);

    @Query("SELECT v FROM VoucherEntity v WHERE " +
           "(:search IS NULL OR LOWER(v.code) LIKE LOWER(CONCAT('%', :search, '%')) OR LOWER(v.description) LIKE LOWER(CONCAT('%', :search, '%'))) AND " +
           "(:isActive IS NULL OR v.isActive = :isActive)")
    Page<VoucherEntity> findAllWithFilter(@Param("search") String search,
                                         @Param("isActive") Boolean isActive,
                                         Pageable pageable);
}
