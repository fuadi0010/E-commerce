package com.e_commerce.backend.feature_order.service.impl;

import com.e_commerce.backend.exception.custom.InsufficientStockException;
import com.e_commerce.backend.exception.custom.ResourceNotFoundException;
import com.e_commerce.backend.feature_order.dto.request.OrderRequest;
import com.e_commerce.backend.feature_order.model.OrderEntity;
import com.e_commerce.backend.feature_order.model.OrderItemEntity;
import com.e_commerce.backend.feature_order.model.OrderStatus;
import com.e_commerce.backend.feature_order.repository.OrderItemRepository;
import com.e_commerce.backend.feature_order.repository.OrderRepository;
import com.e_commerce.backend.feature_product.model.ProductEntity;
import com.e_commerce.backend.feature_product.repository.ProductRepository;
import com.e_commerce.backend.feature_user.model.UserEntity;
import com.e_commerce.backend.feature_user.repository.UserRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.math.BigDecimal;
import java.time.ZonedDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;
import java.util.UUID;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;

import com.e_commerce.backend.feature_payment.model.PaymentEntity;
import com.e_commerce.backend.feature_payment.model.PaymentStatus;
import com.e_commerce.backend.feature_payment.repository.PaymentRepository;
import com.e_commerce.backend.feature_order.dto.response.DashboardStatsResponse;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyCollection;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.*;

/**
 * Unit Tests untuk OrderServiceImpl.
 * Rule 72: Test business logic, validation, exception handling, concurrency logic.
 */
@ExtendWith(MockitoExtension.class)
@DisplayName("OrderServiceImpl Tests")
class OrderServiceImplTest {

    @Mock private OrderRepository orderRepository;
    @Mock private OrderItemRepository orderItemRepository;
    @Mock private ProductRepository productRepository;
    @Mock private UserRepository userRepository;
    @Mock private PaymentRepository paymentRepository;

    @InjectMocks
    private OrderServiceImpl orderService;

    private UUID userId;
    private UUID productId;
    private UserEntity mockUser;
    private ProductEntity mockProduct;

    @BeforeEach
    void setUp() {
        userId = UUID.randomUUID();
        productId = UUID.randomUUID();

        mockUser = new UserEntity();
        mockUser.setId(userId);
        mockUser.setEmail("test@user.com");

        mockProduct = new ProductEntity();
        mockProduct.setId(productId);
        mockProduct.setName("Laptop Gaming Asus ROG");
        mockProduct.setPrice(new BigDecimal("15000000.00"));
        mockProduct.setStock(10);
    }

    // ===========================
    // createOrder — Happy Path
    // ===========================
    @Test
    @DisplayName("createOrder: Berhasil membuat order dan mengurangi stok")
    void createOrder_Success() {
        OrderRequest.OrderItemRequest itemReq = new OrderRequest.OrderItemRequest(productId, 2);
        OrderRequest request = new OrderRequest(List.of(itemReq));

        when(userRepository.findById(userId)).thenReturn(Optional.of(mockUser));
        when(productRepository.findByIdWithPessimisticLock(productId)).thenReturn(Optional.of(mockProduct));
        when(orderRepository.save(any(OrderEntity.class)))
                .thenAnswer(org.mockito.AdditionalAnswers.returnsFirstArg());

        OrderEntity result = orderService.createOrder(userId, request);

        assertNotNull(result);
        assertEquals(OrderStatus.PENDING, result.getStatus());
        assertEquals(new BigDecimal("30000000.00"), result.getTotalAmount()); // 15jt x 2

        // Verify stok berkurang dari 10 → 8
        assertEquals(8, mockProduct.getStock());

        verify(userRepository, times(1)).findById(userId);
        verify(productRepository, times(1)).findByIdWithPessimisticLock(productId);
        verify(productRepository, times(1)).save(mockProduct);
        verify(orderItemRepository, times(1)).save(any());
        verify(orderRepository, times(2)).save(any(OrderEntity.class));
    }

    // ===========================
    // createOrder — Validation
    // ===========================
    @Test
    @DisplayName("createOrder: Order kosong → IllegalArgumentException")
    void createOrder_EmptyItems_ThrowsIllegalArgumentException() {
        OrderRequest request = new OrderRequest(new ArrayList<>());
        when(userRepository.findById(userId)).thenReturn(Optional.of(mockUser));

        IllegalArgumentException ex = assertThrows(IllegalArgumentException.class,
                () -> orderService.createOrder(userId, request));
        assertEquals("Pesanan tidak boleh kosong", ex.getMessage());

        verify(orderRepository, never()).save(any(OrderEntity.class));
    }

