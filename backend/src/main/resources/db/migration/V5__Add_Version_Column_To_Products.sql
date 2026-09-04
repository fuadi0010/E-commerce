-- V5__Add_Version_Column_To_Products.sql
-- Menambahkan kolom version untuk Optimistic Locking pada tabel products.
-- Rule 24: @Version untuk mencegah TOCTOU race condition pada stok.
ALTER TABLE products ADD COLUMN IF NOT EXISTS version BIGINT NOT NULL DEFAULT 0;
