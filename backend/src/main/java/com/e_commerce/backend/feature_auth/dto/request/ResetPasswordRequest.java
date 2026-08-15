package com.e_commerce.backend.feature_auth.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;
import lombok.Data;

@Data
public class ResetPasswordRequest {
    @NotBlank(message = "Token tidak boleh kosong")
    private String token;

    @NotBlank(message = "Password baru tidak boleh kosong")
    @Size(min = 8, message = "Password minimal 8 karakter demi keamanan")
    @Pattern(regexp = "^(?=.*[0-9])(?=.*[A-Z]).{8,}$", message = "Password harus mengandung minimal 1 angka dan 1 huruf besar")
    private String newPassword;

    @NotBlank(message = "Konfirmasi password baru tidak boleh kosong")
    private String confirmPassword;
}
