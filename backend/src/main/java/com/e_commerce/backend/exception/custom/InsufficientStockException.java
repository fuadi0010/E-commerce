package com.e_commerce.backend.exception.custom;

/**
 * Exception yang dilempar ketika stok produk tidak mencukupi untuk memenuhi pesanan.
 * Rule 8: InsufficientStockException → HTTP 409 Conflict
 */
public class InsufficientStockException extends RuntimeException {

    public InsufficientStockException(String message) {
        super(message);
    }

    public InsufficientStockException(String productName, int requested, int available) {
        super(String.format(
            "Stok produk '%s' tidak mencukupi. Diminta: %d, Tersedia: %d",
            productName, requested, available
        ));
    }
}
