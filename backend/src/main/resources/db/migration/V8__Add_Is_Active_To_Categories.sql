-- ==========================================
-- V8: Add is_active column to categories table
-- Mendukung mekanisme Hide Kategori tanpa physical delete
-- ==========================================
ALTER TABLE categories ADD COLUMN is_active BOOLEAN NOT NULL DEFAULT TRUE;
