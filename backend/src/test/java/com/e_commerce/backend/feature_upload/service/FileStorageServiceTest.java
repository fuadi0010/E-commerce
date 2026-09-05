package com.e_commerce.backend.feature_upload.service;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.io.TempDir;
import org.springframework.mock.web.MockMultipartFile;

import java.nio.charset.StandardCharsets;
import java.nio.file.Path;

import static org.junit.jupiter.api.Assertions.*;

@DisplayName("FileStorageService Unit Tests")
class FileStorageServiceTest {

    @TempDir
    Path tempDir;

    private FileStorageService fileStorageService;

    // Valid magic bytes fixtures
    private final byte[] validPngBytes = new byte[]{
            (byte) 0x89, 0x50, 0x4E, 0x47, 0x0D, 0x0A, 0x1A, 0x0A, 0x00, 0x00, 0x00, 0x0D
    };

    private final byte[] validJpgBytes = new byte[]{
            (byte) 0xFF, (byte) 0xD8, (byte) 0xFF, (byte) 0xE0, 0x00, 0x10, 0x4A, 0x46, 0x49, 0x46, 0x00, 0x01
    };

    private final byte[] validWebpBytes = new byte[]{
            'R', 'I', 'F', 'F', 0x20, 0x00, 0x00, 0x00, 'W', 'E', 'B', 'P'
    };

    private final byte[] validPdfBytes = "%PDF-1.4 test document body".getBytes(StandardCharsets.UTF_8);

    @BeforeEach
    void setUp() {
        fileStorageService = new FileStorageService(tempDir);
    }

    @Test
    @DisplayName("storeFile - succeeds for valid PNG")
    void storeFile_ValidPng_Success() {
        MockMultipartFile file = new MockMultipartFile(
                "file", "product-photo.png", "image/png", validPngBytes
        );

        String storedName = fileStorageService.storeFile(file);

        assertNotNull(storedName);
        assertTrue(storedName.endsWith(".png"));
    }

    @Test
    @DisplayName("storeFile - succeeds for valid JPG and JPEG")
    void storeFile_ValidJpg_Success() {
        MockMultipartFile jpgFile = new MockMultipartFile(
                "file", "banner.jpg", "image/jpeg", validJpgBytes
        );
        MockMultipartFile jpegFile = new MockMultipartFile(
                "file", "thumbnail.jpeg", "image/jpeg", validJpgBytes
        );

        String storedJpg = fileStorageService.storeFile(jpgFile);
        String storedJpeg = fileStorageService.storeFile(jpegFile);

        assertNotNull(storedJpg);
        assertTrue(storedJpg.endsWith(".jpg"));
        assertNotNull(storedJpeg);
        assertTrue(storedJpeg.endsWith(".jpeg"));
    }

    @Test
    @DisplayName("storeFile - succeeds for valid WEBP")
    void storeFile_ValidWebp_Success() {
        MockMultipartFile file = new MockMultipartFile(
                "file", "hero.webp", "image/webp", validWebpBytes
        );

        String storedName = fileStorageService.storeFile(file);

        assertNotNull(storedName);
        assertTrue(storedName.endsWith(".webp"));
    }

    @Test
    @DisplayName("storeFile - succeeds for valid PDF")
    void storeFile_ValidPdf_Success() {
        MockMultipartFile file = new MockMultipartFile(
                "file", "invoice.pdf", "application/pdf", validPdfBytes
        );

        String storedName = fileStorageService.storeFile(file);

        assertNotNull(storedName);
        assertTrue(storedName.endsWith(".pdf"));
    }

    @Test
    @DisplayName("validateFile - rejects empty file")
    void validateFile_EmptyFile_ThrowsException() {
        MockMultipartFile emptyFile = new MockMultipartFile(
                "file", "test.png", "image/png", new byte[0]
        );

        IllegalArgumentException ex = assertThrows(IllegalArgumentException.class, () ->
                fileStorageService.validateFile(emptyFile)
        );
        assertTrue(ex.getMessage().contains("File tidak boleh kosong"));
    }

    @Test
    @DisplayName("validateFile - rejects disallowed extensions (e.g. .jsp, .exe, .sh, .html, .svg)")
    void validateFile_DisallowedExtensions_ThrowsException() {
        String[] illegalFiles = {"exploit.jsp", "trojan.exe", "script.sh", "page.html", "vector.svg"};

        for (String filename : illegalFiles) {
            MockMultipartFile file = new MockMultipartFile(
                    "file", filename, "image/png", validPngBytes
            );

            assertThrows(IllegalArgumentException.class, () ->
                    fileStorageService.validateFile(file)
            );
        }
    }

    @Test
    @DisplayName("validateFile - rejects path traversal filenames")
    void validateFile_PathTraversal_ThrowsException() {
        MockMultipartFile file = new MockMultipartFile(
                "file", "../../etc/passwd.png", "image/png", validPngBytes
        );

        IllegalArgumentException ex = assertThrows(IllegalArgumentException.class, () ->
                fileStorageService.validateFile(file)
        );
        assertTrue(ex.getMessage().contains("path traversal"));
    }

    @Test
    @DisplayName("validateFile - rejects MIME type mismatch")
    void validateFile_MimeMismatch_ThrowsException() {
        // Filename says .png, but header says application/pdf
        MockMultipartFile file = new MockMultipartFile(
                "file", "document.png", "application/pdf", validPngBytes
        );

        IllegalArgumentException ex = assertThrows(IllegalArgumentException.class, () ->
                fileStorageService.validateFile(file)
        );
        assertTrue(ex.getMessage().contains("Tipe konten (MIME) tidak sesuai"));
    }

    @Test
    @DisplayName("validateFile - rejects magic bytes mismatch (tampered content)")
    void validateFile_MagicBytesMismatch_ThrowsException() {
        // Filename and MIME claim PNG, but content is arbitrary ASCII
        byte[] fakeBytes = "Hello this is just a plain text disguised as image".getBytes(StandardCharsets.UTF_8);
        MockMultipartFile file = new MockMultipartFile(
                "file", "fake-image.png", "image/png", fakeBytes
        );

        IllegalArgumentException ex = assertThrows(IllegalArgumentException.class, () ->
                fileStorageService.validateFile(file)
        );
        assertTrue(ex.getMessage().contains("magic bytes mismatch"));
    }

    @Test
    @DisplayName("validateFile - rejects file exceeding 5MB limit")
    void validateFile_ExceedsSizeLimit_ThrowsException() {
        byte[] oversizedBytes = new byte[5 * 1024 * 1024 + 1];
        // Set valid PNG header on oversized payload
        System.arraycopy(validPngBytes, 0, oversizedBytes, 0, validPngBytes.length);

        MockMultipartFile file = new MockMultipartFile(
                "file", "huge.png", "image/png", oversizedBytes
        );

        IllegalArgumentException ex = assertThrows(IllegalArgumentException.class, () ->
                fileStorageService.validateFile(file)
        );
        assertTrue(ex.getMessage().contains("Ukuran file terlalu besar"));
    }
}
