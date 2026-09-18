package com.e_commerce.backend.feature_product.controller;

import com.e_commerce.backend.common.dto.ApiResponse;
import com.e_commerce.backend.feature_product.dto.request.PatchProductRequest;
import com.e_commerce.backend.feature_product.dto.request.ProductRequest;
import com.e_commerce.backend.feature_product.dto.response.ProductResponse;
import com.e_commerce.backend.feature_product.mapper.ProductMapper;
import com.e_commerce.backend.feature_product.model.ProductEntity;
import com.e_commerce.backend.feature_product.service.ProductService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.UUID;

/**
 * ProductController — Rule 6, 7, 9, 50
 * Menyediakan CRUD lengkap: List, Detail, Create, Update (PUT), Patch (PATCH), Delete.
 * Response menggunakan ApiResponse<T>.
 * Mapping dilakukan via ProductMapper (Rule 29).
 */
@RestController
@RequestMapping("/api/products")
@RequiredArgsConstructor
public class ProductController {

    private final ProductService productService;
    private final ProductMapper productMapper;

    // POST /api/products — Admin only
    @PostMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<ProductResponse>> createProduct(@Valid @RequestBody ProductRequest request) {
        ProductEntity entity = productService.createProduct(
                request.getCategoryId(),
                request.getName(),
                request.getDescription(),
                request.getPrice(),
                request.getStock(),
                request.getImageUrl()
        );
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success(HttpStatus.CREATED.value(), "Produk berhasil dibuat",
                        productMapper.toResponse(entity)));
    }

    // GET /api/products — Public, with search + filter + sort + pagination
    @GetMapping
    public ResponseEntity<ApiResponse<Page<ProductResponse>>> getAllActiveProducts(
            @RequestParam(required = false) String search,
            @RequestParam(required = false) UUID categoryId,
            @PageableDefault(size = 10, sort = "createdAt") Pageable pageable) {
        Page<ProductResponse> products = productService.getAllActiveProducts(search, categoryId, pageable)
                .map(productMapper::toResponse);
        return ResponseEntity.ok(ApiResponse.success(HttpStatus.OK.value(), "Katalog Produk", products));
    }

    // GET /api/products/admin — Admin only (semua produk: aktif maupun disembunyikan)
    @GetMapping("/admin")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<Page<ProductResponse>>> getAllProductsForAdmin(
            @RequestParam(required = false) String search,
            @RequestParam(required = false) UUID categoryId,
            @RequestParam(required = false) Boolean isActive,
            @PageableDefault(size = 10, sort = "createdAt") Pageable pageable) {
        Page<ProductResponse> products = productService.getAllProductsForAdmin(search, categoryId, isActive, pageable)
                .map(productMapper::toResponse);
        return ResponseEntity.ok(ApiResponse.success(HttpStatus.OK.value(), "Daftar produk admin", products));
    }

    // GET /api/products/{id} — Public
    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<ProductResponse>> getProductById(@PathVariable UUID id) {
        ProductEntity entity = productService.getProductById(id);
        return ResponseEntity.ok(ApiResponse.success(HttpStatus.OK.value(), "Detail produk",
                productMapper.toResponse(entity)));
    }

    // PUT /api/products/{id} — Admin only (full update)
    @PutMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<ProductResponse>> updateProduct(
            @PathVariable UUID id,
            @Valid @RequestBody ProductRequest request) {
        ProductEntity entity = productService.updateProduct(
                id,
                request.getName(),
                request.getDescription(),
                request.getPrice(),
                request.getStock(),
                request.getImageUrl()
        );
        return ResponseEntity.ok(ApiResponse.success(HttpStatus.OK.value(), "Produk berhasil diperbarui",
                productMapper.toResponse(entity)));
    }

    // PATCH /api/products/{id} — Admin only (partial update), Rule 9
    @PatchMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<ProductResponse>> patchProduct(
            @PathVariable UUID id,
            @Valid @RequestBody PatchProductRequest request) {
        ProductEntity entity = productService.patchProduct(id, request);
        return ResponseEntity.ok(ApiResponse.success(HttpStatus.OK.value(), "Produk berhasil diperbarui sebagian",
                productMapper.toResponse(entity)));
    }

    // DELETE /api/products/{id} — Admin only (soft delete / hide)
    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<Void>> softDeleteProduct(@PathVariable UUID id) {
        productService.softDeleteProduct(id);
        return ResponseEntity.ok(ApiResponse.success(HttpStatus.OK.value(), "Produk berhasil disembunyikan dari katalog", null));
    }

    // PATCH /api/products/{id}/hide — Admin only (semantic alias untuk menyembunyikan produk)
    @PatchMapping("/{id}/hide")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<ProductResponse>> hideProduct(@PathVariable UUID id) {
        ProductEntity entity = productService.hideProduct(id);
        return ResponseEntity.ok(ApiResponse.success(HttpStatus.OK.value(), "Produk berhasil disembunyikan dari katalog",
                productMapper.toResponse(entity)));
    }

    // PATCH /api/products/{id}/unhide — Admin only (mengaktifkan kembali produk)
    @PatchMapping("/{id}/unhide")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<ProductResponse>> unhideProduct(@PathVariable UUID id) {
        ProductEntity entity = productService.unhideProduct(id);
        return ResponseEntity.ok(ApiResponse.success(HttpStatus.OK.value(), "Produk berhasil diaktifkan kembali ke katalog",
                productMapper.toResponse(entity)));
    }

    // PATCH /api/products/{id}/show — Admin only (alias unhide)
    @PatchMapping("/{id}/show")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<ProductResponse>> showProduct(@PathVariable UUID id) {
        return unhideProduct(id);
    }
}
