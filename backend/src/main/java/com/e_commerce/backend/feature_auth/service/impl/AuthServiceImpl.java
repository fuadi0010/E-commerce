package com.e_commerce.backend.feature_auth.service.impl;

import java.time.ZonedDateTime;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.e_commerce.backend.feature_auth.dto.request.LoginRequest;
import com.e_commerce.backend.feature_auth.dto.request.RegisterRequest;
import com.e_commerce.backend.feature_auth.dto.request.ResetPasswordRequest;
import com.e_commerce.backend.feature_auth.dto.response.AuthResponse;
import com.e_commerce.backend.feature_auth.dto.response.TokenRefreshResponse;
import com.e_commerce.backend.feature_auth.model.PasswordResetTokenEntity;
import com.e_commerce.backend.feature_auth.model.RefreshTokenEntity;
import com.e_commerce.backend.feature_auth.repository.PasswordResetTokenRepository;
import com.e_commerce.backend.feature_auth.repository.RefreshTokenRepository;
import com.e_commerce.backend.feature_auth.service.AuthService;
import com.e_commerce.backend.feature_user.model.Role;
import com.e_commerce.backend.feature_user.model.UserEntity;
import com.e_commerce.backend.feature_user.model.UserProfileEntity;
import com.e_commerce.backend.feature_user.repository.RoleRepository;
import com.e_commerce.backend.feature_user.repository.UserProfileRepository;
import com.e_commerce.backend.feature_user.repository.UserRepository;
import com.e_commerce.backend.security.JwtUtils;
import com.e_commerce.backend.security.UserDetailsImpl;
import java.security.MessageDigest;
import java.security.NoSuchAlgorithmException;
import java.nio.charset.StandardCharsets;

import com.e_commerce.backend.common.service.EmailService;

import lombok.extern.slf4j.Slf4j;
import lombok.RequiredArgsConstructor;

@Slf4j
@Service
@RequiredArgsConstructor
public class AuthServiceImpl implements AuthService {
    private final UserRepository userRepository;
    private final RoleRepository roleRepository;
    private final UserProfileRepository userProfileRepository;
    private final RefreshTokenRepository refreshTokenRepository;
    private final PasswordResetTokenRepository passwordResetTokenRepository;
    private final PasswordEncoder passwordEncoder;
    private final AuthenticationManager authenticationManager;
    private final JwtUtils jwtUtils;
    private final EmailService emailService;

    private static final long REFRESH_TOKEN_DURATION_MS = 86400000L; // 24 hours
    private static final long RESET_TOKEN_DURATION_MS = 1800000L; // 30 minutes

    @Override
    @Transactional // PR REVIEW: Wajib ada!
    public void register(RegisterRequest request) {
        // 1. Validasi Password Confirmation
        if (!request.getPassword().equals(request.getPasswordConfirmation())) {
            throw new IllegalArgumentException("Konfirmasi password tidak cocok!");
        }

        // 2. Validasi Duplikasi
        if (userRepository.findByEmailAndDeletedAtIsNull(request.getEmail()).isPresent()) {
            throw new IllegalArgumentException("Email sudah terdaftar!"); // Akan ditangkap GlobalExceptionHandler
        }

        // 3. Ambil Role Default
        Role customerRole = roleRepository.findByName("ROLE_CUSTOMER")
                .orElseThrow(() -> new RuntimeException("Error: Role tidak ditemukan di database."));

        // 4. Buat dan Simpan User (BCrypt bekerja di sini)
        UserEntity user = new UserEntity();
        user.setEmail(request.getEmail());
        user.setPassword_hash(passwordEncoder.encode(request.getPassword()));
        user.getRoles().add(customerRole);
        
        UserEntity savedUser = userRepository.save(user);

        // 5. Buat dan Simpan Profil User
        UserProfileEntity profile = new UserProfileEntity();
        profile.setUser(savedUser);
        profile.setFullName(request.getFullName());
        if (request.getPhoneNumber() != null && !request.getPhoneNumber().isBlank()) {
            profile.setPhone(request.getPhoneNumber());
        }
        userProfileRepository.save(profile);
    }

    @Override
    @Transactional
    public AuthResponse login(LoginRequest request) {
        // 1. Delegasi ke Spring Security (Mencegah Timing Attack)
        Authentication authentication = authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(request.getEmail(), request.getPassword())
        );

        // 2. Simpan sesi di memori sementara (SecurityContext)
        SecurityContextHolder.getContext().setAuthentication(authentication);

        // 3. Generate JWT
        String jwt = jwtUtils.generateJwtToken(authentication);

        // 4. Generate Refresh Token
        UserDetailsImpl userDetails = (UserDetailsImpl) authentication.getPrincipal();
        UserEntity user = userRepository.findById(userDetails.getId())
                .orElseThrow(() -> new RuntimeException("User tidak ditemukan"));

