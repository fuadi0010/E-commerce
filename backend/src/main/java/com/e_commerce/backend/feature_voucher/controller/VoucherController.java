package com.e_commerce.backend.feature_voucher.controller;

import com.e_commerce.backend.common.dto.ApiResponse;
import com.e_commerce.backend.feature_voucher.dto.request.CreateVoucherRequest;
import com.e_commerce.backend.feature_voucher.dto.request.UpdateVoucherRequest;
import com.e_commerce.backend.feature_voucher.dto.request.ValidateVoucherRequest;
import com.e_commerce.backend.feature_voucher.dto.response.VoucherCalculationResponse;
import com.e_commerce.backend.feature_voucher.dto.response.VoucherResponse;
import com.e_commerce.backend.feature_voucher.mapper.VoucherMapper;
import com.e_commerce.backend.feature_voucher.model.VoucherEntity;
import com.e_commerce.backend.feature_voucher.service.VoucherService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/vouchers")
@RequiredArgsConstructor
@Tag(name = "Voucher", description = "Endpoints untuk manajemen kupon promo dan voucher diskon (Entitas Utama ke-6)")
public class VoucherController {

    private final VoucherService voucherService;
    private final VoucherMapper voucherMapper;

    @PostMapping
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Membuat voucher promo baru (Khusus Admin)")
    public ResponseEntity<ApiResponse<VoucherResponse>> createVoucher(
            @Valid @RequestBody CreateVoucherRequest request) {

        VoucherEntity created = voucherService.createVoucher(request);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success(HttpStatus.CREATED.value(), "Voucher berhasil dibuat",
                        voucherMapper.toResponse(created)));
    }

    @GetMapping
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Mendapatkan seluruh voucher dengan pencarian, filter status, dan pagination (Khusus Admin)")
    public ResponseEntity<ApiResponse<Page<VoucherResponse>>> getAllVouchers(
            @RequestParam(required = false) String search,
            @RequestParam(required = false) Boolean isActive,
            @PageableDefault(size = 10, sort = "createdAt", direction = Sort.Direction.DESC) Pageable pageable) {

        Page<VoucherResponse> page = voucherService.getAllVouchers(search, isActive, pageable)
                .map(voucherMapper::toResponse);

        return ResponseEntity.ok(ApiResponse.success(HttpStatus.OK.value(), "Daftar voucher", page));
    }

    @GetMapping("/active")
    @Operation(summary = "Mendapatkan daftar voucher promo aktif yang siap digunakan (Publik & Customer)")
    public ResponseEntity<ApiResponse<List<VoucherResponse>>> getActiveVouchers() {
        List<VoucherResponse> list = voucherService.getActiveVouchers().stream()
                .map(voucherMapper::toResponse)
                .toList();

        return ResponseEntity.ok(ApiResponse.success(HttpStatus.OK.value(), "Daftar voucher aktif", list));
    }

    @GetMapping("/{id}")
    @Operation(summary = "Mendapatkan detail voucher berdasarkan ID")
    public ResponseEntity<ApiResponse<VoucherResponse>> getVoucherById(@PathVariable UUID id) {
        VoucherEntity voucher = voucherService.getVoucherById(id);
        return ResponseEntity.ok(ApiResponse.success(HttpStatus.OK.value(), "Detail voucher",
                voucherMapper.toResponse(voucher)));
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Mengubah data voucher promo (Khusus Admin)")
    public ResponseEntity<ApiResponse<VoucherResponse>> updateVoucher(
            @PathVariable UUID id,
            @Valid @RequestBody UpdateVoucherRequest request) {

        VoucherEntity updated = voucherService.updateVoucher(id, request);
        return ResponseEntity.ok(ApiResponse.success(HttpStatus.OK.value(), "Voucher berhasil diperbarui",
                voucherMapper.toResponse(updated)));
    }

    @PatchMapping("/{id}/toggle-status")
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Mengaktifkan atau menonaktifkan status voucher (Khusus Admin)")
    public ResponseEntity<ApiResponse<VoucherResponse>> toggleVoucherStatus(@PathVariable UUID id) {
        VoucherEntity toggled = voucherService.toggleVoucherStatus(id);
        String msg = toggled.getIsActive() ? "Voucher berhasil diaktifkan" : "Voucher berhasil dinonaktifkan";
        return ResponseEntity.ok(ApiResponse.success(HttpStatus.OK.value(), msg, voucherMapper.toResponse(toggled)));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Menghapus voucher (Soft-delete) (Khusus Admin)")
    public ResponseEntity<ApiResponse<Void>> deleteVoucher(@PathVariable UUID id) {
        voucherService.deleteVoucher(id);
        return ResponseEntity.ok(ApiResponse.success(HttpStatus.OK.value(), "Voucher berhasil dihapus", null));
    }

    @PostMapping("/validate")
    @Operation(summary = "Memvalidasi kode voucher dan menghitung nominal potongan belanja")
    public ResponseEntity<ApiResponse<VoucherCalculationResponse>> validateVoucher(
            @Valid @RequestBody ValidateVoucherRequest request) {

        VoucherCalculationResponse calculation = voucherService.validateAndCalculateDiscount(request);
        return ResponseEntity.ok(ApiResponse.success(HttpStatus.OK.value(), calculation.getMessage(), calculation));
    }
}
