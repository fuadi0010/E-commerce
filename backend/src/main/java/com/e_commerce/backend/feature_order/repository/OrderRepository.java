package com.e_commerce.backend.feature_order.repository;

import com.e_commerce.backend.feature_order.model.OrderEntity;
import com.e_commerce.backend.feature_order.model.OrderStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import org.springframework.data.jpa.domain.Specification;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.lang.Nullable;
import java.math.BigDecimal;
import java.time.ZonedDateTime;
import java.util.Collection;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface OrderRepository extends JpaRepository<OrderEntity, UUID>, JpaSpecificationExecutor<OrderEntity> {

    @Override
    @EntityGraph(attributePaths = {"items", "items.product", "user"})
    Optional<OrderEntity> findById(UUID id);

    @EntityGraph(attributePaths = {"items", "items.product", "user"})
    Page<OrderEntity> findByUserId(UUID userId, Pageable pageable);

    // Rule 22: Filter by status
    @EntityGraph(attributePaths = {"items", "items.product", "user"})
    Page<OrderEntity> findByUserIdAndStatus(UUID userId, OrderStatus status, Pageable pageable);

    @Override
    @EntityGraph(attributePaths = {"items", "items.product", "user"})
    Page<OrderEntity> findAll(@Nullable Specification<OrderEntity> spec, Pageable pageable);

    // ORDER-CANCEL-DASHBOARD-001: Customer Dashboard Metrics
    long countByUserIdAndStatusNot(UUID userId, OrderStatus status);

    @Query("SELECT COALESCE(SUM(o.totalAmount), 0) FROM OrderEntity o WHERE o.user.id = :userId AND o.status IN :statuses")
    BigDecimal sumTotalAmountByUserIdAndStatusIn(@Param("userId") UUID userId, @Param("statuses") Collection<OrderStatus> statuses);

    long countByUserIdAndStatusIn(UUID userId, Collection<OrderStatus> statuses);

    // ORDER-CANCEL-DASHBOARD-001: Admin Dashboard Metrics
    long countByStatusNot(OrderStatus status);

    @Query("SELECT COALESCE(SUM(o.totalAmount), 0) FROM OrderEntity o WHERE o.status IN :statuses")
    BigDecimal sumTotalAmountByStatusIn(@Param("statuses") Collection<OrderStatus> statuses);

    long countByStatus(OrderStatus status);
}
