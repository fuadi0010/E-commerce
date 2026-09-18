package com.e_commerce.backend.feature_payment.client;

import com.e_commerce.backend.feature_payment.config.MidtransProperties;
import com.e_commerce.backend.feature_payment.dto.MidtransNotificationPayload;
import com.e_commerce.backend.feature_payment.dto.MidtransSnapRequest;
import com.e_commerce.backend.feature_payment.dto.MidtransSnapResponse;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Component;
import org.springframework.web.client.RestClient;

import java.nio.charset.StandardCharsets;
import java.util.Base64;

/**
 * HTTP Client untuk berkomunikasi dengan API Midtrans (Snap & Core API).
 */
@Component
@RequiredArgsConstructor
@Slf4j
public class MidtransClient {

    private final MidtransProperties properties;

    /**
     * Memanggil Midtrans Snap API untuk membuat token transaksi pembayaran.
     *
     * @param request payload transaksi
     * @return MidtransSnapResponse berisi token dan redirect URL
     */
    public MidtransSnapResponse createSnapTransaction(MidtransSnapRequest request) {
        String serverKey = properties.getServerKey();
        if (serverKey == null || serverKey.isBlank() || serverKey.contains("CHANGE_ME")) {
            log.warn("Midtrans Server Key is not set or still default CHANGE_ME. Generating sandbox mock token for development.");
            return MidtransSnapResponse.builder()
                    .token("sandbox-snap-token-" + request.getTransactionDetails().getOrderId())
                    .redirectUrl("https://app.sandbox.midtrans.com/snap/v2/vtweb/sandbox-token")
                    .build();
        }

        String baseUrl = properties.isProduction() ? "https://app.midtrans.com" : "https://app.sandbox.midtrans.com";
        String authHeader = "Basic " + Base64.getEncoder().encodeToString((serverKey.trim() + ":").getBytes(StandardCharsets.UTF_8));

        log.info("Requesting Midtrans Snap transaction for order_id={}", request.getTransactionDetails().getOrderId());

        try {
            RestClient client = RestClient.builder()
                    .baseUrl(baseUrl)
                    .defaultHeader(HttpHeaders.AUTHORIZATION, authHeader)
                    .defaultHeader(HttpHeaders.CONTENT_TYPE, MediaType.APPLICATION_JSON_VALUE)
                    .defaultHeader(HttpHeaders.ACCEPT, MediaType.APPLICATION_JSON_VALUE)
                    .build();

            return client.post()
                    .uri("/snap/v1/transactions")
                    .body(request)
                    .retrieve()
                    .body(MidtransSnapResponse.class);
        } catch (Exception ex) {
            log.error("Failed to communicate with Midtrans Snap API: {}", ex.getMessage());
            throw new IllegalStateException("Gagal menghubungkan ke Midtrans Payment Gateway: " + ex.getMessage());
        }
    }

    /**
     * Mengambil status transaksi dari Midtrans Core API (GET /v2/{order_id_or_transaction_id}/status).
     *
     * @param orderIdOrTransactionId order_id atau transaction_id di Midtrans
     * @return MidtransNotificationPayload status transaksi dari Midtrans, atau null jika gagal/tidak ditemukan
     */
    public MidtransNotificationPayload getTransactionStatus(String orderIdOrTransactionId) {
        String serverKey = properties.getServerKey();
        if (serverKey == null || serverKey.isBlank() || serverKey.contains("CHANGE_ME")) {
            log.warn("Midtrans Server Key is not set or still default CHANGE_ME. Cannot check transaction status from Midtrans.");
            return null;
        }

        String baseUrl = (properties.getApiUrl() != null && !properties.getApiUrl().isBlank())
                ? properties.getApiUrl()
                : (properties.isProduction() ? "https://api.midtrans.com" : "https://api.sandbox.midtrans.com");
        String authHeader = "Basic " + Base64.getEncoder().encodeToString((serverKey.trim() + ":").getBytes(StandardCharsets.UTF_8));

        log.info("Requesting Midtrans transaction status for id={}", orderIdOrTransactionId);

        try {
            RestClient client = RestClient.builder()
                    .baseUrl(baseUrl)
                    .defaultHeader(HttpHeaders.AUTHORIZATION, authHeader)
                    .defaultHeader(HttpHeaders.ACCEPT, MediaType.APPLICATION_JSON_VALUE)
                    .build();

            return client.get()
                    .uri("/v2/{id}/status", orderIdOrTransactionId)
                    .retrieve()
                    .body(MidtransNotificationPayload.class);
        } catch (Exception ex) {
            log.warn("Failed to get Midtrans transaction status for id={}: {}", orderIdOrTransactionId, ex.getMessage());
            return null;
        }
    }
}
