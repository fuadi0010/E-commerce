-- V9__Create_Reviews_Table.sql
-- Implementasi Entitas Utama ke-5: Reviews & Rating Produk
-- Memenuhi ketentuan minimal 6 entitas utama, relasi N:1, soft delete, dan >=20 seed data.

CREATE TABLE reviews (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    product_id UUID NOT NULL,
    user_id UUID NOT NULL,
    rating INT NOT NULL CHECK (rating >= 1 AND rating <= 5),
    comment TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL,
    deleted_at TIMESTAMP WITH TIME ZONE,
    CONSTRAINT fk_reviews_product FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE,
    CONSTRAINT fk_reviews_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE INDEX idx_reviews_product ON reviews(product_id);
CREATE INDEX idx_reviews_user ON reviews(user_id);

-- ==========================================
-- SEED DATA: 22 Baris Ulasan Produk Nyata & Beragam
-- Menggunakan ID user pelanggan dan produk aktif dari V6__Seed_Data.sql
-- ==========================================
INSERT INTO reviews (id, product_id, user_id, rating, comment, created_at, updated_at) VALUES
('b1010001-0000-0000-0000-000000000001', '66557e36-0c2a-4feb-8570-9168432129c4', 'e20e30fb-aafa-4f78-bf79-770a4ff45c4a', 5, 'Kualitas noise cancelling luar biasa! Suara sangat jernih dan bass empuk. Sangat nyaman dipakai berjam-jam saat WFH.', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('b1010001-0000-0000-0000-000000000002', '66557e36-0c2a-4feb-8570-9168432129c4', 'aadfed81-33e6-4107-9f1e-d2c47456883b', 4, 'Bagus sekali, mikrofon untuk meeting jernih. Sedikit hangat di telinga setelah 3 jam pemakaian tapi build quality jempolan.', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('b1010001-0000-0000-0000-000000000003', 'e3b74ac5-792e-4679-a07f-9e583a5a6387', '40ea009a-9e64-4d14-8b53-a0ff22d16b74', 5, 'Mouse terbaik untuk produktivitas! MagSpeed scroll-nya bikin navigasi spreadsheet ratusan baris jadi sangat cepat.', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('b1010001-0000-0000-0000-000000000004', 'e3b74ac5-792e-4679-a07f-9e583a5a6387', '520012f3-6b98-43e7-a35c-a1fe6d2616be', 5, 'Sangat ergonomis, pegal di pergelangan tangan hilang sejak ganti ke MX Master 3S. Kliknya juga benar-benar senyap.', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('b1010001-0000-0000-0000-000000000005', '51823562-11e6-477b-9529-271d2a5bea19', 'ab0e34f8-5600-4ef4-b0de-2cb4fcb0aac3', 5, 'Mechanical keyboard paling solid. Suara switch brown-nya pas untuk kantor, tidak berisik tapi tactile feedback-nya mantap.', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('b1010001-0000-0000-0000-000000000006', '51823562-11e6-477b-9529-271d2a5bea19', '5c662f58-f4d7-4fbb-89b3-5e57baee5877', 4, 'Koneksi bluetooth ke Mac dan Windows lancar beralih seketika. Keycaps PBT tebal dan font rapi.', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('b1010001-0000-0000-0000-000000000007', '00aa9631-6a47-4180-ae2c-6e14de615a02', '3a8bc45a-9bac-4669-9a19-3b8ef0529b8d', 5, 'MacBook Air M2 Midnight warnanya premium sekali. Baterai tahan seharian penuh tanpa perlu colok charger.', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('b1010001-0000-0000-0000-000000000008', '00aa9631-6a47-4180-ae2c-6e14de615a02', '0dd4a578-f8b2-46ea-b4f8-c102da5ed8e6', 5, 'Ringan, dingin, performa chip M2 kencang untuk coding dan multitasking. Layar Liquid Retina sangat tajam.', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('b1010001-0000-0000-0000-000000000009', '8b4883bc-a887-40c6-8ebd-68fa128b9620', 'dc418ba7-c420-45cb-8e2c-b8fde2f48468', 5, 'Kamera 200MP detailnya gila, zoom 10x masih sangat jernih. Fitur AI sangat membantu pekerjaan sehari-hari.', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('b1010001-0000-0000-0000-000000000010', '8b4883bc-a887-40c6-8ebd-68fa128b9620', '90cab111-4f11-46b8-86eb-6707f55ceefa', 4, 'Bodi titanium terasa kokoh dan tidak licin. Baterai awet seharian penuh pemakaian intensif.', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('b1010001-0000-0000-0000-000000000011', '9c126521-a182-4553-b0fd-db4516b624bc', 'cfe3f9d3-f40e-4f29-ae58-b2ac212c4bbf', 5, 'Powerbank terbaik! Bisa ngecas laptop MacBook Pro 14 inch dengan output 100W tanpa drop. Layar LCD-nya informatif.', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('b1010001-0000-0000-0000-000000000012', '1c3cbb93-9fdc-4aaf-b454-d8e8113eb5a9', '6a68b71d-0d9f-448c-bae7-16178aa3ccc1', 5, 'Simulasi film klasik Fujifilm membuat foto langsung siap posting tanpa edit rumit. Autofokus cepat dan akurat.', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('b1010001-0000-0000-0000-000000000013', '1c3cbb93-9fdc-4aaf-b454-d8e8113eb5a9', '781b4211-feac-4be2-9952-efb972ca30f3', 4, 'Desain kamera retro vintage menawan. Cocok sekali untuk street photography dan traveling ringan.', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('b1010001-0000-0000-0000-000000000014', '413766bd-b3f5-417c-8d72-bdcb652681b7', '4149452b-1348-41f4-ab79-3d25461ecd38', 5, 'Bahan linen katun adem sekali untuk iklim tropis. Kerah tegak membuat tampilan kasual tapi tetap rapi.', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('b1010001-0000-0000-0000-000000000015', '413766bd-b3f5-417c-8d72-bdcb652681b7', 'cc32ecec-ad90-41e1-8483-d436f5bf32aa', 5, 'Jahitan sangat rapi, ukuran L pas di badan. Sudah dicuci berkali-kali warna putih tetap cerah.', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('b1010001-0000-0000-0000-000000000016', 'bab3d62d-f532-4992-b830-cd1fd1a1819d', '97c4aa75-2dec-4a11-a63f-4bf1e433d79c', 5, 'Model oversized-nya jatuh cantik di badan. Warna olive green-nya earthy dan natural banget!', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('b1010001-0000-0000-0000-000000000017', 'bab3d62d-f532-4992-b830-cd1fd1a1819d', '4b787c44-27e3-48d7-bc05-d604601fef3f', 4, 'Bahannya halus dan tidak menerawang. Sangat nyaman dipakai ke kampus maupun hangout santai.', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('b1010001-0000-0000-0000-000000000018', '186facc7-0abf-40c6-8911-392453ea7f08', '94e2ab55-e844-4ba8-b2e6-057156e37b0d', 5, 'Original dan warna Wolf Grey-nya netral dipadukan dengan celana apapun. Bantalan Air-Sole empuk.', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('b1010001-0000-0000-0000-000000000019', '186facc7-0abf-40c6-8911-392453ea7f08', 'e20e30fb-aafa-4f78-bf79-770a4ff45c4a', 5, 'Sneakers wajib punya! Kulitnya lembut dan fleksibel, tidak bikin tumit lecet sejak pemakaian pertama.', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('b1010001-0000-0000-0000-000000000020', 'da04645f-2c06-4c73-9d51-b8bfc3a235de', 'aadfed81-33e6-4107-9f1e-d2c47456883b', 5, 'New Balance 574 klasik tak pernah salah. Sol ENCAP empuk dan nyaman banget dipakai jalan 15.000 langkah seharian.', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('b1010001-0000-0000-0000-000000000021', 'da04645f-2c06-4c73-9d51-b8bfc3a235de', '40ea009a-9e64-4d14-8b53-a0ff22d16b74', 4, 'Warna abu-abunya ikonik. Cengkeraman sol karet bagus di medan licin. Recommended untuk daily shoes.', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('b1010001-0000-0000-0000-000000000022', '9c126521-a182-4553-b0fd-db4516b624bc', '520012f3-6b98-43e7-a35c-a1fe6d2616be', 5, 'Pengisian daya super cepat. Pasangan sempurna untuk traveling jarak jauh tanpa khawatir kehabisan baterai gawai.', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);
