package com.e_commerce.backend.security;

import java.util.Collection;
import java.util.stream.Collectors;
import java.util.UUID;

import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;

import com.e_commerce.backend.feature_user.Model.UserEntity;

import lombok.AllArgsConstructor;

@AllArgsConstructor
public class UserDetailsImpl implements UserDetails{
    // PR REVIEW: Membungkus entitas User asli (Composition over Inheritance)
    private final UserEntity user;

    @Override
    public Collection<? extends GrantedAuthority> getAuthorities() {
        // Menerjemahkan Entitas Role (misal: "ROLE_CUSTOMER") menjadi GrantedAuthority 
        // yang dipahami oleh mesin Spring Security.
        return user.getRoles().stream()
                .map(role -> new SimpleGrantedAuthority(role.getName()))
                .collect(Collectors.toList());
    }

    @Override
    public String getPassword() {
        return user.getPassword_hash();
    }

    @Override
    public String getUsername() {
        // Di sistem kita, Email bertindak sebagai username untuk proses otentikasi
        return user.getEmail(); 
    }

    @Override
    public boolean isAccountNonExpired() {
        return true;
    }

    @Override
    public boolean isAccountNonLocked() {
        return true;
    }

    @Override
    public boolean isCredentialsNonExpired() {
        return true;
    }

    @Override
    public boolean isEnabled() {
        // Karena kita menggunakan Soft Delete (deleted_at IS NULL di repository), 
        // semua data yang sampai ke kelas ini diasumsikan aktif (true).
        return true; 
    }

    // Getter tambahan agar kita bisa mengekstrak ID User kapan saja dari sesi Security
    public UUID getId() {
        return user.getId();
    }
}
