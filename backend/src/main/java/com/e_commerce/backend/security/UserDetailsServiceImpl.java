package com.e_commerce.backend.security;

import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;

import com.e_commerce.backend.feature_user.Model.UserEntity;
import com.e_commerce.backend.feature_user.repository.UserRepository;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class UserDetailsServiceImpl implements UserDetailsService{
    private final UserRepository userRepository;

    // PR REVIEW: Spring Security memanggil fungsi ini secara otomatis saat ada request login
    @Override
    public UserDetails loadUserByUsername(String email) throws UsernameNotFoundException {
        
        // 1. Mencari entitas User berdasarkan email. 
        // Wajib menggunakan metode yang memvalidasi deleted_at IS NULL.
        UserEntity user = userRepository.findByEmailAndDeletedAtIsNull(email)
                .orElseThrow(() -> new UsernameNotFoundException("Kredensial tidak valid: " + email));

        // 2. Membungkus entitas User ke dalam Adapter UserDetailsImpl
        return new UserDetailsImpl(user);
    }
}
