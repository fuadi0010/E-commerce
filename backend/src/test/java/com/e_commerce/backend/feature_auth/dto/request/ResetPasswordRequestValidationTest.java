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
    @DisplayName("Valid request -> Tidak ada violation")
    void validRequest_NoViolations() {
        ResetPasswordRequest request = new ResetPasswordRequest();
        request.setToken("valid-token-123");
        request.setNewPassword("Rahasia123!");
        request.setConfirmPassword("Rahasia123!");

        Set<ConstraintViolation<ResetPasswordRequest>> violations = validator.validate(request);
        assertTrue(violations.isEmpty(), "Harusnya tidak ada constraint violation");
    }

    @Test
    @DisplayName("Password baru kosong -> Validation error pada newPassword")
    void blankNewPassword_ProducesViolation() {
        ResetPasswordRequest request = new ResetPasswordRequest();
        request.setToken("valid-token-123");
        request.setNewPassword("");
        request.setConfirmPassword("Rahasia123!");

        Set<ConstraintViolation<ResetPasswordRequest>> violations = validator.validate(request);
        assertFalse(violations.isEmpty());
        assertTrue(violations.stream().anyMatch(v -> v.getPropertyPath().toString().equals("newPassword")));
    }

    @Test
    @DisplayName("Confirm password kosong (gejala bug utama) -> Validation error pada confirmPassword")
    void blankConfirmPassword_ProducesViolation() {
        ResetPasswordRequest request = new ResetPasswordRequest();
        request.setToken("valid-token-123");
        request.setNewPassword("Rahasia123!");
        request.setConfirmPassword(null); // seperti yang terjadi ketika frontend lupa menyertakan field ini

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
        ResetPasswordRequest request = new ResetPasswordRequest();
        request.setToken("valid-token-123");
        request.setNewPassword("Ab1!");
        request.setConfirmPassword("Ab1!");

        Set<ConstraintViolation<ResetPasswordRequest>> violations = validator.validate(request);
        assertFalse(violations.isEmpty());
        assertTrue(violations.stream().anyMatch(v -> v.getPropertyPath().toString().equals("newPassword")));
    }

    @Test
    @DisplayName("Password tanpa huruf besar atau angka -> Validation error regex pattern")
    void passwordPatternMismatch_ProducesViolation() {
        ResetPasswordRequest request = new ResetPasswordRequest();
        request.setToken("valid-token-123");
        request.setNewPassword("hanyahurufkecilsemua");
        request.setConfirmPassword("hanyahurufkecilsemua");

        Set<ConstraintViolation<ResetPasswordRequest>> violations = validator.validate(request);
        assertFalse(violations.isEmpty());
        assertTrue(violations.stream().anyMatch(v -> 
                v.getPropertyPath().toString().equals("newPassword") &&
                v.getMessage().contains("Password harus mengandung minimal 1 angka dan 1 huruf besar")
        ));
    }

    @Test
    @DisplayName("Token kosong -> Validation error pada token")
    void blankToken_ProducesViolation() {
        ResetPasswordRequest request = new ResetPasswordRequest();
        request.setToken("   ");
        request.setNewPassword("Rahasia123!");
        request.setConfirmPassword("Rahasia123!");

        Set<ConstraintViolation<ResetPasswordRequest>> violations = validator.validate(request);
        assertFalse(violations.isEmpty());
        assertTrue(violations.stream().anyMatch(v -> v.getPropertyPath().toString().equals("token")));
    }
}
