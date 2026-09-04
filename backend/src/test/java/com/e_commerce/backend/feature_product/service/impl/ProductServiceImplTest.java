package com.e_commerce.backend.feature_product.service.impl;

import com.e_commerce.backend.exception.custom.ResourceNotFoundException;
import com.e_commerce.backend.feature_product.dto.request.PatchProductRequest;
import com.e_commerce.backend.feature_product.model.CategoryEntity;
import com.e_commerce.backend.feature_product.model.ProductEntity;
import com.e_commerce.backend.feature_product.repository.ProductRepository;
import com.e_commerce.backend.feature_product.service.CategoryService;
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
import java.util.List;
import java.util.Optional;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

/**
 * Unit Tests untuk ProductServiceImpl.
 * Rule 72: Test CRUD, validation, exception handling, soft delete.
 */
@ExtendWith(MockitoExtension.class)
@DisplayName("ProductServiceImpl Tests")
class ProductServiceImplTest {

    @Mock private ProductRepository productRepository;
    @Mock private CategoryService categoryService;

    @InjectMocks
    private ProductServiceImpl productService;

    private UUID productId;
    private UUID categoryId;
    private CategoryEntity mockCategory;
    private ProductEntity mockProduct;

    @BeforeEach
    void setUp() {
        productId = UUID.randomUUID();
        categoryId = UUID.randomUUID();

        mockCategory = new CategoryEntity();
        mockCategory.setId(categoryId);
        mockCategory.setName("Elektronik");

        mockProduct = new ProductEntity();
        mockProduct.setId(productId);
        mockProduct.setName("Laptop Asus ROG");
        mockProduct.setDescription("Laptop gaming bertenaga tinggi");
        mockProduct.setPrice(new BigDecimal("15000000.00"));
        mockProduct.setStock(10);
        mockProduct.setCategory(mockCategory);
    }

    // ===========================
    // createProduct
    // ===========================
    @Test
    @DisplayName("createProduct: Berhasil membuat produk baru")
    void createProduct_Success() {
        when(categoryService.getCategoryById(categoryId)).thenReturn(mockCategory);
        when(productRepository.save(any(ProductEntity.class)))
                .thenAnswer(org.mockito.AdditionalAnswers.returnsFirstArg());

        ProductEntity result = productService.createProduct(
                categoryId, "Laptop Asus ROG", "Laptop gaming", new BigDecimal("15000000"), 10, null);

        assertNotNull(result);
        assertEquals("Laptop Asus ROG", result.getName());
        assertEquals(10, result.getStock());
        assertEquals(mockCategory, result.getCategory());

        verify(categoryService, times(1)).getCategoryById(categoryId);
        verify(productRepository, times(1)).save(any(ProductEntity.class));
    }

    // ===========================
    // getProductById
    // ===========================
    @Test
    @DisplayName("getProductById: Produk ditemukan → return entity")
    void getProductById_Found_ReturnsEntity() {
        when(productRepository.findById(productId)).thenReturn(Optional.of(mockProduct));

        ProductEntity result = productService.getProductById(productId);

        assertNotNull(result);
        assertEquals(productId, result.getId());
    }

    @Test
    @DisplayName("getProductById: Produk tidak ditemukan → ResourceNotFoundException")
    void getProductById_NotFound_ThrowsResourceNotFoundException() {
        UUID unknownId = UUID.randomUUID();
        when(productRepository.findById(unknownId)).thenReturn(Optional.empty());

        ResourceNotFoundException ex = assertThrows(ResourceNotFoundException.class,
                () -> productService.getProductById(unknownId));
        assertTrue(ex.getMessage().contains(unknownId.toString()));
    }

    // ===========================
    // updateProduct
    // ===========================
    @Test
    @DisplayName("updateProduct: Berhasil mengupdate produk")
    void updateProduct_Success() {
        when(productRepository.findById(productId)).thenReturn(Optional.of(mockProduct));
        when(productRepository.save(any(ProductEntity.class)))
                .thenAnswer(org.mockito.AdditionalAnswers.returnsFirstArg());

        ProductEntity result = productService.updateProduct(
                productId, "Laptop Baru", "Deskripsi baru",
                new BigDecimal("12000000"), 5, "http://newimage.com/img.jpg");

        assertEquals("Laptop Baru", result.getName());
        assertEquals(new BigDecimal("12000000"), result.getPrice());
        assertEquals(5, result.getStock());
    }

