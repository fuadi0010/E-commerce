-- V14__Add_Payment_Method_And_Proof_To_Orders.sql
-- Menambahkan kolom payment_method dan payment_proof_url ke tabel orders (FINDING-002 & FINDING-003)

ALTER TABLE orders
    ADD COLUMN payment_method VARCHAR(50),
    ADD COLUMN payment_proof_url VARCHAR(500);

COMMENT ON COLUMN orders.payment_method IS 'Metode pembayaran yang dipilih (e.g. QRIS, VA, MIDTRANS)';
COMMENT ON COLUMN orders.payment_proof_url IS 'URL dokumen bukti pembayaran / PO / transfer (PDF/Gambar)';
