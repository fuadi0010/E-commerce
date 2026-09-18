package com.e_commerce.backend.feature_auth.repository;

import com.e_commerce.backend.feature_auth.model.PasswordResetTokenEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

import com.e_commerce.backend.feature_user.model.UserEntity;

@Repository
public interface PasswordResetTokenRepository extends JpaRepository<PasswordResetTokenEntity, UUID> {
    Optional<PasswordResetTokenEntity> findByTokenHash(String tokenHash);
    List<PasswordResetTokenEntity> findAllByUserAndIsUsedFalse(UserEntity user);
}

