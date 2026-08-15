package com.e_commerce.backend.feature_user.repository;

import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;

import com.e_commerce.backend.feature_user.Model.UserEntity;
import com.e_commerce.backend.feature_user.Model.UserProfileEntity;

import java.util.UUID;

public interface UserProfileRepository extends JpaRepository<UserProfileEntity, UUID>{
    Optional<UserProfileEntity> findByUser(UserEntity user);
}
