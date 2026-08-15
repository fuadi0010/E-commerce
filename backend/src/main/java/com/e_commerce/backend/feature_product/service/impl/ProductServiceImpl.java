package com.e_commerce.backend.feature_product.service.impl;

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
import java.time.ZonedDateTime;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class ProductServiceImpl implements ProductService {

    private final ProductRepository productRepository;
    private final CategoryService categoryService;

    @Override
    @Transactional
    public ProductEntity createProduct(UUID categoryId, String name, String description, BigDecimal price, Integer stock, String imageUrl) {
        CategoryEntity category = categoryService.getCategoryById(categoryId);

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
    public ProductEntity updateProduct(UUID id, String name, String description, BigDecimal price, Integer stock, String imageUrl) {
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

    @Override
    @Transactional
    public void softDeleteProduct(UUID productId) {
        ProductEntity product = getProductById(productId);
        productRepository.delete(product); // Hibernate's @SQLDelete will handle this automatically
    }

    @Override
    public ProductEntity getProductById(UUID productId) {
        return productRepository.findById(productId)
                .orElseThrow(() -> new RuntimeException("Produk tidak ditemukan atau telah dihapus"));
    }

    @Override
    public Page<ProductEntity> getAllActiveProducts(String search, UUID categoryId, Pageable pageable) {
        return productRepository.findActiveProductsWithFilters(search, categoryId, pageable);
    }
}
