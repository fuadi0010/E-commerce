-- V15__Create_Payments_Table.sql
-- Membuat tabel payments untuk integrasi Midtrans Sandbox Payment Gateway

CREATE TABLE payments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    order_id UUID NOT NULL,
    transaction_id VARCHAR(100),
    snap_token VARCHAR(255),
    redirect_url VARCHAR(500),
    payment_type VARCHAR(50),
    gross_amount DECIMAL(19, 2) NOT NULL,
    currency VARCHAR(10) NOT NULL DEFAULT 'IDR',
    status VARCHAR(50) NOT NULL,
    fraud_status VARCHAR(50),
    payment_details TEXT,
    expiry_time TIMESTAMP WITH TIME ZONE,
    paid_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL,
    CONSTRAINT fk_payments_order FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE RESTRICT
);

-- Indexing untuk query performa tinggi
CREATE INDEX idx_payments_order_id ON payments(order_id);
CREATE INDEX idx_payments_transaction_id ON payments(transaction_id);
CREATE INDEX idx_payments_status ON payments(status);
CREATE INDEX idx_payments_snap_token ON payments(snap_token);

COMMENT ON TABLE payments IS 'Tabel transaksi pembayaran Midtrans Payment Gateway';
COMMENT ON COLUMN payments.transaction_id IS 'ID transaksi dari Midtrans (transaction_id)';
COMMENT ON COLUMN payments.snap_token IS 'Token sesi transaksi dari Midtrans Snap';
COMMENT ON COLUMN payments.redirect_url IS 'URL redirect pembayaran Midtrans';
COMMENT ON COLUMN payments.payment_type IS 'Tipe pembayaran (e.g. qris, bank_transfer, gopay, cstore, credit_card)';
COMMENT ON COLUMN payments.gross_amount IS 'Nominal pembayaran yang ditagihkan ke Midtrans (harus identik dengan total_amount order)';
COMMENT ON COLUMN payments.status IS 'Status pembayaran (PENDING, SETTLEMENT, CAPTURE, DENY, CANCEL, EXPIRE, FAILURE, REFUND)';
COMMENT ON COLUMN payments.fraud_status IS 'Status fraud detection dari Midtrans (ACCEPT, CHALLENGE, DENY)';
COMMENT ON COLUMN payments.payment_details IS 'Payload detail respon JSON dari Midtrans untuk keperluan audit trail';
