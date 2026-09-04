# 🛒 Flowchart: Checkout & Concurrency Control Flow

Dokumentasi alur checkout pesanan dengan **Pessimistic Locking**, validasi stok, dan atomic transaction sesuai Rule 24, 25, dan 83.

## 1. Flowchart Checkout Transaksi
```mermaid
sequenceDiagram
    autonumber
    actor Customer as Customer (Angular)
    participant API as OrderController (/api/orders/checkout)
    participant Service as OrderServiceImpl (@Transactional)
    participant Repo as ProductRepository
    participant DB as PostgreSQL Database

    Customer->>API: POST /api/orders/checkout (items: [{productId, quantity}])
    API->>API: Validasi Input (@Valid, items tidak kosong)
    API->>Service: createOrder(userId, request)
    
    rect rgb(240, 248, 255)
        note over Service, DB: Transaksi Database Dimulai (@Transactional)
        Service->>DB: Buat Draft Order (Status: PENDING)
        
        loop Setiap Item Pesanan
            Service->>Repo: findByIdWithPessimisticLock(productId)
            Repo->>DB: SELECT * FROM products WHERE id = ? FOR UPDATE
            note over Repo, DB: Row Dikunci Eksklusif (Pessimistic Write Lock)
            
            DB-->>Service: ProductEntity (Data Terkunci)
            
            alt Stok Kurang (product.stock < quantity)
                Service-->>API: InsufficientStockException
                note over Service, DB: Transaksi Rollback Otomatis
                API-->>Customer: 409 Conflict ("Stok produk 'X' tidak mencukupi...")
            else Stok Cukup
                Service->>Service: Kurangi Stok (product.stock - quantity)
                Service->>DB: UPDATE products SET stock = ? WHERE id = ?
                Service->>DB: INSERT INTO order_items (price_at_time = product.price)
                Service->>Service: Akumulasi Total Amount
            end
        end
        
        Service->>DB: UPDATE orders SET total_amount = ? WHERE id = ?
        note over Service, DB: Transaksi Berhasil Commit (Lock Dilepas)
    end
    
    Service-->>API: OrderEntity (Tersimpan Lengkap)
    API-->>Customer: 201 Created (ApiResponse<OrderResponse>)
```

## 2. Poin Kunci Keamanan & Integritas:
1. **Pessimistic Locking (`SELECT FOR UPDATE`)**: Mencegah race condition (TOCTOU) saat multi-user memesan item terakhir secara bersamaan.
2. **Atomic Transaction (`@Transactional`)**: Jika salah satu produk habis di tengah proses multi-item, seluruh order di-rollback otomatis dan stok item sebelumnya tidak berkurang.
3. **Price Freeze (`price_at_time`)**: Harga produk disimpan saat pesanan dibuat agar perubahan harga produk di masa depan tidak mengubah total tagihan pesanan lama.
