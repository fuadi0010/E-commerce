package com.e_commerce.backend.common.service.impl;

import io.mailtrap.client.MailtrapClient;
import io.mailtrap.model.request.emails.MailtrapMail;
import io.mailtrap.model.response.emails.SendResponse;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.test.util.ReflectionTestUtils;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
@DisplayName("MailtrapEmailServiceImpl Unit Tests")
class MailtrapEmailServiceImplTest {

    @Mock
    private MailtrapClient mailtrapClient;

    private MailtrapEmailServiceImpl emailService;

    @BeforeEach
    void setUp() {
        emailService = new MailtrapEmailServiceImpl(mailtrapClient);
        ReflectionTestUtils.setField(emailService, "fromEmail", "hello@demomailtrap.co");
        ReflectionTestUtils.setField(emailService, "fromName", "E-Commerce App");
    }

    @Test
    @DisplayName("sendEmail: When MailtrapClient is configured -> Sends email and returns true")
    void sendEmail_Success() {
        SendResponse mockResponse = mock(SendResponse.class);
        when(mailtrapClient.send(any(MailtrapMail.class))).thenReturn(mockResponse);

        boolean result = emailService.sendEmail(
                "buyer@example.com",
                "Order Confirmation",
                "Thank you for your purchase!",
                "Orders"
        );

        assertTrue(result);

        ArgumentCaptor<MailtrapMail> mailCaptor = ArgumentCaptor.forClass(MailtrapMail.class);
        verify(mailtrapClient, times(1)).send(mailCaptor.capture());

        MailtrapMail capturedMail = mailCaptor.getValue();
        assertEquals("Order Confirmation", capturedMail.getSubject());
        assertEquals("Thank you for your purchase!", capturedMail.getText());
        assertEquals("Orders", capturedMail.getCategory());
        assertEquals(1, capturedMail.getTo().size());
        assertEquals("buyer@example.com", capturedMail.getTo().get(0).getEmail());
        assertEquals("hello@demomailtrap.co", capturedMail.getFrom().getEmail());
        assertEquals("E-Commerce App", capturedMail.getFrom().getName());
    }

    @Test
    @DisplayName("sendEmail: When MailtrapClient is null (missing token) -> Returns false gracefully without throwing")
    void sendEmail_NullClient_ReturnsFalse() {
        MailtrapEmailServiceImpl unconfiguredService = new MailtrapEmailServiceImpl(null);

        boolean result = unconfiguredService.sendEmail(
                "buyer@example.com",
                "Order Confirmation",
                "Thank you!",
                "Orders"
        );

        assertFalse(result);
    }

    @Test
    @DisplayName("sendEmail: When MailtrapClient is null but simulation is enabled -> Simulates email, logs, and returns true")
    void sendEmail_NullClient_SimulationEnabled_ReturnsTrue() {
        MailtrapEmailServiceImpl simulationService = new MailtrapEmailServiceImpl(null);
        ReflectionTestUtils.setField(simulationService, "simulationEnabled", true);
        ReflectionTestUtils.setField(simulationService, "fromEmail", "hello@demomailtrap.co");
        ReflectionTestUtils.setField(simulationService, "fromName", "E-Commerce App");

        boolean result = simulationService.sendEmail(
                "buyer@example.com",
                "Order Confirmation",
                "Thank you!",
                "Orders"
        );

        assertTrue(result);
    }

    @Test
    @DisplayName("sendEmail: When MailtrapClient throws exception -> Catches and returns false gracefully")
    void sendEmail_Exception_ReturnsFalse() {
        when(mailtrapClient.send(any(MailtrapMail.class))).thenThrow(new RuntimeException("Mailtrap connection timeout"));

        boolean result = emailService.sendEmail(
                "buyer@example.com",
                "Subject",
                "Content",
                "Test"
        );

        assertFalse(result);
        verify(mailtrapClient, times(1)).send(any(MailtrapMail.class));
    }

    @Test
    @DisplayName("sendPasswordResetEmail: Formats reset message, sets Password Reset category, and delegates to send")
    void sendPasswordResetEmail_Success() {
        SendResponse mockResponse = mock(SendResponse.class);
        when(mailtrapClient.send(any(MailtrapMail.class))).thenReturn(mockResponse);

        String resetLink = "http://localhost:4200/reset-password?token=sample-uuid-token";
        boolean result = emailService.sendPasswordResetEmail("user@example.com", resetLink);

        assertTrue(result);

        ArgumentCaptor<MailtrapMail> mailCaptor = ArgumentCaptor.forClass(MailtrapMail.class);
        verify(mailtrapClient, times(1)).send(mailCaptor.capture());

        MailtrapMail capturedMail = mailCaptor.getValue();
        assertEquals("Reset Password - E-Commerce App", capturedMail.getSubject());
        assertTrue(capturedMail.getText().contains(resetLink));
        assertEquals("Password Reset", capturedMail.getCategory());
        assertEquals("user@example.com", capturedMail.getTo().get(0).getEmail());
    }
}
