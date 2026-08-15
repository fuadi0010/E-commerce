package com.e_commerce.backend.feature_user.repository;

import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;

import com.e_commerce.backend.feature_user.Model.Role;

import java.util.UUID;

public interface RoleRepository extends JpaRepository<Role, UUID>{
    Optional<Role> findByName(String name);
}
