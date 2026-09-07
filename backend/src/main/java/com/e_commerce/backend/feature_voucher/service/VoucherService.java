package com.e_commerce.backend.feature_voucher.service;

import com.e_commerce.backend.feature_voucher.dto.request.CreateVoucherRequest;
import com.e_commerce.backend.feature_voucher.dto.request.UpdateVoucherRequest;
import com.e_commerce.backend.feature_voucher.dto.request.ValidateVoucherRequest;
import com.e_commerce.backend.feature_voucher.dto.response.VoucherCalculationResponse;
import com.e_commerce.backend.feature_voucher.model.VoucherEntity;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import java.util.List;
import java.util.UUID;

public interface VoucherService {

    VoucherEntity createVoucher(CreateVoucherRequest request);

    Page<VoucherEntity> getAllVouchers(String search, Boolean isActive, Pageable pageable);

    List<VoucherEntity> getActiveVouchers();

    VoucherEntity getVoucherById(UUID id);

    VoucherEntity updateVoucher(UUID id, UpdateVoucherRequest request);

    VoucherEntity toggleVoucherStatus(UUID id);

    void deleteVoucher(UUID id);

    VoucherCalculationResponse validateAndCalculateDiscount(ValidateVoucherRequest request);
}
