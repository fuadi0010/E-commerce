package com.e_commerce.backend.feature_product.dto.request;

import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.Min;
import lombok.Data;

import java.math.BigDecimal;
import java.util.UUID;

/**
 * DTO untuk PATCH partial update produk.
 * Semua field optional — hanya field non-null yang akan diupdate.
 * Rule 9: Harus ada endpoint PATCH.
 */
@Data
public class PatchProductRequest {
    private UUID categoryId;
    private String name;
    private String description;

    @DecimalMin(value = "0.0", inclusive = false, message = "Harga harus lebih besar dari 0")
    private BigDecimal price;

    @Min(value = 0, message = "Stok tidak boleh bernilai negatif")
    private Integer stock;

    private String imageUrl;
}
