package com.e_commerce.backend.feature_product.service.impl;

import com.e_commerce.backend.exception.custom.ResourceNotFoundException;
import com.e_commerce.backend.feature_product.dto.request.PatchProductRequest;
import com.e_commerce.backend.feature_product.model.CategoryEntity;
import com.e_commerce.backend.feature_product.model.ProductEntity;
import com.e_commerce.backend.feature_product.repository.ProductRepository;
import com.e_commerce.backend.feature_product.service.CategoryService;
import com.e_commerce.backend.feature_product.service.ProductService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class ProductServiceImpl implements ProductService {

    private final ProductRepository productRepository;
    private final CategoryService categoryService;

    @Override
    @Transactional
    public ProductEntity createProduct(UUID categoryId, String name, String description,
                                        BigDecimal price, Integer stock, String imageUrl) {
        CategoryEntity category = categoryService.getCategoryById(categoryId);
        if (Boolean.FALSE.equals(category.getIsActive())) {
            throw new IllegalArgumentException("Kategori tidak aktif atau disembunyikan. Tidak dapat menambahkan produk pada kategori ini.");
        }

        ProductEntity product = new ProductEntity();
        product.setCategory(category);
        product.setName(name);
        product.setDescription(description);
        product.setPrice(price);
        product.setStock(stock);
        product.setImageUrl(imageUrl);

        return productRepository.save(product);
    }

    @Override
    @Transactional
    public ProductEntity updateProduct(UUID id, String name, String description,
                                        BigDecimal price, Integer stock, String imageUrl) {
        ProductEntity product = getProductById(id);

        product.setName(name);
        product.setDescription(description);
        product.setPrice(price);
        product.setStock(stock);
        if (imageUrl != null) {
            product.setImageUrl(imageUrl);
        }

        return productRepository.save(product);
    }

    /**
     * Rule 9: Partial update — hanya field non-null yang diupdate.
     */
    @Override
    @Transactional
    public ProductEntity patchProduct(UUID id, PatchProductRequest request) {
        ProductEntity product = getProductById(id);

        if (request.getCategoryId() != null) {
            CategoryEntity category = categoryService.getCategoryById(request.getCategoryId());
            product.setCategory(category);
        }
        if (request.getName() != null) {
            product.setName(request.getName());
        }
        if (request.getDescription() != null) {
            product.setDescription(request.getDescription());
        }
        if (request.getPrice() != null) {
            product.setPrice(request.getPrice());
        }
        if (request.getStock() != null) {
            product.setStock(request.getStock());
        }
        if (request.getImageUrl() != null) {
            product.setImageUrl(request.getImageUrl());
        }

        return productRepository.save(product);
    }

    @Override
    @Transactional
    public void softDeleteProduct(UUID productId) {
        ProductEntity product = getProductById(productId);
        // Rule 15: @SQLDelete handles soft delete automatically via Hibernate
        productRepository.delete(product);
    }

    @Override
    @Transactional(readOnly = true)
    public ProductEntity getProductById(UUID productId) {
        return productRepository.findById(productId)
                .orElseThrow(() -> new ResourceNotFoundException("Produk dengan ID " + productId + " tidak ditemukan atau telah dihapus"));
    }

    @Override
    @Transactional(readOnly = true)
    public Page<ProductEntity> getAllActiveProducts(String search, UUID categoryId, Pageable pageable) {
        // Rule 23: Sanitize sorting — hanya field dalam whitelist yang diizinkan
        Pageable safePage = ProductRepository.sanitizePageable(pageable);
        return productRepository.findActiveProductsWithFilters(search, categoryId, safePage);
    }
}
