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
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;

import java.math.BigDecimal;
import java.time.ZonedDateTime;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
@DisplayName("VoucherServiceImpl Unit Tests")
class VoucherServiceImplTest {

    @Mock
    private VoucherRepository voucherRepository;

    @InjectMocks
    private VoucherServiceImpl voucherService;

    private UUID voucherId;
    private VoucherEntity percentVoucher;
    private VoucherEntity fixedVoucher;

    @BeforeEach
    void setUp() {
        voucherId = UUID.randomUUID();

        percentVoucher = VoucherEntity.builder()
                .id(voucherId)
                .code("HEMAT20")
                .description("Diskon 20% max 50rb")
                .discountType(DiscountType.PERCENTAGE)
                .discountValue(BigDecimal.valueOf(20))
                .minPurchase(BigDecimal.valueOf(100000))
                .maxDiscount(BigDecimal.valueOf(50000))
                .quota(100)
                .usedCount(5)
                .isActive(true)
                .validUntil(ZonedDateTime.now().plusDays(30))
                .build();

        fixedVoucher = VoucherEntity.builder()
                .id(UUID.randomUUID())
                .code("POTONGAN30K")
                .description("Potongan 30rb")
                .discountType(DiscountType.FIXED)
                .discountValue(BigDecimal.valueOf(30000))
                .minPurchase(BigDecimal.valueOf(150000))
                .maxDiscount(null)
                .quota(50)
                .usedCount(10)
                .isActive(true)
                .validUntil(ZonedDateTime.now().plusDays(30))
                .build();
    }

    @Test
    @DisplayName("createVoucher: sukses membuat voucher baru")
    void createVoucher_Success() {
        CreateVoucherRequest request = CreateVoucherRequest.builder()
                .code("NEWYEAR50")
                .description("Diskon Tahun Baru")
                .discountType(DiscountType.PERCENTAGE)
                .discountValue(BigDecimal.valueOf(50))
                .minPurchase(BigDecimal.valueOf(200000))
                .maxDiscount(BigDecimal.valueOf(100000))
                .quota(200)
                .validUntil(ZonedDateTime.now().plusDays(60))
                .build();

        when(voucherRepository.existsByCodeIgnoreCase("NEWYEAR50")).thenReturn(false);
        when(voucherRepository.save(any(VoucherEntity.class))).thenAnswer(inv -> inv.getArgument(0));

        VoucherEntity result = voucherService.createVoucher(request);

        assertNotNull(result);
        assertEquals("NEWYEAR50", result.getCode());
        assertTrue(result.getIsActive());
        verify(voucherRepository, times(1)).save(any(VoucherEntity.class));
    }

    @Test
    @DisplayName("createVoucher: gagal jika kode voucher sudah ada")
    void createVoucher_ThrowsWhenDuplicateCode() {
        CreateVoucherRequest request = CreateVoucherRequest.builder()
                .code("HEMAT20")
                .description("Diskon")
                .discountType(DiscountType.PERCENTAGE)
                .discountValue(BigDecimal.valueOf(20))
                .validUntil(ZonedDateTime.now().plusDays(30))
                .build();

        when(voucherRepository.existsByCodeIgnoreCase("HEMAT20")).thenReturn(true);

        assertThrows(DuplicateResourceException.class, () -> voucherService.createVoucher(request));
    }

    @Test
    @DisplayName("createVoucher: gagal jika diskon persentase > 100%")
    void createVoucher_ThrowsWhenPercentageExceeds100() {
        CreateVoucherRequest request = CreateVoucherRequest.builder()
                .code("BONUS150")
                .description("Diskon 150%")
                .discountType(DiscountType.PERCENTAGE)
                .discountValue(BigDecimal.valueOf(150))
                .validUntil(ZonedDateTime.now().plusDays(30))
                .build();

        when(voucherRepository.existsByCodeIgnoreCase("BONUS150")).thenReturn(false);

        assertThrows(IllegalArgumentException.class, () -> voucherService.createVoucher(request));
    }

    @Test
    @DisplayName("getAllVouchers: mengembalikan halaman voucher")
    void getAllVouchers_Success() {
        Pageable pageable = PageRequest.of(0, 10);
        Page<VoucherEntity> page = new PageImpl<>(List.of(percentVoucher, fixedVoucher), pageable, 2);

        when(voucherRepository.findAllWithFilter("HEMAT", true, pageable)).thenReturn(page);

        Page<VoucherEntity> result = voucherService.getAllVouchers("HEMAT", true, pageable);

        assertNotNull(result);
        assertEquals(2, result.getTotalElements());
    }

    @Test
    @DisplayName("getActiveVouchers: mengembalikan daftar voucher yang sedang aktif")
    void getActiveVouchers_Success() {
        when(voucherRepository.findAvailableVouchers(any(ZonedDateTime.class)))
                .thenReturn(List.of(percentVoucher, fixedVoucher));

        List<VoucherEntity> result = voucherService.getActiveVouchers();

        assertNotNull(result);
        assertEquals(2, result.size());
    }

