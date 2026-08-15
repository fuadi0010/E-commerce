package com.e_commerce.backend.feature_upload.controller;

import com.e_commerce.backend.common.dto.ApiResponse;
import com.e_commerce.backend.feature_upload.service.FileStorageService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.web.servlet.support.ServletUriComponentsBuilder;

import java.util.Arrays;
import java.util.List;

@RestController
@RequestMapping("/api/upload")
@RequiredArgsConstructor
public class UploadController {

    private final FileStorageService fileStorageService;

    // Membatasi tipe MIME sesuai dengan requirement rules.md (Gambar dan PDF)
    private static final List<String> ALLOWED_CONTENT_TYPES = Arrays.asList(
            "image/jpeg",
            "image/png",
            "image/webp",
            "application/pdf"
    );

    private static final long MAX_FILE_SIZE = 5 * 1024 * 1024; // 5 MB

    @PostMapping
    @PreAuthorize("hasAnyRole('ADMIN', 'CUSTOMER')")
    public ResponseEntity<ApiResponse<String>> uploadFile(@RequestParam("file") MultipartFile file) {
        
        // 1. Validasi Keberadaan File
        if (file.isEmpty()) {
            throw new IllegalArgumentException("File tidak boleh kosong");
        }

        // 2. Validasi Tipe Konten
        String contentType = file.getContentType();
        if (contentType == null || !ALLOWED_CONTENT_TYPES.contains(contentType)) {
            throw new IllegalArgumentException("Tipe file tidak diizinkan. Hanya JPG, PNG, WEBP, dan PDF yang diperbolehkan.");
        }

        // 3. Validasi Ukuran File
        if (file.getSize() > MAX_FILE_SIZE) {
            throw new IllegalArgumentException("Ukuran file terlalu besar. Maksimal 5MB.");
        }

        // Menyimpan file
        String fileName = fileStorageService.storeFile(file);

        // Membuat URL akses publik
        String fileDownloadUri = ServletUriComponentsBuilder.fromCurrentContextPath()
                .path("/uploads/")
                .path(fileName)
                .toUriString();

        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success(HttpStatus.CREATED.value(), "File berhasil diunggah", fileDownloadUri));
    }
}
