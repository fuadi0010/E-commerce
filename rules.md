# AGENTS.md

# PROJECT RULES — FULLSTACK E-COMMERCE S1 CAPSTONE

Dokumen ini adalah sumber aturan utama untuk seluruh pekerjaan proyek.

Agent WAJIB membaca dan memahami file ini SEBELUM:
- membuat kode;
- membuat entity;
- membuat migration;
- membuat endpoint;
- membuat component;
- mengubah arsitektur;
- mengubah database;
- mengubah authentication/authorization;
- menambahkan dependency;
- membuat dummy/seed data.

Rules dalam file ini harus dipatuhi selama seluruh lifecycle project.

Jika instruksi user bertentangan dengan aturan wajib di file ini:
1. Jangan memilih salah satu secara diam-diam.
2. Identifikasi konflik secara eksplisit.
3. Jelaskan dampaknya.
4. Minta keputusan/konfirmasi sebelum melakukan perubahan yang melanggar requirement.

Requirement proyek kampus adalah minimum requirement.
Engineering rules di file ini boleh lebih ketat daripada requirement kampus.

==================================================
1. PROJECT OBJECTIVE
==================================================

Project adalah aplikasi Fullstack E-Commerce untuk proyek S1.

Project WAJIB terdiri dari:
- Frontend
- Backend
- Database

Frontend dan Backend WAJIB berada dalam satu repository GitHub menggunakan struktur monorepo.

Target utama:
1. Memenuhi seluruh ketentuan proyek S1.
2. Menghasilkan aplikasi yang benar-benar terhubung ke database.
3. Tidak menggunakan dummy/mock data sebagai pengganti database production flow.
4. Memiliki authentication dan authorization yang benar.
5. Memiliki CRUD lengkap untuk minimal 6 entitas utama.
6. Memiliki search, filtering, sorting, dan pagination.
7. Memiliki global error handling.
8. Memiliki validation frontend dan backend.
9. Memiliki dokumentasi API.
10. Memiliki dokumentasi sistem dan README.
11. Memiliki struktur kode yang maintainable.
12. Menghindari security vulnerability umum seperti IDOR, mass assignment, user enumeration, SQL injection, dan credential leakage.

Jangan mengejar sekadar "aplikasi berjalan".
Fokus pada correctness, maintainability, security, consistency, dan kesesuaian requirement.

==================================================
2. TECHNOLOGY STACK
==================================================

## Backend

- Java 21
- Spring Boot 3.3.x
- Spring Security
- Spring Data JPA
- Hibernate
- Maven
- PostgreSQL
- Flyway
- JWT
- BCrypt
- Bean Validation
- Swagger/OpenAPI
- JUnit
- Mockito

## Frontend

- Angular
- TypeScript
- Angular Router
- HttpClient
- Reactive Forms

Frontend WAJIB menggunakan Client-Side Routing.

Framework frontend tidak boleh diganti tanpa keputusan eksplisit.

## Database

- PostgreSQL
- Flyway migration
- UUID primary key
- Normalisasi minimal 3NF

DILARANG menggunakan:

spring.jpa.hibernate.ddl-auto=update

Schema database harus dikelola menggunakan Flyway.

==================================================
3. REPOSITORY STRUCTURE
==================================================

Repository WAJIB menggunakan monorepo.

Struktur minimum:

/
├── backend/
│   ├── src/
│   ├── pom.xml
│   └── ...
│
├── frontend/
│   ├── src/
│   ├── package.json
│   └── ...
│
├── docs/
│   ├── flowchart/
│   ├── database/
│   ├── api/
│   └── architecture/
│
├── README.md
├── AGENTS.md
└── .gitignore

Frontend dan backend TIDAK BOLEH dipisahkan menjadi repository berbeda.

Repository GitHub wajib dapat diakses secara public sesuai ketentuan pengumpulan.

==================================================
4. DEVELOPMENT WORKFLOW
==================================================

Agent WAJIB bekerja secara bertahap.

Urutan kerja:

PHASE 1 — Requirement Analysis
PHASE 2 — Architecture Design
PHASE 3 — Database Design
PHASE 4 — Backend Foundation
PHASE 5 — Authentication & Authorization
PHASE 6 — Backend CRUD
PHASE 7 — Search/Filter/Sorting/Pagination
PHASE 8 — File Upload
PHASE 9 — Frontend Foundation
PHASE 10 — Frontend Authentication
PHASE 11 — Frontend CRUD
PHASE 12 — Dashboard
PHASE 13 — Error Handling & Notification
PHASE 14 — Testing
PHASE 15 — Documentation
PHASE 16 — Final Compliance Audit

Jangan langsung membuat seluruh aplikasi sekaligus tanpa validasi setiap phase.

Setiap phase harus menghasilkan kondisi yang dapat diverifikasi.

==================================================
5. REQUIREMENT TRACEABILITY
==================================================

Setiap requirement harus dapat dilacak ke implementasi.

Agent WAJIB mempertahankan checklist requirement internal yang mencakup:

- Requirement
- Implementasi
- File terkait
- Endpoint/component terkait
- Status
- Evidence/test

Jangan menyatakan requirement "selesai" hanya karena kode sudah dibuat.

Requirement dianggap selesai jika:
1. Implementasi tersedia.
2. Terhubung dengan sistem.
3. Berfungsi.
4. Tidak melanggar security rule.
5. Sudah diverifikasi.
6. Tidak merusak fitur lain.

==================================================
6. BACKEND ARCHITECTURE
==================================================

Gunakan layering yang jelas:

Controller
    ↓
Service
    ↓
Repository
    ↓
Database

DTO digunakan sebagai boundary antara API dan domain/entity.

Struktur minimum:

controller/
service/
repository/
entity/
dto/
mapper/
exception/
security/
config/
specification/
util/

Jangan menaruh business logic kompleks di Controller.

Controller bertanggung jawab terhadap:
- menerima request;
- validasi request;
- memanggil service;
- mengembalikan response.

Service bertanggung jawab terhadap:
- business logic;
- authorization/ownership;
- transaction boundary;
- orchestration.

Repository bertanggung jawab terhadap:
- database access.

Entity bertanggung jawab terhadap:
- persistence mapping.

==================================================
7. RESPONSE CONTRACT — NON-NEGOTIABLE
==================================================

Semua endpoint tanpa kecuali WAJIB menggunakan response wrapper yang konsisten.

Format:

{
  "status": 200,
  "message": "string",
  "data": {},
  "errors": null,
  "timestamp": "ISO-8601"
}

Gunakan:

ApiResponse<T>

Aturan:

- status = HTTP status code.
- message = human-readable message.
- data = payload sukses.
- data = null ketika error.
- errors = null ketika sukses.
- errors berisi detail validation/error yang aman ditampilkan.
- timestamp menggunakan ISO-8601.

