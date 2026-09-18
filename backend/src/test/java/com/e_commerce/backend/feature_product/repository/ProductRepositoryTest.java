package com.e_commerce.backend.feature_product.repository;

import com.e_commerce.backend.feature_product.model.ProductEntity;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.transaction.annotation.Transactional;

import java.util.UUID;

import static org.junit.jupiter.api.Assertions.*;

@SpringBootTest
@Transactional
@DisplayName("ProductRepository Integration Tests")
class ProductRepositoryTest {

    @Autowired
    private ProductRepository productRepository;

    @Test
    @DisplayName("findActiveProductsWithFilters: search=null, categoryId=null works with EntityGraph")
    void testFindAllNoFilters() {
        Pageable pageable = ProductRepository.sanitizePageable(PageRequest.of(0, 10));
        assertDoesNotThrow(() -> {
            Page<ProductEntity> page = productRepository.findActiveProductsWithFilters(null, null, pageable);
            assertNotNull(page);
            // Verify EntityGraph eager loading does not throw LazyInitializationException
            page.getContent().forEach(p -> {
                assertNotNull(p.getName());
                if (p.getCategory() != null) {
                    assertNotNull(p.getCategory().getName());
                }
            });
        });
    }

    @Test
    @DisplayName("findActiveProductsWithFilters: search with text and categoryId works")
    void testFindWithSearchAndCategory() {
        Pageable pageable = ProductRepository.sanitizePageable(PageRequest.of(0, 10, Sort.by(Sort.Direction.ASC, "price")));
        assertDoesNotThrow(() -> {
            Page<ProductEntity> page = productRepository.findActiveProductsWithFilters("test", UUID.randomUUID(), pageable);
            assertNotNull(page);
        });
    }

    @Test
    @DisplayName("findActiveProductsWithFilters: empty search string works")
    void testFindWithEmptySearch() {
        Pageable pageable = ProductRepository.sanitizePageable(PageRequest.of(0, 5, Sort.by(Sort.Direction.DESC, "createdAt")));
        assertDoesNotThrow(() -> {
            Page<ProductEntity> page = productRepository.findActiveProductsWithFilters("", null, pageable);
            assertNotNull(page);
        });
    }

    @Test
    @DisplayName("findAllProductsForAdmin: retrieves both active and hidden products without error")
    void testFindAllProductsForAdmin() {
        Pageable pageable = ProductRepository.sanitizePageable(PageRequest.of(0, 10));
        assertDoesNotThrow(() -> {
            Page<ProductEntity> page = productRepository.findAllProductsForAdmin(null, null, null, pageable);
            assertNotNull(page);
        });
    }
}
