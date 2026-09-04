# 🛒 Fullstack E-Commerce Platform (Spring Boot 3.3 + Angular 18)

Aplikasi Web E-Commerce berskala enterprise yang dibangun menggunakan arsitektur Monorepo, memisahkan backend REST API Spring Boot (Java 21) dan frontend Single Page Application Angular 18. Proyek ini mengimplementasikan aturan rekayasa perangkat lunak modern, keamanan stateless berbasis JWT, kontrol konkurensi data (Pessimistic & Optimistic Locking), validasi berlapis, serta penanganan error global terstandarisasi.

---

## 🚀 Technology Stack

### Backend
* **Bahasa**: Java 21 (LTS)
* **Framework**: Spring Boot 3.3.5
* **Keamanan**: Spring Security 6 + JWT (`jjwt` 0.11.5) + BCrypt (Strength 12)
* **Basis Data**: PostgreSQL 16
* **ORM & Migrasi**: Hibernate / Spring Data JPA + Flyway Database Migration
* **Dokumentasi API**: OpenAPI 3 / Swagger UI (`springdoc-openapi` 2.6.0)
* **Email Service**: Spring Boot Starter Mail (`JavaMailSender`)
* **Unit Testing**: JUnit 5 + Mockito 5
* **Build Tool**: Apache Maven

### Frontend
* **Framework**: Angular 18 (Standalone Components, Signals)
* **Routing**: Angular Router dengan Route Guards (`authGuard`, `adminGuard`)
* **Styling**: Tailwind CSS & Modern UI Components
* **State & HTTP**: Angular `HttpClient`, RxJS Observables, Reactive Forms, HTTP Interceptor
* **Notifikasi**: Custom Toast Notification System (`ToastService`)

---

## 📁 Struktur Proyek (Monorepo)

```text
.
├── backend/                        # Aplikasi Backend Spring Boot
│   ├── src/main/java/com/e_commerce/backend/
│   │   ├── common/                 # DTO & Base Entity terstandarisasi
│   │   ├── exception/              # Global Exception Handler & Custom Exceptions
│   │   ├── feature_auth/           # Modul Otentikasi & Token Management
│   │   ├── feature_order/          # Modul Pesanan, Checkout & Locking
│   │   ├── feature_product/        # Modul Produk, Kategori, Mapper & Specification
│   │   ├── feature_upload/         # Modul Penyimpanan & Validasi File
│   │   ├── feature_user/           # Modul Profil Pengguna & RBAC
│   │   └── security/               # Konfigurasi Security, JWT & UserDetails
│   ├── src/main/resources/
│   │   ├── db/migration/           # Skrip Migrasi Skema Basis Data Flyway (V1 - V6)
│   │   └── application.properties  # Konfigurasi Aplikasi & Environment Variable
│   └── pom.xml                     # Konfigurasi Dependensi Maven
├── frontend/                       # Aplikasi Frontend Angular
│   ├── src/app/
│   │   ├── core/                   # Guards, Interceptors, Models & Services
│   │   ├── features/               # Halaman Fitur: Auth, Catalog, Cart, Checkout, Dashboard, Profile, Admin
│   │   └── shared/                 # Layout, Navbar, Toast & Error Pages (401, 403, 404, 500)
│   └── package.json                # Dependensi Frontend
├── docs/                           # Dokumentasi Teknis
│   ├── architecture/               # Diagram Arsitektur Sistem
│   ├── database/                   # Dokumentasi Skema & ERD Mermaid
│   └── flowchart/                  # Diagram Alur Bisnis, Autentikasi & Checkout
└── README.md                       # Dokumentasi Utama
```

---

## 🛠️ Prasyarat Sistem

Sebelum menjalankan aplikasi, pastikan perangkat Anda telah terpasang:
1. **Java Development Kit (JDK) 21**
2. **Apache Maven 3.9+** (atau gunakan `./mvnw`)
3. **Node.js (v18.x atau v20.x)** & **npm**
4. **PostgreSQL 16** (berjalan pada port `localhost:5432`)

---

## ⚙️ Konfigurasi Environment Variables

Aplikasi mendukung konfigurasi fleksibel melalui Environment Variable berikut:

| Variabel | Nilai Default / Deskripsi | Wajib |
|---|---|---|
| `DB_URL` | `jdbc:postgresql://localhost:5432/ecommerce_db` | Ya |
| `DB_USERNAME` | `postgres` | Ya |
| `DB_PASSWORD` | Password database Anda | Ya |
| `JWT_SECRET` | Kunci rahasia Base64 (min. 256-bit) | Ya |
| `JWT_EXPIRATION_MS` | `86400000` (24 jam dalam milidetik) | Opsional |
| `MAIL_HOST` | `sandbox.smtp.mailtrap.io` (atau SMTP lain) | Opsional |
| `MAIL_PORT` | `2525` | Opsional |
| `MAIL_USERNAME` | Username SMTP | Opsional |
| `MAIL_PASSWORD` | Password SMTP | Opsional |

---

## 🚀 Cara Menjalankan Aplikasi

### 1. Menyiapkan Basis Data
Buat basis data baru di PostgreSQL:
```sql
CREATE DATABASE ecommerce_db;
```
Flyway akan mengeksekusi migrasi skema tabel dan seed data secara otomatis saat backend pertama kali dijalankan.

### 2. Menjalankan Backend (Spring Boot)
Buka terminal dan jalankan:
```bash
cd backend
mvn clean compile
mvn spring-boot:run
```
Backend akan aktif di `http://localhost:8080`.

* **Swagger UI / Dokumentasi API**: [http://localhost:8080/swagger-ui.html](http://localhost:8080/swagger-ui.html)

### 3. Menjalankan Frontend (Angular)
Buka terminal baru dan jalankan:
```bash
cd frontend
npm install
npm start
```
Frontend akan aktif di `http://localhost:4200`.

---

## 🔑 Akun Demo Pengujian

Aplikasi telah dilengkapi dengan data awal (seed) yang siap digunakan:

| Peran (Role) | Email | Password | Hak Akses |
|---|---|---|---|
| **ADMIN** | `budi.santoso@gmail.com` | `Admin1234!` | Akses penuh Panel Admin (`/admin`), Kelola Produk, Kelola Kategori, Kelola Status Pesanan |
| **CUSTOMER** | `siti.kusuma@outlook.com` | `Admin1234!` | Belanja Katalog, Keranjang, Checkout Pesanan, Riwayat Transaksi, Edit Profil |
| **CUSTOMER** | `ayu.setiawan@gmail.com` | `Admin1234!` | Belanja Katalog, Checkout, Profil Akun |

---

## 🧪 Menjalankan Unit Testing

Untuk memvalidasi integritas logika bisnis, validasi, dan kontrol keamanan:
```bash
cd backend
mvn test
```
Seluruh skenario pengujian unit (Authentication, Product CRUD & Patch, Order Checkout dengan Pessimistic Lock) akan dieksekusi secara otomatis.
