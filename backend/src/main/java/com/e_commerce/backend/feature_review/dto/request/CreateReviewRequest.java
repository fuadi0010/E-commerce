package com.e_commerce.backend.feature_review.dto.request;

import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.UUID;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CreateReviewRequest {

    @NotNull(message = "Product ID wajib diisi")
    private UUID productId;

    @NotNull(message = "Rating wajib diisi")
    @Min(value = 1, message = "Rating minimal bernilai 1")
    @Max(value = 5, message = "Rating maksimal bernilai 5")
    private Integer rating;

    @NotBlank(message = "Ulasan / komentar wajib diisi")
    @Size(min = 3, max = 1000, message = "Ulasan harus berisi antara 3 hingga 1000 karakter")
    private String comment;
}
