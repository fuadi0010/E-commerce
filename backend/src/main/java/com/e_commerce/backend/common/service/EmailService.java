package com.e_commerce.backend.common.service;

public interface EmailService {

    /**
     * Send an email with recipient, subject, text content, and Mailtrap category.
     *
     * @param to Target email address
     * @param subject Subject line of the email
     * @param text Body text content
     * @param category Category identifier for Mailtrap analytics and logs
     * @return true if sending succeeded, false otherwise
     */
    boolean sendEmail(String to, String subject, String text, String category);

    /**
     * Helper to send password reset instruction email.
     *
     * @param to Target user email address
     * @param resetLink The full password reset URL with token
     * @return true if sending succeeded, false otherwise
     */
    boolean sendPasswordResetEmail(String to, String resetLink);
}
