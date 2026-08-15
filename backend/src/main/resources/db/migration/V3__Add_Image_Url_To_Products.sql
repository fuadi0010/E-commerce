-- Migrasi untuk menambahkan kolom image_url ke tabel products
ALTER TABLE products ADD COLUMN image_url VARCHAR(255);