    @Test
    @DisplayName("getVoucherById: sukses jika ID ditemukan")
    void getVoucherById_Success() {
        when(voucherRepository.findById(voucherId)).thenReturn(Optional.of(percentVoucher));

        VoucherEntity result = voucherService.getVoucherById(voucherId);

        assertNotNull(result);
        assertEquals("HEMAT20", result.getCode());
    }

    @Test
    @DisplayName("getVoucherById: gagal jika ID tidak ditemukan")
    void getVoucherById_ThrowsWhenNotFound() {
        when(voucherRepository.findById(voucherId)).thenReturn(Optional.empty());

        assertThrows(ResourceNotFoundException.class, () -> voucherService.getVoucherById(voucherId));
    }

    @Test
    @DisplayName("toggleVoucherStatus: mengubah status aktif menjadi tidak aktif dan sebaliknya")
    void toggleVoucherStatus_Success() {
        when(voucherRepository.findById(voucherId)).thenReturn(Optional.of(percentVoucher));
        when(voucherRepository.save(any(VoucherEntity.class))).thenAnswer(inv -> inv.getArgument(0));

        VoucherEntity toggled = voucherService.toggleVoucherStatus(voucherId);

        assertFalse(toggled.getIsActive());
    }

    @Test
    @DisplayName("deleteVoucher: memanggil repository delete untuk soft-delete")
    void deleteVoucher_Success() {
        when(voucherRepository.findById(voucherId)).thenReturn(Optional.of(percentVoucher));
        doNothing().when(voucherRepository).delete(percentVoucher);

        assertDoesNotThrow(() -> voucherService.deleteVoucher(voucherId));
        verify(voucherRepository, times(1)).delete(percentVoucher);
    }

    @Test
    @DisplayName("validate: sukses untuk voucher persentase dengan capping max discount")
    void validate_Success_PercentageWithMaxDiscount() {
        ValidateVoucherRequest request = ValidateVoucherRequest.builder()
                .code("HEMAT20")
                .orderAmount(BigDecimal.valueOf(500000)) // 20% dari 500rb = 100rb, tapi maxDiscount = 50rb
                .build();

        when(voucherRepository.findByCodeIgnoreCase("HEMAT20")).thenReturn(Optional.of(percentVoucher));

        VoucherCalculationResponse response = voucherService.validateAndCalculateDiscount(request);

        assertTrue(response.isValid());
        assertEquals(BigDecimal.valueOf(50000), response.getDiscountAmount());
        assertEquals(BigDecimal.valueOf(450000), response.getFinalAmount());
    }

    @Test
    @DisplayName("validate: sukses untuk voucher nominal tetap (FIXED)")
    void validate_Success_FixedDiscount() {
        ValidateVoucherRequest request = ValidateVoucherRequest.builder()
                .code("POTONGAN30K")
                .orderAmount(BigDecimal.valueOf(200000))
                .build();

        when(voucherRepository.findByCodeIgnoreCase("POTONGAN30K")).thenReturn(Optional.of(fixedVoucher));

        VoucherCalculationResponse response = voucherService.validateAndCalculateDiscount(request);

        assertTrue(response.isValid());
        assertEquals(BigDecimal.valueOf(30000), response.getDiscountAmount());
        assertEquals(BigDecimal.valueOf(170000), response.getFinalAmount());
    }

    @Test
    @DisplayName("validate: gagal jika voucher tidak ditemukan")
    void validate_Fails_WhenNotFound() {
        ValidateVoucherRequest request = ValidateVoucherRequest.builder()
                .code("TIDAKADA")
                .orderAmount(BigDecimal.valueOf(100000))
                .build();

        when(voucherRepository.findByCodeIgnoreCase("TIDAKADA")).thenReturn(Optional.empty());

        VoucherCalculationResponse response = voucherService.validateAndCalculateDiscount(request);

        assertFalse(response.isValid());
        assertEquals(BigDecimal.ZERO, response.getDiscountAmount());
    }

    @Test
    @DisplayName("validate: gagal jika total belanja belum mencapai minimum belanja")
    void validate_Fails_WhenBelowMinPurchase() {
        ValidateVoucherRequest request = ValidateVoucherRequest.builder()
                .code("HEMAT20")
                .orderAmount(BigDecimal.valueOf(50000)) // Min purchase 100rb
                .build();

        when(voucherRepository.findByCodeIgnoreCase("HEMAT20")).thenReturn(Optional.of(percentVoucher));

        VoucherCalculationResponse response = voucherService.validateAndCalculateDiscount(request);

        assertFalse(response.isValid());
        assertTrue(response.getMessage().contains("minimal belanja"));
    }
}
