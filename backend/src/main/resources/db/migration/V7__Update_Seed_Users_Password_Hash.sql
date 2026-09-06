-- V7__Update_Seed_Users_Password_Hash.sql
-- Fix ID: AUTH-FIX-001
-- Memperbarui hash kata sandi untuk seluruh 20 akun seed agar cocok dengan "Admin1234!" (BCrypt strength 12)
-- Hanya memperbarui baris akun seed berdasarkan ID spesifik (tidak menyentuh akun registrasi pengguna).

UPDATE users
SET password_hash = '$2a$12$385JT1F9Ya.APOEDyNV0eeyVnrC9o4h8wBUT1BZDAPQNBAjrNwmma',
    updated_at = CURRENT_TIMESTAMP
WHERE id IN (
    '671513bf-2a94-4ef3-aed4-a77537274f02', -- budi.santoso@gmail.com (Admin)
    '78b7c574-ef44-460d-948d-e0ab2b082815', -- andi.wijaya@yahoo.co.id (Admin)
    'e20e30fb-aafa-4f78-bf79-770a4ff45c4a', -- siti.kusuma@outlook.com (Customer)
    'aadfed81-33e6-4107-9f1e-d2c47456883b', -- ayu.setiawan@gmail.com (Customer)
    '40ea009a-9e64-4d14-8b53-a0ff22d16b74', -- joko.pratama@gmail.com (Customer)
    '520012f3-6b98-43e7-a35c-a1fe6d2616be', -- rina.sari89@gmail.com (Customer)
    'ab0e34f8-5600-4ef4-b0de-2cb4fcb0aac3', -- dewi.lestari@yahoo.co.id (Customer)
    '5c662f58-f4d7-4fbb-89b3-5e57baee5877', -- eko.nugroho@hotmail.com (Customer)
    '3a8bc45a-9bac-4669-9a19-3b8ef0529b8d', -- fitri.saputra@gmail.com (Customer)
    '0dd4a578-f8b2-46ea-b4f8-c102da5ed8e6', -- gilang.wahyudi@gmail.com (Customer)
    'dc418ba7-c420-45cb-8e2c-b8fde2f48468', -- hendra.gunawan@gmail.com (Customer)
    '90cab111-4f11-46b8-86eb-6707f55ceefa', -- indah.h@gmail.com (Customer)
    'cfe3f9d3-f40e-4f29-ae58-b2ac212c4bbf', -- cahyo.purnomo@gmail.com (Customer)
    '6a68b71d-0d9f-448c-bae7-16178aa3ccc1', -- lestari.wibowo@gmail.com (Customer)
    '781b4211-feac-4be2-9952-efb972ca30f3', -- mega.irawan@yahoo.co.id (Customer)
    '4149452b-1348-41f4-ab79-3d25461ecd38', -- nisa.susanti@gmail.com (Customer)
    'cc32ecec-ad90-41e1-8483-d436f5bf32aa', -- oky.w@gmail.com (Customer)
    '97c4aa75-2dec-4a11-a63f-4bf1e433d79c', -- putra.rahmawati@gmail.com (Customer)
    '4b787c44-27e3-48d7-bc05-d604601fef3f', -- rizky.kurniawan@outlook.com (Customer)
    '94e2ab55-e844-4ba8-b2e6-057156e37b0d'  -- surya.sanjaya@gmail.com (Customer)
);
