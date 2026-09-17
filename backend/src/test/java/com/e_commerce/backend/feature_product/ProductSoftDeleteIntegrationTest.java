package com.e_commerce.backend.feature_product;

import com.e_commerce.backend.feature_order.model.OrderEntity;
import com.e_commerce.backend.feature_order.repository.OrderItemRepository;
import com.e_commerce.backend.feature_order.repository.OrderRepository;
import com.e_commerce.backend.feature_product.model.CategoryEntity;
import com.e_commerce.backend.feature_product.model.ProductEntity;
import com.e_commerce.backend.feature_product.repository.CategoryRepository;
import com.e_commerce.backend.feature_product.repository.ProductRepository;
import com.e_commerce.backend.feature_product.service.ProductService;
import com.e_commerce.backend.feature_review.repository.ReviewRepository;
import jakarta.persistence.EntityManager;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.*;

/**
 * Critical Regression & Integration Tests for Soft Delete Product.
 * Memvalidasi 10 skenario wajib sesuai spesifikasi:
 * TEST 1 s/d TEST 10.
 */
@SpringBootTest
@Transactional
@DisplayName("Product Soft Delete Critical Regression Tests")
class ProductSoftDeleteIntegrationTest {

    @Autowired
    private ProductService productService;

    @Autowired
    private ProductRepository productRepository;

    @Autowired
    private CategoryRepository categoryRepository;

    @Autowired
    private OrderRepository orderRepository;

    @Autowired
    private OrderItemRepository orderItemRepository;

    @Autowired
    private ReviewRepository reviewRepository;

    @Autowired
    private EntityManager entityManager;

    private CategoryEntity getOrCreateCategory() {
        return categoryRepository.findAll().stream()
                .filter(CategoryEntity::getIsActive)
                .findFirst()
                .orElseGet(() -> {
                    CategoryEntity cat = new CategoryEntity();
                    cat.setName("Test Category " + UUID.randomUUID());
                    cat.setIsActive(true);
                    return categoryRepository.save(cat);
                });
    }

    @Test
    @DisplayName("TEST 1: Product stock > 0 → Hide → Berhasil di-soft-delete")
    void test1_ProductStockGreaterThanZero_Hide_Success() {
        CategoryEntity category = getOrCreateCategory();
        ProductEntity product = productService.createProduct(
                category.getId(),
                "Produk Stok Positif " + UUID.randomUUID(),
                "Deskripsi produk uji",
                new BigDecimal("150000.00"),
                25, // stock > 0
                "https://example.com/img1.jpg"
        );
        entityManager.flush();

        assertDoesNotThrow(() -> productService.softDeleteProduct(product.getId()));
        entityManager.flush();
        entityManager.clear();

        // Verifikasi langsung di database melalui native query bahwa record masih ada dan deleted_at terisi
        Object deletedAt = entityManager.createNativeQuery(
                "SELECT deleted_at FROM products WHERE id = :id")
                .setParameter("id", product.getId())
                .getSingleResult();

        assertNotNull(deletedAt, "Kolom deleted_at di database harus terisi (tidak boleh NULL)");
    }

    @Test
    @DisplayName("TEST 2: Product stock = 0 → Hide → Berhasil di-soft-delete")
    void test2_ProductStockZero_Hide_Success() {
        CategoryEntity category = getOrCreateCategory();
        ProductEntity product = productService.createProduct(
                category.getId(),
                "Produk Stok Habis " + UUID.randomUUID(),
                "Deskripsi produk stok habis",
                new BigDecimal("99000.00"),
                0, // stock = 0
                "https://example.com/img2.jpg"
        );
        entityManager.flush();

        assertDoesNotThrow(() -> productService.softDeleteProduct(product.getId()));
        entityManager.flush();
        entityManager.clear();

        Object deletedAt = entityManager.createNativeQuery(
                "SELECT deleted_at FROM products WHERE id = :id")
                .setParameter("id", product.getId())
                .getSingleResult();

        assertNotNull(deletedAt, "Produk dengan stock = 0 harus dapat di-hide dan deleted_at terisi");
    }

