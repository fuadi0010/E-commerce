package com.e_commerce.backend.feature_auth.dto.request;

import jakarta.validation.ConstraintViolation;
import jakarta.validation.Validation;
import jakarta.validation.Validator;
import jakarta.validation.ValidatorFactory;
import org.junit.jupiter.api.BeforeAll;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

import java.util.Set;

import static org.junit.jupiter.api.Assertions.*;

@DisplayName("ResetPasswordRequest Bean Validation Tests")
class ResetPasswordRequestValidationTest {

    private static Validator validator;

    @BeforeAll
    static void setUpValidator() {
        ValidatorFactory factory = Validation.buildDefaultValidatorFactory();
        validator = factory.getValidator();
    }

    @Test
    @DisplayName("Valid request Mode A (Token) -> Tidak ada violation")
    void validRequest_WithToken_NoViolations() {
        ResetPasswordRequest request = ResetPasswordRequest.builder()
                .token("valid-token-123")
                .newPassword("Rahasia123!")
                .confirmPassword("Rahasia123!")
                .build();

        Set<ConstraintViolation<ResetPasswordRequest>> violations = validator.validate(request);
        assertTrue(violations.isEmpty(), "Harusnya tidak ada constraint violation untuk token valid");
    }

    @Test
    @DisplayName("Valid request Mode B (Email + ResetCode) -> Tidak ada violation")
    void validRequest_WithEmailAndResetCode_NoViolations() {
        ResetPasswordRequest request = ResetPasswordRequest.builder()
                .email("user@example.com")
                .resetCode("123456")
                .newPassword("Rahasia123!")
                .confirmPassword("Rahasia123!")
                .build();

        Set<ConstraintViolation<ResetPasswordRequest>> violations = validator.validate(request);
        assertTrue(violations.isEmpty(), "Harusnya tidak ada constraint violation untuk email + kode 6 digit valid");
    }

    @Test
    @DisplayName("Password baru kosong -> Validation error pada newPassword")
    void blankNewPassword_ProducesViolation() {
        ResetPasswordRequest request = ResetPasswordRequest.builder()
                .token("valid-token-123")
                .newPassword("")
                .confirmPassword("Rahasia123!")
                .build();

        Set<ConstraintViolation<ResetPasswordRequest>> violations = validator.validate(request);
        assertFalse(violations.isEmpty());
        assertTrue(violations.stream().anyMatch(v -> v.getPropertyPath().toString().equals("newPassword")));
    }

    @Test
    @DisplayName("Confirm password kosong -> Validation error pada confirmPassword")
    void blankConfirmPassword_ProducesViolation() {
        ResetPasswordRequest request = ResetPasswordRequest.builder()
                .token("valid-token-123")
                .newPassword("Rahasia123!")
                .confirmPassword(null)
                .build();

        Set<ConstraintViolation<ResetPasswordRequest>> violations = validator.validate(request);
        assertFalse(violations.isEmpty(), "Harus ada violation karena confirmPassword null/blank");
        assertTrue(violations.stream().anyMatch(v -> 
                v.getPropertyPath().toString().equals("confirmPassword") &&
                v.getMessage().contains("Konfirmasi password baru tidak boleh kosong")
        ));
    }

    @Test
    @DisplayName("Password terlalu pendek (< 8 karakter) -> Validation error")
    void shortPassword_ProducesViolation() {
        ResetPasswordRequest request = ResetPasswordRequest.builder()
                .token("valid-token-123")
                .newPassword("Ab1!")
                .confirmPassword("Ab1!")
                .build();

        Set<ConstraintViolation<ResetPasswordRequest>> violations = validator.validate(request);
        assertFalse(violations.isEmpty());
        assertTrue(violations.stream().anyMatch(v -> v.getPropertyPath().toString().equals("newPassword")));
    }

    @Test
    @DisplayName("Password tanpa huruf besar atau angka -> Validation error regex pattern")
    void passwordPatternMismatch_ProducesViolation() {
        ResetPasswordRequest request = ResetPasswordRequest.builder()
                .token("valid-token-123")
                .newPassword("hanyahurufkecilsemua")
                .confirmPassword("hanyahurufkecilsemua")
                .build();

        Set<ConstraintViolation<ResetPasswordRequest>> violations = validator.validate(request);
        assertFalse(violations.isEmpty());
        assertTrue(violations.stream().anyMatch(v -> 
                v.getPropertyPath().toString().equals("newPassword") &&
                v.getMessage().contains("Password harus mengandung minimal 1 angka dan 1 huruf besar")
        ));
    }

    @Test
    @DisplayName("Format email tidak valid pada Mode B -> Validation error pada email")
    void invalidEmailFormat_ProducesViolation() {
        ResetPasswordRequest request = ResetPasswordRequest.builder()
                .email("bukan-email-valid")
                .resetCode("123456")
                .newPassword("Rahasia123!")
                .confirmPassword("Rahasia123!")
                .build();

        Set<ConstraintViolation<ResetPasswordRequest>> violations = validator.validate(request);
        assertFalse(violations.isEmpty());
        assertTrue(violations.stream().anyMatch(v -> 
                v.getPropertyPath().toString().equals("email") &&
                v.getMessage().contains("Format email tidak valid")
        ));
    }

    @Test
    @DisplayName("Format resetCode bukan 6 digit angka -> Validation error pada resetCode")
    void invalidResetCodePattern_ProducesViolation() {
        ResetPasswordRequest request = ResetPasswordRequest.builder()
                .email("user@example.com")
                .resetCode("1234A")
                .newPassword("Rahasia123!")
                .confirmPassword("Rahasia123!")
                .build();

        Set<ConstraintViolation<ResetPasswordRequest>> violations = validator.validate(request);
        assertFalse(violations.isEmpty());
        assertTrue(violations.stream().anyMatch(v -> 
                v.getPropertyPath().toString().equals("resetCode") &&
                v.getMessage().contains("Kode reset password harus berupa 6 digit angka")
        ));
    }
}
