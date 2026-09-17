package com.e_commerce.backend.feature_auth.repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.e_commerce.backend.feature_auth.model.RegistrationOtpEntity;
import com.e_commerce.backend.feature_user.model.UserEntity;

@Repository
public interface RegistrationOtpRepository extends JpaRepository<RegistrationOtpEntity, UUID> {
    Optional<RegistrationOtpEntity> findTopByUserAndIsUsedFalseOrderByCreatedAtDesc(UserEntity user);
    List<RegistrationOtpEntity> findAllByUserAndIsUsedFalse(UserEntity user);
}
