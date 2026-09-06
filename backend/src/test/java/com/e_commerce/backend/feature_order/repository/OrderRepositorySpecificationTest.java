package com.e_commerce.backend.feature_order.repository;

import com.e_commerce.backend.feature_order.model.OrderEntity;
import com.e_commerce.backend.feature_order.model.OrderStatus;
import com.e_commerce.backend.feature_order.specification.OrderSpecification;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.transaction.annotation.Transactional;

import java.time.ZoneOffset;
import java.time.ZonedDateTime;

import static org.junit.jupiter.api.Assertions.*;

@SpringBootTest
@Transactional
class OrderRepositorySpecificationTest {

    @Autowired
    private OrderRepository orderRepository;

    @Test
    @DisplayName("findAll with null filters: berhasil tanpa PSQLException data type inference error")
    void findAll_NullFilters_Succeeds() {
        Page<OrderEntity> page = orderRepository.findAll(
                OrderSpecification.withFilters(null, null, null),
                PageRequest.of(0, 10)
        );

        assertNotNull(page);
        assertTrue(page.getTotalElements() > 0, "Seeded database harus memiliki orders");
    }

    @Test
    @DisplayName("findAll with status filter: berhasil mengembalikan pesanan sesuai status")
    void findAll_StatusFilter_ReturnsFilteredOrders() {
        Page<OrderEntity> page = orderRepository.findAll(
                OrderSpecification.withFilters(OrderStatus.PENDING, null, null),
                PageRequest.of(0, 10)
        );

        assertNotNull(page);
        for (OrderEntity order : page.getContent()) {
            assertEquals(OrderStatus.PENDING, order.getStatus());
        }
    }

    @Test
    @DisplayName("findAll with date range filter: berhasil tanpa error")
    void findAll_DateFilter_Succeeds() {
        ZonedDateTime start = ZonedDateTime.now(ZoneOffset.UTC).minusYears(1);
        ZonedDateTime end = ZonedDateTime.now(ZoneOffset.UTC).plusDays(1);

        Page<OrderEntity> page = orderRepository.findAll(
                OrderSpecification.withFilters(null, start, end),
                PageRequest.of(0, 10)
        );

        assertNotNull(page);
    }
}