    // ===========================
    // createOrder — User Not Found
    // ===========================
    @Test
    @DisplayName("createOrder: User tidak ditemukan → ResourceNotFoundException")
    void createOrder_UserNotFound_ThrowsResourceNotFoundException() {
        OrderRequest request = new OrderRequest(List.of(new OrderRequest.OrderItemRequest(productId, 1)));
        when(userRepository.findById(userId)).thenReturn(Optional.empty());

        ResourceNotFoundException ex = assertThrows(ResourceNotFoundException.class,
                () -> orderService.createOrder(userId, request));
        assertEquals("User tidak ditemukan", ex.getMessage());

        verify(orderRepository, never()).save(any());
    }

    // ===========================
    // createOrder — Product Not Found
    // ===========================
    @Test
    @DisplayName("createOrder: Produk tidak ditemukan → ResourceNotFoundException")
    void createOrder_ProductNotFound_ThrowsResourceNotFoundException() {
        OrderRequest.OrderItemRequest itemReq = new OrderRequest.OrderItemRequest(productId, 1);
        OrderRequest request = new OrderRequest(List.of(itemReq));

        when(userRepository.findById(userId)).thenReturn(Optional.of(mockUser));
        when(orderRepository.save(any(OrderEntity.class))).thenReturn(new OrderEntity());
        when(productRepository.findByIdWithPessimisticLock(productId)).thenReturn(Optional.empty());

        ResourceNotFoundException ex = assertThrows(ResourceNotFoundException.class,
                () -> orderService.createOrder(userId, request));
        assertTrue(ex.getMessage().contains("Produk tidak ditemukan atau tidak aktif"));
    }

    // ===========================
    // createOrder — InsufficientStock (Rule 8)
    // ===========================
    @Test
    @DisplayName("createOrder: Stok tidak cukup → InsufficientStockException (Rule 8)")
    void createOrder_InsufficientStock_ThrowsInsufficientStockException() {
        // Minta 20, stok hanya 10
        OrderRequest.OrderItemRequest itemReq = new OrderRequest.OrderItemRequest(productId, 20);
        OrderRequest request = new OrderRequest(List.of(itemReq));

        when(userRepository.findById(userId)).thenReturn(Optional.of(mockUser));
        when(orderRepository.save(any(OrderEntity.class))).thenReturn(new OrderEntity());
        when(productRepository.findByIdWithPessimisticLock(productId)).thenReturn(Optional.of(mockProduct));

        InsufficientStockException ex = assertThrows(InsufficientStockException.class,
                () -> orderService.createOrder(userId, request));
        assertTrue(ex.getMessage().contains("Laptop Gaming Asus ROG"));
        assertTrue(ex.getMessage().contains("20"));
        assertTrue(ex.getMessage().contains("10"));

        // Stok TIDAK boleh berubah saat exception
        assertEquals(10, mockProduct.getStock());
        verify(productRepository, never()).save(any(ProductEntity.class));
        verify(orderItemRepository, never()).save(any());
    }

    // ===========================
    // updateOrderStatus
    // ===========================
    @Test
    @DisplayName("updateOrderStatus: Berhasil mengubah status order")
    void updateOrderStatus_Success() {
        UUID orderId = UUID.randomUUID();
        OrderEntity order = new OrderEntity();
        order.setId(orderId);
        order.setStatus(OrderStatus.PENDING);

        when(orderRepository.findById(orderId)).thenReturn(Optional.of(order));
        when(orderRepository.save(any(OrderEntity.class)))
                .thenAnswer(org.mockito.AdditionalAnswers.returnsFirstArg());

        OrderEntity result = orderService.updateOrderStatus(orderId, OrderStatus.PAID);

        assertEquals(OrderStatus.PAID, result.getStatus());
        verify(orderRepository, times(1)).save(order);
    }

