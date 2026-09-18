package com.e_commerce.backend.feature_auth.repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.e_commerce.backend.feature_auth.model.PasswordResetCodeEntity;
import com.e_commerce.backend.feature_user.model.UserEntity;

@Repository
public interface PasswordResetCodeRepository extends JpaRepository<PasswordResetCodeEntity, UUID> {
    Optional<PasswordResetCodeEntity> findTopByUserAndIsUsedFalseOrderByCreatedAtDesc(UserEntity user);
    List<PasswordResetCodeEntity> findAllByUserAndIsUsedFalse(UserEntity user);
}
