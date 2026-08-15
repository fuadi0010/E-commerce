package com.e_commerce.backend.feature_order.service.impl;

import com.e_commerce.backend.feature_order.dto.request.OrderRequest;
import com.e_commerce.backend.feature_order.model.OrderEntity;
import com.e_commerce.backend.feature_order.model.OrderStatus;
import com.e_commerce.backend.feature_order.repository.OrderItemRepository;
import com.e_commerce.backend.feature_order.repository.OrderRepository;
import com.e_commerce.backend.feature_product.model.ProductEntity;
import com.e_commerce.backend.feature_product.repository.ProductRepository;
import com.e_commerce.backend.feature_user.Model.UserEntity;
import com.e_commerce.backend.feature_user.repository.UserRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class OrderServiceImplTest {

    @Mock
    private OrderRepository orderRepository;

    @Mock
    private OrderItemRepository orderItemRepository;

    @Mock
    private ProductRepository productRepository;

    @Mock
    private UserRepository userRepository;

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
        mockProduct.setName("Laptop Gaming");
        mockProduct.setPrice(new BigDecimal("15000000.00"));
        mockProduct.setStock(10);
    }

    @Test
    void createOrder_Success() {
        // Arrange
        OrderRequest.OrderItemRequest itemReq = new OrderRequest.OrderItemRequest(productId, 2);
        OrderRequest request = new OrderRequest(List.of(itemReq));

        when(userRepository.findById(userId)).thenReturn(Optional.of(mockUser));
        when(productRepository.findByIdAndDeletedAtIsNull(productId)).thenReturn(Optional.of(mockProduct));
        
        when(orderRepository.save(any(OrderEntity.class))).thenAnswer(org.mockito.AdditionalAnswers.returnsFirstArg());

        // Act
        OrderEntity result = orderService.createOrder(userId, request);

        // Assert
        assertNotNull(result);
        assertEquals(OrderStatus.PENDING, result.getStatus());
        assertEquals(new BigDecimal("30000000.00"), result.getTotalAmount()); // 15jt x 2

        // Verify stok berkurang
        assertEquals(8, mockProduct.getStock());
        
        // Verify method calls
        verify(userRepository, times(1)).findById(userId);
        verify(productRepository, times(1)).findByIdAndDeletedAtIsNull(productId);
        verify(productRepository, times(1)).save(mockProduct);
        verify(orderItemRepository, times(1)).save(any());
        verify(orderRepository, times(2)).save(any(OrderEntity.class)); // 1 untuk draft, 1 untuk update total
    }

    @Test
    void createOrder_UserNotFound_ThrowsException() {
        // Arrange
        OrderRequest request = new OrderRequest(List.of(new OrderRequest.OrderItemRequest(productId, 1)));
        when(userRepository.findById(userId)).thenReturn(Optional.empty());

        // Act & Assert
        RuntimeException exception = assertThrows(RuntimeException.class, () -> 
            orderService.createOrder(userId, request)
        );
        assertEquals("User tidak ditemukan", exception.getMessage());
        
        verify(orderRepository, never()).save(any());
    }

    @Test
    void createOrder_EmptyItems_ThrowsIllegalArgumentException() {
        // Arrange
        OrderRequest request = new OrderRequest(new ArrayList<>()); // Empty list
        when(userRepository.findById(userId)).thenReturn(Optional.of(mockUser));

        // Act & Assert
        IllegalArgumentException exception = assertThrows(IllegalArgumentException.class, () -> 
            orderService.createOrder(userId, request)
        );
        assertEquals("Pesanan tidak boleh kosong", exception.getMessage());
    }

    @Test
    void createOrder_ProductNotFound_ThrowsException() {
        // Arrange
        OrderRequest.OrderItemRequest itemReq = new OrderRequest.OrderItemRequest(productId, 1);
        OrderRequest request = new OrderRequest(List.of(itemReq));

        when(userRepository.findById(userId)).thenReturn(Optional.of(mockUser));
        OrderEntity savedDraftOrder = new OrderEntity();
        when(orderRepository.save(any(OrderEntity.class))).thenReturn(savedDraftOrder);
        when(productRepository.findByIdAndDeletedAtIsNull(productId)).thenReturn(Optional.empty());

        // Act & Assert
        RuntimeException exception = assertThrows(RuntimeException.class, () -> 
            orderService.createOrder(userId, request)
        );
        assertTrue(exception.getMessage().contains("Produk tidak ditemukan atau tidak aktif"));
    }

    @Test
    void createOrder_InsufficientStock_ThrowsIllegalArgumentException() {
        // Arrange
        OrderRequest.OrderItemRequest itemReq = new OrderRequest.OrderItemRequest(productId, 20); // Minta 20, stok cuma 10
        OrderRequest request = new OrderRequest(List.of(itemReq));

        when(userRepository.findById(userId)).thenReturn(Optional.of(mockUser));
        OrderEntity savedDraftOrder = new OrderEntity();
        when(orderRepository.save(any(OrderEntity.class))).thenReturn(savedDraftOrder);
        when(productRepository.findByIdAndDeletedAtIsNull(productId)).thenReturn(Optional.of(mockProduct));

        // Act & Assert
        IllegalArgumentException exception = assertThrows(IllegalArgumentException.class, () -> 
            orderService.createOrder(userId, request)
        );
        assertTrue(exception.getMessage().contains("Stok tidak mencukupi"));
        
        // Memastikan tidak ada transaksi penyimpanan order item atau pengubahan produk yang terjadi
        verify(productRepository, never()).save(any(ProductEntity.class));
        verify(orderItemRepository, never()).save(any());
    }
}
