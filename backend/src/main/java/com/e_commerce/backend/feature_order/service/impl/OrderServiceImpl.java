package com.e_commerce.backend.feature_order.service.impl;

import com.e_commerce.backend.feature_order.dto.request.OrderRequest;
import com.e_commerce.backend.feature_order.model.OrderEntity;
import com.e_commerce.backend.feature_order.model.OrderItemEntity;
import com.e_commerce.backend.feature_order.model.OrderStatus;
import com.e_commerce.backend.feature_order.repository.OrderItemRepository;
import com.e_commerce.backend.feature_order.repository.OrderRepository;
import com.e_commerce.backend.feature_order.service.OrderService;
import com.e_commerce.backend.feature_product.model.ProductEntity;
import com.e_commerce.backend.feature_product.repository.ProductRepository;
import com.e_commerce.backend.feature_user.Model.UserEntity;
import com.e_commerce.backend.feature_user.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class OrderServiceImpl implements OrderService {

    private final OrderRepository orderRepository;
    private final OrderItemRepository orderItemRepository;
    private final ProductRepository productRepository;
    private final UserRepository userRepository;

    @Override
    @Transactional
    public OrderEntity createOrder(UUID userId, OrderRequest request) {
        UserEntity user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User tidak ditemukan"));

        if (request.getItems() == null || request.getItems().isEmpty()) {
            throw new IllegalArgumentException("Pesanan tidak boleh kosong");
        }

        // 1. Buat Order (Draft)
        OrderEntity order = new OrderEntity();
        order.setUser(user);
        order.setStatus(OrderStatus.PENDING);
        order.setTotalAmount(BigDecimal.ZERO);
        OrderEntity savedOrder = orderRepository.save(order);

        BigDecimal totalAmount = BigDecimal.ZERO;

        // 2. Proses tiap item
        for (OrderRequest.OrderItemRequest itemReq : request.getItems()) {
            ProductEntity product = productRepository.findByIdWithPessimisticLock(itemReq.getProductId())
                    .orElseThrow(() -> new RuntimeException("Produk tidak ditemukan atau tidak aktif: " + itemReq.getProductId()));

            if (product.getStock() < itemReq.getQuantity()) {
                throw new IllegalArgumentException("Stok tidak mencukupi untuk produk: " + product.getName());
            }

            // Kurangi stok
            product.setStock(product.getStock() - itemReq.getQuantity());
            productRepository.save(product);

            // Buat OrderItem
            OrderItemEntity orderItem = new OrderItemEntity();
            orderItem.setOrder(savedOrder);
            orderItem.setProduct(product);
            orderItem.setQuantity(itemReq.getQuantity());
            orderItem.setPriceAtTime(product.getPrice()); // Freeze harga

            orderItemRepository.save(orderItem);

            // Akumulasi total
            BigDecimal itemTotal = product.getPrice().multiply(BigDecimal.valueOf(itemReq.getQuantity()));
            totalAmount = totalAmount.add(itemTotal);
            
            savedOrder.getItems().add(orderItem);
        }

        // 3. Update total order
        savedOrder.setTotalAmount(totalAmount);
        return orderRepository.save(savedOrder);
    }

    @Override
    @Transactional
    public OrderEntity updateOrderStatus(UUID orderId, OrderStatus newStatus) {
        OrderEntity order = getOrderById(orderId);
        order.setStatus(newStatus);
        return orderRepository.save(order);
    }

    @Override
    public OrderEntity getOrderById(UUID orderId) {
        return orderRepository.findById(orderId)
                .orElseThrow(() -> new RuntimeException("Order tidak ditemukan"));
    }

    @Override
    public org.springframework.data.domain.Page<OrderEntity> getOrdersByUser(UUID userId, org.springframework.data.domain.Pageable pageable) {
        return orderRepository.findByUserId(userId, pageable);
    }
}
