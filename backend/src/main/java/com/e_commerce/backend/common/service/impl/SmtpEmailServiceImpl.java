package com.e_commerce.backend.common.service.impl;

import com.e_commerce.backend.common.service.EmailService;
import jakarta.mail.internet.MimeMessage;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.stereotype.Service;

import java.nio.charset.StandardCharsets;

@Slf4j
@Service
public class SmtpEmailServiceImpl implements EmailService {

    private final JavaMailSender mailSender;

    @Value("${spring.mail.username:}")
    private String mailUsername;

    @Value("${spring.mail.properties.mail.smtp.from:}")
    private String smtpFromEmail;

    @Value("${app.mail.from:}")
    private String appMailFrom;

    @Value("${MAIL_FROM:}")
    private String envMailFrom;

    @Value("${app.mail.from-name:E-Commerce App}")
    private String fromName;

    public SmtpEmailServiceImpl(@Autowired(required = false) JavaMailSender mailSender) {
        this.mailSender = mailSender;
    }

    @Override
    public boolean sendEmail(String to, String subject, String text, String category) {
        if (mailSender == null) {
            log.error("JavaMailSender is not available. Cannot deliver email to {}", to);
            return false;
        }

        String sender;
        if (smtpFromEmail != null && !smtpFromEmail.isBlank()) {
            sender = smtpFromEmail.trim();
        } else if (appMailFrom != null && !appMailFrom.isBlank()) {
            sender = appMailFrom.trim();
        } else if (envMailFrom != null && !envMailFrom.isBlank()) {
            sender = envMailFrom.trim();
        } else if (mailUsername != null && !mailUsername.isBlank()) {
            sender = mailUsername.trim();
        } else {
            sender = "";
        }

        if (sender.isBlank()) {
            log.error("No sender email configured (spring.mail.username, spring.mail.properties.mail.smtp.from, or app.mail.from). Cannot deliver email to {}", to);
            return false;
        }

        try {
            MimeMessage mimeMessage = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(mimeMessage, false, StandardCharsets.UTF_8.name());

            if (fromName != null && !fromName.isBlank()) {
                helper.setFrom(sender, fromName.trim());
            } else {
                helper.setFrom(sender);
            }

            helper.setTo(to);
            helper.setSubject(subject);
            helper.setText(text, false);

            if (category != null && !category.isBlank()) {
                mimeMessage.setHeader("X-Category", category.trim());
            }

            mailSender.send(mimeMessage);
            log.info("Email successfully sent via SMTP to {} [Category: {}]", to, category != null ? category : "General");
            return true;
        } catch (Exception e) {
            log.error("Failed to send email via SMTP to {}: {}", to, e.getMessage());
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

    @Override
    public boolean sendPasswordResetOtpEmail(String to, String resetCode, int expirationMinutes) {
        String subject = "Kode Reset Password - E-Commerce App";
        String content = "Halo,\n\n"
                + "Kami menerima permintaan untuk mereset password akun Anda.\n\n"
                + "Kode reset password Anda adalah:\n\n"
                + resetCode + "\n\n"
                + "Kode ini berlaku selama " + expirationMinutes + " menit.\n\n"
                + "Jangan berikan kode ini kepada siapa pun demi keamanan akun Anda.\n\n"
                + "Jika Anda tidak meminta kode ini, silakan abaikan email ini dan password Anda akan tetap aman.";
        return sendEmail(to, subject, content, "Password Reset OTP");
    }

    @Override
    public boolean sendRegistrationOtpEmail(String to, String fullName, String otp, int expirationMinutes) {
        String recipientGreeting = (fullName != null && !fullName.isBlank()) ? fullName : to;
        String subject = "Kode Verifikasi Akun";
        String content = "Halo " + recipientGreeting + ",\n\n"
                + "Kode OTP Anda adalah:\n\n"
                + otp + "\n\n"
                + "Kode berlaku selama " + expirationMinutes + " menit.\n\n"
                + "Jangan bagikan kode ini kepada siapa pun.\n\n"
                + "Jika Anda tidak meminta kode ini, silakan abaikan email ini.";
        return sendEmail(to, subject, content, "Account Registration OTP");
    }
}
