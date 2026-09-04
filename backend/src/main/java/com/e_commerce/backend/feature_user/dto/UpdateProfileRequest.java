package com.e_commerce.backend.feature_user.dto;

import com.fasterxml.jackson.annotation.JsonAlias;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;
import lombok.Data;

@Data
public class UpdateProfileRequest {
    @NotBlank(message = "Nama lengkap tidak boleh kosong")
    @Size(max = 150, message = "Nama terlalu panjang")
    @JsonAlias({"name"})
    private String fullName;

    // PR REVIEW: Validasi nomor telepon sangat penting di e-commerce untuk logistik (opsional tetapi jika diisi harus valid)
    @Pattern(regexp = "^$|^\\+?[0-9]{10,15}$", message = "Format nomor telepon tidak valid")
    @JsonAlias({"phoneNumber"})
    private String phone;

    private String address;
}
