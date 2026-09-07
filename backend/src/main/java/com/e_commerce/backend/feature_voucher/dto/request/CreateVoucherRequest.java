package com.e_commerce.backend.feature_voucher.dto.request;

import com.e_commerce.backend.feature_voucher.model.DiscountType;
import jakarta.validation.constraints.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.ZonedDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CreateVoucherRequest {

    @NotBlank(message = "Kode voucher wajib diisi")
    @Pattern(regexp = "^[A-Z0-9_-]{3,50}$", message = "Kode voucher hanya boleh berisi huruf kapital, angka, garis bawah, atau strip (3-50 karakter)")
    private String code;

    @NotBlank(message = "Deskripsi voucher wajib diisi")
    @Size(max = 255, message = "Deskripsi maksimal 255 karakter")
    private String description;

    @NotNull(message = "Tipe diskon wajib dipilih (PERCENTAGE atau FIXED)")
    private DiscountType discountType;

    @NotNull(message = "Nilai diskon wajib diisi")
    @DecimalMin(value = "0.01", message = "Nilai diskon harus lebih besar dari 0")
    private BigDecimal discountValue;

    @Builder.Default
    @DecimalMin(value = "0.00", message = "Minimal pembelian tidak boleh negatif")
    private BigDecimal minPurchase = BigDecimal.ZERO;

    @DecimalMin(value = "0.01", message = "Maksimal diskon harus lebih besar dari 0")
    private BigDecimal maxDiscount;

    @Builder.Default
    @Min(value = 1, message = "Kuota voucher minimal bernilai 1")
    private Integer quota = 100;

    @NotNull(message = "Tanggal masa berlaku voucher wajib diisi")
    @Future(message = "Masa berlaku voucher harus di masa depan")
    private ZonedDateTime validUntil;
}
