package com.e_commerce.backend.feature_product.dto.request;

import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

import java.math.BigDecimal;
import java.util.UUID;

@Data
public class ProductRequest {
    @NotNull(message = "ID Kategori wajib diisi")
    private UUID categoryId;

    @NotBlank(message = "Nama produk tidak boleh kosong")
    private String name;

    private String description;

    @NotNull(message = "Harga wajib diisi")
    @DecimalMin(value = "0.0", inclusive = false, message = "Harga harus lebih besar dari 0")
    private BigDecimal price;

    @NotNull(message = "Stok wajib diisi")
    @Min(value = 0, message = "Stok tidak boleh bernilai negatif")
    private Integer stock;

    private String imageUrl;
}
