# 🛒 Fullstack E-Commerce Platform (Spring Boot 3.3 + Angular 18)

Aplikasi Web E-Commerce berskala enterprise yang dibangun menggunakan arsitektur Monorepo, memisahkan backend REST API Spring Boot (Java 21) dan frontend Single Page Application Angular 18. Proyek ini mengimplementasikan aturan rekayasa perangkat lunak modern, keamanan stateless berbasis JWT, kontrol konkurensi data (Pessimistic & Optimistic Locking), validasi berlapis, sistem ulasan & rating produk, kupon voucher dinamis, upload berkas (gambar & PDF dokumen bukti bayar), serta penanganan error global terstandarisasi.

---

## 🚀 Technology Stack

### Backend
* **Bahasa**: Java 21 (LTS)
* **Framework**: Spring Boot 3.3.5
* **Keamanan**: Spring Security 6 + JWT (`jjwt` 0.11.5) + BCrypt (Strength 12) + RBAC (Role-Based Access Control)
* **Basis Data**: PostgreSQL 16 (Relational Database)
* **ORM & Migrasi**: Hibernate / Spring Data JPA + Flyway Database Migration (V1 s/d V10)
* **Dokumentasi API**: OpenAPI 3 / Swagger UI (`springdoc-openapi` 2.6.0)
* **Email Service**: Spring Boot Starter Mail (`JavaMailSender`) terintegrasi Mailtrap Sandbox & Live API
* **File Storage**: Penyimpanan lokal aman dengan validasi MIME Type, ukuran file, ekstensi, dan header magic bytes (JPEG, PNG, WebP, dan Dokumen PDF)
* **Unit & Integration Testing**: JUnit 5 + Mockito 5 + Spring Data JPA Specification Test
* **Build Tool**: Apache Maven

### Frontend
* **Framework**: Angular 18 (Standalone Components, Signals, Reactive Forms)
* **Routing**: Angular Router dengan Route Guards (`authGuard`, `adminGuard`)
* **Styling**: Tailwind CSS & Modern Clean UI Components (Glassmorphism, Micro-animations, Responsive Design)
* **State & HTTP**: Angular `HttpClient`, RxJS Observables, Reactive Forms, HTTP Interceptor (JWT Auto-inject & 401 Handling)
* **Notifikasi**: Custom Toast Notification System (`ToastService`)
* **Unit Testing**: Karma + Jasmine Runner + ChromeHeadless

---

## 🏛️ 6 Entitas Utama Sistem (>20 Data Realistis per Entitas)

Sistem mengelola 6 entitas utama dengan relasi database terintegrasi dan soft-delete:

| No | Entitas Utama | Deskripsi & Atribut Kunci | Fitur Terkait |
|:---:|---|---|---|
| 1 | **User (Pengguna)** | ID, Nama, Email, Password (BCrypt), Phone, Role (`ADMIN`, `CUSTOMER`), `is_active`, `deleted_at` | RBAC, Profil, Admin User Management (`/admin/users`) |
| 2 | **Category (Kategori)** | ID, Nama Kategori, Deskripsi, `is_active`, `deleted_at` | Katalog Filter, Admin Category Hide/Show (`/admin/categories`) |
| 3 | **Product (Produk)** | ID, Nama Produk, SKU, Harga, Stok, Deskripsi, Kategori, Image URL, `version`, `is_active`, `deleted_at` | Optimistic Locking, Pengurangan Stok, Katalog, Admin CRUD |
| 4 | **Order (Pesanan)** | ID, User, Status (`PENDING`, `PAID`, `SHIPPED`, `DELIVERED`, `COMPLETED`, `CANCELLED`), Total Harga, Timestamp | Pessimistic Locking Stock Verification, Riwayat Pesanan Pelanggan (`/orders`), Admin Filter Tanggal (`/admin/orders`) |
| 5 | **Review (Ulasan & Rating)** | ID, Produk, User, Rating (1-5), Komentar Ulasan, Timestamp, `deleted_at` | Rangkuman Rating Bintang, Ulasan Pembeli, Form Review di Detail Produk |
| 6 | **Voucher (Kupon Diskon)** | ID, Kode Voucher, Tipe Diskon (`PERCENTAGE`, `FIXED_AMOUNT`), Nilai Diskon, Min. Belanja, Max. Diskon, Kuota, `is_active`, `deleted_at` | Validasi Kupon Real-time di Checkout, Manajemen Voucher Admin (`/admin/vouchers`) |