    @Test
    @DisplayName("updateOrderStatus: Batalkan order (CANCELLED) -> Berhasil mengembalikan stok produk")
    void updateOrderStatus_CancelOrder_RestoresStockSuccessfully() {
        UUID orderId = UUID.randomUUID();
        OrderEntity order = new OrderEntity();
        order.setId(orderId);
        order.setStatus(OrderStatus.PENDING);

        ProductEntity prod1 = ProductEntity.builder()
                .id(UUID.randomUUID())
                .name("Kemeja Putih")
                .stock(10)
                .build();

        ProductEntity prod2 = ProductEntity.builder()
                .id(UUID.randomUUID())
                .name("Celana Jeans")
                .stock(5)
                .build();

        OrderItemEntity item1 = OrderItemEntity.builder()
                .id(UUID.randomUUID())
                .order(order)
                .product(prod1)
                .quantity(3)
                .build();

        OrderItemEntity item2 = OrderItemEntity.builder()
                .id(UUID.randomUUID())
                .order(order)
                .product(prod2)
                .quantity(2)
                .build();

        order.setItems(new ArrayList<>(List.of(item1, item2)));

        when(orderRepository.findById(orderId)).thenReturn(Optional.of(order));
        when(productRepository.findByIdWithPessimisticLock(prod1.getId())).thenReturn(Optional.of(prod1));
        when(productRepository.findByIdWithPessimisticLock(prod2.getId())).thenReturn(Optional.of(prod2));
        when(orderRepository.save(any(OrderEntity.class))).thenAnswer(org.mockito.AdditionalAnswers.returnsFirstArg());

        OrderEntity result = orderService.updateOrderStatus(orderId, OrderStatus.CANCELLED);

        assertEquals(OrderStatus.CANCELLED, result.getStatus());
        assertEquals(13, prod1.getStock(), "Stok produk 1 harus bertambah dari 10 menjadi 13");
        assertEquals(7, prod2.getStock(), "Stok produk 2 harus bertambah dari 5 menjadi 7");

        verify(productRepository, times(1)).save(prod1);
        verify(productRepository, times(1)).save(prod2);
        verify(orderRepository, times(1)).save(order);
    }

    @Test
    @DisplayName("updateOrderStatus: Status sudah CANCELLED lalu di-update CANCELLED lagi -> Idempoten, tidak menambah stok lagi")
    void updateOrderStatus_AlreadyCancelled_IdempotentNoStockAdded() {
        UUID orderId = UUID.randomUUID();
        OrderEntity order = new OrderEntity();
        order.setId(orderId);
        order.setStatus(OrderStatus.CANCELLED);

        when(orderRepository.findById(orderId)).thenReturn(Optional.of(order));

        OrderEntity result = orderService.updateOrderStatus(orderId, OrderStatus.CANCELLED);

        assertEquals(OrderStatus.CANCELLED, result.getStatus());
        verify(productRepository, never()).findByIdWithPessimisticLock(any());
        verify(productRepository, never()).save(any());
        verify(orderRepository, never()).save(any());
    }

    @Test
    @DisplayName("updateOrderStatus: Pesanan yang sudah CANCELLED tidak dapat diubah ke status lain -> Throws IllegalStateException")
    void updateOrderStatus_AlreadyCancelled_CannotChangeToOtherStatus() {
        UUID orderId = UUID.randomUUID();
        OrderEntity order = new OrderEntity();
        order.setId(orderId);
        order.setStatus(OrderStatus.CANCELLED);

        when(orderRepository.findById(orderId)).thenReturn(Optional.of(order));

        IllegalStateException ex = assertThrows(IllegalStateException.class,
                () -> orderService.updateOrderStatus(orderId, OrderStatus.PAID));

        assertTrue(ex.getMessage().contains("sudah dibatalkan tidak dapat diubah"));
        verify(productRepository, never()).save(any());
        verify(orderRepository, never()).save(any());
    }

    // ===========================
    // getOrderById
    // ===========================
    @Test
    @DisplayName("getOrderById: Order tidak ditemukan → ResourceNotFoundException")
    void getOrderById_NotFound_ThrowsResourceNotFoundException() {
        UUID unknownId = UUID.randomUUID();
        when(orderRepository.findById(unknownId)).thenReturn(Optional.empty());

        ResourceNotFoundException ex = assertThrows(ResourceNotFoundException.class,
                () -> orderService.getOrderById(unknownId));
        assertTrue(ex.getMessage().contains(unknownId.toString()));
    }

