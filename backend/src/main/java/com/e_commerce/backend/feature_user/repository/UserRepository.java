package com.e_commerce.backend.feature_user.repository;

import java.util.Optional;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import com.e_commerce.backend.feature_user.model.UserEntity;

import java.util.UUID;

public interface UserRepository extends JpaRepository<UserEntity, UUID>{
    Optional<UserEntity> findByEmailAndDeletedAtIsNull(String email);

    @Query("SELECT u FROM UserEntity u LEFT JOIN UserProfileEntity p ON p.user = u WHERE " +
           "(:search IS NULL OR LOWER(u.email) LIKE LOWER(CONCAT('%', :search, '%')) OR LOWER(p.fullName) LIKE LOWER(CONCAT('%', :search, '%')))")
    Page<UserEntity> findAllWithSearch(@Param("search") String search, Pageable pageable);
}
