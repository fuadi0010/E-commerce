package com.e_commerce.backend.feature_voucher.service.impl;

import com.e_commerce.backend.exception.custom.DuplicateResourceException;
import com.e_commerce.backend.exception.custom.ResourceNotFoundException;
import com.e_commerce.backend.feature_voucher.dto.request.CreateVoucherRequest;
import com.e_commerce.backend.feature_voucher.dto.request.UpdateVoucherRequest;
import com.e_commerce.backend.feature_voucher.dto.request.ValidateVoucherRequest;
import com.e_commerce.backend.feature_voucher.dto.response.VoucherCalculationResponse;
import com.e_commerce.backend.feature_voucher.model.DiscountType;
import com.e_commerce.backend.feature_voucher.model.VoucherEntity;
import com.e_commerce.backend.feature_voucher.repository.VoucherRepository;
import com.e_commerce.backend.feature_voucher.service.VoucherService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.ZonedDateTime;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class VoucherServiceImpl implements VoucherService {

    private final VoucherRepository voucherRepository;

    @Override
    @Transactional
    public VoucherEntity createVoucher(CreateVoucherRequest request) {
        String normalizedCode = request.getCode().trim().toUpperCase();

        if (voucherRepository.existsByCodeIgnoreCase(normalizedCode)) {
            throw new DuplicateResourceException("Kode voucher '" + normalizedCode + "' sudah terdaftar");
        }

        if (request.getDiscountType() == DiscountType.PERCENTAGE) {
            if (request.getDiscountValue().compareTo(BigDecimal.valueOf(100)) > 0) {
                throw new IllegalArgumentException("Nilai diskon persentase tidak boleh lebih dari 100%");
            }
        }

        VoucherEntity voucher = VoucherEntity.builder()
                .code(normalizedCode)
                .description(request.getDescription().trim())
                .discountType(request.getDiscountType())
                .discountValue(request.getDiscountValue())
                .minPurchase(request.getMinPurchase() != null ? request.getMinPurchase() : BigDecimal.ZERO)
                .maxDiscount(request.getMaxDiscount())
                .quota(request.getQuota())
                .usedCount(0)
                .isActive(true)
                .validUntil(request.getValidUntil())
                .build();

        return voucherRepository.save(voucher);
    }

    @Override
    @Transactional(readOnly = true)
    public Page<VoucherEntity> getAllVouchers(String search, Boolean isActive, Pageable pageable) {
        String normalizedSearch = (search != null && !search.trim().isEmpty()) ? search.trim() : null;
        return voucherRepository.findAllWithFilter(normalizedSearch, isActive, pageable);
    }

    @Override
    @Transactional(readOnly = true)
    public List<VoucherEntity> getActiveVouchers() {
        return voucherRepository.findAvailableVouchers(ZonedDateTime.now());
    }

    @Override
    @Transactional(readOnly = true)
    public VoucherEntity getVoucherById(UUID id) {
        return voucherRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Voucher dengan ID '" + id + "' tidak ditemukan"));
    }

    @Override
    @Transactional
    public VoucherEntity updateVoucher(UUID id, UpdateVoucherRequest request) {
        VoucherEntity voucher = getVoucherById(id);

        if (request.getDiscountType() == DiscountType.PERCENTAGE) {
            if (request.getDiscountValue().compareTo(BigDecimal.valueOf(100)) > 0) {
                throw new IllegalArgumentException("Nilai diskon persentase tidak boleh lebih dari 100%");
            }
        }

        voucher.setDescription(request.getDescription().trim());
        voucher.setDiscountType(request.getDiscountType());
        voucher.setDiscountValue(request.getDiscountValue());
        voucher.setMinPurchase(request.getMinPurchase() != null ? request.getMinPurchase() : BigDecimal.ZERO);
        voucher.setMaxDiscount(request.getMaxDiscount());
        voucher.setQuota(request.getQuota());
        voucher.setValidUntil(request.getValidUntil());
        if (request.getIsActive() != null) {
            voucher.setIsActive(request.getIsActive());
        }

        return voucherRepository.save(voucher);
    }

    @Override
    @Transactional
    public VoucherEntity toggleVoucherStatus(UUID id) {
        VoucherEntity voucher = getVoucherById(id);
        voucher.setIsActive(!voucher.getIsActive());
        return voucherRepository.save(voucher);
    }

    @Override
    @Transactional
    public void deleteVoucher(UUID id) {
        VoucherEntity voucher = getVoucherById(id);
        voucherRepository.delete(voucher);
    }

    @Override
    @Transactional(readOnly = true)
    public VoucherCalculationResponse validateAndCalculateDiscount(ValidateVoucherRequest request) {
        String code = request.getCode().trim().toUpperCase();
        BigDecimal orderAmount = request.getOrderAmount();

        Optional<VoucherEntity> optionalVoucher = voucherRepository.findByCodeIgnoreCase(code);
        if (optionalVoucher.isEmpty()) {
            return VoucherCalculationResponse.builder()
                    .valid(false)
                    .code(code)
                    .discountAmount(BigDecimal.ZERO)
                    .finalAmount(orderAmount)
                    .message("Kode voucher tidak ditemukan.")
                    .build();
        }

        VoucherEntity voucher = optionalVoucher.get();

        if (!voucher.getIsActive()) {
            return VoucherCalculationResponse.builder()
                    .valid(false)
                    .code(code)
                    .discountAmount(BigDecimal.ZERO)
                    .finalAmount(orderAmount)
                    .message("Voucher ini sedang dinonaktifkan.")
                    .build();
        }

        if (voucher.getValidUntil().isBefore(ZonedDateTime.now())) {
            return VoucherCalculationResponse.builder()
                    .valid(false)
                    .code(code)
                    .discountAmount(BigDecimal.ZERO)
                    .finalAmount(orderAmount)
                    .message("Masa berlaku voucher ini telah habis.")
                    .build();
        }

        if (voucher.getUsedCount() >= voucher.getQuota()) {
            return VoucherCalculationResponse.builder()
                    .valid(false)
                    .code(code)
                    .discountAmount(BigDecimal.ZERO)
                    .finalAmount(orderAmount)
                    .message("Kuota penukaran voucher ini telah habis.")
                    .build();
        }

        if (orderAmount.compareTo(voucher.getMinPurchase()) < 0) {
            return VoucherCalculationResponse.builder()
                    .valid(false)
                    .code(code)
                    .discountAmount(BigDecimal.ZERO)
                    .finalAmount(orderAmount)
                    .message("Total belanja belum memenuhi syarat minimal belanja Rp " + voucher.getMinPurchase().setScale(0, RoundingMode.DOWN))
                    .build();
        }

        BigDecimal discount;
        if (voucher.getDiscountType() == DiscountType.PERCENTAGE) {
            BigDecimal rawDiscount = orderAmount
                    .multiply(voucher.getDiscountValue())
                    .divide(BigDecimal.valueOf(100), 2, RoundingMode.HALF_UP);

            if (voucher.getMaxDiscount() != null && rawDiscount.compareTo(voucher.getMaxDiscount()) > 0) {
                discount = voucher.getMaxDiscount();
            } else {
                discount = rawDiscount;
            }
        } else {
            discount = voucher.getDiscountValue().min(orderAmount);
        }

        BigDecimal finalAmount = orderAmount.subtract(discount).max(BigDecimal.ZERO);

        return VoucherCalculationResponse.builder()
                .valid(true)
                .code(voucher.getCode())
                .description(voucher.getDescription())
                .discountAmount(discount.setScale(0, RoundingMode.HALF_UP))
                .finalAmount(finalAmount.setScale(0, RoundingMode.HALF_UP))
                .message("Voucher berhasil diterapkan! Hemat Rp " + discount.setScale(0, RoundingMode.HALF_UP))
                .build();
    }
}