    // ===========================
    // createOrder — Concurrency / Deadlock Prevention
    // ===========================
    @Test
    @DisplayName("createOrder: Item diurutkan berdasarkan productId untuk mencegah deadlock")
    void createOrder_SortsItemsByProductId_PreventsDeadlock() {
        UUID productId1 = UUID.fromString("00000000-0000-0000-0000-000000000001");
        UUID productId2 = UUID.fromString("00000000-0000-0000-0000-000000000002");

        ProductEntity product1 = new ProductEntity();
        product1.setId(productId1);
        product1.setName("Product 1");
        product1.setPrice(new BigDecimal("10000.00"));
        product1.setStock(5);

        ProductEntity product2 = new ProductEntity();
        product2.setId(productId2);
        product2.setName("Product 2");
        product2.setPrice(new BigDecimal("20000.00"));
        product2.setStock(5);

        // Berikan request dengan urutan terbalik (product2 dulu baru product1)
        OrderRequest.OrderItemRequest item2 = new OrderRequest.OrderItemRequest(productId2, 1);
        OrderRequest.OrderItemRequest item1 = new OrderRequest.OrderItemRequest(productId1, 1);
        OrderRequest request = new OrderRequest(List.of(item2, item1));

        when(userRepository.findById(userId)).thenReturn(Optional.of(mockUser));
        when(orderRepository.save(any(OrderEntity.class))).thenAnswer(org.mockito.AdditionalAnswers.returnsFirstArg());
        when(productRepository.findByIdWithPessimisticLock(productId1)).thenReturn(Optional.of(product1));
        when(productRepository.findByIdWithPessimisticLock(productId2)).thenReturn(Optional.of(product2));

        OrderEntity result = orderService.createOrder(userId, request);

        assertNotNull(result);
        assertEquals(new BigDecimal("30000.00"), result.getTotalAmount());

        // Verifikasi bahwa findByIdWithPessimisticLock dipanggil dengan urutan productId1 DULU baru productId2
        org.mockito.InOrder inOrder = inOrder(productRepository);
        inOrder.verify(productRepository).findByIdWithPessimisticLock(productId1);
        inOrder.verify(productRepository).findByIdWithPessimisticLock(productId2);
    }

    @Test
    @DisplayName("getAllOrdersWithFilters: Berhasil memanggil orderRepository.findAll dengan Specification")
    void getAllOrdersWithFilters_CallsRepositoryWithSpec() {
        Pageable pageable = PageRequest.of(0, 10);
        Page<OrderEntity> mockPage = new PageImpl<>(List.of(new OrderEntity()));

        when(orderRepository.findAll(any(org.springframework.data.jpa.domain.Specification.class), eq(pageable)))
                .thenReturn(mockPage);

        Page<OrderEntity> result = orderService.getAllOrdersWithFilters(OrderStatus.PENDING, null, null, pageable);

        assertNotNull(result);
        assertEquals(1, result.getTotalElements());
        verify(orderRepository).findAll(any(org.springframework.data.jpa.domain.Specification.class), eq(pageable));
    }

    @Test
    @DisplayName("getAllOrdersWithFilters: Berhasil dengan rentang tanggal startDate dan endDate")
    void getAllOrdersWithFilters_WithDateRange_CallsRepositoryWithSpec() {
        Pageable pageable = PageRequest.of(0, 10);
        Page<OrderEntity> mockPage = new PageImpl<>(List.of(new OrderEntity()));
        ZonedDateTime startDate = ZonedDateTime.now().minusDays(3);
        ZonedDateTime endDate = ZonedDateTime.now();

        when(orderRepository.findAll(any(org.springframework.data.jpa.domain.Specification.class), eq(pageable)))
                .thenReturn(mockPage);

        Page<OrderEntity> result = orderService.getAllOrdersWithFilters(OrderStatus.PAID, startDate, endDate, pageable);

        assertNotNull(result);
        assertEquals(1, result.getTotalElements());
        verify(orderRepository).findAll(any(org.springframework.data.jpa.domain.Specification.class), eq(pageable));
    }

    @Test
    @DisplayName("getOrdersByUserAndStatus: Berhasil dengan filter status memanggil findByUserIdAndStatus")
    void getOrdersByUserAndStatus_WithStatus_CallsFindByUserIdAndStatus() {
        UUID userId = UUID.randomUUID();
        Pageable pageable = PageRequest.of(0, 10);
        Page<OrderEntity> mockPage = new PageImpl<>(List.of(new OrderEntity()));

        when(orderRepository.findByUserIdAndStatus(userId, OrderStatus.PAID, pageable))
                .thenReturn(mockPage);

        Page<OrderEntity> result = orderService.getOrdersByUserAndStatus(userId, OrderStatus.PAID, pageable);

        assertNotNull(result);
        assertEquals(1, result.getTotalElements());
        verify(orderRepository).findByUserIdAndStatus(userId, OrderStatus.PAID, pageable);
        verify(orderRepository, never()).findByUserId(userId, pageable);
    }

