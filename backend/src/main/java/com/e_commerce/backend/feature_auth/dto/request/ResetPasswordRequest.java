package com.e_commerce.backend.feature_auth.dto.request;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ResetPasswordRequest {

    /**
     * Otorisasi Mode A: Temporary Reset Token (UUID) yang dihasilkan setelah verifikasi OTP di /verify-reset-code.
     */
    private String token;

    /**
     * Otorisasi Mode B: Email pemilik akun (untuk direct reset di /reset-password).
     */
    @Email(message = "Format email tidak valid")
    private String email;

    /**
     * Otorisasi Mode B: Kode reset password 6 digit yang dikirim ke email.
     */
    @Pattern(regexp = "^[0-9]{6}$", message = "Kode reset password harus berupa 6 digit angka")
    private String resetCode;

    @NotBlank(message = "Password baru tidak boleh kosong")
    @Size(min = 8, message = "Password minimal 8 karakter demi keamanan")
    @Pattern(regexp = "^(?=.*[0-9])(?=.*[A-Z]).{8,}$", message = "Password harus mengandung minimal 1 angka dan 1 huruf besar")
    private String newPassword;

    @NotBlank(message = "Konfirmasi password baru tidak boleh kosong")
    private String confirmPassword;
}