DILARANG:

ResponseEntity<EntityClass>

atau:

Map<String, Object>

secara ad-hoc sebagai response API.

Semua response harus melalui ApiResponse<T>.

==================================================
8. GLOBAL EXCEPTION HANDLING
==================================================

WAJIB membuat:

@RestControllerAdvice

GlobalExceptionHandler

SEBELUM controller CRUD pertama dibuat.

Controller TIDAK BOLEH memiliki try-catch untuk business exception.

Exception handling minimum:

| Exception | HTTP Status |
|---|---:|
| ResourceNotFoundException | 404 |
| MethodArgumentNotValidException | 422 |
| DuplicateResourceException | 409 |
| DataIntegrityViolationException | 409 |
| InsufficientStockException | 409 |
| OptimisticLockException | 409 |
| BadCredentialsException | 401 |
| AccessDeniedException | 403 |
| Malformed/invalid request | 400 |
| Unexpected Exception | 500 |

Validation error:

422

Format errors harus dapat menunjukkan field dan message.

Contoh:

"errors": {
  "email": "Email tidak valid",
  "password": "Password minimal 8 karakter"
}

Unexpected exception:

- log full stacktrace di server;
- response kepada client harus generic;
- JANGAN mengirim ex.getMessage() mentah;
- JANGAN leak SQL;
- JANGAN leak stacktrace;
- JANGAN leak internal implementation.

==================================================
9. REST API
==================================================

Backend WAJIB mengikuti prinsip REST.

Minimum HTTP method:

GET
POST
PUT
PATCH
DELETE

Gunakan HTTP status code yang sesuai.

Contoh:

GET collection       → 200
GET detail           → 200
POST create          → 201
PUT update           → 200
PATCH update         → 200
DELETE               → 200 atau 204
Validation failure   → 422
Unauthorized         → 401
Forbidden             → 403
Not found             → 404
Conflict              → 409
Unexpected error      → 500

Jangan menggunakan POST untuk semua operasi.

Endpoint harus menggunakan naming yang konsisten.

Contoh:

GET    /api/v1/products
GET    /api/v1/products/{id}
POST   /api/v1/products
PUT    /api/v1/products/{id}
PATCH  /api/v1/products/{id}
DELETE /api/v1/products/{id}

==================================================
10. DATABASE REQUIREMENTS
==================================================

Database WAJIB memenuhi:

- Minimal 6 tabel utama.
- Minimal 5 relasi.
- Primary Key.
- Foreign Key.
- Normalisasi minimal sampai 3NF.
- created_at pada setiap tabel utama.
- updated_at pada setiap tabel utama.
- Minimal 2 tabel menggunakan soft delete.
- Minimal 20 seed data realistis per tabel utama.

Data seed DILARANG berupa:

test1
test2
test3

Gunakan data realistis yang relevan dengan domain e-commerce.

==================================================
11. DATABASE RELATIONSHIP
==================================================

Database WAJIB memiliki minimal:

- One To One
- One To Many
- Many To One
- Many To Many

Minimal total:

6 tabel utama
5 relasi eksplisit

Sebelum membuat migration:

1. Daftar semua tabel.
2. Daftar primary key.
3. Daftar foreign key.
4. Daftar seluruh relasi.
5. Tentukan cardinality setiap relasi.
6. Pastikan terdapat 1:1.
7. Pastikan terdapat 1:N.
8. Pastikan terdapat N:1.
9. Pastikan terdapat N:M.
10. Pastikan minimal 5 relasi.
11. Pastikan minimal 6 tabel.
12. Periksa normalisasi sampai 3NF.

Jangan generate migration jika database design belum tervalidasi.

Setelah database design disetujui, migration dapat dibuat tanpa meminta konfirmasi ulang untuk setiap migration selama migration masih mengikuti design yang telah disetujui.

==================================================
12. DATABASE NORMALIZATION
==================================================

Database minimal 3NF.

Agent WAJIB menghindari:

- repeating group;
- partial dependency;
- transitive dependency;
- data redundant tanpa alasan;
- menyimpan data yang sebenarnya berasal dari tabel lain tanpa kebutuhan yang jelas.

Sebelum finalisasi schema, dokumentasikan:

1. Entity/table.
2. Primary key.
3. Foreign key.
4. Relationship.
5. Functional dependency utama jika relevan.
6. Alasan schema memenuhi 3NF.

Jika denormalisasi digunakan, alasan harus didokumentasikan.

==================================================
13. PRIMARY KEY
==================================================

Primary key entity utama WAJIB menggunakan UUID.

Gunakan:

GenerationType.UUID

DILARANG menggunakan auto-increment Long sebagai public entity identifier.

Tujuan:
- mengurangi predictable identifier;
- mengurangi enumeration;
- lebih aman untuk public API.

UUID yang digunakan sebagai identifier API tidak boleh berasal langsung dari input user tanpa validasi ownership.

==================================================
14. BASE ENTITY & AUDITING
==================================================

Entity utama WAJIB memiliki:

createdAt
updatedAt

Gunakan Spring Data JPA Auditing:

@CreatedDate
@LastModifiedDate
@EnableJpaAuditing

Gunakan BaseEntity.

JANGAN mengisi timestamp secara manual di service layer.

==================================================
15. SOFT DELETE
==================================================

Minimal 2 tabel WAJIB menggunakan soft delete.

Gunakan Hibernate 6+:

@SQLDelete
@SQLRestriction("deleted_at IS NULL")

DILARANG menggunakan @Where untuk implementasi baru karena API tersebut deprecated pada Hibernate modern.

Data soft deleted:
- tidak boleh muncul pada query normal;
- tetap berada di database;
- dapat digunakan untuk audit/recovery sesuai kebutuhan.

==================================================
16. ENUM
==================================================

Semua enum entity WAJIB:

@Enumerated(EnumType.STRING)

DILARANG:

EnumType.ORDINAL

Alasan:
penambahan atau perubahan urutan enum dapat merusak interpretasi data lama.

==================================================
17. MONEY / CURRENCY
==================================================

Semua nilai uang WAJIB menggunakan:

BigDecimal

DILARANG:

Double
Float

Column money wajib eksplisit:

precision = 19
scale = 2

Contoh:

@Column(precision = 19, scale = 2, nullable = false)

==================================================
18. FETCH STRATEGY
==================================================

Default relationship:

FetchType.LAZY

DILARANG menggunakan EAGER tanpa alasan.

Jika EAGER diperlukan:
- harus ada alasan teknis;
- alasan harus ditulis pada komentar kode;
- harus dipastikan tidak menyebabkan N+1 query.

==================================================
19. OPEN-IN-VIEW
==================================================

WAJIB:

spring.jpa.open-in-view=false

Lazy loading harus diselesaikan di service/transaction boundary yang tepat.