        String refreshToken = UUID.randomUUID().toString();
        RefreshTokenEntity refreshTokenEntity = RefreshTokenEntity.builder()
                .user(user)
                .token(refreshToken)
                .expiryDate(ZonedDateTime.now().plusNanos(REFRESH_TOKEN_DURATION_MS * 1000000))
                .build();
        refreshTokenRepository.save(refreshTokenEntity);

        // 5. Ekstrak data untuk Response
        List<String> roles = userDetails.getAuthorities().stream()
                .map(GrantedAuthority::getAuthority)
                .collect(Collectors.toList());

        return AuthResponse.builder()
                .accessToken(jwt)
                .refreshToken(refreshToken)
                .type("Bearer")
                .email(userDetails.getUsername())
                .roles(roles)
                .build();
    }

    @Override
    @Transactional
    public void logout(String refreshToken) {
        refreshTokenRepository.deleteByToken(refreshToken);
    }

    @Override
    @Transactional
    public TokenRefreshResponse refreshToken(String requestRefreshToken) {
        RefreshTokenEntity refreshTokenEntity = refreshTokenRepository.findByToken(requestRefreshToken)
                .orElseThrow(() -> new IllegalArgumentException("Refresh token tidak valid atau tidak ditemukan."));

        if (refreshTokenEntity.getExpiryDate().isBefore(ZonedDateTime.now())) {
            refreshTokenRepository.delete(refreshTokenEntity);
            throw new IllegalArgumentException("Refresh token sudah kedaluwarsa. Silakan login kembali.");
        }

        List<String> roles = refreshTokenEntity.getUser().getRoles().stream()
                .map(Role::getName)
                .collect(Collectors.toList());
        String newJwt = jwtUtils.generateJwtTokenFromEmail(refreshTokenEntity.getUser().getEmail(), roles);
        
        // Optional: Rotate refresh token
        String newRefreshToken = UUID.randomUUID().toString();
        refreshTokenEntity.setToken(newRefreshToken);
        refreshTokenEntity.setExpiryDate(ZonedDateTime.now().plusNanos(REFRESH_TOKEN_DURATION_MS * 1000000));
        refreshTokenRepository.save(refreshTokenEntity);

        return TokenRefreshResponse.builder()
                .accessToken(newJwt)
                .refreshToken(newRefreshToken)
                .type("Bearer")
                .build();
    }

    @Override
    @Transactional
    public void forgotPassword(String email) {
        userRepository.findByEmailAndDeletedAtIsNull(email).ifPresent(user -> {
            String token = UUID.randomUUID().toString();
            String hashedToken = hashToken(token);

            PasswordResetTokenEntity resetTokenEntity = PasswordResetTokenEntity.builder()
                    .user(user)
                    .tokenHash(hashedToken)
                    .expiryDate(ZonedDateTime.now().plusNanos(RESET_TOKEN_DURATION_MS * 1000000))
                    .isUsed(false)
                    .build();
            passwordResetTokenRepository.save(resetTokenEntity);

            String resetLink = "http://localhost:4200/reset-password?token=" + token;
            
            emailService.sendPasswordResetEmail(user.getEmail(), resetLink);
        });
        // Kita tidak throw exception bila user tidak ditemukan, demi mencegah enumeration.
    }

    @Override
    @Transactional
    public void resetPassword(ResetPasswordRequest request) {
        if (!request.getNewPassword().equals(request.getConfirmPassword())) {
            throw new IllegalArgumentException("Konfirmasi password baru tidak cocok!");
        }

        String hashedToken = hashToken(request.getToken());
        PasswordResetTokenEntity resetTokenEntity = passwordResetTokenRepository.findByTokenHash(hashedToken)
                .orElseThrow(() -> new IllegalArgumentException("Token tidak valid atau salah."));

        if (resetTokenEntity.getIsUsed()) {
            throw new IllegalArgumentException("Token sudah pernah digunakan.");
        }

        if (resetTokenEntity.getExpiryDate().isBefore(ZonedDateTime.now())) {
            throw new IllegalArgumentException("Token reset password sudah kedaluwarsa.");
        }

        UserEntity user = resetTokenEntity.getUser();
        user.setPassword_hash(passwordEncoder.encode(request.getNewPassword()));
        userRepository.save(user);

        resetTokenEntity.setIsUsed(true);
        passwordResetTokenRepository.save(resetTokenEntity);
    }

    private String hashToken(String token) {
        try {
            MessageDigest digest = MessageDigest.getInstance("SHA-256");
            byte[] hash = digest.digest(token.getBytes(StandardCharsets.UTF_8));
            StringBuilder hexString = new StringBuilder();
            for (byte b : hash) {
                String hex = Integer.toHexString(0xff & b);
                if (hex.length() == 1) hexString.append('0');
                hexString.append(hex);
            }
            return hexString.toString();
        } catch (NoSuchAlgorithmException e) {
            throw new RuntimeException("Error hashing token", e);
        }
    }
}
