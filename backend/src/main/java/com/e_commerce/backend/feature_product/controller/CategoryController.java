package com.e_commerce.backend.feature_product.controller;

import com.e_commerce.backend.common.dto.ApiResponse;
import com.e_commerce.backend.feature_product.dto.request.CategoryRequest;
import com.e_commerce.backend.feature_product.dto.response.CategoryResponse;
import com.e_commerce.backend.feature_product.mapper.ProductMapper;
import com.e_commerce.backend.feature_product.model.CategoryEntity;
import com.e_commerce.backend.feature_product.service.CategoryService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

/**
 * CategoryController — Rule 6, 7, 9, 50
 * Menyediakan CRUD lengkap: List, Detail, Create, Update, Delete.
 * Response menggunakan ApiResponse<T>.
 */
@RestController
@RequestMapping("/api/categories")
@RequiredArgsConstructor
public class CategoryController {

    private final CategoryService categoryService;
    private final ProductMapper productMapper;

    // POST /api/categories — Admin only
    @PostMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<CategoryResponse>> createCategory(@Valid @RequestBody CategoryRequest request) {
        CategoryEntity entity = categoryService.createCategory(request.getName());
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success(HttpStatus.CREATED.value(), "Kategori berhasil dibuat",
                        productMapper.toCategoryResponse(entity)));
    }

    // GET /api/categories — Public
    @GetMapping
    public ResponseEntity<ApiResponse<List<CategoryResponse>>> getAllCategories() {
        List<CategoryResponse> responses = categoryService.getAllCategories().stream()
                .map(productMapper::toCategoryResponse)
                .collect(Collectors.toList());
        return ResponseEntity.ok(ApiResponse.success(HttpStatus.OK.value(), "Daftar kategori", responses));
    }

    // GET /api/categories/{id} — Public
    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<CategoryResponse>> getCategoryById(@PathVariable UUID id) {
        CategoryEntity entity = categoryService.getCategoryById(id);
        return ResponseEntity.ok(ApiResponse.success(HttpStatus.OK.value(), "Detail kategori",
                productMapper.toCategoryResponse(entity)));
    }

    // PUT /api/categories/{id} — Admin only
    @PutMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<CategoryResponse>> updateCategory(
            @PathVariable UUID id,
            @Valid @RequestBody CategoryRequest request) {
        CategoryEntity entity = categoryService.updateCategory(id, request.getName());
        return ResponseEntity.ok(ApiResponse.success(HttpStatus.OK.value(), "Kategori berhasil diperbarui",
                productMapper.toCategoryResponse(entity)));
    }

    // DELETE /api/categories/{id} — Admin only
    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<Void>> deleteCategory(@PathVariable UUID id) {
        categoryService.deleteCategory(id);
        return ResponseEntity.ok(ApiResponse.success(HttpStatus.OK.value(), "Kategori berhasil dihapus", null));
    }
}
