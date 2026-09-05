package com.e_commerce.backend.feature_user.repository;

import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;

import com.e_commerce.backend.feature_user.model.UserEntity;

import java.util.UUID;

public interface UserRepository extends JpaRepository<UserEntity, UUID>{
    Optional<UserEntity> findByEmailAndDeletedAtIsNull(String email);
}
