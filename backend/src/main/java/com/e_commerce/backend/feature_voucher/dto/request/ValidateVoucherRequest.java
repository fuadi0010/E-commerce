package com.e_commerce.backend.feature_voucher.dto.request;

import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ValidateVoucherRequest {

    @NotBlank(message = "Kode voucher wajib diisi")
    private String code;

    @NotNull(message = "Jumlah total belanja wajib diisi")
    @DecimalMin(value = "0.01", message = "Jumlah total belanja harus lebih besar dari 0")
    private BigDecimal orderAmount;
}
