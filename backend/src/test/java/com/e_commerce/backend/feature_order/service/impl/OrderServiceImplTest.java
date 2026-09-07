package com.e_commerce.backend.feature_order.service.impl;

import com.e_commerce.backend.exception.custom.InsufficientStockException;
import com.e_commerce.backend.exception.custom.ResourceNotFoundException;
import com.e_commerce.backend.feature_order.dto.request.OrderRequest;
import com.e_commerce.backend.feature_order.model.OrderEntity;
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
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
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

        verify(orderRepository, never()).save(any());
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
}
