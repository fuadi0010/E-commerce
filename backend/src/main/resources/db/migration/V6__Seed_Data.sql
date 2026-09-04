-- V6__Seed_Data.sql
-- Seed data e-commerce realistis (20 data per tabel utama)
-- Dibuat dengan format natural alur operasional admin (bukan data monoton AI).
-- Password semua akun: Admin1234! (BCrypt strength 12)
-- Akun Admin:
--   1. budi.santoso@gmail.com (Budi Santoso - Jakarta Pusat)
--   2. andi.wijaya@yahoo.co.id (Andi Wijaya - Jakarta Selatan)

-- Bersihkan data lama jika ada (idempotent)
DELETE FROM order_items;
DELETE FROM orders;
DELETE FROM user_profiles;
DELETE FROM user_roles;
DELETE FROM products;
DELETE FROM categories;
DELETE FROM users;
DELETE FROM roles;

-- ==========================================
-- 1. ROLES (ROLE_ADMIN, ROLE_CUSTOMER)
-- ==========================================
INSERT INTO roles (id, name, created_at, updated_at) VALUES
('73337262-c412-46ba-ade4-6482b44353b8', 'ROLE_ADMIN', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('b848ef9a-ecb6-4a4d-a941-3437a61f6e45', 'ROLE_CUSTOMER', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

-- ==========================================
-- 2. USERS (20 Users: 2 Admin + 18 Customers)
-- ==========================================
INSERT INTO users (id, email, password_hash, created_at, updated_at) VALUES
('671513bf-2a94-4ef3-aed4-a77537274f02', 'budi.santoso@gmail.com', '$2a$12$385JT1F9Ya.APOEDyNV0eeyVnrC9o4h8wBUT1BZDAPQNBAjrNwmma', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('78b7c574-ef44-460d-948d-e0ab2b082815', 'andi.wijaya@yahoo.co.id', '$2a$12$385JT1F9Ya.APOEDyNV0eeyVnrC9o4h8wBUT1BZDAPQNBAjrNwmma', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('e20e30fb-aafa-4f78-bf79-770a4ff45c4a', 'siti.kusuma@outlook.com', '$2a$12$385JT1F9Ya.APOEDyNV0eeyVnrC9o4h8wBUT1BZDAPQNBAjrNwmma', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('aadfed81-33e6-4107-9f1e-d2c47456883b', 'ayu.setiawan@gmail.com', '$2a$12$385JT1F9Ya.APOEDyNV0eeyVnrC9o4h8wBUT1BZDAPQNBAjrNwmma', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('40ea009a-9e64-4d14-8b53-a0ff22d16b74', 'joko.pratama@gmail.com', '$2a$12$385JT1F9Ya.APOEDyNV0eeyVnrC9o4h8wBUT1BZDAPQNBAjrNwmma', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('520012f3-6b98-43e7-a35c-a1fe6d2616be', 'rina.sari89@gmail.com', '$2a$12$385JT1F9Ya.APOEDyNV0eeyVnrC9o4h8wBUT1BZDAPQNBAjrNwmma', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('ab0e34f8-5600-4ef4-b0de-2cb4fcb0aac3', 'dewi.lestari@yahoo.co.id', '$2a$12$385JT1F9Ya.APOEDyNV0eeyVnrC9o4h8wBUT1BZDAPQNBAjrNwmma', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('5c662f58-f4d7-4fbb-89b3-5e57baee5877', 'eko.nugroho@hotmail.com', '$2a$12$385JT1F9Ya.APOEDyNV0eeyVnrC9o4h8wBUT1BZDAPQNBAjrNwmma', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('3a8bc45a-9bac-4669-9a19-3b8ef0529b8d', 'fitri.saputra@gmail.com', '$2a$12$385JT1F9Ya.APOEDyNV0eeyVnrC9o4h8wBUT1BZDAPQNBAjrNwmma', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('0dd4a578-f8b2-46ea-b4f8-c102da5ed8e6', 'gilang.wahyudi@gmail.com', '$2a$12$385JT1F9Ya.APOEDyNV0eeyVnrC9o4h8wBUT1BZDAPQNBAjrNwmma', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('dc418ba7-c420-45cb-8e2c-b8fde2f48468', 'hendra.gunawan@gmail.com', '$2a$12$385JT1F9Ya.APOEDyNV0eeyVnrC9o4h8wBUT1BZDAPQNBAjrNwmma', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('90cab111-4f11-46b8-86eb-6707f55ceefa', 'indah.h@gmail.com', '$2a$12$385JT1F9Ya.APOEDyNV0eeyVnrC9o4h8wBUT1BZDAPQNBAjrNwmma', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('cfe3f9d3-f40e-4f29-ae58-b2ac212c4bbf', 'cahyo.purnomo@gmail.com', '$2a$12$385JT1F9Ya.APOEDyNV0eeyVnrC9o4h8wBUT1BZDAPQNBAjrNwmma', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('6a68b71d-0d9f-448c-bae7-16178aa3ccc1', 'lestari.wibowo@gmail.com', '$2a$12$385JT1F9Ya.APOEDyNV0eeyVnrC9o4h8wBUT1BZDAPQNBAjrNwmma', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('781b4211-feac-4be2-9952-efb972ca30f3', 'mega.irawan@yahoo.co.id', '$2a$12$385JT1F9Ya.APOEDyNV0eeyVnrC9o4h8wBUT1BZDAPQNBAjrNwmma', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('4149452b-1348-41f4-ab79-3d25461ecd38', 'nisa.susanti@gmail.com', '$2a$12$385JT1F9Ya.APOEDyNV0eeyVnrC9o4h8wBUT1BZDAPQNBAjrNwmma', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('cc32ecec-ad90-41e1-8483-d436f5bf32aa', 'oky.w@gmail.com', '$2a$12$385JT1F9Ya.APOEDyNV0eeyVnrC9o4h8wBUT1BZDAPQNBAjrNwmma', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('97c4aa75-2dec-4a11-a63f-4bf1e433d79c', 'putra.rahmawati@gmail.com', '$2a$12$385JT1F9Ya.APOEDyNV0eeyVnrC9o4h8wBUT1BZDAPQNBAjrNwmma', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('4b787c44-27e3-48d7-bc05-d604601fef3f', 'rizky.kurniawan@outlook.com', '$2a$12$385JT1F9Ya.APOEDyNV0eeyVnrC9o4h8wBUT1BZDAPQNBAjrNwmma', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('94e2ab55-e844-4ba8-b2e6-057156e37b0d', 'surya.sanjaya@gmail.com', '$2a$12$385JT1F9Ya.APOEDyNV0eeyVnrC9o4h8wBUT1BZDAPQNBAjrNwmma', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

-- ==========================================
-- 3. USER_ROLES
-- ==========================================
INSERT INTO user_roles (user_id, role_id) VALUES
('671513bf-2a94-4ef3-aed4-a77537274f02', '73337262-c412-46ba-ade4-6482b44353b8'),
('78b7c574-ef44-460d-948d-e0ab2b082815', '73337262-c412-46ba-ade4-6482b44353b8'),
('e20e30fb-aafa-4f78-bf79-770a4ff45c4a', 'b848ef9a-ecb6-4a4d-a941-3437a61f6e45'),
('aadfed81-33e6-4107-9f1e-d2c47456883b', 'b848ef9a-ecb6-4a4d-a941-3437a61f6e45'),
('40ea009a-9e64-4d14-8b53-a0ff22d16b74', 'b848ef9a-ecb6-4a4d-a941-3437a61f6e45'),
('520012f3-6b98-43e7-a35c-a1fe6d2616be', 'b848ef9a-ecb6-4a4d-a941-3437a61f6e45'),
('ab0e34f8-5600-4ef4-b0de-2cb4fcb0aac3', 'b848ef9a-ecb6-4a4d-a941-3437a61f6e45'),
('5c662f58-f4d7-4fbb-89b3-5e57baee5877', 'b848ef9a-ecb6-4a4d-a941-3437a61f6e45'),
('3a8bc45a-9bac-4669-9a19-3b8ef0529b8d', 'b848ef9a-ecb6-4a4d-a941-3437a61f6e45'),
('0dd4a578-f8b2-46ea-b4f8-c102da5ed8e6', 'b848ef9a-ecb6-4a4d-a941-3437a61f6e45'),
('dc418ba7-c420-45cb-8e2c-b8fde2f48468', 'b848ef9a-ecb6-4a4d-a941-3437a61f6e45'),
('90cab111-4f11-46b8-86eb-6707f55ceefa', 'b848ef9a-ecb6-4a4d-a941-3437a61f6e45'),
('cfe3f9d3-f40e-4f29-ae58-b2ac212c4bbf', 'b848ef9a-ecb6-4a4d-a941-3437a61f6e45'),
('6a68b71d-0d9f-448c-bae7-16178aa3ccc1', 'b848ef9a-ecb6-4a4d-a941-3437a61f6e45'),
('781b4211-feac-4be2-9952-efb972ca30f3', 'b848ef9a-ecb6-4a4d-a941-3437a61f6e45'),
('4149452b-1348-41f4-ab79-3d25461ecd38', 'b848ef9a-ecb6-4a4d-a941-3437a61f6e45'),
('cc32ecec-ad90-41e1-8483-d436f5bf32aa', 'b848ef9a-ecb6-4a4d-a941-3437a61f6e45'),
('97c4aa75-2dec-4a11-a63f-4bf1e433d79c', 'b848ef9a-ecb6-4a4d-a941-3437a61f6e45'),
('4b787c44-27e3-48d7-bc05-d604601fef3f', 'b848ef9a-ecb6-4a4d-a941-3437a61f6e45'),
('94e2ab55-e844-4ba8-b2e6-057156e37b0d', 'b848ef9a-ecb6-4a4d-a941-3437a61f6e45');

-- ==========================================
-- 4. USER_PROFILES (20 Lengkap: Nama, Telepon, Alamat Nyata)
-- ==========================================
INSERT INTO user_profiles (id, user_id, full_name, phone, address, created_at, updated_at) VALUES
('029ba272-233b-48fd-af93-6d7ccd9b1f91', '671513bf-2a94-4ef3-aed4-a77537274f02', 'Budi Santoso', '081234567890', 'Jl. Sudirman No. 45, RT 02/RW 04, Kel. Menteng, Kec. Menteng, Jakarta Pusat 10310', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('c0ea7e77-4bf8-4470-a187-12c2d9776798', '78b7c574-ef44-460d-948d-e0ab2b082815', 'Andi Wijaya', '082198765432', 'Jl. Gatot Subroto Blok C No. 12, RT 05/RW 02, Kel. Tebet Barat, Kec. Tebet, Jakarta Selatan 12860', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('62aa41ca-8a50-4895-9203-8271d6667344', 'e20e30fb-aafa-4f78-bf79-770a4ff45c4a', 'Siti Nurhaliza Kusuma', '085712345678', 'Jl. Braga No. 8, RT 01/RW 03, Kel. Braga, Kec. Sumur Bandung, Kota Bandung 40111', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('1f1d8603-1037-467b-9011-c4cc0368fb8e', 'aadfed81-33e6-4107-9f1e-d2c47456883b', 'Ayu Putri Setiawan', '083187654321', 'Jl. Malioboro No. 15, RT 03/RW 01, Kel. Sosromenduran, Kec. Gedongtengen, Kota Yogyakarta 55271', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('8625432e-2cf2-461f-9571-892641cf20ed', '40ea009a-9e64-4d14-8b53-a0ff22d16b74', 'Joko Susanto Pratama', '089623456789', 'Jl. Ahmad Yani No. 77, RT 04/RW 06, Kel. Gubeng, Kec. Gubeng, Kota Surabaya 60281', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('b7dcc5ff-72da-4566-bedc-9c6e5518635f', '520012f3-6b98-43e7-a35c-a1fe6d2616be', 'Rina Melati Sari', '081356789012', 'Jl. Pemuda No. 32, RT 02/RW 05, Kel. Pandansari, Kec. Semarang Tengah, Kota Semarang 50132', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('7a62ff6f-623f-49b0-b395-358d22567556', 'ab0e34f8-5600-4ef4-b0de-2cb4fcb0aac3', 'Dewi Anggraini Lestari', '082278901234', 'Jl. Gajah Mada No. 88, RT 01/RW 02, Kel. Pemecutan, Kec. Denpasar Barat, Kota Denpasar 80113', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('eec9e7c9-b297-4b7f-8d5f-c056e424f977', '5c662f58-f4d7-4fbb-89b3-5e57baee5877', 'Eko Prasetyo Nugroho', '085690123456', 'Jl. Veteran No. 55, RT 06/RW 02, Kel. Ketawanggede, Kec. Lowokwaru, Kota Malang 65141', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('09b85a83-d5a3-4655-b7f4-b4d71376d18c', '3a8bc45a-9bac-4669-9a19-3b8ef0529b8d', 'Fitri Handayani Saputra', '081901234567', 'Jl. Cendrawasih No. 19, RT 03/RW 04, Kel. Mariso, Kec. Mariso, Kota Makassar 90111', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('3f66c204-cc9c-48b1-8763-49d95d83b643', '0dd4a578-f8b2-46ea-b4f8-c102da5ed8e6', 'Gilang Ramadhan Wahyudi', '082212345678', 'Perumahan Bumi Serpong Damai, Sektor 9A No. 3, BSD City, Tangerang Selatan 15321', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('8e93cb0c-18c6-45a6-979c-e9b583ff2d37', 'dc418ba7-c420-45cb-8e2c-b8fde2f48468', 'Hendra Tri Gunawan', '085534567890', 'Jl. Sam Ratulangi No. 102, RT 02/RW 01, Kel. Wenang Selatan, Kec. Wenang, Kota Manado 95111', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('72470ff8-0f94-443a-a5c9-49aec6a3c6e4', '90cab111-4f11-46b8-86eb-6707f55ceefa', 'Indah Permatasari Hidayat', '083145678901', 'Jl. Diponegoro No. 42, RT 05/RW 03, Kel. Madras Hulu, Kec. Medan Polonia, Kota Medan 20152', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('5d9a5382-69e8-40a9-af0b-c69dbc0eb479', 'cfe3f9d3-f40e-4f29-ae58-b2ac212c4bbf', 'Cahyo Bagus Purnomo', '081256789012', 'Jl. Pahlawan No. 18, RT 04/RW 02, Kel. Dadi Mulya, Kec. Samarinda Ulu, Kota Samarinda 75123', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('8a551a64-bede-4e82-9e57-a20c91027fe1', '6a68b71d-0d9f-448c-bae7-16178aa3ccc1', 'Lestari Dwi Wibowo', '082267890123', 'Jl. Tjilik Riwut KM 2.5 No. 8, Kel. Palangka, Kec. Jekan Raya, Kota Palangka Raya 73112', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('c8313cad-51e9-4ff3-88d9-e5d2d8ed47ae', '781b4211-feac-4be2-9952-efb972ca30f3', 'Mega Puspita Irawan', '085578901234', 'Jl. Riau No. 67, RT 01/RW 04, Kel. Kampung Baru, Kec. Senapelan, Kota Pekanbaru 28153', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('fe491c86-cf4f-46df-a7a9-3918a66a1a01', '4149452b-1348-41f4-ab79-3d25461ecd38', 'Nisa Amalia Susanti', '081289012345', 'Jl. Khatib Sulaiman No. 23, RT 02/RW 06, Kel. Lolong Belanti, Kec. Padang Utara, Kota Padang 25136', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('2ff332fe-d20b-4316-aedc-9718878f0eb6', 'cc32ecec-ad90-41e1-8483-d436f5bf32aa', 'Oky Kurnia Wicaksono', '082290123456', 'Jl. Gajah Mada No. 12, RT 03/RW 01, Kel. Benua Melayu Darat, Kec. Pontianak Selatan, Kota Pontianak 78122', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('40dd85e5-9654-4bae-8919-7cf7db07c11a', '97c4aa75-2dec-4a11-a63f-4bf1e433d79c', 'Raden Putra Rahmawati', '085501234567', 'Jl. Slamet Riyadi No. 250, RT 02/RW 05, Kel. Timuran, Kec. Banjarsari, Kota Surakarta 57131', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('9c767481-5dcd-4ae4-9b59-9fee195dfea2', '4b787c44-27e3-48d7-bc05-d604601fef3f', 'Muhammad Rizky Kurniawan', '081312345678', 'Jl. Pajajaran No. 88, RT 04/RW 07, Kel. Bantarjati, Kec. Bogor Utara, Kota Bogor 16153', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('5741863f-106d-4037-8127-46fef8232f13', '94e2ab55-e844-4ba8-b2e6-057156e37b0d', 'Surya Darma Sanjaya', '082323456789', 'Jl. Boulevard Raya Blok AA No. 5, Summarecon Bekasi, Kota Bekasi 17142', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

-- ==========================================
-- 5. CATEGORIES (20 Kategori Retail Nyata)
-- ==========================================
INSERT INTO categories (id, name, created_at, updated_at) VALUES
('e84d426b-9ccb-4ab3-858b-425e04ae2785', 'Audio & Headphone', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('cf36fc48-ed49-42ca-b0f5-33c6b44d979f', 'Komputer & Laptop', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('8779ebc8-5980-46c0-a2d0-0fdab5a627b1', 'Aksesoris Komputer', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('d5659555-9c1b-410a-b496-335b683f0daf', 'Smartphone & Tablet', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('74635b16-4d41-460f-8ee2-512cd4ac6147', 'Aksesoris Gadget', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('285cb3be-04f7-47ff-a184-525647304370', 'Fotografi & Videografi', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('201a47d6-715d-4f8a-8386-9492c0d57e41', 'Fashion & Busana Pria', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('af058ae9-ecef-47af-9990-8432d048db06', 'Fashion & Busana Wanita', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('6622a104-07f6-4bd9-8351-1bdce73ec791', 'Sepatu & Sneakers', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('75ac0943-ac54-4252-a609-e1d2a7282417', 'Tas & Ransel', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('009891d1-2bd8-4ee5-b9f5-fad48d5571ba', 'Jam Tangan', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('74725d50-6057-4d49-96b1-994cd421dbb1', 'Furnitur & Ruang Kerja', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('4d6a481c-b69f-4e46-874b-496c99833ad4', 'Peralatan Dapur & Masak', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('76c7ad9e-7949-48ac-8ce4-9d2757875b52', 'Elektronik Rumah Tangga', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('8f3178fa-b9a3-4290-acb5-bb8dc7c778a6', 'Perawatan Wajah & Skincare', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('825a2f59-dad1-4ee4-af71-e7c5f5503e73', 'Suplemen & Kesehatan', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('1de1da0a-3d06-42ba-a1c0-c108eb3c93c5', 'Olahraga & Kebugaran', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('df3ba47d-c1ad-4232-ba46-491080c0b18f', 'Perlengkapan Outdoor & Camping', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('34087f50-ddbd-4fe1-b3fa-2ab5e92fbf03', 'Kopi & Barista', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('74fde353-8626-4b35-8449-18e76d5b8c33', 'Buku & Alat Tulis', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

-- ==========================================
-- 6. PRODUCTS (25 Produk Nyata dengan Spesifikasi, Harga Pasar, & Gambar)
-- ==========================================
INSERT INTO products (id, category_id, name, description, price, stock, image_url, version, created_at, updated_at) VALUES
('66557e36-0c2a-4feb-8570-9168432129c4', 'e84d426b-9ccb-4ab3-858b-425e04ae2785', 'Sony WH-1000XM5 Wireless Noise Cancelling Headphones - Silver', 'Headphone nirkabel flagship terkemuka di industri dengan teknologi Auto NC Optimizer, 8 mikrofon pengurang kebisingan, dynamic driver 30mm berpresisi tinggi, dan daya tahan baterai hingga 30 jam dengan pengisian cepat USB-PD.', 4799000, 14, 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=800&q=80', 0, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('e3b74ac5-792e-4679-a07f-9e583a5a6387', '8779ebc8-5980-46c0-a2d0-0fdab5a627b1', 'Logitech MX Master 3S Wireless Performance Mouse', 'Mouse produktivitas ergonomis nirkabel premium dengan sensor optik 8.000 DPI yang dapat melacak pada permukaan kaca, tombol klik senyap Quiet Clicks, dan roda scroll elektromagnetik MagSpeed super cepat.', 1499000, 28, 'https://images.unsplash.com/photo-1615663245857-ac93bb7c39e7?auto=format&fit=crop&w=800&q=80', 0, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('51823562-11e6-477b-9529-271d2a5bea19', '8779ebc8-5980-46c0-a2d0-0fdab5a627b1', 'Keychron K2 Pro QMK/VIA Wireless Mechanical Keyboard - Brown Switch', 'Keyboard mekanikal nirkabel 75% kompak dengan layout ANSI, switch Gateron G Pro Brown tactile, peredam suara busa acoustic ganda, tombol PBT double-shot OSA profile, dan kustomisasi pemetaan QMK/VIA.', 1650000, 19, 'https://images.unsplash.com/photo-1587829741301-dc798b83add3?auto=format&fit=crop&w=800&q=80', 0, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('00aa9631-6a47-4180-ae2c-6e14de615a02', 'cf36fc48-ed49-42ca-b0f5-33c6b44d979f', 'Apple MacBook Air 13 M2 8-Core CPU 8-Core GPU 256GB - Midnight', 'Laptop ultra-ringan bertenaga chip Apple M2 generasi berikutnya, layar Liquid Retina 13.6 inci cerah dengan True Tone, kamera FaceTime HD 1080p, audio spasial empat speaker, dan ketahanan baterai hingga 18 jam.', 16499000, 8, 'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?auto=format&fit=crop&w=800&q=80', 0, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('8b4883bc-a887-40c6-8ebd-68fa128b9620', 'd5659555-9c1b-410a-b496-335b683f0daf', 'Samsung Galaxy S24 Ultra 5G 12GB/256GB Titanium Gray', 'Smartphone flagship dengan rangka titanium premium, layar Dynamic AMOLED 2X 6.8 inci 120Hz adaptif, prosesor Snapdragon 8 Gen 3 for Galaxy, kamera utama 200MP bertenaga Galaxy AI, dan S Pen bawaan terintegrasi.', 19999000, 12, 'https://images.unsplash.com/photo-1610945265064-0e34e5519bbf?auto=format&fit=crop&w=800&q=80', 0, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('9c126521-a182-4553-b0fd-db4516b624bc', '74635b16-4d41-460f-8ee2-512cd4ac6147', 'Anker Prime 20000mAh Power Bank 200W Output (PowerCore)', 'Power bank kapasitas besar 20.000mAh dengan port ganda USB-C berkekuatan total 200W, mampu mengisi daya cepat dua laptop secara simultan, dilengkapi layar cerdas LCD informatif untuk status daya real-time.', 1399000, 35, 'https://images.unsplash.com/photo-1609592424364-c2c31e9c2c62?auto=format&fit=crop&w=800&q=80', 0, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('1c3cbb93-9fdc-4aaf-b454-d8e8113eb5a9', '285cb3be-04f7-47ff-a184-525647304370', 'Fujifilm X-T30 II Mirrorless Digital Camera Body - Silver', 'Kamera mirrorless bergaya retro klasik dengan sensor X-Trans CMOS 4 26.1MP, prosesor X-Processor 4 berkecepatan tinggi, perekaman video DCI 4K/30p, dan 18 simulasi film analog legendaris Fujifilm.', 14299000, 6, 'https://images.unsplash.com/photo-1516035069371-29a1b244cc32?auto=format&fit=crop&w=800&q=80', 0, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('413766bd-b3f5-417c-8d72-bdcb652681b7', '201a47d6-715d-4f8a-8386-9492c0d57e41', 'Uniqlo Kemeja Katun Linen Kerah Tegak Lengan Panjang White (L)', 'Kemeja pria kasual elegan perpaduan serat katun lembut dan linen alami berpori sejuk. Desain kerah tegak modern (mandarin collar) yang cocok untuk suasana santai maupun semi-formal tropis.', 399000, 45, 'https://images.unsplash.com/photo-1596755094514-f87e34085b2c?auto=format&fit=crop&w=800&q=80', 0, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('bab3d62d-f532-4992-b830-cd1fd1a1819d', 'af058ae9-ecef-47af-9990-8432d048db06', 'Cottonink Basic Oversized Linen Blouse Olive Green (M)', 'Blus wanita berpotongan loose relaxed fit berbahan katun linen premium bernapas. Aksen kancing kayu alami di bagian dada memberi sentuhan estetik minimalis yang nyaman dikenakan seharian.', 349000, 32, 'https://images.unsplash.com/photo-1572804013309-59a88b7e92f1?auto=format&fit=crop&w=800&q=80', 0, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('186facc7-0abf-40c6-8911-392453ea7f08', '6622a104-07f6-4bd9-8351-1bdce73ec791', 'Nike Air Jordan 1 Low Wolf Grey / Aluminum (Size 42)', 'Sneakers ikonik siluet low-top dengan konstruksi kulit asli berkualitas premium, perpaduan warna Wolf Grey netral dan aksen biru muda, serta bantalan sol encapsulated Air-Sole untuk kenyamanan langkah harian.', 1949000, 11, 'https://images.unsplash.com/photo-1552346154-21d32810aba3?auto=format&fit=crop&w=800&q=80', 0, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('da04645f-2c06-4c73-9d51-b8bfc3a235de', '6622a104-07f6-4bd9-8351-1bdce73ec791', 'New Balance 574 Core Grey Classic Heritage Sneakers (Size 43)', 'Sepatu lari klasik legendaris New Balance dengan upper suede berpadu mesh berpori, teknologi bantalan midsole ENCAP berbahan EVA tahan lama, dan sol tapak karet cengkeram anti-selip.', 1299000, 22, 'https://images.unsplash.com/photo-1539185441755-769473a23570?auto=format&fit=crop&w=800&q=80', 0, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('cf9f6166-a60f-4061-a1b7-1369c6f5811e', '75ac0943-ac54-4252-a609-e1d2a7282417', 'Osprey Daylite Plus 20L Everyday Laptop Daypack - Black', 'Ransel harian serbaguna berkapasitas 20 liter dengan kompartemen laptop 15 inci empuk, panel belakang busa die-cut berlapis mesh dengan sirkulasi udara AirScape, dan kain nilon daur ulang tahan cipratan air.', 985000, 17, 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?auto=format&fit=crop&w=800&q=80', 0, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('8c4cb153-ae8d-4930-8359-b34c6be0085d', '009891d1-2bd8-4ee5-b9f5-fad48d5571ba', 'Seiko 5 Sports Automatic SRPD55K1 Black Dial Stainless Steel', 'Jam tangan otomatis pria legendaris dengan kaliber mekanikal 4R36 berdaya simpan 41 jam, bezel rotasi searah bergaya diver, kaca Hardlex kristal, jarum dan indeks berpendar LumiBrite, serta ketahanan air 100M.', 3150000, 9, 'https://images.unsplash.com/photo-1524805444758-089113d48a6d?auto=format&fit=crop&w=800&q=80', 0, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('eca9caef-4190-4e52-97e9-857264d29056', '74725d50-6057-4d49-96b1-994cd421dbb1', 'Sihoo M57 Ergonomic Office Chair Full Breathable Mesh - Grey', 'Kursi kerja ergonomis full mesh jaring berkualitas tinggi dengan penopang pinggang 2-arah yang dapat disetel, sandaran kepala 3D, armrest dapat disesuaikan multi-posisi, dan mekanisme tilt-recline 120 derajat.', 2450000, 15, 'https://images.unsplash.com/photo-1580481077195-c228ff31a949?auto=format&fit=crop&w=800&q=80', 0, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('993704b7-1b08-41f5-9e93-066bac64ab68', '4d6a481c-b69f-4e46-874b-496c99833ad4', 'Philips Airfryer XXL HD9650/99 Twin TurboStar 1.4kg 2225W', 'Penggoreng tanpa minyak kapasitas ekstra besar XXL yang muat satu ayam utuh, teknologi Twin TurboStar yang membuang lemak berlebih dari makanan, kontrol digital QuickControl dengan 5 program memasak preset.', 3899000, 13, 'https://images.unsplash.com/photo-1585515320310-259814833e62?auto=format&fit=crop&w=800&q=80', 0, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('cd90edbd-0c65-4b9d-8ff1-a1998233c391', '34087f50-ddbd-4fe1-b3fa-2ab5e92fbf03', 'DeLonghi Dedica EC685.M Manual Espresso Coffee Maker - Silver', 'Mesin kopi espresso manual ramping berlebar hanya 15cm dengan tekanan pompa 15 bar profesional, teknologi pemanas Thermoblock siap pakai dalam 40 detik, dan steam wand susu Cappuccino System fleksibel.', 3650000, 10, 'https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?auto=format&fit=crop&w=800&q=80', 0, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('d29edb11-60f7-4a1c-91c2-3d0c4a8351d8', '76c7ad9e-7949-48ac-8ce4-9d2757875b52', 'Dyson Supersonic Nural Hair Dryer - Strawberry Bronze & Blush Pink', 'Pengering rambut berteknologi sensor Nural pintar yang secara otomatis menurunkan suhu saat mendekati kulit kepala guna melindungi kilau alami rambut, bertenaga motor digital Dyson V9 berkecepatan 110.000 RPM.', 7999000, 7, 'https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?auto=format&fit=crop&w=800&q=80', 0, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('8507fef2-b651-447d-8114-a3529f9169da', '8f3178fa-b9a3-4290-acb5-bb8dc7c778a6', 'Skintific 5X Ceramide Barrier Repair Moisture Gel 50g', 'Pelembap wajah bertekstur gel ringan dengan formulasi 5 jenis Ceramide (NP, NS, AS, EOP, AP), Hyaluronic Acid, Centella Asiatica, dan Marine Collagen untuk menenangkan, mengunci hidrasi, dan memperkuat skin barrier.', 149000, 85, 'https://images.unsplash.com/photo-1556228720-195a672e8a03?auto=format&fit=crop&w=800&q=80', 0, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('77475350-bbbb-46d2-8700-72122cb0c112', '8f3178fa-b9a3-4290-acb5-bb8dc7c778a6', 'Somethinc Niacinamide + Moisture Sabi Beet Brightening Serum 20ml', 'Serum pencerah kulit wajah dengan kandungan 5% Niacinamide dipadukan dengan ekstrak SabiWhite dari akar kunyit dan Beetroot, membantu menyamarkan noda hitam bekas jerawat, meratakan warna kulit, dan mengontrol minyak.', 119000, 70, 'https://images.unsplash.com/photo-1620916566398-39f1143ab7be?auto=format&fit=crop&w=800&q=80', 0, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('7d2cdb11-aff1-4aa7-9359-33ca8dc28905', '825a2f59-dad1-4ee4-af71-e7c5f5503e73', 'Blackmores Bio C 1000mg 150 Tablet Ekstrak Citrus Bioflavonoid', 'Suplemen vitamin C dosis tinggi 1000mg diperkaya ekstrak Citrus Bioflavonoids dan Rosehips untuk mengoptimalkan penyerapan dan daya kerja dalam tubuh serta memelihara daya tahan imun harian, ramah bagi lambung.', 385000, 52, 'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?auto=format&fit=crop&w=800&q=80', 0, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('084d019d-b60a-4821-b611-542206b4ccb0', '1de1da0a-3d06-42ba-a1c0-c108eb3c93c5', 'Garmin Forerunner 265 GPS Running Smartwatch Black/Powder Grey', 'Smartwatch lari dengan layar sentuh AMOLED 1.3 inci cerah bertenaga baterai hingga 13 hari, metrik pelatihan canggih Training Readiness, HRV Status, morning report, serta multi-band GNSS berakurasi tinggi.', 6999000, 16, 'https://images.unsplash.com/photo-1508685096489-7aacd43bd3b1?auto=format&fit=crop&w=800&q=80', 0, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('5099857f-5cbd-4ac5-a58b-2d5723a63513', 'df3ba47d-c1ad-4232-ba46-491080c0b18f', 'Eiger Sender Arc 25L Hiking Daypack Olive Green', 'Tas ransel gunung berkapasitas 25 liter dengan kompartemen utama luas, backsystem Aerovent busa berpori yang sejuk, rain cover terintegrasi anti air, dan tali kompresi samping untuk kestabilan beban trekking.', 629000, 24, 'https://images.unsplash.com/photo-1622560480605-d83c853bc5c3?auto=format&fit=crop&w=800&q=80', 0, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('9d6bf033-8991-425f-966c-2dee1f6dce61', 'df3ba47d-c1ad-4232-ba46-491080c0b18f', 'Stanley The Quencher H2.0 FlowState Stainless Tumbler 40oz Charcoal', 'Tumbler vakum insulasi dinding ganda baja tahan karat 18/8 kapasitas 1.18 liter, mampu menjaga minuman dingin es hingga 48 jam, dilengkapi pegangan kokoh ergonomis dan tutup putar 3 posisi FlowState.', 780000, 30, 'https://images.unsplash.com/photo-1570824104453-508955ab713e?auto=format&fit=crop&w=800&q=80', 0, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('d6cf0236-ad07-4a24-bf7b-b11080fa94f7', '74fde353-8626-4b35-8449-18e76d5b8c33', 'Kindle Paperwhite 11th Gen 16GB 6.8 inch 300 ppi Waterproof', 'E-reader portabel dengan layar tanpa silau 6.8 inci beresolusi 300 ppi yang menyerupai kertas asli, lampu depan bernada hangat yang dapat disesuaikan dari putih ke amber, tahan air IPX8, dan baterai awet hingga 10 minggu.', 2499000, 18, 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?auto=format&fit=crop&w=800&q=80', 0, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('a594839f-d91c-411a-8024-c0d2c038f773', '74fde353-8626-4b35-8449-18e76d5b8c33', 'Lamy Safari Fountain Pen Charcoal Black - Medium Nib (M)', 'Pena celup fountain pen klasik asal Jerman berbahan plastik ABS tahan banting dengan grip ergonomis berkontur segitiga, klip pegas logam fleksibel berlapis krom hitam, dan nib baja berkualitas tinggi beraliran tinta lancar.', 375000, 40, 'https://images.unsplash.com/photo-1583485088034-697b5bc54ccd?auto=format&fit=crop&w=800&q=80', 0, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

-- ==========================================
-- 7. ORDERS (20 Transaksi Beragam Status & Total Akurat)
-- ==========================================
INSERT INTO orders (id, user_id, status, total_amount, created_at, updated_at) VALUES
('099826fe-9090-40f8-b7d1-4bf105801d1d', 'e20e30fb-aafa-4f78-bf79-770a4ff45c4a', 'COMPLETED', 6198000, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('aa8e31ee-82cf-4b09-ad23-cbe2347c4562', 'aadfed81-33e6-4107-9f1e-d2c47456883b', 'PAID', 2998000, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('03f98592-b213-46a5-afff-17516b057485', '40ea009a-9e64-4d14-8b53-a0ff22d16b74', 'SHIPPED', 1650000, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('897ebe21-177f-4d24-8a62-82eff9c82583', '520012f3-6b98-43e7-a35c-a1fe6d2616be', 'PENDING', 33347000, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('a3fead08-24e1-4bd5-b968-9cf93aacca96', 'ab0e34f8-5600-4ef4-b0de-2cb4fcb0aac3', 'CANCELLED', 19999000, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('441eced5-2b2d-46e7-9150-d438e954f0ba', '5c662f58-f4d7-4fbb-89b3-5e57baee5877', 'COMPLETED', 2798000, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('28e96301-468c-48fb-b755-bdd6e15ccfbe', '3a8bc45a-9bac-4669-9a19-3b8ef0529b8d', 'PAID', 15284000, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('18efec63-1259-4b3b-8657-5b5ebbd1243d', '0dd4a578-f8b2-46ea-b4f8-c102da5ed8e6', 'SHIPPED', 798000, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('97ea629c-d207-4484-bb58-f047b4f987ef', 'dc418ba7-c420-45cb-8e2c-b8fde2f48468', 'PENDING', 349000, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('48a8608a-da3a-4087-9d7f-6dd5b7191747', '90cab111-4f11-46b8-86eb-6707f55ceefa', 'CANCELLED', 7797000, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('3b968954-c055-4c0a-8ea4-a89f39662df0', 'cfe3f9d3-f40e-4f29-ae58-b2ac212c4bbf', 'COMPLETED', 1299000, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('d3911129-8272-4ab1-9745-9c60588fc81d', '6a68b71d-0d9f-448c-bae7-16178aa3ccc1', 'PAID', 1970000, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('0d4f0e4c-d9e2-4bdc-a97d-74a998f4d5d7', '781b4211-feac-4be2-9952-efb972ca30f3', 'SHIPPED', 3299000, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('591012ec-a02e-41aa-87b7-5fd87b6570fa', '4149452b-1348-41f4-ab79-3d25461ecd38', 'PENDING', 4900000, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('29f48c4f-17fc-4dee-8bcf-6e8974f18c30', 'cc32ecec-ad90-41e1-8483-d436f5bf32aa', 'CANCELLED', 3899000, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('4388babb-c83b-45af-b51d-48fc4f159cd9', '97c4aa75-2dec-4a11-a63f-4bf1e433d79c', 'COMPLETED', 14299000, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('1a54498c-bf5f-4542-b266-27b8efce1c18', '4b787c44-27e3-48d7-bc05-d604601fef3f', 'PAID', 7999000, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('21e9ac7f-fa0d-4fb0-a87c-07116316a499', '94e2ab55-e844-4ba8-b2e6-057156e37b0d', 'SHIPPED', 298000, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('1e766ecf-536b-4ae7-b7c2-cca74a190019', 'e20e30fb-aafa-4f78-bf79-770a4ff45c4a', 'PENDING', 2618000, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('2afcc8f5-1ef7-460c-a3bc-1ac160ff5d98', 'aadfed81-33e6-4107-9f1e-d2c47456883b', 'CANCELLED', 770000, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

-- ==========================================
-- 8. ORDER_ITEMS (Relasi Item Pesanan ke Produk)
-- ==========================================
INSERT INTO order_items (id, order_id, product_id, quantity, price_at_time, created_at, updated_at) VALUES
('e33d15c1-47c7-49cc-bffe-f319dabb7b8f', '099826fe-9090-40f8-b7d1-4bf105801d1d', '66557e36-0c2a-4feb-8570-9168432129c4', 1, 4799000, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('67f0b898-f062-46eb-96f7-57f0262db642', '099826fe-9090-40f8-b7d1-4bf105801d1d', '9c126521-a182-4553-b0fd-db4516b624bc', 1, 1399000, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('a531c6a7-8d69-491b-9229-19fdeff024dd', 'aa8e31ee-82cf-4b09-ad23-cbe2347c4562', 'e3b74ac5-792e-4679-a07f-9e583a5a6387', 2, 1499000, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('ef0029de-37a5-4e1e-bd1a-17fed8d27551', '03f98592-b213-46a5-afff-17516b057485', '51823562-11e6-477b-9529-271d2a5bea19', 1, 1650000, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('35f417e8-ba0a-408e-bc9e-d75c2f028fba', '897ebe21-177f-4d24-8a62-82eff9c82583', '00aa9631-6a47-4180-ae2c-6e14de615a02', 2, 16499000, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('f3d16bb3-751a-4cee-b376-02518be3043f', '897ebe21-177f-4d24-8a62-82eff9c82583', 'bab3d62d-f532-4992-b830-cd1fd1a1819d', 1, 349000, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('c823089d-fea9-47de-95de-c2a06961c0b2', 'a3fead08-24e1-4bd5-b968-9cf93aacca96', '8b4883bc-a887-40c6-8ebd-68fa128b9620', 1, 19999000, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('98a7bac7-2b03-40ea-9f63-ac39ff108e90', '441eced5-2b2d-46e7-9150-d438e954f0ba', '9c126521-a182-4553-b0fd-db4516b624bc', 2, 1399000, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('34bca3a0-ecec-488b-969d-c3fad9fa7ae6', '28e96301-468c-48fb-b755-bdd6e15ccfbe', '1c3cbb93-9fdc-4aaf-b454-d8e8113eb5a9', 1, 14299000, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('705d9308-f5ab-4ccd-8d34-6e6e09c2ff33', '28e96301-468c-48fb-b755-bdd6e15ccfbe', 'cf9f6166-a60f-4061-a1b7-1369c6f5811e', 1, 985000, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('f8d31e64-f7c0-4724-b669-890c92b4f9d9', '18efec63-1259-4b3b-8657-5b5ebbd1243d', '413766bd-b3f5-417c-8d72-bdcb652681b7', 2, 399000, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('7180ee3d-7f66-4643-8d2e-813a8579c9cc', '97ea629c-d207-4484-bb58-f047b4f987ef', 'bab3d62d-f532-4992-b830-cd1fd1a1819d', 1, 349000, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('72bcd4c3-e3b5-427e-b15c-0399301c488c', '48a8608a-da3a-4087-9d7f-6dd5b7191747', '186facc7-0abf-40c6-8911-392453ea7f08', 2, 1949000, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('179f1678-8566-4d31-8fdb-e7d002827fc3', '48a8608a-da3a-4087-9d7f-6dd5b7191747', '993704b7-1b08-41f5-9e93-066bac64ab68', 1, 3899000, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('16204743-bac7-4e53-ac3d-3770397f411e', '3b968954-c055-4c0a-8ea4-a89f39662df0', 'da04645f-2c06-4c73-9d51-b8bfc3a235de', 1, 1299000, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('6e6c6e44-f456-4409-81d1-588de33237a2', 'd3911129-8272-4ab1-9745-9c60588fc81d', 'cf9f6166-a60f-4061-a1b7-1369c6f5811e', 2, 985000, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('7add63b7-05ad-4d6d-8675-7ae3020edbce', '0d4f0e4c-d9e2-4bdc-a97d-74a998f4d5d7', '8c4cb153-ae8d-4930-8359-b34c6be0085d', 1, 3150000, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('bd4cafa5-a847-4d1e-98fe-24a063cd21fa', '0d4f0e4c-d9e2-4bdc-a97d-74a998f4d5d7', '8507fef2-b651-447d-8114-a3529f9169da', 1, 149000, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('00631bc6-b072-44e7-a522-a54583eb01e2', '591012ec-a02e-41aa-87b7-5fd87b6570fa', 'eca9caef-4190-4e52-97e9-857264d29056', 2, 2450000, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('f821e0d0-4ac0-4b81-88ff-79d3ace2d0df', '29f48c4f-17fc-4dee-8bcf-6e8974f18c30', '993704b7-1b08-41f5-9e93-066bac64ab68', 1, 3899000, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('8da820ef-6581-4887-9860-1a23d52cd3b1', '4388babb-c83b-45af-b51d-48fc4f159cd9', 'cd90edbd-0c65-4b9d-8ff1-a1998233c391', 2, 3650000, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('4a38f065-b3dc-4435-bdc9-a386aa69e9d3', '4388babb-c83b-45af-b51d-48fc4f159cd9', '084d019d-b60a-4821-b611-542206b4ccb0', 1, 6999000, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('30d0cbe9-0b8f-4469-93b8-36d04dfd520b', '1a54498c-bf5f-4542-b266-27b8efce1c18', 'd29edb11-60f7-4a1c-91c2-3d0c4a8351d8', 1, 7999000, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('63513172-050e-4cac-ad7b-76ac96029c58', '21e9ac7f-fa0d-4fb0-a87c-07116316a499', '8507fef2-b651-447d-8114-a3529f9169da', 2, 149000, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('1d1933f4-d0e3-4445-abb8-a75c09216e93', '1e766ecf-536b-4ae7-b7c2-cca74a190019', '77475350-bbbb-46d2-8700-72122cb0c112', 1, 119000, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('ab86e8e2-c94c-40b3-8659-f48e69414096', '1e766ecf-536b-4ae7-b7c2-cca74a190019', 'd6cf0236-ad07-4a24-bf7b-b11080fa94f7', 1, 2499000, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('5e9514cb-4ada-4c51-bcb9-50565e779ae2', '2afcc8f5-1ef7-460c-a3bc-1ac160ff5d98', '7d2cdb11-aff1-4aa7-9359-33ca8dc28905', 2, 385000, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);
