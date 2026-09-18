package com.e_commerce.backend.feature_payment.repository;

import com.e_commerce.backend.feature_order.model.OrderEntity;
import com.e_commerce.backend.feature_order.repository.OrderRepository;
import com.e_commerce.backend.feature_payment.model.PaymentEntity;
import com.e_commerce.backend.feature_payment.model.PaymentStatus;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.ZoneOffset;
import java.time.ZonedDateTime;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.*;

@SpringBootTest
@Transactional
@DisplayName("PaymentRepository Integration Tests")
class PaymentRepositoryTest {

    @Autowired
    private PaymentRepository paymentRepository;

    @Autowired
    private OrderRepository orderRepository;

    @Test
    @DisplayName("Should save and retrieve payment entity with correct auditing and status")
    void testSaveAndRetrievePayment() {
        OrderEntity order = orderRepository.findAll().stream().findFirst()
                .orElseThrow(() -> new IllegalStateException("Test database must contain at least one order"));

        PaymentEntity payment = PaymentEntity.builder()
                .order(order)
                .transactionId("trx-test-" + UUID.randomUUID())
                .snapToken("snap-token-12345")
                .redirectUrl("https://app.sandbox.midtrans.com/snap/v2/vtweb/snap-token-12345")
                .paymentType("qris")
                .grossAmount(order.getTotalAmount())
                .currency("IDR")
                .status(PaymentStatus.PENDING)
                .fraudStatus("ACCEPT")
                .paymentDetails("{\"status\":\"pending\"}")
                .expiryTime(ZonedDateTime.now(ZoneOffset.UTC).plusDays(1))
                .build();

        PaymentEntity saved = paymentRepository.saveAndFlush(payment);

        assertNotNull(saved.getId());
        assertNotNull(saved.getCreatedAt());
        assertNotNull(saved.getUpdatedAt());
        assertEquals("snap-token-12345", saved.getSnapToken());
        assertEquals(PaymentStatus.PENDING, saved.getStatus());

        // Test findByTransactionId
        Optional<PaymentEntity> foundByTrx = paymentRepository.findByTransactionId(saved.getTransactionId());
        assertTrue(foundByTrx.isPresent());
        assertEquals(saved.getId(), foundByTrx.get().getId());

        // Test findBySnapToken
        Optional<PaymentEntity> foundBySnap = paymentRepository.findBySnapToken("snap-token-12345");
        assertTrue(foundBySnap.isPresent());
        assertEquals(saved.getId(), foundBySnap.get().getId());

        // Test findFirstByOrderIdOrderByCreatedAtDesc
        Optional<PaymentEntity> latest = paymentRepository.findFirstByOrderIdOrderByCreatedAtDesc(order.getId());
        assertTrue(latest.isPresent());
        assertEquals(saved.getId(), latest.get().getId());

        // Test existsByOrderIdAndStatus
        assertTrue(paymentRepository.existsByOrderIdAndStatus(order.getId(), PaymentStatus.PENDING));
        assertFalse(paymentRepository.existsByOrderIdAndStatus(order.getId(), PaymentStatus.SETTLEMENT));

        // Test list by order
        List<PaymentEntity> list = paymentRepository.findByOrderIdOrderByCreatedAtDesc(order.getId());
        assertFalse(list.isEmpty());
        assertEquals(saved.getId(), list.get(0).getId());
    }
}
