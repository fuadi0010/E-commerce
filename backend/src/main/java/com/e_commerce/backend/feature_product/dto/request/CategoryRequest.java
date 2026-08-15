package com.e_commerce.backend.feature_product.dto.request;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class CategoryRequest {
    @NotBlank(message = "Nama kategori tidak boleh kosong")
    private String name;
}
