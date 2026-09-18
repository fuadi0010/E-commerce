package com.e_commerce.backend.feature_payment.controller;

import com.e_commerce.backend.common.dto.ApiResponse;
import com.e_commerce.backend.feature_payment.dto.MidtransConfigResponse;
import com.e_commerce.backend.feature_payment.dto.PaymentResponse;
import com.e_commerce.backend.feature_payment.model.PaymentStatus;
import com.e_commerce.backend.feature_payment.service.PaymentService;
import com.e_commerce.backend.feature_user.model.Role;
import com.e_commerce.backend.feature_user.model.UserEntity;
import com.e_commerce.backend.security.UserDetailsImpl;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;

import java.math.BigDecimal;
import java.util.Set;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
@DisplayName("PaymentController Unit Tests")
class PaymentControllerTest {

    @Mock
    private PaymentService paymentService;

    @InjectMocks
    private PaymentController paymentController;

    private UserDetailsImpl customerUserDetails;
    private UUID userId;
    private UUID orderId;

    @BeforeEach
    void setUp() {
        userId = UUID.randomUUID();
        orderId = UUID.randomUUID();

        Role customerRole = new Role();
        customerRole.setName("ROLE_CUSTOMER");

        UserEntity user = new UserEntity();
        user.setId(userId);
        user.setEmail("buyer@example.com");
        user.setRoles(Set.of(customerRole));

        customerUserDetails = new UserDetailsImpl(user);
    }

    @Test
    @DisplayName("createOrderPayment: Returns 200 OK with PaymentResponse")
    void createOrderPayment_Success() {
        PaymentResponse response = PaymentResponse.builder()
                .id(UUID.randomUUID())
                .orderId(orderId)
                .snapToken("test-snap-token")
                .redirectUrl("https://app.sandbox.midtrans.com/snap/v2/vtweb/test-snap-token")
                .grossAmount(BigDecimal.valueOf(250000))
                .status(PaymentStatus.PENDING)
                .build();

        when(paymentService.createOrGetPaymentForOrder(orderId, userId, false)).thenReturn(response);

        ResponseEntity<ApiResponse<PaymentResponse>> result = paymentController.createOrderPayment(orderId, customerUserDetails);

        assertNotNull(result);
        assertEquals(HttpStatus.OK, result.getStatusCode());
        assertNotNull(result.getBody());
        assertEquals("test-snap-token", result.getBody().getData().getSnapToken());
        verify(paymentService, times(1)).createOrGetPaymentForOrder(orderId, userId, false);
    }

    @Test
    @DisplayName("getOrderPayment: Returns 200 OK with PaymentResponse")
    void getOrderPayment_Success() {
        PaymentResponse response = PaymentResponse.builder()
                .id(UUID.randomUUID())
                .orderId(orderId)
                .snapToken("test-snap-token")
                .status(PaymentStatus.SETTLEMENT)
                .build();

        when(paymentService.getPaymentStatus(orderId, userId, false)).thenReturn(response);

        ResponseEntity<ApiResponse<PaymentResponse>> result = paymentController.getOrderPayment(orderId, customerUserDetails);

        assertNotNull(result);
        assertEquals(HttpStatus.OK, result.getStatusCode());
        assertNotNull(result.getBody());
        assertEquals(PaymentStatus.SETTLEMENT, result.getBody().getData().getStatus());
        verify(paymentService, times(1)).getPaymentStatus(orderId, userId, false);
    }

    @Test
    @DisplayName("getMidtransConfig: Returns 200 OK with public Midtrans configuration")
    void getMidtransConfig_Success() {
        MidtransConfigResponse config = MidtransConfigResponse.builder()
                .clientKey("SB-Mid-client-xyz")
                .snapUrl("https://app.sandbox.midtrans.com/snap/snap.js")
                .isProduction(false)
                .build();

        when(paymentService.getPublicConfig()).thenReturn(config);

        ResponseEntity<ApiResponse<MidtransConfigResponse>> result = paymentController.getMidtransConfig();

        assertNotNull(result);
        assertEquals(HttpStatus.OK, result.getStatusCode());
        assertNotNull(result.getBody());
        assertEquals("SB-Mid-client-xyz", result.getBody().getData().getClientKey());
        assertFalse(result.getBody().getData().isProduction());
        verify(paymentService, times(1)).getPublicConfig();
    }

    @Test
    @DisplayName("handleMidtransNotification: Returns 200 OK after processing webhook payload")
    void handleMidtransNotification_Success() {
        com.e_commerce.backend.feature_payment.dto.MidtransNotificationPayload payload =
                com.e_commerce.backend.feature_payment.dto.MidtransNotificationPayload.builder()
                        .orderId(orderId.toString())
                        .statusCode("200")
                        .grossAmount("150000.00")
                        .signatureKey("valid-hash")
                        .transactionStatus("settlement")
                        .build();

        doNothing().when(paymentService).handleNotification(payload);

        ResponseEntity<ApiResponse<java.util.Map<String, String>>> response = paymentController.handleMidtransNotification(payload);

        assertNotNull(response);
        assertEquals(HttpStatus.OK, response.getStatusCode());
        assertNotNull(response.getBody());
        assertEquals("ok", response.getBody().getData().get("status"));
        verify(paymentService, times(1)).handleNotification(payload);
    }
}

