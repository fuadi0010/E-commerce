package com.e_commerce.backend.feature_payment.model;

/**
 * Status pembayaran untuk transaksi Midtrans Gateway.
 * Sesuai dengan spesifikasi Midtrans transaction status.
 */
public enum PaymentStatus {
    /**
     * Menunggu pembayaran dari pelanggan.
     */
    PENDING,

    /**
     * Pembayaran sukses dan dana telah diselesaikan (QRIS, VA, GoPay, dll).
     */
    SETTLEMENT,

    /**
     * Transaksi kartu kredit berhasil di-capture.
     */
    CAPTURE,

    /**
     * Transaksi ditolak oleh bank atau sistem Fraud Detection System (FDS).
     */
    DENY,

    /**
     * Transaksi dibatalkan oleh pengguna atau merchant.
     */
    CANCEL,

    /**
     * Transaksi kedaluwarsa karena batas waktu pembayaran terlewati.
     */
    EXPIRE,

    /**
     * Transaksi mengalami kegagalan teknis.
     */
    FAILURE,

    /**
     * Transaksi dikembalikan dananya kepada pelanggan.
     */
    REFUND;

    /**
     * Menentukan apakah status pembayaran ini menandakan pembayaran telah lunas.
     */
    public boolean isSuccess() {
        return this == SETTLEMENT || this == CAPTURE;
    }

    /**
     * Menentukan apakah status pembayaran telah mencapai kondisi akhir (tidak dapat berubah lagi).
     */
    public boolean isTerminal() {
        return this == SETTLEMENT || this == DENY || this == CANCEL || this == EXPIRE || this == FAILURE || this == REFUND;
    }
}
