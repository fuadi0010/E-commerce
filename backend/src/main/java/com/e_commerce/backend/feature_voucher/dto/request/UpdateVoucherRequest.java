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
public class UpdateVoucherRequest {

    @NotBlank(message = "Deskripsi voucher wajib diisi")
    @Size(max = 255, message = "Deskripsi maksimal 255 karakter")
    private String description;

    @NotNull(message = "Tipe diskon wajib dipilih")
    private DiscountType discountType;

    @NotNull(message = "Nilai diskon wajib diisi")
    @DecimalMin(value = "0.01", message = "Nilai diskon harus lebih besar dari 0")
    private BigDecimal discountValue;

    @NotNull(message = "Minimal pembelian wajib diisi")
    @DecimalMin(value = "0.00", message = "Minimal pembelian tidak boleh negatif")
    private BigDecimal minPurchase;

    @DecimalMin(value = "0.01", message = "Maksimal diskon harus lebih besar dari 0")
    private BigDecimal maxDiscount;

    @NotNull(message = "Kuota voucher wajib diisi")
    @Min(value = 1, message = "Kuota voucher minimal bernilai 1")
    private Integer quota;

    @NotNull(message = "Tanggal masa berlaku voucher wajib diisi")
    private ZonedDateTime validUntil;

    private Boolean isActive;
}
