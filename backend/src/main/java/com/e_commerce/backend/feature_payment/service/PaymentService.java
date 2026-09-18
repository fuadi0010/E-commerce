package com.e_commerce.backend.feature_payment.service;

import com.e_commerce.backend.feature_payment.dto.MidtransConfigResponse;
import com.e_commerce.backend.feature_payment.dto.PaymentResponse;

import java.util.UUID;

public interface PaymentService {

    /**
     * Membuat transaksi Snap baru atau mengembalikan pembayaran PENDING yang masih aktif untuk order tertentu.
     *
     * @param orderId ID pesanan
     * @param userId ID pengguna yang sedang login
     * @param isAdmin flag apakah pengguna memiliki role ADMIN
     * @return PaymentResponse detail pembayaran beserta snap token
     */
    PaymentResponse createOrGetPaymentForOrder(UUID orderId, UUID userId, boolean isAdmin);

    /**
     * Mengambil status pembayaran terbaru untuk order tertentu.
     *
     * @param orderId ID pesanan
     * @param userId ID pengguna yang sedang login
     * @param isAdmin flag apakah pengguna memiliki role ADMIN
     * @return PaymentResponse detail pembayaran
     */
    PaymentResponse getPaymentStatus(UUID orderId, UUID userId, boolean isAdmin);

    /**
     * Mengambil konfigurasi publik Midtrans (Client Key & Snap URL).
     *
     * @return MidtransConfigResponse
     */
    MidtransConfigResponse getPublicConfig();

    /**
     * Memproses notifikasi webhook HTTP POST dari Midtrans.
     * Memvalidasi signature SHA-512 dan memperbarui status order & pembayaran secara idempoten.
     *
     * @param payload DTO payload notifikasi dari Midtrans
     */
    void handleNotification(com.e_commerce.backend.feature_payment.dto.MidtransNotificationPayload payload);
}

