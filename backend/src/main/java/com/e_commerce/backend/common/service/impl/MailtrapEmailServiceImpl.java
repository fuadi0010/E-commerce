package com.e_commerce.backend.common.service.impl;

import com.e_commerce.backend.common.service.EmailService;
import io.mailtrap.client.MailtrapClient;
import io.mailtrap.model.request.emails.Address;
import io.mailtrap.model.request.emails.MailtrapMail;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.util.List;

@Slf4j
@Service
public class MailtrapEmailServiceImpl implements EmailService {

    private final MailtrapClient mailtrapClient;

    @Value("${mailtrap.from.email:hello@demomailtrap.co}")
    private String fromEmail;

    @Value("${mailtrap.from.name:E-Commerce App}")
    private String fromName;

    public MailtrapEmailServiceImpl(@Autowired(required = false) MailtrapClient mailtrapClient) {
        this.mailtrapClient = mailtrapClient;
    }

    @Override
    public boolean sendEmail(String to, String subject, String text, String category) {
        if (mailtrapClient == null) {
            log.warn("Mailtrap client is not configured (missing or invalid API token). Skipping email to {}", to);
            return false;
        }

        try {
            MailtrapMail mail = MailtrapMail.builder()
                    .from(new Address(fromEmail, fromName))
                    .to(List.of(new Address(to)))
                    .subject(subject)
                    .text(text)
                    .category(category != null && !category.isBlank() ? category : "General")
                    .build();

            Object response = mailtrapClient.send(mail);
            log.info("Email successfully sent via Mailtrap to {}. Response: {}", to, response);
            return true;
        } catch (Exception e) {
            log.error("Failed to send email via Mailtrap to {}: {}", to, e.getMessage(), e);
            return false;
        }
    }

    @Override
    public boolean sendPasswordResetEmail(String to, String resetLink) {
        String subject = "Reset Password - E-Commerce App";
        String content = "Silakan klik link berikut untuk melakukan reset password Anda:\n\n"
                + resetLink + "\n\nLink ini akan kedaluwarsa dalam 30 menit.";
        return sendEmail(to, subject, content, "Password Reset");
    }
}
