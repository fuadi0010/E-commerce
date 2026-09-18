package com.e_commerce.backend.common.service;

public interface EmailService {

    /**
     * Send an email with recipient, subject, text content, and category tag.
     *
     * @param to Target email address
     * @param subject Subject line of the email
     * @param text Body text content
     * @param category Category identifier for email analytics and logs
     * @return true if sending succeeded, false otherwise
     */
    boolean sendEmail(String to, String subject, String text, String category);

    /**
     * Helper to send password reset instruction email (Deprecated: Use sendPasswordResetOtpEmail instead).
     *
     * @param to Target user email address
     * @param resetLink The full password reset URL with token
     * @return true if sending succeeded, false otherwise
     */
    boolean sendPasswordResetEmail(String to, String resetLink);

    /**
     * Helper to send 6-digit password reset code (OTP) verification email.
     *
     * @param to Target user email address
     * @param resetCode 6-digit numeric reset code
     * @param expirationMinutes Minutes before reset code expires
     * @return true if sending succeeded, false otherwise
     */
    boolean sendPasswordResetOtpEmail(String to, String resetCode, int expirationMinutes);

    /**
     * Helper to send account registration OTP verification email.
     *
     * @param to Target user email address
     * @param fullName User's full name or email identifier
     * @param otp 6-digit one-time password
     * @param expirationMinutes Minutes before OTP expires
     * @return true if sending succeeded, false otherwise
     */
    boolean sendRegistrationOtpEmail(String to, String fullName, String otp, int expirationMinutes);
}