Jangan bergantung pada Open Session in View untuk menghasilkan response API.

==================================================
20. PAGINATION
==================================================

Semua list endpoint WAJIB menggunakan Pageable.

DILARANG:

findAll()

tanpa Pageable untuk production list endpoint.

Minimal mendukung:

page
size
sort

Frontend wajib menyediakan:
- Previous
- Next
- nomor halaman
- informasi jumlah data
- pilihan jumlah data per halaman

Contoh:

GET /api/v1/products?page=0&size=10&sort=name,asc

==================================================
21. SEARCH
==================================================

List endpoint yang relevan WAJIB mendukung search berdasarkan keyword.

Contoh:

GET /api/v1/products?search=laptop

Search harus:
- aman;
- menggunakan parameter binding;
- tidak menggunakan string SQL concatenation mentah;
- memiliki behavior yang terdokumentasi.

==================================================
22. FILTERING
==================================================

List endpoint yang relevan WAJIB mendukung filtering.

Minimal dapat digunakan untuk:
- status;
- kategori;
- tanggal.

Contoh:

GET /api/v1/products?status=ACTIVE
GET /api/v1/products?categoryId=UUID
GET /api/v1/orders?startDate=2026-01-01&endDate=2026-01-31

Search + filter + sorting + pagination harus dapat digunakan secara bersamaan.

==================================================
23. SORTING
==================================================

Minimal mendukung:

- terbaru;
- terlama;
- A-Z;
- Z-A.

Backend harus melakukan whitelist terhadap field sorting yang diperbolehkan.

JANGAN langsung memasukkan parameter sort user ke query SQL mentah.

==================================================
24. CONCURRENCY & TRANSACTION
==================================================

Fitur yang mengubah shared state wajib mempertimbangkan concurrency.

Contoh:
- stock;
- quantity;
- counter;
- balance;
- quota.

Gunakan:

@Version

untuk optimistic locking ketika sesuai.

Gunakan:

@Lock(LockModeType.PESSIMISTIC_WRITE)

untuk operasi high-contention seperti checkout jika diperlukan.

Validasi:

stock >= quantity

WAJIB dilakukan setelah lock didapat dan di dalam transaction.

DILARANG melakukan:

1. cek stock;
2. kemudian baru lock;

karena dapat menyebabkan TOCTOU race condition.

==================================================
25. TRANSACTION BOUNDARY
==================================================

Operasi multi-step yang harus atomic WAJIB berada dalam satu transaction.

Contoh checkout:

1. lock product;
2. validasi stock;
3. buat order;
4. buat order item;
5. update stock;
6. commit.

Jika item ke-3 gagal:
- perubahan sebelumnya harus rollback;
- jangan meninggalkan partial state;
- jangan membuat orphan record.

==================================================
26. VALIDATION — BACKEND
==================================================

Semua POST dan PUT WAJIB menggunakan:

@Valid

DTO WAJIB memiliki validation constraint.

Gunakan sesuai kebutuhan:

@NotBlank
@NotNull
@NotEmpty
@Email
@Pattern
@Size
@Min
@Max
@Positive
@PositiveOrZero
@Past
@Future

PATCH juga harus memiliki validation yang sesuai.

Minimal validation mencakup:
- required;
- minimum;
- maximum;
- email;
- enum;
- numeric;
- date;
- unique.

==================================================
27. PASSWORD VALIDATION
==================================================

Password minimal:

- 8 karakter;
- minimal 1 huruf besar;
- minimal 1 angka.

Password confirmation wajib divalidasi.

passwordConfirmation harus divalidasi di service layer.

Jangan mengandalkan annotation field-level biasa untuk cross-field equality jika tidak diperlukan.

==================================================
28. DTO
==================================================

DILARANG bind request body langsung ke Entity JPA.

Gunakan:

CreateRequest
UpdateRequest
ResponseDTO

Contoh:

CreateProductRequest
UpdateProductRequest
ProductResponse

Alasan:
- mencegah mass assignment;
- memisahkan API contract dari persistence model;
- memudahkan perubahan entity;
- meningkatkan security.

==================================================
29. MAPPING
==================================================

Gunakan mapper layer.

Entity → Response DTO
Request DTO → Entity

Mapper dapat menggunakan MapStruct atau implementasi manual yang terstruktur.

Jangan menaruh mapping kompleks di Controller.

==================================================
30. AUTHENTICATION
==================================================

WAJIB memiliki:

- Register
- Login
- Logout
- Forgot Password
- Reset Password
- Refresh Token

Refresh token wajib digunakan sebagai mekanisme session persistence.

Authentication menggunakan JWT.

JWT minimal terdiri dari:
- access token;
- refresh token.

==================================================
31. PASSWORD SECURITY
==================================================

Password WAJIB di-hash menggunakan BCrypt.

BCrypt strength:

>= 12

DILARANG:
- plaintext password;
- MD5;
- SHA-1;
- custom hashing;
- menyimpan password mentah.

==================================================
32. JWT SECURITY
==================================================

JWT secret DILARANG hardcode.

Gunakan environment variable.

Contoh:

${JWT_SECRET}

Secret tidak boleh commit ke repository.

application-example.yml:
- boleh berisi placeholder.

application-local.yml:
- WAJIB di-gitignore jika berisi secret lokal.

==================================================
33. REFRESH TOKEN
==================================================

Refresh token:
- memiliki expiry;
- harus dapat direvoke;
- tidak boleh berlaku selamanya;
- harus memiliki validasi user;
- harus dapat dinonaktifkan ketika logout jika menggunakan server-side persistence.

Jangan percaya claim JWT tanpa signature verification.

==================================================
34. FORGOT PASSWORD
==================================================

forgotPassword() WAJIB mengembalikan response generic.

Baik email:
- terdaftar;
- maupun tidak terdaftar;

harus menghasilkan response yang tidak membocorkan keberadaan account.

Tujuan:
mencegah user enumeration.

==================================================
35. RESET PASSWORD
==================================================

Reset password token:

- disimpan dalam bentuk SHA-256 hash di database;
- token mentah tidak disimpan;
- token hanya dapat digunakan sekali;
- memiliki expiry;
- expiry maksimal 30 menit;
- memiliki used flag/status.

Setelah berhasil digunakan:
- token harus invalid.

==================================================
36. REGISTRATION SECURITY
==================================================

Register endpoint TIDAK BOLEH menerima role dari client.

DILARANG:

{
  "email": "...",
  "password": "...",
  "role": "ADMIN"
}

Role default:

CUSTOMER

Role ADMIN hanya dapat dibuat melalui:
- seeder;
- mekanisme admin terproteksi;
- endpoint khusus yang membutuhkan authorization admin.

==================================================
37. AUTHORIZATION / RBAC
==================================================

Minimal terdapat 2 role dengan hak akses berbeda.

Minimum role:

CUSTOMER
ADMIN

