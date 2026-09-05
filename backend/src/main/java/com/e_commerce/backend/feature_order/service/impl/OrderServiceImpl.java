package com.e_commerce.backend.feature_order.service.impl;

import com.e_commerce.backend.exception.custom.InsufficientStockException;
import com.e_commerce.backend.exception.custom.ResourceNotFoundException;
import com.e_commerce.backend.feature_order.dto.request.OrderRequest;
import com.e_commerce.backend.feature_order.model.OrderEntity;
import com.e_commerce.backend.feature_order.model.OrderItemEntity;
import com.e_commerce.backend.feature_order.model.OrderStatus;
import com.e_commerce.backend.feature_order.repository.OrderItemRepository;
import com.e_commerce.backend.feature_order.repository.OrderRepository;
import com.e_commerce.backend.feature_order.service.OrderService;
import com.e_commerce.backend.feature_product.model.ProductEntity;
import com.e_commerce.backend.feature_product.repository.ProductRepository;
import com.e_commerce.backend.feature_user.model.UserEntity;
import com.e_commerce.backend.feature_user.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.ZonedDateTime;
import java.util.ArrayList;
import java.util.Collections;
import java.util.Comparator;
import java.util.List;
import java.util.UUID;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

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
                .orElseThrow(() -> new ResourceNotFoundException("User tidak ditemukan"));

        if (request.getItems() == null || request.getItems().isEmpty()) {
            throw new IllegalArgumentException("Pesanan tidak boleh kosong");
        }

        // Rule 24 & Concurrency Fix:
        // Urutkan item berdasarkan productId sebelum memperoleh pessimistic lock untuk mencegah database deadlock.
        // Copy ke ArrayList terlebih dahulu untuk menghindari UnsupportedOperationException jika request.getItems() immutable (e.g. List.of()).
        List<OrderRequest.OrderItemRequest> sortedItems = new ArrayList<>(request.getItems());
        Collections.sort(sortedItems, Comparator.comparing(
                OrderRequest.OrderItemRequest::getProductId,
                Comparator.nullsLast(Comparator.naturalOrder())
        ));

        // Rule 25: Seluruh checkout dalam satu transaction
        // 1. Buat Order (Draft)
        OrderEntity order = new OrderEntity();
        order.setUser(user);
        order.setStatus(OrderStatus.PENDING);
        order.setTotalAmount(BigDecimal.ZERO);
        OrderEntity savedOrder = orderRepository.save(order);

        BigDecimal totalAmount = BigDecimal.ZERO;

        // 2. Proses tiap item dalam urutan productId yang deterministik
        for (OrderRequest.OrderItemRequest itemReq : sortedItems) {
            // Rule 24: Lock sebelum baca stok — mencegah TOCTOU race condition
            ProductEntity product = productRepository.findByIdWithPessimisticLock(itemReq.getProductId())
                    .orElseThrow(() -> new ResourceNotFoundException(
                        "Produk tidak ditemukan atau tidak aktif: " + itemReq.getProductId()));

            // Rule 24: Validasi SETELAH lock
            if (product.getStock() < itemReq.getQuantity()) {
                // Rule 8: InsufficientStockException → 409
                throw new InsufficientStockException(product.getName(), itemReq.getQuantity(), product.getStock());
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
    @Transactional(readOnly = true)
    public OrderEntity getOrderById(UUID orderId) {
        return orderRepository.findById(orderId)
                .orElseThrow(() -> new ResourceNotFoundException("Order dengan ID " + orderId + " tidak ditemukan"));
    }

    @Override
    @Transactional(readOnly = true)
    public Page<OrderEntity> getOrdersByUser(UUID userId, Pageable pageable) {
        return orderRepository.findByUserId(userId, pageable);
    }

    @Override
    @Transactional(readOnly = true)
    public Page<OrderEntity> getOrdersByUserAndStatus(UUID userId, OrderStatus status, Pageable pageable) {
        if (status != null) {
            return orderRepository.findByUserIdAndStatus(userId, status, pageable);
        }
        return orderRepository.findByUserId(userId, pageable);
    }

    @Override
    @Transactional(readOnly = true)
    public Page<OrderEntity> getAllOrdersWithFilters(OrderStatus status, ZonedDateTime startDate,
                                                     ZonedDateTime endDate, Pageable pageable) {
        return orderRepository.findWithFilters(status, startDate, endDate, pageable);
    }
}
