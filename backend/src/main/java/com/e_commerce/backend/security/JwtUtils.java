package com.e_commerce.backend.security;

import java.security.Key;
import java.util.Date;

import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.SignatureAlgorithm;
import io.jsonwebtoken.io.Decoders;
import io.jsonwebtoken.security.Keys;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.core.Authentication;
import org.springframework.stereotype.Component;
import io.jsonwebtoken.ExpiredJwtException;
import io.jsonwebtoken.MalformedJwtException;
import io.jsonwebtoken.UnsupportedJwtException;
import io.jsonwebtoken.security.SecurityException;

@Slf4j
@Component
public class JwtUtils {
    @Value("${app.jwt.secret}")
    private String jwtSecret;

    @Value("${app.jwt.expirationMs}")
    private int jwtExpirationMs;

    // 1. Membuat Token saat User berhasil Login
    public String generateJwtToken(Authentication authentication) {
        // Mengambil data UserDetailsImpl yang sudah kita buat sebelumnya
        UserDetailsImpl userPrincipal = (UserDetailsImpl) authentication.getPrincipal();
        java.util.List<String> roles = userPrincipal.getAuthorities().stream()
                .map(org.springframework.security.core.GrantedAuthority::getAuthority)
                .collect(java.util.stream.Collectors.toList());

        return Jwts.builder()
                .setSubject(userPrincipal.getUsername()) // Isi token dengan email user
                .claim("roles", roles) // Menyertakan role user (misal: ROLE_ADMIN, ROLE_CUSTOMER)
                .setIssuedAt(new Date()) // Waktu token dibuat
                .setExpiration(new Date((new Date()).getTime() + jwtExpirationMs)) // Waktu kedaluwarsa
                .signWith(key(), SignatureAlgorithm.HS256) // Stempel kriptografi (Tanda Tangan)
                .compact();
    }

    public String generateJwtTokenFromEmail(String email, java.util.List<String> roles) {
        return Jwts.builder()
                .setSubject(email)
                .claim("roles", roles)
                .setIssuedAt(new Date())
                .setExpiration(new Date((new Date()).getTime() + jwtExpirationMs))
                .signWith(key(), SignatureAlgorithm.HS256)
                .compact();
    }

    public String generateJwtTokenFromEmail(String email) {
        return generateJwtTokenFromEmail(email, java.util.Collections.emptyList());
    }

    // 2. Mengekstrak identitas (Email) dari Token
    public String getUserNameFromJwtToken(String token) {
        return Jwts.parserBuilder()
                .setSigningKey(key())
                .build()
                .parseClaimsJws(token)
                .getBody()
                .getSubject();
    }

    // 3. Memvalidasi keaslian dan masa berlaku Token
    public boolean validateJwtToken(String authToken) {
        try {
            Jwts.parserBuilder().setSigningKey(key()).build().parseClaimsJws(authToken);
            return true;
        } catch (SecurityException | MalformedJwtException e) {
            log.error("Invalid JWT signature/token: {}", e.getMessage());
        } catch (ExpiredJwtException e) {
            log.error("JWT token is expired: {}", e.getMessage());
        } catch (UnsupportedJwtException e) {
            log.error("JWT token is unsupported: {}", e.getMessage());
        } catch (IllegalArgumentException e) {
            log.error("JWT claims string is empty: {}", e.getMessage());
        }
        return false;
    }

    // Mengubah String kunci rahasia menjadi objek Key kriptografi
    private Key key() {
        try {
            return Keys.hmacShaKeyFor(Decoders.BASE64.decode(jwtSecret));
        } catch (Exception e) {
            return Keys.hmacShaKeyFor(jwtSecret.getBytes(java.nio.charset.StandardCharsets.UTF_8));
        }
    }
}
