package com.e_commerce.backend.feature_auth.dto.request;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;
import lombok.Data;

@Data
public class RegisterRequest {
    @NotBlank(message = "Email tidak boleh kosong")
    @Email(message = "Format email tidak valid")
    private String email;

    @NotBlank(message = "Password tidak boleh kosong")
    @Size(min = 8, message = "Password minimal 8 karakter demi keamanan")
    @Pattern(regexp = "^(?=.*[0-9])(?=.*[A-Z]).{8,}$", message = "Password harus mengandung minimal 1 angka dan 1 huruf besar")
    private String password;

    @NotBlank(message = "Konfirmasi password tidak boleh kosong")
    private String passwordConfirmation;

    @NotBlank(message = "Nama lengkap tidak boleh kosong")
    private String fullName;

    private String phoneNumber;
}