Role lain dapat ditambahkan jika benar-benar dibutuhkan domain.

Setiap endpoint private harus memiliki authorization rule.

Gunakan:

@PreAuthorize

pada method level.

DILARANG hanya mengandalkan:

authorizeHttpRequests()

di SecurityConfig.

URL-level authorization dan method-level authorization dapat digunakan bersama.

==================================================
38. OWNERSHIP & IDOR PROTECTION
==================================================

Untuk resource milik user:

userId WAJIB berasal dari:

SecurityContextHolder

atau JWT principal.

DILARANG mengambil identity pemilik dari:
- request body;
- query parameter;
- path variable;

untuk operasi self-owned resource.

Contoh buruk:

DELETE /users/{userId}/orders/{orderId}

dengan userId dipercaya dari URL.

Service harus:
1. mendapatkan authenticated user;
2. mengambil resource;
3. memeriksa ownership;
4. baru melakukan mutation.

Tujuan:
mencegah IDOR.

==================================================
39. SECURITYCONFIG
==================================================

SecurityConfig harus mendefinisikan:

PUBLIC:
- register;
- login;
- forgot password;
- reset password;
- refresh token;
- API documentation jika memang dibuat public.

PRIVATE:
- resource user;
- order;
- cart;
- checkout;
- admin functionality;
- resource lainnya sesuai domain.

Jangan mengubah authorization pattern tanpa:
1. menjelaskan endpoint yang terdampak;
2. memastikan endpoint public/private tetap benar.

==================================================
40. CORS
==================================================

allowedOrigins WAJIB eksplisit.

DILARANG:

allowedOrigins("*")

jika:

allowCredentials=true

Frontend origin harus ditentukan secara eksplisit.

==================================================
41. FILE UPLOAD — BACKEND
==================================================

Backend WAJIB mendukung upload:

- gambar;
- PDF.

File upload harus memiliki:
- validasi content type;
- validasi extension;
- validasi ukuran;
- nama file aman;
- penyimpanan aman;
- response URL/path yang aman.

Jangan mempercayai extension dari client saja.

Jangan menggunakan nama file asli user sebagai nama file storage tanpa sanitization.

Jangan mengizinkan arbitrary executable file.

==================================================
42. FILE UPLOAD — FRONTEND
==================================================

Frontend harus menyediakan UI untuk upload file yang diperlukan.

Minimal:
- image upload;
- PDF upload.

Frontend harus:
- memvalidasi file type;
- memvalidasi ukuran;
- menampilkan error;
- menampilkan progress jika relevan;
- menangani upload failure.

Backend tetap menjadi sumber validasi final.

==================================================
43. API DOCUMENTATION
==================================================

WAJIB menggunakan salah satu:

- Swagger;
- OpenAPI;
- Postman Collection.

Dokumentasi harus dapat digunakan untuk menguji seluruh endpoint.

Dokumentasikan minimal:
- method;
- URL;
- request;
- response;
- authentication;
- authorization;
- validation;
- status code;
- error response.

Swagger/OpenAPI lebih disarankan karena dapat terintegrasi dengan backend.

==================================================
44. FRONTEND RESPONSIVE
==================================================

Frontend WAJIB responsive.

Minimal breakpoint:

Mobile:
<= 768px

Tablet:
769px – 1024px

Desktop:
> 1024px

Setiap halaman utama harus:
- menyesuaikan ukuran layar;
- tidak overflow;
- tidak rusak;
- dapat digunakan pada touch/mobile;
- memiliki layout yang usable.

Responsive harus diuji pada ketiga kategori.

==================================================
45. FRONTEND ROUTING
==================================================

WAJIB menggunakan Client-Side Routing.

Minimal:

PUBLIC ROUTE
PRIVATE ROUTE
ROLE-BASED ROUTE

Contoh:

/login
/register
/forgot-password
/reset-password
/dashboard
/products
/orders
/admin

User tanpa authentication:
- tidak boleh mengakses private route.

User tanpa permission:
- tidak boleh mengakses role route.

Unauthorized navigation harus diarahkan ke halaman yang sesuai.

==================================================
46. FRONTEND AUTHENTICATION FLOW
==================================================

Minimal flow:

Register
↓
Login
↓
Dashboard

WAJIB memiliki:

- Login
- Register
- Logout
- Forgot Password
- Reset Password
- Refresh token/session persistence

Setelah login berhasil:
- redirect ke Dashboard.

Ketika browser di-refresh:
- session harus tetap aktif selama token/session masih valid.

Logout:
- menghapus token;
- menghapus authentication state;
- membersihkan data authentication;
- mengarahkan user ke halaman public.

==================================================
47. TOKEN STORAGE
==================================================

Token dapat menggunakan:

- Local Storage
atau
- Cookie

sesuai arsitektur yang dipilih.

Jika menggunakan cookie:
- pertimbangkan HttpOnly;
- Secure;
- SameSite;
- CSRF protection sesuai arsitektur.

Jika menggunakan Local Storage:
- jangan menyimpan credential plaintext selain token yang memang dibutuhkan;
- pahami risiko XSS;
- pastikan XSS prevention diterapkan.

Jangan menyimpan password user.

==================================================
48. HTTP INTERCEPTOR
==================================================

Frontend WAJIB memiliki HTTP interceptor untuk kebutuhan authentication.

Interceptor dapat menangani:
- Authorization header;
- 401;
- refresh token;
- retry request yang sesuai;
- global error handling.

Jangan menduplikasi logic token pada setiap service.

==================================================
49. DASHBOARD
==================================================

Dashboard WAJIB mengambil data nyata dari backend.

DILARANG membuat dashboard statis menggunakan hardcoded data sebagai data utama.

Minimal berisi:

- Card Summary;
- Total Data;
- Statistik;
- Aktivitas terbaru.

Data dashboard harus berasal dari API/backend.

Jika backend gagal:
- frontend harus menampilkan fallback/error state;
- jangan diam-diam menampilkan data palsu sebagai data sebenarnya.

==================================================
50. CRUD INTERFACE
==================================================

Minimal terdapat 6 entitas utama.

SETIAP entitas utama WAJIB memiliki:

- List;
- Detail;
- Create;
- Edit;
- Delete.

Semua proses harus terhubung dengan API backend.

DILARANG membuat CRUD dummy yang hanya mengubah state frontend tanpa database.

Flow:

Frontend
↓
HTTP API
↓
Controller
↓
Service
↓
Repository
↓
PostgreSQL

==================================================
51. SEARCH UI
==================================================

Frontend list harus menyediakan search berdasarkan keyword untuk entitas yang relevan.

Search harus terhubung dengan API.

DILARANG melakukan filtering seluruh dataset hanya di frontend jika dataset berasal dari backend dan API telah mendukung server-side search.

==================================================
52. FILTER UI
==================================================