    @Test
    @DisplayName("getOrdersByUserAndStatus: Berhasil tanpa status memanggil findByUserId")
    void getOrdersByUserAndStatus_WithoutStatus_CallsFindByUserId() {
        UUID userId = UUID.randomUUID();
        Pageable pageable = PageRequest.of(0, 10);
        Page<OrderEntity> mockPage = new PageImpl<>(List.of(new OrderEntity()));

        when(orderRepository.findByUserId(userId, pageable))
                .thenReturn(mockPage);

        Page<OrderEntity> result = orderService.getOrdersByUserAndStatus(userId, null, pageable);

        assertNotNull(result);
        assertEquals(1, result.getTotalElements());
        verify(orderRepository).findByUserId(userId, pageable);
        verify(orderRepository, never()).findByUserIdAndStatus(any(), any(), any());
    }

    // ===========================
    // FINDING-002 & FINDING-003: Payment Method & Proof Tests
    // ===========================
    @Test
    @DisplayName("createOrder: Menyimpan paymentMethod dan paymentProofUrl saat checkout")
    void createOrder_WithPaymentMethodAndProof_PersistsCorrectly() {
        OrderRequest.OrderItemRequest itemReq = new OrderRequest.OrderItemRequest(productId, 1);
        OrderRequest request = OrderRequest.builder()
                .items(List.of(itemReq))
                .paymentMethod("QRIS")
                .paymentProofUrl("https://example.com/proofs/receipt.pdf")
                .build();

        when(userRepository.findById(userId)).thenReturn(Optional.of(mockUser));
        when(productRepository.findByIdWithPessimisticLock(productId)).thenReturn(Optional.of(mockProduct));
        when(orderRepository.save(any(OrderEntity.class)))
                .thenAnswer(org.mockito.AdditionalAnswers.returnsFirstArg());

        OrderEntity result = orderService.createOrder(userId, request);

        assertNotNull(result);
        assertEquals("QRIS", result.getPaymentMethod());
        assertEquals("https://example.com/proofs/receipt.pdf", result.getPaymentProofUrl());
    }

    @Test
    @DisplayName("updatePaymentProof: Berhasil memperbarui bukti pembayaran pesanan oleh pemiliknya")
    void updatePaymentProof_Owner_Success() {
        UUID orderId = UUID.randomUUID();
        OrderEntity order = new OrderEntity();
        order.setId(orderId);
        order.setUser(mockUser);
        order.setStatus(OrderStatus.PENDING);

        when(orderRepository.findById(orderId)).thenReturn(Optional.of(order));
        when(orderRepository.save(any(OrderEntity.class)))
                .thenAnswer(org.mockito.AdditionalAnswers.returnsFirstArg());

        OrderEntity result = orderService.updatePaymentProof(orderId, mockUser.getId(), "https://example.com/new_proof.pdf");

        assertEquals("https://example.com/new_proof.pdf", result.getPaymentProofUrl());
        verify(orderRepository, times(1)).save(order);
    }

    @Test
    @DisplayName("updatePaymentProof: Bukan pemilik pesanan (IDOR) -> Throws AccessDeniedException")
    void updatePaymentProof_NotOwner_ThrowsAccessDeniedException() {
        UUID orderId = UUID.randomUUID();
        OrderEntity order = new OrderEntity();
        order.setId(orderId);
        order.setUser(mockUser);

        UUID differentUserId = UUID.randomUUID();
        when(orderRepository.findById(orderId)).thenReturn(Optional.of(order));

        assertThrows(AccessDeniedException.class,
                () -> orderService.updatePaymentProof(orderId, differentUserId, "https://example.com/fraud_proof.pdf"));

        verify(orderRepository, never()).save(any());
    }

