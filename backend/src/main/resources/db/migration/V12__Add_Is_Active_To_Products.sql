-- V12__Add_Is_Active_To_Products.sql
-- Menambahkan kolom is_active untuk manajemen visibilitas produk (Soft Hide/Show)
ALTER TABLE products ADD COLUMN IF NOT EXISTS is_active BOOLEAN NOT NULL DEFAULT TRUE;

-- Buat indeks untuk mempercepat query filter katalog aktif
CREATE INDEX IF NOT EXISTS idx_products_is_active ON products(is_active);