    // ===========================
    // patchProduct (Rule 9)
    // ===========================
    @Test
    @DisplayName("patchProduct: Partial update — hanya field yang diisi yang berubah")
    void patchProduct_PartialUpdate_OnlyChangesSpecifiedFields() {
        when(productRepository.findById(productId)).thenReturn(Optional.of(mockProduct));
        when(productRepository.save(any(ProductEntity.class)))
                .thenAnswer(org.mockito.AdditionalAnswers.returnsFirstArg());

        PatchProductRequest patch = new PatchProductRequest();
        patch.setStock(99); // Hanya update stok

        ProductEntity result = productService.patchProduct(productId, patch);

        // Stok berubah
        assertEquals(99, result.getStock());
        // Field lain tetap sama
        assertEquals("Laptop Asus ROG", result.getName());
        assertEquals(new BigDecimal("15000000.00"), result.getPrice());
    }

    // ===========================
    // softDeleteProduct
    // ===========================
    @Test
    @DisplayName("softDeleteProduct: Produk berhasil di-soft-delete")
    void softDeleteProduct_Success() {
        when(productRepository.findById(productId)).thenReturn(Optional.of(mockProduct));

        assertDoesNotThrow(() -> productService.softDeleteProduct(productId));
        verify(productRepository, times(1)).delete(mockProduct);
    }

    // ===========================
    // getAllActiveProducts — Pagination
    // ===========================
    @Test
    @DisplayName("getAllActiveProducts: Filter dan pagination berfungsi")
    void getAllActiveProducts_WithSearchAndCategory_ReturnsPage() {
        Pageable pageable = PageRequest.of(0, 10);
        Page<ProductEntity> expectedPage = new PageImpl<>(List.of(mockProduct));

        when(productRepository.findActiveProductsWithFilters(eq("laptop"), eq(categoryId), any(Pageable.class)))
                .thenReturn(expectedPage);

        Page<ProductEntity> result = productService.getAllActiveProducts("laptop", categoryId, pageable);

        assertNotNull(result);
        assertEquals(1, result.getTotalElements());
        assertEquals(mockProduct, result.getContent().get(0));
    }

    @Test
    @DisplayName("sanitizePageable: Berhasil sanitasi field sort valid dan konversi snake_case ke property Java")
    void sanitizePageable_ValidAndLegacyFields() {
        // Test 1: Unsorted -> fallback ke createdAt DESC
        Pageable unsorted = Pageable.unpaged();
        Pageable res1 = ProductRepository.sanitizePageable(unsorted);
        assertEquals("createdAt: DESC", res1.getSort().iterator().next().toString());

        // Test 2: Field valid (price, ASC)
        Pageable p2 = PageRequest.of(0, 10, org.springframework.data.domain.Sort.by("price"));
        Pageable res2 = ProductRepository.sanitizePageable(p2);
        assertEquals("price: ASC", res2.getSort().iterator().next().toString());

        // Test 3: Field snake_case legacy (created_at) -> dikonversi ke createdAt
        Pageable p3 = PageRequest.of(0, 10, org.springframework.data.domain.Sort.by(org.springframework.data.domain.Sort.Direction.ASC, "created_at"));
        Pageable res3 = ProductRepository.sanitizePageable(p3);
        assertEquals("createdAt: ASC", res3.getSort().iterator().next().toString());

        // Test 4: Field ilegal (misal SQL injection / unknown column) -> di-filter habis dan fallback ke createdAt DESC
        Pageable p4 = PageRequest.of(0, 10, org.springframework.data.domain.Sort.by("password_hash"));
        Pageable res4 = ProductRepository.sanitizePageable(p4);
        assertEquals("createdAt: DESC", res4.getSort().iterator().next().toString());
    }
}