    // ===========================
    // ORDER-PAYMENT-FIX-001: cancelOrder Tests
    // ===========================
    @Test
    @DisplayName("cancelOrder: Berhasil membatalkan pesanan PENDING, mengembalikan stok, dan membatalkan pembayaran aktif")
    void cancelOrder_Success_RestoresStockAndCancelsPayment() {
        UUID orderId = UUID.randomUUID();
        OrderEntity order = new OrderEntity();
        order.setId(orderId);
        order.setUser(mockUser);
        order.setStatus(OrderStatus.PENDING);

        OrderItemEntity item = new OrderItemEntity();
        item.setId(UUID.randomUUID());
        item.setProduct(mockProduct);
        item.setQuantity(3);
        order.setItems(List.of(item));

        mockProduct.setStock(7); // stok saat ini 7, harus dikembalikan jadi 10

        PaymentEntity activePayment = PaymentEntity.builder()
                .id(UUID.randomUUID())
                .order(order)
                .status(PaymentStatus.PENDING)
                .build();

        when(orderRepository.findById(orderId)).thenReturn(Optional.of(order));
        when(productRepository.findByIdWithPessimisticLock(productId)).thenReturn(Optional.of(mockProduct));
        when(paymentRepository.findFirstByOrderIdOrderByCreatedAtDesc(orderId)).thenReturn(Optional.of(activePayment));
        when(orderRepository.save(any(OrderEntity.class))).thenAnswer(org.mockito.AdditionalAnswers.returnsFirstArg());

        OrderEntity cancelledOrder = orderService.cancelOrder(orderId, mockUser.getId());

        assertNotNull(cancelledOrder);
        assertEquals(OrderStatus.CANCELLED, cancelledOrder.getStatus());
        assertEquals(10, mockProduct.getStock());
        assertEquals(PaymentStatus.CANCEL, activePayment.getStatus());

        verify(productRepository, times(1)).save(mockProduct);
        verify(paymentRepository, times(1)).save(activePayment);
        verify(orderRepository, times(1)).save(order);
    }

    @Test
    @DisplayName("cancelOrder: Admin dapat membatalkan pesanan tanpa IDOR check (userId = null)")
    void cancelOrder_Admin_Success() {
        UUID orderId = UUID.randomUUID();
        OrderEntity order = new OrderEntity();
        order.setId(orderId);
        order.setUser(mockUser);
        order.setStatus(OrderStatus.PENDING);
        order.setItems(new ArrayList<>());

        when(orderRepository.findById(orderId)).thenReturn(Optional.of(order));
        when(paymentRepository.findFirstByOrderIdOrderByCreatedAtDesc(orderId)).thenReturn(Optional.empty());
        when(orderRepository.save(any(OrderEntity.class))).thenAnswer(org.mockito.AdditionalAnswers.returnsFirstArg());

        OrderEntity cancelledOrder = orderService.cancelOrder(orderId, null);

        assertNotNull(cancelledOrder);
        assertEquals(OrderStatus.CANCELLED, cancelledOrder.getStatus());
        verify(orderRepository, times(1)).save(order);
    }

    @Test
    @DisplayName("cancelOrder: User lain mencoba membatalkan pesanan (IDOR) -> Throws AccessDeniedException")
    void cancelOrder_NotOwner_ThrowsAccessDeniedException() {
        UUID orderId = UUID.randomUUID();
        OrderEntity order = new OrderEntity();
        order.setId(orderId);
        order.setUser(mockUser);
        order.setStatus(OrderStatus.PENDING);

        UUID attackerId = UUID.randomUUID();
        when(orderRepository.findById(orderId)).thenReturn(Optional.of(order));

        assertThrows(AccessDeniedException.class, () -> orderService.cancelOrder(orderId, attackerId));
        verify(orderRepository, never()).save(any());
        verify(productRepository, never()).save(any());
    }

    @Test
    @DisplayName("cancelOrder: Pesanan bukan PENDING (misal: PAID) -> Throws IllegalStateException")
    void cancelOrder_NotPending_ThrowsIllegalStateException() {
        UUID orderId = UUID.randomUUID();
        OrderEntity order = new OrderEntity();
        order.setId(orderId);
        order.setUser(mockUser);
        order.setStatus(OrderStatus.PAID);

        when(orderRepository.findById(orderId)).thenReturn(Optional.of(order));

        IllegalStateException ex = assertThrows(IllegalStateException.class,
                () -> orderService.cancelOrder(orderId, mockUser.getId()));
        assertTrue(ex.getMessage().contains("Hanya pesanan dengan status PENDING"));
        verify(orderRepository, never()).save(any());
    }