---

## 📁 Struktur Monorepo Proyek

```text
.
├── backend/                        # Aplikasi Backend Spring Boot
│   ├── src/main/java/com/e_commerce/backend/
│   │   ├── common/                 # DTO terstandarisasi, ApiResponse, BaseEntity
│   │   ├── config/                 # Konfigurasi JPA Auditing & Spring Web
│   │   ├── exception/              # GlobalExceptionHandler & Custom Exceptions
│   │   ├── feature_auth/           # Otentikasi, Registrasi, Forgot & Reset Password
│   │   ├── feature_order/          # Transaksi, Checkout, Locking, Specification Filter
│   │   ├── feature_product/        # Produk, Kategori, Mapper, DTO & Specification
│   │   ├── feature_review/         # Ulasan & Rating Bintang Produk
│   │   ├── feature_upload/         # Upload File Gambar & Dokumen PDF
│   │   ├── feature_user/           # Manajemen Pengguna & Admin User List
│   │   ├── feature_voucher/        # Kupon Diskon & Kalkulasi Voucher
│   │   └── security/               # Spring Security, JWT Token Filter & UserDetails
│   ├── src/main/resources/
│   │   ├── db/migration/           # Skrip Migrasi Skema Basis Data Flyway (V1 - V10)
│   │   └── application.properties  # Konfigurasi Aplikasi & Database Properties
│   ├── src/test/java/              # 111 Unit & Integration Tests (100% Green)
│   └── pom.xml                     # Konfigurasi Dependensi Maven
├── frontend/                       # Aplikasi Frontend Angular
│   ├── src/app/
│   │   ├── core/                   # Guards, Interceptors, Models, Services (API Client)
│   │   ├── features/
│   │   │   ├── admin/              # Admin: Dashboard, Produk, Kategori, Pesanan, Voucher, Users
│   │   │   ├── auth/               # Auth: Login, Register, Forgot & Reset Password
│   │   │   ├── cart/               # Keranjang Belanja Pelanggan
│   │   │   ├── catalog/            # Katalog Produk & Halaman Detail Produk
│   │   │   ├── checkout/           # Checkout & Lampiran Dokumen Bukti Bayar PDF
│   │   │   ├── dashboard/          # Dashboard Statistik Pelanggan & Admin
│   │   │   ├── orders/             # Riwayat Pesanan Pelanggan & Detail Modal
│   │   │   └── profile/            # Pengaturan Profil & Ganti Password
│   │   └── shared/                 # Layouts, Navbar, Toast, Error Pages (401, 403, 404, 500)
│   └── package.json                # Dependensi Frontend Node/Angular
├── docs/                           # Dokumentasi Arsitektur & ERD Basis Data
└── README.md                       # Dokumentasi Utama
```

---

## 🛠️ Prasyarat Sistem

Pastikan perangkat lokal Anda telah terpasang:
1. **Java Development Kit (JDK) 21**
2. **Apache Maven 3.9+** (atau gunakan wrapper bawaan)
3. **Node.js (v18.x atau v20.x LTS)** & **npm**
4. **PostgreSQL 16** (berjalan pada port default `localhost:5432`)

---

## ⚙️ Konfigurasi Environment Variables

Aplikasi mendukung konfigurasi fleksibel melalui Environment Variable berikut:

