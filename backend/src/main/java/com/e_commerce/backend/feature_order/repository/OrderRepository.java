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
import org.springframework.data.jpa.domain.Specification;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.lang.Nullable;
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

    // Backward-compatible delegating method
    @Deprecated
    default Page<OrderEntity> findWithFilters(
            OrderStatus status,
            ZonedDateTime startDate,
            ZonedDateTime endDate,
            Pageable pageable) {
        return findAll(com.e_commerce.backend.feature_order.specification.OrderSpecification.withFilters(status, startDate, endDate), pageable);
    }
}