    @Test
    @DisplayName("TEST 3, 5 & 8: Product memiliki relasi Order Items → Hide → Berhasil tanpa FK Conflict")
    void test3_ProductWithOrderItems_Hide_Success_NoFkConflict() {
        // ID produk Sony WH-1000XM5 dari V6 seed data yang memiliki relasi ke order_items
        UUID seededProductId = UUID.fromString("66557e36-0c2a-4feb-8570-9168432129c4");

        // Pastikan relasi order_items memang ada
        Number orderItemCount = (Number) entityManager.createNativeQuery(
                "SELECT COUNT(*) FROM order_items WHERE product_id = :id")
                .setParameter("id", seededProductId)
                .getSingleResult();
        assertTrue(orderItemCount.longValue() > 0, "Produk harus memiliki relasi order_items sebelum pengujian");

        // Jalankan Soft Delete
        assertDoesNotThrow(() -> productService.softDeleteProduct(seededProductId));
        entityManager.flush();
        entityManager.clear();

        // Verifikasi TEST 8: Record masih ada di database
        Number productCount = (Number) entityManager.createNativeQuery(
                "SELECT COUNT(*) FROM products WHERE id = :id")
                .setParameter("id", seededProductId)
                .getSingleResult();
        assertEquals(1L, productCount.longValue(), "Data produk di database tidak boleh terhapus (harus tetap ada)");

        // Verifikasi order_items masih utuh tanpa perubahan
        Number orderItemCountAfter = (Number) entityManager.createNativeQuery(
                "SELECT COUNT(*) FROM order_items WHERE product_id = :id")
                .setParameter("id", seededProductId)
                .getSingleResult();
        assertEquals(orderItemCount.longValue(), orderItemCountAfter.longValue(),
                "Jumlah relasi order_items tidak boleh berkurang atau terhapus");
    }

    @Test
    @DisplayName("TEST 4: Product memiliki relasi Reviews → Hide → Berhasil dan Reviews tetap utuh")
    void test4_ProductWithReviews_Hide_Success_ReviewsPreserved() {
        UUID seededProductId = UUID.fromString("66557e36-0c2a-4feb-8570-9168432129c4");

        Number reviewCountBefore = (Number) entityManager.createNativeQuery(
                "SELECT COUNT(*) FROM reviews WHERE product_id = :id")
                .setParameter("id", seededProductId)
                .getSingleResult();
        assertTrue(reviewCountBefore.longValue() > 0, "Produk harus memiliki relasi review dari seed data V9");

        assertDoesNotThrow(() -> productService.softDeleteProduct(seededProductId));
        entityManager.flush();
        entityManager.clear();

        // Verifikasi review TIDAK terhapus secara cascade
        Number reviewCountAfter = (Number) entityManager.createNativeQuery(
                "SELECT COUNT(*) FROM reviews WHERE product_id = :id")
                .setParameter("id", seededProductId)
                .getSingleResult();
        assertEquals(reviewCountBefore.longValue(), reviewCountAfter.longValue(),
                "Seluruh ulasan review produk harus tetap utuh dan tidak boleh terhapus");
    }

    @Test
    @DisplayName("TEST 6: Product yang di-hide tidak muncul di katalog publik")
    void test6_HiddenProduct_NotAppearingInPublicCatalog() {
        CategoryEntity category = getOrCreateCategory();
        String uniqueName = "Katalog Hidden Check " + UUID.randomUUID();
        ProductEntity product = productService.createProduct(
                category.getId(),
                uniqueName,
                "Deskripsi untuk pengujian katalog",
                new BigDecimal("50000.00"),
                10,
                null
        );
        entityManager.flush();

        // Saat masih aktif, produk muncul di pencarian
        Page<ProductEntity> activeBefore = productService.getAllActiveProducts(uniqueName, null, PageRequest.of(0, 10));
        assertEquals(1, activeBefore.getTotalElements(), "Produk aktif harus muncul di katalog");

        // Hide produk
        productService.softDeleteProduct(product.getId());
        entityManager.flush();
        entityManager.clear();

        // Setelah di-hide, produk TIDAK BOLEH muncul di pencarian katalog
        Page<ProductEntity> activeAfter = productService.getAllActiveProducts(uniqueName, null, PageRequest.of(0, 10));
        assertEquals(0, activeAfter.getTotalElements(), "Produk yang disembunyikan TIDAK BOLEH muncul di katalog publik");
    }

