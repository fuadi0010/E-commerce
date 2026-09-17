package com.e_commerce.backend.common.service.impl;

import jakarta.mail.Session;
import jakarta.mail.internet.MimeMessage;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.test.util.ReflectionTestUtils;

import java.util.Properties;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
@DisplayName("SmtpEmailServiceImpl Unit Tests")
class SmtpEmailServiceImplTest {

    @Mock
    private JavaMailSender mailSender;

    private SmtpEmailServiceImpl emailService;

    @BeforeEach
    void setUp() {
        emailService = new SmtpEmailServiceImpl(mailSender);
        ReflectionTestUtils.setField(emailService, "mailUsername", "app@gmail.com");
        ReflectionTestUtils.setField(emailService, "smtpFromEmail", "app@gmail.com");
        ReflectionTestUtils.setField(emailService, "fromName", "E-Commerce App");
    }

    private MimeMessage createRealMimeMessage() {
        return new MimeMessage(Session.getInstance(new Properties()));
    }

    @Test
    @DisplayName("sendEmail: When JavaMailSender is configured -> Sends email via SMTP and returns true")
    void sendEmail_Success() {
        MimeMessage mimeMessage = createRealMimeMessage();
        when(mailSender.createMimeMessage()).thenReturn(mimeMessage);

        boolean result = emailService.sendEmail(
                "buyer@example.com",
                "Order Confirmation",
                "Thank you for your purchase!",
                "Orders"
        );

        assertTrue(result);

        ArgumentCaptor<MimeMessage> messageCaptor = ArgumentCaptor.forClass(MimeMessage.class);
        verify(mailSender, times(1)).send(messageCaptor.capture());

        MimeMessage captured = messageCaptor.getValue();
        assertNotNull(captured);
        verify(mailSender, times(1)).createMimeMessage();
    }

    @Test
    @DisplayName("sendEmail: When JavaMailSender throws exception -> Catches exception and returns false gracefully")
    void sendEmail_MailSenderThrows_ReturnsFalse() {
        MimeMessage mimeMessage = createRealMimeMessage();
        when(mailSender.createMimeMessage()).thenReturn(mimeMessage);
        doThrow(new RuntimeException("SMTP authentication failed")).when(mailSender).send(any(MimeMessage.class));

        boolean result = emailService.sendEmail(
                "buyer@example.com",
                "Test Subject",
                "Test Content",
                "General"
        );

        assertFalse(result);
        verify(mailSender, times(1)).send(any(MimeMessage.class));
    }

    @Test
    @DisplayName("sendEmail: When sender email is not configured -> Returns false gracefully without sending")
    void sendEmail_NoSenderConfigured_ReturnsFalse() {
        ReflectionTestUtils.setField(emailService, "mailUsername", "");
        ReflectionTestUtils.setField(emailService, "smtpFromEmail", "");

        boolean result = emailService.sendEmail(
                "buyer@example.com",
                "Test Subject",
                "Test Content",
                "General"
        );

        assertFalse(result);
        verify(mailSender, never()).createMimeMessage();
        verify(mailSender, never()).send(any(MimeMessage.class));
    }

    @Test
    @DisplayName("sendEmail: When JavaMailSender is null -> Returns false gracefully")
    void sendEmail_MailSenderNull_ReturnsFalse() {
        SmtpEmailServiceImpl unconfiguredService = new SmtpEmailServiceImpl(null);

        boolean result = unconfiguredService.sendEmail(
                "buyer@example.com",
                "Test Subject",
                "Test Content",
                "General"
        );

        assertFalse(result);
    }

    @Test
    @DisplayName("sendPasswordResetEmail: Formats reset message and successfully delivers")
    void sendPasswordResetEmail_Success() {
        MimeMessage mimeMessage = createRealMimeMessage();
        when(mailSender.createMimeMessage()).thenReturn(mimeMessage);

        String resetLink = "http://localhost:4200/reset-password?token=sample-uuid-token";
        boolean result = emailService.sendPasswordResetEmail("user@example.com", resetLink);

        assertTrue(result);
        verify(mailSender, times(1)).send(any(MimeMessage.class));
    }

    @Test
    @DisplayName("sendRegistrationOtpEmail: Formats OTP message with expiration and successfully delivers")
    void sendRegistrationOtpEmail_Success() {
        MimeMessage mimeMessage = createRealMimeMessage();
        when(mailSender.createMimeMessage()).thenReturn(mimeMessage);

        boolean result = emailService.sendRegistrationOtpEmail("user@example.com", "John Doe", "123456", 5);

        assertTrue(result);
        verify(mailSender, times(1)).send(any(MimeMessage.class));
    }
}