Frontend harus menyediakan filter sesuai domain.

Minimal mendukung konsep:

- status;
- kategori;
- tanggal.

Filter harus dikirim ke backend.

Search + filter + sorting + pagination harus dapat digunakan bersamaan.

==================================================
53. SORTING UI
==================================================

Frontend harus menyediakan:

- terbaru;
- terlama;
- A-Z;
- Z-A.

Sorting dikirim ke backend.

Jangan mengambil seluruh dataset kemudian melakukan sorting hanya di frontend untuk data production.

==================================================
54. PAGINATION UI
==================================================

List data WAJIB memiliki:

- Previous;
- Next;
- nomor halaman;
- informasi jumlah data;
- pilihan jumlah data per halaman.

Contoh:

Showing 11–20 of 125

Page:
1 2 3 4 5 ...

Page size:
10
20
50

==================================================
55. FORM VALIDATION — FRONTEND
==================================================

Semua form WAJIB memiliki validation.

Minimal:
- required;
- minimum character;
- maximum character;
- email;
- phone number;
- password;
- password confirmation.

Error harus muncul secara realtime sesuai interaction user.

Frontend validation bukan pengganti backend validation.

Backend tetap wajib memvalidasi ulang.

==================================================
56. TOAST NOTIFICATION
==================================================

Seluruh proses CRUD WAJIB memiliki notification.

Minimal:

SUCCESS
ERROR
WARNING
INFO

Gunakan Toast Notification.

Contoh:

Create berhasil
→ Success toast

Update gagal
→ Error toast

Delete membutuhkan perhatian
→ Warning toast

Informasi proses
→ Info toast

Jangan membuat notification system terpisah untuk setiap component.

Gunakan centralized notification service.

==================================================
57. FRONTEND ERROR PAGES
==================================================

Frontend WAJIB memiliki halaman:

401 Unauthorized
403 Forbidden
404 Not Found
500 Internal Server Error

Juga harus memiliki fallback ketika API gagal.

Contoh:
- backend down;
- timeout;
- network error;
- unexpected 500.

Jangan membiarkan halaman kosong ketika API gagal.

==================================================
58. ERROR UX
==================================================

Error kepada user harus:
- jelas;
- singkat;
- tidak menampilkan stacktrace;
- tidak menampilkan SQL;
- tidak menampilkan secret;
- tidak menampilkan internal exception.

Contoh:

"Terjadi kesalahan pada server. Silakan coba lagi."

bukan:

"org.postgresql.util.PSQLException: ERROR..."

==================================================
59. FRONTEND STATE MANAGEMENT
==================================================

Jangan menyimpan state global secara berlebihan.

Gunakan state lokal untuk state yang hanya dibutuhkan component.

Gunakan centralized state/service jika state digunakan lintas halaman atau fitur.

Authentication state harus centralized.

Jangan membuat duplicated authentication state di banyak component.

==================================================
60. API FAILURE HANDLING
==================================================

Setiap request penting harus mempertimbangkan:

- loading;
- success;
- empty;
- error.

Jangan mengasumsikan API selalu berhasil.

Minimal UI state:

Loading
Success
Empty
Error

==================================================
61. DATA ACCESS
==================================================

Backend harus selalu menggunakan repository/database untuk read/write data.

DILARANG membuat dummy data di service sebagai pengganti database.

DILARANG:

return List.of(
    ...
);

sebagai pengganti query database production.

Seed data hanya digunakan untuk initial database state/testing.

==================================================
62. SEED DATA
==================================================

Setiap tabel utama minimal memiliki 20 data realistis.

Seed harus:
- konsisten dengan foreign key;
- tidak melanggar unique constraint;
- memiliki relasi valid;
- dapat digunakan untuk testing;
- tidak menggunakan placeholder buruk seperti test1/test2.

Pastikan urutan seed mengikuti dependency foreign key.

==================================================
63. MIGRATION
==================================================

Gunakan Flyway.

Migration harus:
- immutable setelah digunakan pada environment;
- memiliki naming konsisten;
- tidak diedit sembarangan setelah applied;
- memiliki perubahan schema yang jelas.

Contoh:

V1__create_users.sql
V2__create_products.sql
V3__create_orders.sql

DILARANG menggunakan:

ddl-auto=update

Migration pertama harus mencakup schema dasar sesuai database design yang telah disetujui.

==================================================
64. MIGRATION APPROVAL
==================================================

Sebelum migration schema utama dibuat, agent WAJIB menampilkan:

1. Daftar tabel.
2. Primary key.
3. Foreign key.
4. Relasi.
5. Cardinality.
6. Soft delete table.
7. Timestamp.
8. Index penting.
9. Alasan desain.
10. Verifikasi 3NF.

Jangan membuat migration jika requirement:
- minimal 6 tabel;
- minimal 5 relasi;
- 1:1;
- 1:N;
- N:1;
- N:M;

belum terpenuhi.

Setelah design disetujui, agent boleh membuat migration sesuai design.

==================================================
65. INDEXING
==================================================

Tambahkan index untuk field yang memang sering digunakan untuk:

- lookup;
- foreign key;
- filtering;
- sorting;
- unique constraint.

Jangan membuat index secara membabi buta.

Setiap index harus memiliki alasan penggunaan.

==================================================
66. DATABASE CONSTRAINT
==================================================

Business invariant penting harus dijaga oleh database jika memungkinkan.

Contoh:
- UNIQUE email;
- FK;
- NOT NULL;
- CHECK constraint bila relevan.

Jangan hanya mengandalkan validation application untuk invariant yang juga dapat dijaga database.

==================================================
67. RACE CONDITION
==================================================

Jangan berasumsi validation application cukup untuk mencegah duplicate data.

Contoh:

if (!exists(email)) {
    save(user);
}

Tidak cukup karena dua request dapat melakukan check bersamaan.

Tetap gunakan:
- database unique constraint;
- exception handling;
- transaction/locking sesuai kebutuhan.

DataIntegrityViolationException untuk race condition harus ditangani sebagai 409 jika sesuai kasus.

==================================================
68. SECURITY CHECKLIST
==================================================

Sebelum fitur dianggap selesai, periksa:

[ ] Password di-hash.
[ ] JWT signature diverifikasi.
[ ] JWT secret tidak hardcode.
[ ] DB password tidak hardcode.
[ ] Request menggunakan DTO.
[ ] Tidak ada mass assignment.
[ ] Ownership dicek.
[ ] @PreAuthorize diterapkan.
[ ] CORS eksplisit.
[ ] Validation aktif.
[ ] SQL parameterized.
[ ] Tidak ada stacktrace ke client.
[ ] Tidak ada secret di response.
[ ] Tidak ada user enumeration.
[ ] Password reset token di-hash.
[ ] Password reset token expiry.
[ ] Password reset token single-use.
[ ] Role tidak berasal dari register request.
[ ] File upload divalidasi.
[ ] IDOR dicegah.