    @Autowired
    private com.e_commerce.backend.feature_order.mapper.OrderMapper orderMapper;

    @Test
    @DisplayName("TEST 7: Historical Order tetap dapat diakses setelah produk di-hide")
    void test7_HistoricalOrder_StillAccessibleAfterProductHide() {
        // Order id dari seed data V6 yang mereferensikan produk seededProductId
        UUID seededOrderId = UUID.fromString("099826fe-9090-40f8-b7d1-4bf105801d1d");
        UUID seededProductId = UUID.fromString("66557e36-0c2a-4feb-8570-9168432129c4");

        // Hide produk tersebut
        productService.softDeleteProduct(seededProductId);
        entityManager.flush();
        entityManager.clear();

        // Muat kembali historical order
        OrderEntity order = orderRepository.findById(seededOrderId).orElse(null);
        assertNotNull(order, "Order historis harus tetap dapat ditemukan");
        assertFalse(order.getItems().isEmpty(), "Item dalam order historis tidak boleh kosong");

        // Verifikasi OrderResponse mapping sesuai arsitektur project (OrderMapper menangani produk berstatus arsip/hide)
        com.e_commerce.backend.feature_order.dto.response.OrderResponse response = orderMapper.toResponse(order);
        assertNotNull(response, "Order response harus berhasil dibuat tanpa error");
        assertFalse(response.getItems().isEmpty(), "Item order response tidak boleh kosong");
        assertNotNull(response.getItems().get(0).getPriceAtTime(), "Snapshot harga historis (priceAtTime) harus tetap ada");
        assertNotNull(response.getItems().get(0).getProduct(), "Informasi produk pada order historis harus tetap ada");

        // Verifikasi di level database bahwa relasi foreign key product_id tetap utuh dan tersimpan
        Object dbProductId = entityManager.createNativeQuery(
                "SELECT product_id FROM order_items WHERE order_id = :orderId AND product_id = :productId")
                .setParameter("orderId", seededOrderId)
                .setParameter("productId", seededProductId)
                .getSingleResult();
        assertEquals(seededProductId, dbProductId, "Foreign key product_id di database harus tetap tersimpan");
    }

    @Test
    @DisplayName("TEST 9 & 10: Admin Hide tanpa error dan produk aktif lain tetap normal")
    void test9_test10_AdminHideNoError_AndOtherActiveProductsRemainNormal() {
        CategoryEntity category = getOrCreateCategory();
        ProductEntity prodA = productService.createProduct(category.getId(), "Prod Aktif A " + UUID.randomUUID(), "Desc", new BigDecimal("10000"), 5, null);
        ProductEntity prodB = productService.createProduct(category.getId(), "Prod Aktif B " + UUID.randomUUID(), "Desc", new BigDecimal("20000"), 10, null);
        entityManager.flush();

        // Admin hide prodA
        assertDoesNotThrow(() -> productService.softDeleteProduct(prodA.getId()));
        entityManager.flush();
        entityManager.clear();

        // prodB tetap aktif dan dapat diambil
        ProductEntity fetchedB = productService.getProductById(prodB.getId());
        assertNotNull(fetchedB);
        assertNull(fetchedB.getDeletedAt());
        assertEquals("Prod Aktif B", fetchedB.getName().substring(0, 12));
    }
}
