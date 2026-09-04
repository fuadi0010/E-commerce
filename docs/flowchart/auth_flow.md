# 🔄 Flowchart: Authentication & Authorization Flow

Dokumentasi diagram alur autentikasi dan otorisasi menggunakan Spring Security + JWT Stateless sesuai Rule 83.

## 1. Flowchart Registrasi User
```mermaid
sequenceDiagram
    autonumber
    actor Client as Frontend (Angular)
    participant API as AuthController (/api/auth/register)
    participant Service as AuthServiceImpl
    participant DB as PostgreSQL (users, user_profiles)

    Client->>API: POST /api/auth/register (email, password, fullName)
    API->>API: Validasi Input (@Valid, @Pattern, @Email)
    alt Validasi Gagal
        API-->>Client: 422 Unprocessable Entity (errors map)
    else Validasi Berhasil
        API->>Service: register(request)
        Service->>DB: Cek duplikasi email (deleted_at IS NULL)
        alt Email Sudah Terdaftar
            Service-->>API: DuplicateResourceException
            API-->>Client: 409 Conflict ("Email sudah terdaftar")
        else Email Tersedia
            Service->>Service: BCrypt Hash Password (strength=12)
            Service->>DB: Simpan UserEntity (Role: ROLE_CUSTOMER)
            Service->>DB: Simpan UserProfileEntity
            Service-->>API: Success
            API-->>Client: 201 Created ("Registrasi berhasil")
        end
    end
```

---

## 2. Flowchart Login & Token Issuance
```mermaid
sequenceDiagram
    autonumber
    actor Client as Frontend (Angular)
    participant API as AuthController (/api/auth/login)
    participant Sec as AuthenticationManager
    participant JWT as JwtUtils
    participant DB as PostgreSQL

    Client->>API: POST /api/auth/login (email, password)
    API->>Sec: authenticate(UsernamePasswordAuthenticationToken)
    alt Kredensial Salah
        Sec-->>API: BadCredentialsException
        API-->>Client: 401 Unauthorized ("Email atau password salah")
    else Kredensial Benar
        Sec-->>API: Authentication Object (UserDetailsImpl)
        API->>JWT: generateJwtToken(authentication)
        JWT-->>API: Access Token (HS256, exp: 24h)
        API->>DB: Simpan Refresh Token (UUID, exp: 24h)
        API-->>Client: 200 OK (accessToken, refreshToken, user info, roles)
        Client->>Client: Simpan token di TokenService (localStorage)
        Client->>Client: Redirect ke /dashboard
    end
```

---

## 3. Flowchart JWT Interception & Refresh Token
```mermaid
sequenceDiagram
    autonumber
    actor Client as Angular App
    participant Interceptor as JwtInterceptor
    participant API as Backend API
    participant Auth as AuthController (/api/auth/refresh-token)

    Client->>Interceptor: Request Protected Endpoint (/api/orders/my-orders)
    Interceptor->>Interceptor: Inject Header: "Authorization: Bearer <token>"
    Interceptor->>API: Forward Request
    alt Token Valid
        API-->>Interceptor: 200 OK (Data)
        Interceptor-->>Client: Return Data
    else Token Expired (401)
        API-->>Interceptor: 401 Unauthorized
        Interceptor->>Auth: POST /api/auth/refresh-token (refreshToken)
        alt Refresh Token Valid
            Auth-->>Interceptor: 200 OK (New Access Token, New Refresh Token)
            Interceptor->>Interceptor: Simpan token baru
            Interceptor->>API: Retry original request dengan Token Baru
            API-->>Interceptor: 200 OK (Data)
            Interceptor-->>Client: Return Data
        else Refresh Token Expired / Invalid
            Auth-->>Interceptor: 401 / 400
            Interceptor->>Client: Clear Session & Redirect ke /login (returnUrl)
        end
    end
```