==================================================
69. API SECURITY
==================================================

Jangan percaya:
- userId dari body;
- role dari body;
- ownership dari body;
- permission dari client.

Client adalah untrusted input.

Semua keputusan authorization harus dibuat backend.

Frontend route guard hanya UX/security assistance.

Frontend route guard BUKAN pengganti backend authorization.

==================================================
70. SQL INJECTION
==================================================

Gunakan:
- Spring Data JPA;
- parameter binding;
- Specification;
- safe query construction.

DILARANG melakukan concatenation user input ke raw SQL.

Contoh buruk:

"SELECT * FROM products WHERE name = '" + search + "'"

==================================================
71. API RESPONSE SECURITY
==================================================

Jangan mengembalikan Entity langsung jika Entity mengandung field sensitif.

Contoh field yang tidak boleh keluar:

- password;
- password hash;
- reset token hash;
- refresh token jika tidak diperlukan;
- internal security data.

Gunakan Response DTO.

==================================================
72. TESTING
==================================================

Backend minimal memiliki test untuk:

- service business logic;
- validation;
- authentication;
- authorization;
- CRUD;
- exception handling;
- critical concurrency logic.

Critical flow yang wajib diuji:

- register;
- login;
- invalid login;
- authorization;
- CRUD;
- ownership;
- duplicate data;
- validation;
- not found;
- stock/concurrency jika ada;
- checkout jika ada.

==================================================
73. API TESTING
==================================================

Semua endpoint harus dapat diuji menggunakan:

Swagger/OpenAPI
atau
Postman Collection.

Test harus mencakup:

- success;
- validation error;
- unauthorized;
- forbidden;
- not found;
- conflict;
- server error jika dapat direproduksi.

==================================================
74. FRONTEND TESTING / VERIFICATION
==================================================

Minimal verifikasi:

- responsive mobile;
- responsive tablet;
- responsive desktop;
- login;
- register;
- logout;
- forgot password;
- reset password;
- private route;
- role route;
- CRUD;
- search;
- filter;
- sorting;
- pagination;
- upload;
- validation;
- toast;
- 401;
- 403;
- 404;
- 500;
- API failure fallback.

==================================================
75. DEFINITION OF DONE — BACKEND ENDPOINT
==================================================

Sebelum endpoint dinyatakan selesai:

[ ] REST method benar.
[ ] HTTP status benar.
[ ] Response menggunakan ApiResponse<T>.
[ ] Error ditangani GlobalExceptionHandler.
[ ] Request menggunakan DTO.
[ ] @Valid diterapkan.
[ ] Validation lengkap.
[ ] Authentication benar.
[ ] Authorization benar.
[ ] @PreAuthorize sesuai.
[ ] Ownership dicek jika diperlukan.
[ ] Tidak ada IDOR.
[ ] Query list menggunakan Pageable.
[ ] Search tersedia jika relevan.
[ ] Filter tersedia jika relevan.
[ ] Sorting tersedia jika relevan.
[ ] FetchType LAZY.
[ ] Transaction boundary benar.
[ ] Locking ditangani jika shared state berubah.
[ ] Tidak ada dummy data.
[ ] Tidak leak informasi sensitif.
[ ] Endpoint terdokumentasi.
[ ] Endpoint sudah diuji.

Jika salah satu requirement wajib belum terpenuhi:
ENDPOINT BELUM SELESAI.

==================================================
76. DEFINITION OF DONE — FRONTEND FEATURE
==================================================

Sebelum fitur frontend dinyatakan selesai:

[ ] Responsive mobile.
[ ] Responsive tablet.
[ ] Responsive desktop.
[ ] Terhubung ke backend.
[ ] Loading state.
[ ] Success state.
[ ] Empty state.
[ ] Error state.
[ ] Validation.
[ ] Realtime validation jika form.
[ ] Toast notification jika CRUD.
[ ] Authentication sesuai kebutuhan.
[ ] Authorization sesuai role.
[ ] API error ditangani.
[ ] Tidak ada hardcoded production data.
[ ] Tidak ada duplicate business logic.
[ ] Routing benar.

==================================================
77. DEFINITION OF DONE — ENTITY
==================================================

Sebelum entity dinyatakan selesai:

[ ] UUID primary key.
[ ] BaseEntity.
[ ] createdAt.
[ ] updatedAt.
[ ] Enum menggunakan STRING.
[ ] Relationship benar.
[ ] FetchType LAZY.
[ ] Foreign key benar.
[ ] Soft delete jika termasuk 2+ tabel required.
[ ] BigDecimal untuk currency.
[ ] Tidak ada sensitive field yang bocor.
[ ] Migration tersedia.
[ ] Seed tersedia.
[ ] Repository tersedia.
[ ] Service tersedia.
[ ] DTO tersedia.
[ ] Mapper tersedia.
[ ] Controller tersedia jika entity memang API resource.
[ ] CRUD selesai.

==================================================
78. DEFINITION OF DONE — DATABASE
==================================================

Sebelum database dinyatakan selesai:

[ ] Minimal 6 tabel utama.
[ ] Minimal 5 relasi.
[ ] 1:1 tersedia.
[ ] 1:N tersedia.
[ ] N:1 tersedia.
[ ] N:M tersedia.
[ ] PK tersedia.
[ ] FK tersedia.
[ ] 3NF.
[ ] created_at setiap tabel utama.
[ ] updated_at setiap tabel utama.
[ ] Minimal 2 soft delete.
[ ] Minimal 20 seed data setiap tabel utama.
[ ] Unique constraints benar.
[ ] Index relevan.
[ ] Migration menggunakan Flyway.
[ ] Tidak menggunakan ddl-auto=update.

==================================================
79. FINAL FRONTEND REQUIREMENT AUDIT
==================================================

Sebelum project dianggap selesai, pastikan:

[ ] Responsive mobile <=768px.
[ ] Responsive tablet 769-1024px.
[ ] Responsive desktop >1024px.

[ ] Login.
[ ] Register.
[ ] Logout.
[ ] Forgot Password.
[ ] Reset Password.
[ ] Refresh token/session persistence.

[ ] Public route.
[ ] Private route.
[ ] Role route.
[ ] Unauthorized redirect.

[ ] Dashboard.
[ ] Card Summary.
[ ] Total Data.
[ ] Statistik.
[ ] Aktivitas terbaru.
[ ] Data dashboard berasal dari backend.

[ ] CRUD list.
[ ] CRUD detail.
[ ] CRUD create.
[ ] CRUD edit.
[ ] CRUD delete.

[ ] Search.
[ ] Filter status.
[ ] Filter kategori.
[ ] Filter tanggal.
[ ] Sorting terbaru.
[ ] Sorting terlama.
[ ] Sorting A-Z.
[ ] Sorting Z-A.