| Variabel | Nilai Default / Deskripsi | Wajib |
|---|---|:---:|
| `DB_URL` | `jdbc:postgresql://localhost:5432/ecommerce_db` | Ya |
| `DB_USERNAME` | `postgres` | Ya |
| `DB_PASSWORD` | Password akun PostgreSQL Anda | Ya |
| `JWT_SECRET` | Kunci rahasia Base64 (minimal 256-bit) | Ya |
| `JWT_EXPIRATION_MS` | `86400000` (24 jam dalam milidetik) | Opsional |
| `MAIL_HOST` | `sandbox.smtp.mailtrap.io` (atau provider SMTP lain) | Opsional |
| `MAIL_PORT` | `2525` | Opsional |
| `MAIL_USERNAME` | Username kredensial SMTP | Opsional |
| `MAIL_PASSWORD` | Password kredensial SMTP | Opsional |

---

## 🚀 Panduan Menjalankan Aplikasi Secara Lokal

### 1. Menyiapkan Basis Data PostgreSQL
Buat basis data baru bernama `ecommerce_db`:
```sql
CREATE DATABASE ecommerce_db;
```
*Catatan*: Flyway Migration akan secara otomatis membuat seluruh skema tabel (`V1` s/d `V10`) beserta data awal (seed data realistis) saat backend pertama kali dijalankan.

Jika Anda ingin menjalankan migrasi basis data secara manual melalui Maven:
```powershell
mvn flyway:migrate "-Dflyway.url=jdbc:postgresql://localhost:5432/ecommerce_db" "-Dflyway.user=postgres" "-Dflyway.password=YOUR_PASSWORD"
```

---

### 2. Menjalankan Backend (Spring Boot)

Buka terminal di direktori `backend`:

#### Windows PowerShell:
```powershell
$env:DB_USERNAME="postgres"
$env:DB_PASSWORD="YOUR_PASSWORD"
mvn spring-boot:run
```

#### Windows Command Prompt (CMD):
```cmd
set DB_USERNAME=postgres&& set DB_PASSWORD=YOUR_PASSWORD&& mvn spring-boot:run
```

#### Linux / macOS:
```bash
DB_USERNAME=postgres DB_PASSWORD=YOUR_PASSWORD mvn spring-boot:run
```

