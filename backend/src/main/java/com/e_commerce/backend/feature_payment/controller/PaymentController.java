package com.e_commerce.backend.feature_payment.controller;

import com.e_commerce.backend.common.dto.ApiResponse;
import com.e_commerce.backend.feature_payment.dto.MidtransConfigResponse;
import com.e_commerce.backend.feature_payment.dto.PaymentResponse;
import com.e_commerce.backend.feature_payment.service.PaymentService;
import com.e_commerce.backend.security.UserDetailsImpl;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.UUID;

/**
 * Controller untuk transaksi pembayaran Midtrans Payment Gateway.
 */
@RestController
@RequiredArgsConstructor
public class PaymentController {

    private final PaymentService paymentService;

    /**
     * Membuat atau mengambil token Snap Midtrans untuk pesanan tertentu.
     */
    @PostMapping("/api/orders/{id}/payment")
    @PreAuthorize("hasAnyRole('CUSTOMER', 'ADMIN')")
    public ResponseEntity<ApiResponse<PaymentResponse>> createOrderPayment(
            @PathVariable("id") UUID orderId,
            @AuthenticationPrincipal UserDetailsImpl userDetails) {

        boolean isAdmin = userDetails.getAuthorities().stream()
                .anyMatch(a -> a.getAuthority().equals("ROLE_ADMIN"));

        PaymentResponse response = paymentService.createOrGetPaymentForOrder(orderId, userDetails.getId(), isAdmin);
        return ResponseEntity.ok(ApiResponse.success(response, "Token pembayaran Midtrans berhasil dibuat"));
    }

    /**
     * Mengambil status transaksi pembayaran terbaru untuk pesanan tertentu.
     */
    @GetMapping("/api/orders/{id}/payment")
    @PreAuthorize("hasAnyRole('CUSTOMER', 'ADMIN')")
    public ResponseEntity<ApiResponse<PaymentResponse>> getOrderPayment(
            @PathVariable("id") UUID orderId,
            @AuthenticationPrincipal UserDetailsImpl userDetails) {

        boolean isAdmin = userDetails.getAuthorities().stream()
                .anyMatch(a -> a.getAuthority().equals("ROLE_ADMIN"));

        PaymentResponse response = paymentService.getPaymentStatus(orderId, userDetails.getId(), isAdmin);
        return ResponseEntity.ok(ApiResponse.success(response, "Status pembayaran berhasil diambil"));
    }

    /**
     * Mengambil konfigurasi publik Midtrans (Client Key & Snap script URL).
     * Endpoint publik tanpa autentikasi, aman karena tidak mengandung Server Key.
     */
    @GetMapping("/api/payments/midtrans/config")
    public ResponseEntity<ApiResponse<MidtransConfigResponse>> getMidtransConfig() {
        MidtransConfigResponse response = paymentService.getPublicConfig();
        return ResponseEntity.ok(ApiResponse.success(response, "Konfigurasi publik Midtrans berhasil diambil"));
    }

    /**
     * Webhook Notification Handler dari Midtrans.
     * Menerima event perubahan status transaksi pembayaran secara real-time.
     * Endpoint ini publik (tanpa token Bearer) dan diverifikasi menggunakan SHA-512 signature key.
     */
    @PostMapping("/api/payments/midtrans/notification")
    public ResponseEntity<ApiResponse<java.util.Map<String, String>>> handleMidtransNotification(
            @org.springframework.web.bind.annotation.RequestBody com.e_commerce.backend.feature_payment.dto.MidtransNotificationPayload payload) {

        paymentService.handleNotification(payload);
        return ResponseEntity.ok(ApiResponse.success(
                java.util.Map.of("status", "ok"),
                "Notifikasi Midtrans berhasil diproses"
        ));
    }
}