[ ] Pagination previous.
[ ] Pagination next.
[ ] Nomor halaman.
[ ] Jumlah data.
[ ] Page size.

[ ] Image upload.
[ ] PDF upload.

[ ] Form validation.
[ ] Required.
[ ] Minimum.
[ ] Maximum.
[ ] Email.
[ ] Phone.
[ ] Password confirmation.
[ ] Realtime validation.

[ ] Success toast.
[ ] Error toast.
[ ] Warning toast.
[ ] Info toast.

[ ] 401 page.
[ ] 403 page.
[ ] 404 page.
[ ] 500 page.
[ ] API failure fallback.

==================================================
80. FINAL BACKEND REQUIREMENT AUDIT
==================================================

[ ] REST API.
[ ] GET.
[ ] POST.
[ ] PUT.
[ ] PATCH.
[ ] DELETE.

[ ] Register.
[ ] Login.
[ ] Logout.
[ ] Refresh token.
[ ] Forgot password.
[ ] Reset password.

[ ] Minimal 2 role.
[ ] Role permissions berbeda.
[ ] @PreAuthorize.

[ ] Minimal 6 entitas utama.
[ ] CRUD lengkap setiap entitas.
[ ] Tidak ada dummy CRUD.

[ ] Server-side validation.
[ ] Required.
[ ] Email.
[ ] Unique.
[ ] Minimum.
[ ] Maximum.
[ ] Enum.
[ ] Numeric.
[ ] Date.

[ ] Image upload.
[ ] PDF upload.

[ ] 400.
[ ] 401.
[ ] 403.
[ ] 404.
[ ] 422.
[ ] 500.

[ ] JSON response konsisten.
[ ] ApiResponse<T>.
[ ] GlobalExceptionHandler.

[ ] 6+ tabel.
[ ] 5+ relasi.
[ ] 1:1.
[ ] 1:N.
[ ] N:1.
[ ] N:M.

[ ] Soft delete 2+ tabel.

[ ] Swagger/OpenAPI/Postman.
[ ] Search.
[ ] Filter.
[ ] Sorting.
[ ] Pagination.

==================================================
81. FINAL DATABASE REQUIREMENT AUDIT
==================================================

[ ] Minimal 6 tabel utama.
[ ] Minimal 5 relasi.
[ ] Primary key.
[ ] Foreign key.
[ ] Normalisasi 3NF.
[ ] created_at.
[ ] updated_at.
[ ] 2+ soft delete.
[ ] 20+ seed data per tabel utama.

==================================================
82. DOCUMENTATION REQUIREMENTS
==================================================

Project WAJIB memiliki README.md.

README minimal berisi:

1. Judul aplikasi.
2. Deskripsi singkat aplikasi.
3. Fitur utama.
4. Teknologi yang digunakan.
5. Struktur folder proyek.
6. Cara instalasi.
7. Cara menjalankan backend.
8. Cara menjalankan frontend.
9. Database setup.
10. Environment variables.
11. API documentation.
12. Demo account jika diperlukan.

==================================================
83. FLOWCHART
==================================================

Project WAJIB memiliki dokumentasi perancangan sistem berupa Flowchart.

Minimal dokumentasikan flow penting seperti:

- authentication;
- registration;
- login;
- checkout;
- CRUD utama;
- proses bisnis utama lainnya.

Flowchart harus disimpan di:

docs/flowchart/

Jangan membuat flowchart yang tidak sesuai dengan implementasi aktual.

==================================================
84. ARCHITECTURE DOCUMENTATION
==================================================

Dokumentasikan minimal:

- system architecture;
- frontend/backend communication;
- authentication flow;
- database relationship;
- major business flow.

Simpan di:

docs/architecture/
docs/database/

==================================================
85. ENVIRONMENT CONFIGURATION
==================================================

Secret harus menggunakan environment variable.

Minimal:

DB_URL
DB_USERNAME
DB_PASSWORD
JWT_SECRET

Jangan commit:

- password;
- JWT secret;
- API secret;
- private key;
- credential.

Sediakan:

application-example.yml

sebagai template.

File local secret harus berada di .gitignore.

==================================================
86. GIT RULES
==================================================

Jangan commit:

- .env;
- application-local.yml;
- password;
- JWT secret;
- credential;
- private key;
- generated binary besar;
- node_modules;
- target;
- IDE metadata yang tidak diperlukan.

Commit harus memiliki tujuan jelas.

Jangan melakukan commit besar yang mencampur:
- feature;
- refactor;
- database migration;
- unrelated formatting;

tanpa alasan.

==================================================
87. DEPENDENCY MANAGEMENT
==================================================

Jangan menambahkan dependency hanya karena "mungkin berguna".

Sebelum menambahkan dependency:
1. Pastikan kebutuhan.
2. Periksa apakah Spring/Angular sudah menyediakan capability tersebut.
3. Pertimbangkan maintenance.
4. Pertimbangkan security.
5. Pertimbangkan ukuran dependency.
6. Pastikan kompatibel dengan stack.

==================================================
88. CODE QUALITY
==================================================

Prioritaskan:

Correctness
>
Security
>
Maintainability
>
Testability
>
Performance
>
Convenience

Hindari:
- clever code;
- premature abstraction;
- giant service;
- giant controller;
- duplicated business logic;
- magic number;
- magic string;
- unnecessary inheritance;
- unnecessary generic abstraction.

Gunakan naming yang jelas.

==================================================
89. PERFORMANCE
==================================================

Perhatikan:

- N+1 query;
- unnecessary EAGER;
- unbounded list query;
- missing pagination;
- excessive API request;
- unnecessary frontend rendering;
- duplicate API call;
- inefficient search;
- missing database index.

Jangan melakukan optimization tanpa memahami bottleneck.

==================================================
90. LOGGING
==================================================

Log harus membantu debugging tanpa membocorkan secret.

DILARANG log:
- password;
- JWT secret;
- refresh token mentah;
- reset token mentah;
- sensitive personal information secara berlebihan.

Error server:
- log exception;
- sertakan context yang relevan;
- jangan expose detail internal kepada client.

==================================================
91. BUSINESS LOGIC LOCATION
==================================================

Business logic harus berada di service/domain layer.

DILARANG menaruh business rule utama di:
- Controller;
- DTO;
- Angular component;
- repository query semata jika rule lebih kompleks.

Frontend boleh melakukan UX validation.

Backend tetap authoritative.

==================================================
92. FRONTEND/BACKEND CONTRACT
==================================================

Frontend harus mengikuti API contract backend.

Jangan membuat frontend berdasarkan asumsi response.

Gunakan response:

ApiResponse<T>

secara konsisten.

Jika API berubah:
1. Update contract.
2. Update backend.
3. Update frontend.
4. Update documentation.
5. Test integration.