* Backend akan berjalan aktif pada alamat: **`http://localhost:8080`**
* **Swagger UI / OpenAPI Dokumentasi**: **[http://localhost:8080/swagger-ui.html](http://localhost:8080/swagger-ui.html)**

---

### 3. Menjalankan Frontend (Angular)

Buka terminal baru di direktori `frontend`:
```bash
npm install
npm start
```

* Frontend akan berjalan aktif pada alamat: **`http://localhost:4200`**

---

## 🌐 Peta Navigasi & Rute Halaman

### Pelanggan (Customer Storefront)
* `/catalog` — Katalog Produk lengkap dengan filter kategori, pencarian keyword, sortir harga/nama, dan pagination.
* `/product/:id` — Detail Produk lengkap dengan galeri foto, stok, deskripsi, ringkasan rating bintang, dan ulasan pelanggan.
* `/cart` — Keranjang Belanja interaktif (tambah/kurang kuantiti produk, hapus item).
* `/checkout` — Checkout Transaksi dengan validasi kupon voucher diskon, rincian biaya, dan upload bukti transfer PDF.
* `/orders` — Riwayat Pesanan Saya: tab filter status, progress bar pengiriman 4-tahap, modal rincian transaksi, dan upload dokumen bukti transfer.
* `/dashboard` — Dashboard Ringkasan Belanja dan transaksi terakhir.
* `/profile` — Pengaturan Profil, nomor telepon, dan ganti password aman.
* `/login`, `/register`, `/forgot-password`, `/reset-password` — Alur autentikasi lengkap dengan token JWT.

### Administrator (Admin Panel)
* `/admin/dashboard` — Metrik statistik penjualan, total pesanan, produk aktif, dan pengguna terdaftar.
* `/admin/products` — Manajemen Produk: tabel produk lengkap, sortir stok, pencarian, dan soft-delete.
* `/admin/products/new` & `/admin/products/edit/:id` — Formulir tambah dan edit produk dengan upload foto produk.
* `/admin/categories` & `/admin/categories/new` — Manajemen Kategori: mekanisme Hide/Show kategori produk.
* `/admin/orders` — Manajemen Pesanan: filter status pesanan, filter rentang tanggal (Date Range Picker `startDate` & `endDate`), serta update status pesanan.
* `/admin/vouchers` — Manajemen Voucher: buat kupon diskon baru (persentase / nominal tetap), kuota, masa berlaku, dan soft-delete.
* `/admin/users` — Manajemen Pengguna: daftar akun terdaftar, pencarian nama/email, modal profil lengkap, dan soft-delete dengan proteksi akun aktif.

---

## 🔑 Akun Uji Coba Demo (Seed Data)

Aplikasi telah dilengkapi akun pengujian dengan peran berbeda:

| Peran (Role) | Email Akun | Kata Sandi | Cakupan Hak Akses |
|---|---|---|---|
| **ADMIN** | `budi.santoso@gmail.com` | `Admin1234!` | Hak penuh Admin Panel (`/admin`), Manajemen Produk, Kategori, Pesanan, Kupon Voucher, dan Pengguna. |
| **CUSTOMER** | `siti.kusuma@outlook.com` | `Admin1234!` | Belanja Katalog, Keranjang, Checkout dengan Voucher, Riwayat Pesanan, Upload PDF Bukti Bayar, Ulasan Produk. |
| **CUSTOMER** | `ayu.setiawan@gmail.com` | `Admin1234!` | Belanja Katalog, Checkout, Profil Akun. |

---

## 🧪 Panduan Menjalankan Pengujian Otomatis (Testing)

### 1. Backend Automated Tests (JUnit 5 & Mockito)

Menjalankan seluruh 111 test suite backend (mencakup Otentikasi, Voucher, Review, Order Concurrency Locking, File Storage, Specification Query, dan Service Logic):

```powershell
cmd /c "set DB_USERNAME=postgres&& set DB_PASSWORD=YOUR_PASSWORD&& mvn test"
```

Menjalankan unit test spesifik:
```bash
mvn test -Dtest=OrderServiceImplTest
mvn test -Dtest=ReviewServiceImplTest
mvn test -Dtest=VoucherServiceImplTest
mvn test -Dtest=UploadControllerTest
```

### 2. Frontend Automated Tests (Karma & Jasmine)

Menjalankan pengujian komponen frontend menggunakan ChromeHeadless:
```bash
cd frontend
npm test -- --no-watch --browsers=ChromeHeadless
```

### 3. Frontend Production Build Validation

Memvalidasi kompilasi bundle Angular tanpa kesalahan:
```bash
cd frontend
npm run build
```
Hasil build produksi akan tersimpan pada direktori `frontend/dist/frontend`.

---

## 🛡️ Keamanan & Integritas Rekayasa

1. **Proteksi IDOR**: Endpoint data pesanan dan ulasan memvalidasi bahwa pelanggan hanya dapat mengakses dan memodifikasi data kepemilikannya sendiri.
2. **Kontrol Konkurensi Stok**: Implementasi `Pessimistic Write Lock` pada proses checkout untuk mencegah *race condition* dan *overselling* stok produk.
3. **Penyimpanan Berkas Aman**: Validasi ganda tipe MIME berkas, ukuran maksimal 5MB, serta pengecekan *magic bytes* header untuk mencegah injeksi file berbahaya.
4. **Soft Delete**: Penghapusan data produk, kategori, voucher, ulasan, dan pengguna menggunakan mekanisme `deleted_at` untuk menjamin integritas riwayat transaksi historis.
