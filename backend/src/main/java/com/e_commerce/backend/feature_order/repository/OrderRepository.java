package com.e_commerce.backend.feature_order.repository;

import com.e_commerce.backend.feature_order.model.OrderEntity;
import com.e_commerce.backend.feature_order.model.OrderStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.ZonedDateTime;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface OrderRepository extends JpaRepository<OrderEntity, UUID> {

    @Override
    @EntityGraph(attributePaths = {"items", "items.product", "user"})
    Optional<OrderEntity> findById(UUID id);

    @EntityGraph(attributePaths = {"items", "items.product", "user"})
    Page<OrderEntity> findByUserId(UUID userId, Pageable pageable);

    // Rule 22: Filter by status
    @EntityGraph(attributePaths = {"items", "items.product", "user"})
    Page<OrderEntity> findByUserIdAndStatus(UUID userId, OrderStatus status, Pageable pageable);

    // Rule 22: Filter by date range (Admin)
    @EntityGraph(attributePaths = {"items", "items.product", "user"})
    @Query("SELECT o FROM OrderEntity o WHERE " +
           "(:status IS NULL OR o.status = :status) AND " +
           "(:startDate IS NULL OR o.createdAt >= :startDate) AND " +
           "(:endDate IS NULL OR o.createdAt <= :endDate)")
    Page<OrderEntity> findWithFilters(
            @Param("status") OrderStatus status,
            @Param("startDate") ZonedDateTime startDate,
            @Param("endDate") ZonedDateTime endDate,
            Pageable pageable);
}
