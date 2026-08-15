# Fullstack E-Commerce Application (Spring Boot + Angular)

Aplikasi E-Commerce lengkap yang dibangun menggunakan arsitektur monorepo, memisahkan backend Spring Boot (Java 21) dan frontend Angular. 
Proyek ini mengimplementasikan aturan dan *best practices* yang ketat (termasuk Spring Security JWT, Flyway, dan penanganan exception secara global).

## 🚀 Technology Stack

### Backend
* **Bahasa**: Java 21
* **Framework**: Spring Boot 3.3.x
* **Database**: PostgreSQL 16
* **ORM & Migrasi**: Hibernate / Spring Data JPA + Flyway
* **Keamanan**: Spring Security + JWT
* **Dokumentasi API**: OpenAPI / Swagger (`springdoc`)
* **Email Service**: JavaMailSender (Mailtrap / SMTP)
* **Build Tool**: Maven

### Frontend (Mendatang)
* **Framework**: Angular 18+
* **Styling**: Tailwind CSS
* **Komunikasi API**: `HttpClient` dengan Interceptor (untuk JWT)

## 📁 Struktur Proyek

```text
.
├── backend/            # Aplikasi Spring Boot
│   ├── src/main/java   # Source Code Java
│   ├── src/main/resources/db/migration # Skema Flyway
│   └── pom.xml         # Dependensi Maven
├── docs/               # Dokumentasi Teknis
│   ├── architecture/   # Diagram ERD & Flow
│   └── api/            # Spesifikasi API
└── README.md           # File dokumentasi ini
```

## 🛠️ Prasyarat

Pastikan perangkat lunak berikut terinstal:
1. **Java Development Kit (JDK) 21**
2. **Apache Maven** (atau gunakan `./mvnw` dari dalam *project*)
3. **PostgreSQL** (berjalan pada `localhost:5432`)
4. **Node.js & npm** (untuk frontend nantinya)

## 🚀 Cara Menjalankan Aplikasi (Backend)

1. **Konfigurasi Database**
   Buat database PostgreSQL dengan nama `ecommerce_db`.
   Pastikan kredensial (username & password) diset sebagai *environment variable* atau diubah sementara di `backend/src/main/resources/application.properties`.

2. **Migrasi Database**
   Proyek ini menggunakan **Flyway**. Saat aplikasi dijalankan pertama kali, semua skema tabel (termasuk *Roles*, *Users*, *Products*, dll) akan dibuat secara otomatis sesuai urutan skrip `V1` hingga `V4`.

3. **Build dan Jalankan**
   Buka terminal, masuk ke folder `backend` dan jalankan:
   ```bash
   cd backend
   mvn clean compile
   mvn spring-boot:run
   ```

4. **Akses Swagger UI**
   Setelah server menyala (di port `8080`), buka browser dan akses dokumentasi API melalui:
   [http://localhost:8080/swagger-ui.html](http://localhost:8080/swagger-ui.html)

## 🔐 Keamanan & Token

Untuk mengakses endpoint yang diproteksi (seperti membuat pesanan atau menambah produk):
1. Lakukan Register via `/api/auth/register`.
2. Lakukan Login via `/api/auth/login`.
3. Anda akan mendapatkan `accessToken`. Salin token tersebut.
4. Di Swagger UI, klik tombol **Authorize** dan tempel token tersebut.
