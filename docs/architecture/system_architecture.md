# 🏛️ Dokumentasi Arsitektur Sistem

## 1. Diagram Arsitektur Keseluruhan
```mermaid
graph TB
    subgraph Client Layer
        SPA["Frontend SPA (Angular 18+)\n- Tailwind CSS\n- Reactive Forms\n- Signals & Observables\n- HTTP Interceptors"]
    end

    subgraph API Gateway / Security
        SEC["Spring Security Filter Chain\n- JwtAuthenticationFilter\n- CORS Configuration\n- BCrypt (Strength 12)\n- Role-based Access Control (@PreAuthorize)"]
    end

    subgraph Backend Layer (Spring Boot 3.3)
        direction TB
        CTRL["Controller Layer\n(REST API Endpoints, ApiResponse<T>)"]
        MAP["Mapper Layer\n(Entity ⇄ DTO Mapping)"]
        SVC["Service Layer\n(Business Logic, Transaction Management)"]
        REPO["Repository Layer\n(Spring Data JPA, Lock Mode, Specifications)"]
        EXC["Global Exception Handler\n(@RestControllerAdvice)"]
    end

    subgraph Persistence Layer
        DB[("PostgreSQL 16\n- 3NF Normalized\n- UUID Primary Keys\n- Flyway Migrations\n- Soft Deletes\n- Row Locks")]
    end

    SPA <-->|HTTPS / JSON REST API| SEC
    SEC <--> CTRL
    CTRL <--> MAP
    CTRL <--> SVC
    SVC <--> REPO
    REPO <--> DB
    CTRL -.-> EXC
    SVC -.-> EXC
```

## 2. Prinsip Rekayasa Perangkat Lunak:
1. **Separation of Concerns (SoC)**: Pemisahan yang ketat antara Controller (thin), Service (business logic), Mapper (data transformation), dan Repository (persistence).
2. **Stateless Security**: Backend tidak menyimpan sesi di memori server. Autentikasi berbasis JWT token dengan refresh token rotation di database.
3. **IDOR Prevention**: Identitas pengguna diambil langsung dari `SecurityContextHolder` yang diverifikasi dari JWT, bukan dari parameter URL client.
4. **Resilience & Locking**: Penggunaan Pessimistic Write Lock pada saat checkout dan Optimistic Lock `@Version` pada stok produk.