    // ===========================
    // ORDER-PAYMENT-FIX-001: updatePaymentMethod Tests
    // ===========================
    @Test
    @DisplayName("updatePaymentMethod: Berhasil mengubah metode pembayaran dan menganulir pending payment sebelumnya")
    void updatePaymentMethod_Success() {
        UUID orderId = UUID.randomUUID();
        OrderEntity order = new OrderEntity();
        order.setId(orderId);
        order.setUser(mockUser);
        order.setStatus(OrderStatus.PENDING);
        order.setPaymentMethod("QRIS");

        PaymentEntity oldPayment = PaymentEntity.builder()
                .id(UUID.randomUUID())
                .order(order)
                .status(PaymentStatus.PENDING)
                .build();

        when(orderRepository.findById(orderId)).thenReturn(Optional.of(order));
        when(paymentRepository.findFirstByOrderIdOrderByCreatedAtDesc(orderId)).thenReturn(Optional.of(oldPayment));
        when(orderRepository.save(any(OrderEntity.class))).thenAnswer(org.mockito.AdditionalAnswers.returnsFirstArg());

        OrderEntity updated = orderService.updatePaymentMethod(orderId, mockUser.getId(), "VA");

        assertNotNull(updated);
        assertEquals("VA", updated.getPaymentMethod());
        assertEquals(PaymentStatus.CANCEL, oldPayment.getStatus());
        verify(paymentRepository, times(1)).save(oldPayment);
        verify(orderRepository, times(1)).save(order);
    }

    @Test
    @DisplayName("updatePaymentMethod: User lain mencoba mengubah metode (IDOR) -> Throws AccessDeniedException")
    void updatePaymentMethod_NotOwner_ThrowsAccessDeniedException() {
        UUID orderId = UUID.randomUUID();
        OrderEntity order = new OrderEntity();
        order.setId(orderId);
        order.setUser(mockUser);
        order.setStatus(OrderStatus.PENDING);

        UUID intruderId = UUID.randomUUID();
        when(orderRepository.findById(orderId)).thenReturn(Optional.of(order));

        assertThrows(AccessDeniedException.class,
                () -> orderService.updatePaymentMethod(orderId, intruderId, "VA"));
        verify(orderRepository, never()).save(any());
    }

    @Test
    @DisplayName("updatePaymentMethod: Pesanan sudah dibayar (PAID) -> Throws IllegalStateException")
    void updatePaymentMethod_NonPending_ThrowsIllegalStateException() {
        UUID orderId = UUID.randomUUID();
        OrderEntity order = new OrderEntity();
        order.setId(orderId);
        order.setUser(mockUser);
        order.setStatus(OrderStatus.PAID);

        when(orderRepository.findById(orderId)).thenReturn(Optional.of(order));

        assertThrows(IllegalStateException.class,
                () -> orderService.updatePaymentMethod(orderId, mockUser.getId(), "VA"));
        verify(orderRepository, never()).save(any());
    }

    @Test
    @DisplayName("updatePaymentMethod: Nilai kosong/blank -> Throws IllegalArgumentException")
    void updatePaymentMethod_Blank_ThrowsIllegalArgumentException() {
        UUID orderId = UUID.randomUUID();
        assertThrows(IllegalArgumentException.class,
                () -> orderService.updatePaymentMethod(orderId, mockUser.getId(), "   "));
    }

    // ===========================
    // ORDER-CANCEL-DASHBOARD-001: Tests
    // ===========================
    @Test
    @DisplayName("cancelOrder: Order PENDING tapi pembayaran sudah SETTLEMENT -> Throws IllegalStateException")
    void cancelOrder_PaymentAlreadySettled_ThrowsIllegalStateException() {
        UUID orderId = UUID.randomUUID();
        OrderEntity order = new OrderEntity();
        order.setId(orderId);
        order.setUser(mockUser);
        order.setStatus(OrderStatus.PENDING);

        PaymentEntity settledPayment = PaymentEntity.builder()
                .id(UUID.randomUUID())
                .order(order)
                .status(PaymentStatus.SETTLEMENT)
                .build();

        when(orderRepository.findById(orderId)).thenReturn(Optional.of(order));
        when(paymentRepository.findFirstByOrderIdOrderByCreatedAtDesc(orderId)).thenReturn(Optional.of(settledPayment));

        IllegalStateException ex = assertThrows(IllegalStateException.class,
                () -> orderService.cancelOrder(orderId, mockUser.getId()));

        assertTrue(ex.getMessage().contains("sudah dibayar tidak dapat dibatalkan"));
        verify(orderRepository, never()).save(any());
        verify(productRepository, never()).save(any());
    }

