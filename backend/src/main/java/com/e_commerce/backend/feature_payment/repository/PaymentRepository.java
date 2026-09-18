package com.e_commerce.backend.feature_payment.repository;

import com.e_commerce.backend.feature_payment.model.PaymentEntity;
import com.e_commerce.backend.feature_payment.model.PaymentStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

/**
 * Spring Data JPA Repository untuk entitas pembayaran Midtrans.
 */
@Repository
public interface PaymentRepository extends JpaRepository<PaymentEntity, UUID> {

    /**
     * Mencari pembayaran berdasarkan Midtrans transaction_id.
     */
    Optional<PaymentEntity> findByTransactionId(String transactionId);

    /**
     * Mencari pembayaran berdasarkan Snap Token.
     */
    Optional<PaymentEntity> findBySnapToken(String snapToken);

    /**
     * Mengambil entitas pembayaran terbaru untuk order tertentu.
     */
    Optional<PaymentEntity> findFirstByOrderIdOrderByCreatedAtDesc(UUID orderId);

    /**
     * Mengambil seluruh riwayat percobaan pembayaran untuk order tertentu.
     */
    List<PaymentEntity> findByOrderIdOrderByCreatedAtDesc(UUID orderId);

    /**
     * Memeriksa apakah ada pembayaran dengan status tertentu untuk order tertentu.
     */
    boolean existsByOrderIdAndStatus(UUID orderId, PaymentStatus status);
}
