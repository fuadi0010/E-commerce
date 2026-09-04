package com.e_commerce.backend.feature_product.service;

import com.e_commerce.backend.feature_product.dto.request.PatchProductRequest;
import com.e_commerce.backend.feature_product.model.ProductEntity;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import java.math.BigDecimal;
import java.util.UUID;

public interface ProductService {
    ProductEntity createProduct(UUID categoryId, String name, String description, BigDecimal price, Integer stock, String imageUrl);

    ProductEntity updateProduct(UUID id, String name, String description, BigDecimal price, Integer stock, String imageUrl);

    /** Rule 9: Partial update via PATCH */
    ProductEntity patchProduct(UUID id, PatchProductRequest request);

    void softDeleteProduct(UUID id);

    ProductEntity getProductById(UUID id);

    Page<ProductEntity> getAllActiveProducts(String search, UUID categoryId, Pageable pageable);
}