    @Test
    @DisplayName("getDashboardStats: Customer dashboard mengecualikan CANCELLED dari totalOrders dan hanya menghitung order lunas ke totalAmount")
    void getDashboardStats_Customer_ExcludesCancelledAndUnpaid() {
        UUID customerId = mockUser.getId();

        when(orderRepository.countByUserIdAndStatusNot(customerId, OrderStatus.CANCELLED)).thenReturn(2L);
        when(orderRepository.sumTotalAmountByUserIdAndStatusIn(eq(customerId), anyCollection())).thenReturn(new BigDecimal("175000.00"));
        when(orderRepository.countByUserIdAndStatusIn(eq(customerId), anyCollection())).thenReturn(1L);

        DashboardStatsResponse stats = orderService.getDashboardStats(customerId, false);

        assertNotNull(stats);
        assertEquals(2L, stats.getTotalOrders());
        assertEquals(new BigDecimal("175000.00"), stats.getTotalAmount());
        assertEquals(1L, stats.getPendingOrders());

        verify(orderRepository, times(1)).countByUserIdAndStatusNot(customerId, OrderStatus.CANCELLED);
        verify(orderRepository, times(1)).sumTotalAmountByUserIdAndStatusIn(eq(customerId), anyCollection());
        verify(orderRepository, times(1)).countByUserIdAndStatusIn(eq(customerId), anyCollection());
    }

    @Test
    @DisplayName("getDashboardStats: Admin dashboard mengecualikan CANCELLED dari totalOrders dan pendapatan hanya dari status lunas")
    void getDashboardStats_Admin_ExcludesCancelledAndUnpaid() {
        when(orderRepository.countByStatusNot(OrderStatus.CANCELLED)).thenReturn(5L);
        when(orderRepository.sumTotalAmountByStatusIn(anyCollection())).thenReturn(new BigDecimal("175000.00"));
        when(orderRepository.countByStatus(OrderStatus.PENDING)).thenReturn(2L);

        DashboardStatsResponse stats = orderService.getDashboardStats(null, true);

        assertNotNull(stats);
        assertEquals(5L, stats.getTotalOrders());
        assertEquals(new BigDecimal("175000.00"), stats.getTotalAmount());
        assertEquals(2L, stats.getPendingOrders());

        verify(orderRepository, times(1)).countByStatusNot(OrderStatus.CANCELLED);
        verify(orderRepository, times(1)).sumTotalAmountByStatusIn(anyCollection());
        verify(orderRepository, times(1)).countByStatus(OrderStatus.PENDING);
    }

    @Test
    @DisplayName("cancelOrder: Order dengan status PAID tidak dapat dibatalkan -> Throws IllegalStateException")
    void cancelOrder_OrderStatusPaid_ThrowsIllegalStateException() {
        UUID orderId = UUID.randomUUID();
        OrderEntity order = new OrderEntity();
        order.setId(orderId);
        order.setUser(mockUser);
        order.setStatus(OrderStatus.PAID);

        when(orderRepository.findById(orderId)).thenReturn(Optional.of(order));

        IllegalStateException ex = assertThrows(IllegalStateException.class,
                () -> orderService.cancelOrder(orderId, mockUser.getId()));

        assertTrue(ex.getMessage().contains("Pesanan yang sudah dibayar tidak dapat dibatalkan"));
        verify(orderRepository, never()).save(any());
        verify(productRepository, never()).save(any());
    }

    @Test
    @DisplayName("updateOrderStatus: Order PAID diubah menjadi CANCELLED -> Throws IllegalStateException")
    void updateOrderStatus_PaidToCancelled_ThrowsIllegalStateException() {
        UUID orderId = UUID.randomUUID();
        OrderEntity order = new OrderEntity();
        order.setId(orderId);
        order.setStatus(OrderStatus.PAID);

        when(orderRepository.findById(orderId)).thenReturn(Optional.of(order));

        IllegalStateException ex = assertThrows(IllegalStateException.class,
                () -> orderService.updateOrderStatus(orderId, OrderStatus.CANCELLED));

        assertTrue(ex.getMessage().contains("Pesanan yang sudah dibayar tidak dapat dibatalkan"));
        verify(orderRepository, never()).save(any());
        verify(productRepository, never()).save(any());
    }
}