==================================================
93. NO HARDCODED BUSINESS DATA
==================================================

DILARANG hardcode:

- product list;
- order list;
- user list;
- dashboard statistics;
- stock;
- category;

sebagai pengganti backend.

Static data hanya diperbolehkan untuk:
- UI configuration;
- labels;
- constant options;
- static presentation data yang memang bukan database data.

==================================================
94. NO SILENT ARCHITECTURE CHANGE
==================================================

Agent tidak boleh mengubah:

- database structure;
- authentication architecture;
- authorization architecture;
- API response contract;
- frontend framework;
- folder architecture;

secara diam-diam.

Jika perubahan diperlukan:
1. Jelaskan masalah.
2. Jelaskan solusi.
3. Jelaskan impact.
4. Minta persetujuan jika perubahan memengaruhi requirement.

==================================================
95. DO NOT OVERENGINEER
==================================================

Requirement kampus harus dipenuhi dengan implementasi yang masuk akal.

Jangan menambahkan:
- microservices;
- Kafka;
- Kubernetes;
- distributed tracing;
- complex event architecture;

jika tidak dibutuhkan oleh scope project.

Project adalah capstone S1, bukan production distributed system skala besar.

Prioritaskan:
- correctness;
- completeness;
- clarity;
- security;
- maintainability.

==================================================
96. FINAL PROJECT ACCEPTANCE CRITERIA
==================================================

Project hanya dapat dianggap FINAL jika seluruh kategori berikut memenuhi requirement:

DATABASE
[ ] 6+ tabel
[ ] 5+ relasi
[ ] 1:1
[ ] 1:N
[ ] N:1
[ ] N:M
[ ] 3NF
[ ] PK/FK
[ ] timestamp
[ ] soft delete 2+
[ ] 20 seed/tabel

BACKEND
[ ] REST API
[ ] CRUD 6+ entity
[ ] Authentication
[ ] Authorization
[ ] RBAC
[ ] Validation
[ ] Global error handling
[ ] ApiResponse
[ ] Search
[ ] Filter
[ ] Sorting
[ ] Pagination
[ ] Upload
[ ] API documentation
[ ] Security

FRONTEND
[ ] Responsive
[ ] Authentication flow
[ ] Routing
[ ] Dashboard
[ ] CRUD
[ ] Search
[ ] Filter
[ ] Sorting
[ ] Pagination
[ ] Upload
[ ] Validation realtime
[ ] Toast notification
[ ] Error pages
[ ] API fallback

DOCUMENTATION
[ ] README
[ ] Flowchart
[ ] Architecture documentation
[ ] Database documentation
[ ] API documentation

REPOSITORY
[ ] Monorepo
[ ] Frontend + backend satu repository
[ ] Public GitHub
[ ] Secrets tidak committed
[ ] .gitignore benar

==================================================
97. FINAL AUDIT PROCEDURE
==================================================

Sebelum menyatakan project selesai, agent WAJIB melakukan audit dalam urutan:

STEP 1
Periksa requirement kampus.

STEP 2
Periksa AGENTS.md.

STEP 3
Periksa database.

STEP 4
Periksa seluruh endpoint.

STEP 5
Periksa authentication.

STEP 6
Periksa authorization.

STEP 7
Periksa frontend routing.

STEP 8
Periksa seluruh CRUD.

STEP 9
Periksa search/filter/sorting/pagination.

STEP 10
Periksa upload.

STEP 11
Periksa validation.

STEP 12
Periksa notification.

STEP 13
Periksa error handling.

STEP 14
Periksa API documentation.

STEP 15
Periksa README.

STEP 16
Periksa Flowchart.

STEP 17
Periksa seed data.

STEP 18
Periksa responsive UI.

STEP 19
Jalankan test.

STEP 20
Lakukan final compliance report.

==================================================
98. FINAL COMPLIANCE REPORT
==================================================

Setelah audit, agent WAJIB menghasilkan laporan:

## Requirement Compliance

| Category | Requirement | Status | Evidence |
|---|---|---|---|
| Database | 6+ tables | PASS/FAIL | ... |
| Database | 5+ relationships | PASS/FAIL | ... |
| Database | 3NF | PASS/FAIL | ... |
| Database | Soft delete | PASS/FAIL | ... |
| Backend | REST API | PASS/FAIL | ... |
| Backend | CRUD | PASS/FAIL | ... |
| Backend | Authentication | PASS/FAIL | ... |
| Backend | RBAC | PASS/FAIL | ... |
| Backend | Validation | PASS/FAIL | ... |
| Backend | Error handling | PASS/FAIL | ... |
| Backend | Upload | PASS/FAIL | ... |
| Backend | Search/filter/sort/page | PASS/FAIL | ... |
| Frontend | Responsive | PASS/FAIL | ... |
| Frontend | Authentication flow | PASS/FAIL | ... |
| Frontend | Routing | PASS/FAIL | ... |
| Frontend | Dashboard | PASS/FAIL | ... |
| Frontend | CRUD | PASS/FAIL | ... |
| Frontend | Upload | PASS/FAIL | ... |
| Frontend | Validation | PASS/FAIL | ... |
| Frontend | Toast | PASS/FAIL | ... |
| Frontend | Error pages | PASS/FAIL | ... |
| Documentation | README | PASS/FAIL | ... |
| Documentation | Flowchart | PASS/FAIL | ... |
| Documentation | API docs | PASS/FAIL | ... |
| Repository | Monorepo | PASS/FAIL | ... |

Jangan menyatakan project COMPLETE jika ada requirement wajib yang FAIL.

==================================================
99. CRITICAL RULE
==================================================

Jika requirement wajib belum terpenuhi:

JANGAN:
- menganggapnya selesai;
- menyembunyikan kekurangan;
- mengganti requirement;
- membuat workaround palsu;
- menggunakan dummy data untuk menutupi fitur;
- menghapus requirement.

WAJIB:
- menyebutkan requirement yang belum terpenuhi;
- menjelaskan penyebab;
- memberikan solusi;
- memperbaiki jika agent memiliki otoritas untuk memperbaikinya;
- melakukan audit ulang setelah perbaikan.

==================================================
100. PRINCIPLE
==================================================

Build the simplest system that fully satisfies the requirements.

Jangan membuat sistem lebih kompleks dari kebutuhan.

Namun jangan mengorbankan:
- security;
- correctness;
- data integrity;
- maintainability;
- requirement compliance.

Requirement kampus adalah baseline.

AGENTS.md adalah engineering contract.

Tidak ada fitur yang dianggap selesai hanya karena "kode sudah dibuat".

Fitur selesai berarti:
IMPLEMENTED
+
INTEGRATED
+
VALIDATED
+
TESTED
+
DOCUMENTED
+
COMPLIANT

==================================================
END OF AGENTS.md
==================================================