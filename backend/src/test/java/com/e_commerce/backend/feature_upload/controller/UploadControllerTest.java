package com.e_commerce.backend.feature_upload.controller;

import com.e_commerce.backend.common.dto.ApiResponse;
import com.e_commerce.backend.feature_upload.service.FileStorageService;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.mock.web.MockHttpServletRequest;
import org.springframework.mock.web.MockMultipartFile;
import org.springframework.web.context.request.RequestContextHolder;
import org.springframework.web.context.request.ServletRequestAttributes;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
@DisplayName("UploadController Unit Tests")
class UploadControllerTest {

    @Mock
    private FileStorageService fileStorageService;

    @InjectMocks
    private UploadController uploadController;

    @BeforeEach
    void setUp() {
        MockHttpServletRequest request = new MockHttpServletRequest();
        request.setScheme("http");
        request.setServerName("localhost");
        request.setServerPort(8080);
        RequestContextHolder.setRequestAttributes(new ServletRequestAttributes(request));
    }

    @AfterEach
    void tearDown() {
        RequestContextHolder.resetRequestAttributes();
    }

    @Test
    @DisplayName("uploadFile - returns 201 Created with full download URL")
    void uploadFile_Success() {
        MockMultipartFile file = new MockMultipartFile(
                "file", "photo.png", "image/png", new byte[]{1, 2, 3}
        );

        when(fileStorageService.storeFile(file)).thenReturn("abc-123.png");

        ResponseEntity<ApiResponse<String>> response = uploadController.uploadFile(file);

        assertNotNull(response);
        assertEquals(HttpStatus.CREATED, response.getStatusCode());
        assertNotNull(response.getBody());
        assertEquals(201, response.getBody().getStatus());
        assertEquals("File berhasil diunggah", response.getBody().getMessage());
        assertEquals("http://localhost:8080/uploads/abc-123.png", response.getBody().getData());

        verify(fileStorageService, times(1)).storeFile(file);
    }

    @Test
    @DisplayName("uploadFile - PDF document returns 201 Created with full download URL")
    void uploadFile_PdfDocument_Success() {
        MockMultipartFile file = new MockMultipartFile(
                "file", "payment-proof.pdf", "application/pdf", "%PDF-1.4 sample content".getBytes()
        );

        when(fileStorageService.storeFile(file)).thenReturn("proof-456.pdf");

        ResponseEntity<ApiResponse<String>> response = uploadController.uploadFile(file);

        assertNotNull(response);
        assertEquals(HttpStatus.CREATED, response.getStatusCode());
        assertNotNull(response.getBody());
        assertEquals(201, response.getBody().getStatus());
        assertEquals("http://localhost:8080/uploads/proof-456.pdf", response.getBody().getData());

        verify(fileStorageService, times(1)).storeFile(file);
    }
}
