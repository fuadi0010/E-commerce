package com.e_commerce.backend.feature_order.specification;

import com.e_commerce.backend.feature_order.model.OrderEntity;
import com.e_commerce.backend.feature_order.model.OrderStatus;
import org.springframework.data.jpa.domain.Specification;

import java.time.ZonedDateTime;

/**
 * JPA Specifications untuk query order dinamis.
 */
public class OrderSpecification {

    public static Specification<OrderEntity> hasStatus(OrderStatus status) {
        return (root, query, cb) -> {
            if (status == null) {
                return cb.conjunction();
            }
            return cb.equal(root.get("status"), status);
        };
    }

    public static Specification<OrderEntity> createdBetween(ZonedDateTime startDate, ZonedDateTime endDate) {
        return (root, query, cb) -> {
            if (startDate != null && endDate != null) {
                return cb.between(root.get("createdAt"), startDate, endDate);
            } else if (startDate != null) {
                return cb.greaterThanOrEqualTo(root.get("createdAt"), startDate);
            } else if (endDate != null) {
                return cb.lessThanOrEqualTo(root.get("createdAt"), endDate);
            }
            return cb.conjunction();
        };
    }

    public static Specification<OrderEntity> withFilters(OrderStatus status, ZonedDateTime startDate, ZonedDateTime endDate) {
        return Specification.where(hasStatus(status))
                .and(createdBetween(startDate, endDate));
    }
}
