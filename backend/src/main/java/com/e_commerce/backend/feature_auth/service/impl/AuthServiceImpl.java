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
import com.e_commerce.backend.feature_auth.dto.request.VerifyOtpRequest;
import com.e_commerce.backend.feature_auth.dto.request.VerifyResetCodeRequest;
import com.e_commerce.backend.feature_auth.dto.request.ResendOtpRequest;
import com.e_commerce.backend.feature_auth.dto.response.AuthResponse;
import com.e_commerce.backend.feature_auth.dto.response.TokenRefreshResponse;
import com.e_commerce.backend.feature_auth.dto.response.VerifyResetCodeResponse;
import com.e_commerce.backend.feature_auth.model.PasswordResetCodeEntity;
import com.e_commerce.backend.feature_auth.model.PasswordResetTokenEntity;
import com.e_commerce.backend.feature_auth.model.RefreshTokenEntity;
import com.e_commerce.backend.feature_auth.model.RegistrationOtpEntity;
import com.e_commerce.backend.feature_auth.repository.PasswordResetCodeRepository;
import com.e_commerce.backend.feature_auth.repository.PasswordResetTokenRepository;
import com.e_commerce.backend.feature_auth.repository.RefreshTokenRepository;
import com.e_commerce.backend.feature_auth.repository.RegistrationOtpRepository;
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
import java.security.SecureRandom;
import java.nio.charset.StandardCharsets;
import java.time.Duration;
import java.util.Optional;

import org.springframework.beans.factory.annotation.Value;
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
    private final PasswordResetCodeRepository passwordResetCodeRepository;
    private final RegistrationOtpRepository registrationOtpRepository;
    private final PasswordEncoder passwordEncoder;
    private final AuthenticationManager authenticationManager;
    private final JwtUtils jwtUtils;
    private final EmailService emailService;


    @Value("${app.otp.expiration-minutes:5}")
    private int otpExpirationMinutes = 5;

    @Value("${app.otp.max-attempts:5}")
    private int otpMaxAttempts = 5;

    @Value("${app.otp.resend-cooldown-seconds:60}")
    private int otpResendCooldownSeconds = 60;

    @Value("${app.frontend.url:http://localhost:4200}")
    private String frontendBaseUrl;

    private final SecureRandom secureRandom = new SecureRandom();

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
        Optional<UserEntity> existingUserOpt = userRepository.findByEmailAndDeletedAtIsNull(request.getEmail());
        UserEntity user;
        if (existingUserOpt.isPresent()) {
            UserEntity existingUser = existingUserOpt.get();
            if (Boolean.TRUE.equals(existingUser.getEmailVerified())) {
                throw new IllegalArgumentException("Email sudah terdaftar!"); // Akan ditangkap GlobalExceptionHandler
            }
            // User sudah registrasi tapi belum verifikasi -> perbarui kata sandi dan profil
            user = existingUser;
            user.setPassword_hash(passwordEncoder.encode(request.getPassword()));
            user = userRepository.save(user);

            UserProfileEntity profile = userProfileRepository.findByUser(user)
                    .orElseGet(() -> {
                        UserProfileEntity newProf = new UserProfileEntity();
                        newProf.setUser(existingUser);
                        return newProf;
                    });
            profile.setFullName(request.getFullName());
            if (request.getPhoneNumber() != null && !request.getPhoneNumber().isBlank()) {
                profile.setPhone(request.getPhoneNumber());
            }
            userProfileRepository.save(profile);
        } else {
            // 3. Ambil Role Default
            Role customerRole = roleRepository.findByName("ROLE_CUSTOMER")
                    .orElseThrow(() -> new RuntimeException("Error: Role tidak ditemukan di database."));

            // 4. Buat dan Simpan User baru dengan email_verified = false
            user = new UserEntity();
            user.setEmail(request.getEmail());
            user.setPassword_hash(passwordEncoder.encode(request.getPassword()));
            user.setEmailVerified(false);
            user.getRoles().add(customerRole);
            
            user = userRepository.save(user);

            // 5. Buat dan Simpan Profil User
            UserProfileEntity profile = new UserProfileEntity();
            profile.setUser(user);
            profile.setFullName(request.getFullName());
            if (request.getPhoneNumber() != null && !request.getPhoneNumber().isBlank()) {
                profile.setPhone(request.getPhoneNumber());
            }
            userProfileRepository.save(profile);
        }

        // 6. Invalidate OTP sebelumnya yang masih aktif jika ada
        invalidatePreviousOtps(user);

        // 7. Generate dan simpan OTP baru
        String rawOtp = generateOtp();
        String otpHash = hashToken(rawOtp);

        RegistrationOtpEntity otpEntity = RegistrationOtpEntity.builder()
                .user(user)
                .otpHash(otpHash)
                .expiryDate(ZonedDateTime.now().plusMinutes(otpExpirationMinutes))
                .attempts(0)
                .maxAttempts(otpMaxAttempts)
                .isUsed(false)
                .lastResendAt(ZonedDateTime.now())
                .build();
        registrationOtpRepository.save(otpEntity);

        // 8. Kirim OTP via Email
        boolean sent = emailService.sendRegistrationOtpEmail(user.getEmail(), request.getFullName(), rawOtp, otpExpirationMinutes);
        if (!sent) {
            log.error("Failed to deliver registration OTP email to {}", user.getEmail());
            throw new IllegalStateException("Gagal mengirimkan kode verifikasi OTP ke email Anda. Silakan periksa konfigurasi email atau coba beberapa saat lagi.");
        }
        log.info("Registration OTP email successfully sent to {}", user.getEmail());
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
            invalidatePreviousResetCodes(user);

            String rawCode = generateOtp();
            String codeHash = hashToken(rawCode);

            PasswordResetCodeEntity resetCodeEntity = PasswordResetCodeEntity.builder()
                    .user(user)
                    .codeHash(codeHash)
                    .expiryDate(ZonedDateTime.now().plusMinutes(15))
                    .attempts(0)
                    .maxAttempts(5)
                    .isUsed(false)
                    .build();
            passwordResetCodeRepository.save(resetCodeEntity);

            boolean sent = emailService.sendPasswordResetOtpEmail(user.getEmail(), rawCode, 15);
            if (!sent) {
                log.error("Failed to deliver password reset OTP email to {}", user.getEmail());
                throw new IllegalStateException("Gagal mengirimkan kode reset password. Silakan periksa konfigurasi email atau coba beberapa saat lagi.");
            }
            log.info("Password reset OTP email successfully sent to {}", user.getEmail());
        });
        // Kita tidak throw exception bila user tidak ditemukan, demi mencegah enumeration.
    }

    @Override
    @Transactional
    public VerifyResetCodeResponse verifyResetCode(VerifyResetCodeRequest request) {
        UserEntity user = userRepository.findByEmailAndDeletedAtIsNull(request.getEmail())
                .orElseThrow(() -> new IllegalArgumentException("Akun tidak ditemukan atau email salah."));

        PasswordResetCodeEntity codeEntity = passwordResetCodeRepository
                .findTopByUserAndIsUsedFalseOrderByCreatedAtDesc(user)
                .orElseThrow(() -> new IllegalArgumentException("Kode reset password tidak ditemukan atau sudah digunakan. Silakan minta kode baru."));

        if (codeEntity.getExpiryDate().isBefore(ZonedDateTime.now())) {
            codeEntity.setIsUsed(true);
            passwordResetCodeRepository.save(codeEntity);
            throw new IllegalArgumentException("Kode reset password sudah kedaluwarsa. Silakan minta kode baru.");
        }

        if (codeEntity.getAttempts() >= codeEntity.getMaxAttempts()) {
            codeEntity.setIsUsed(true);
            passwordResetCodeRepository.save(codeEntity);
            throw new IllegalArgumentException("Batas percobaan telah habis. Silakan minta kode baru.");
        }

        String inputCodeHash = hashToken(request.getCode());
        if (!inputCodeHash.equals(codeEntity.getCodeHash())) {
            int newAttempts = codeEntity.getAttempts() + 1;
            codeEntity.setAttempts(newAttempts);
            if (newAttempts >= codeEntity.getMaxAttempts()) {
                codeEntity.setIsUsed(true);
                passwordResetCodeRepository.save(codeEntity);
                throw new IllegalArgumentException("Kode reset password salah. Batas percobaan telah habis. Silakan minta kode baru.");
            }
            passwordResetCodeRepository.save(codeEntity);
            int remainingAttempts = codeEntity.getMaxAttempts() - newAttempts;
            throw new IllegalArgumentException("Kode reset password salah. Sisa percobaan: " + remainingAttempts);
        }

        // OTP Cocok
        codeEntity.setIsUsed(true);
        passwordResetCodeRepository.save(codeEntity);

        // Invalidate previous unused reset tokens for this user
        invalidatePreviousResetTokens(user);

        // Issue temporary UUID authorization token
        String rawResetToken = UUID.randomUUID().toString();
        String hashedToken = hashToken(rawResetToken);

        PasswordResetTokenEntity resetTokenEntity = PasswordResetTokenEntity.builder()
                .user(user)
                .tokenHash(hashedToken)
                .expiryDate(ZonedDateTime.now().plusNanos(RESET_TOKEN_DURATION_MS * 1000000))
                .isUsed(false)
                .build();
        passwordResetTokenRepository.save(resetTokenEntity);

        log.info("Password reset code successfully verified for user {}", user.getEmail());

        return VerifyResetCodeResponse.builder()
                .resetToken(rawResetToken)
                .email(user.getEmail())
                .message("Kode verifikasi berhasil divalidasi.")
                .build();
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

    @Override
    @Transactional
    public void verifyOtp(VerifyOtpRequest request) {
        UserEntity user = userRepository.findByEmailAndDeletedAtIsNull(request.getEmail())
                .orElseThrow(() -> new IllegalArgumentException("Akun tidak ditemukan atau email salah."));

        if (Boolean.TRUE.equals(user.getEmailVerified())) {
            throw new IllegalArgumentException("Akun sudah terverifikasi. Silakan login.");
        }

        RegistrationOtpEntity otpEntity = registrationOtpRepository
                .findTopByUserAndIsUsedFalseOrderByCreatedAtDesc(user)
                .orElseThrow(() -> new IllegalArgumentException("Kode OTP tidak ditemukan atau sudah digunakan. Silakan minta kode baru."));

        if (otpEntity.getExpiryDate().isBefore(ZonedDateTime.now())) {
            otpEntity.setIsUsed(true);
            registrationOtpRepository.save(otpEntity);
            throw new IllegalArgumentException("Kode OTP sudah kedaluwarsa. Silakan minta kode baru.");
        }

        if (otpEntity.getAttempts() >= otpEntity.getMaxAttempts()) {
            otpEntity.setIsUsed(true);
            registrationOtpRepository.save(otpEntity);
            throw new IllegalArgumentException("Batas percobaan OTP telah terlampaui. Silakan minta kode baru.");
        }

        String inputOtpHash = hashToken(request.getOtp());
        if (!inputOtpHash.equals(otpEntity.getOtpHash())) {
            int newAttempts = otpEntity.getAttempts() + 1;
            otpEntity.setAttempts(newAttempts);
            if (newAttempts >= otpEntity.getMaxAttempts()) {
                otpEntity.setIsUsed(true);
                registrationOtpRepository.save(otpEntity);
                throw new IllegalArgumentException("Kode OTP salah. Batas percobaan telah habis. Silakan minta kode baru.");
            }
            registrationOtpRepository.save(otpEntity);
            int remainingAttempts = otpEntity.getMaxAttempts() - newAttempts;
            throw new IllegalArgumentException("Kode OTP salah. Sisa percobaan: " + remainingAttempts);
        }

        // OTP Cocok
        otpEntity.setIsUsed(true);
        registrationOtpRepository.save(otpEntity);

        user.setEmailVerified(true);
        userRepository.save(user);
    }

    @Override
    @Transactional
    public void resendOtp(ResendOtpRequest request) {
        UserEntity user = userRepository.findByEmailAndDeletedAtIsNull(request.getEmail())
                .orElseThrow(() -> new IllegalArgumentException("Akun tidak ditemukan atau email salah."));

        if (Boolean.TRUE.equals(user.getEmailVerified())) {
            throw new IllegalArgumentException("Akun sudah aktif dan terverifikasi. Silakan login.");
        }

        Optional<RegistrationOtpEntity> latestOtpOpt = registrationOtpRepository
                .findTopByUserAndIsUsedFalseOrderByCreatedAtDesc(user);

        if (latestOtpOpt.isPresent()) {
            RegistrationOtpEntity latestOtp = latestOtpOpt.get();
            ZonedDateTime cooldownEnd = latestOtp.getLastResendAt().plusSeconds(otpResendCooldownSeconds);
            if (ZonedDateTime.now().isBefore(cooldownEnd)) {
                long remainingSeconds = Duration.between(ZonedDateTime.now(), cooldownEnd).getSeconds() + 1;
                throw new IllegalArgumentException("Harap tunggu " + remainingSeconds + " detik sebelum meminta kode OTP baru.");
            }
        }

        invalidatePreviousOtps(user);

        String fullName = userProfileRepository.findByUser(user)
                .map(UserProfileEntity::getFullName)
                .orElse(user.getEmail());

        String rawOtp = generateOtp();
        String otpHash = hashToken(rawOtp);

        RegistrationOtpEntity newOtp = RegistrationOtpEntity.builder()
                .user(user)
                .otpHash(otpHash)
                .expiryDate(ZonedDateTime.now().plusMinutes(otpExpirationMinutes))
                .attempts(0)
                .maxAttempts(otpMaxAttempts)
                .isUsed(false)
                .lastResendAt(ZonedDateTime.now())
                .build();
        registrationOtpRepository.save(newOtp);

        boolean sent = emailService.sendRegistrationOtpEmail(user.getEmail(), fullName, rawOtp, otpExpirationMinutes);
        if (!sent) {
            log.error("Failed to deliver resent registration OTP email to {}", user.getEmail());
            throw new IllegalStateException("Gagal mengirimkan kode OTP baru ke email Anda. Silakan periksa konfigurasi email atau coba beberapa saat lagi.");
        }
        log.info("Resent registration OTP email successfully sent to {}", user.getEmail());
    }

    private void invalidatePreviousOtps(UserEntity user) {
        List<RegistrationOtpEntity> activeOtps = registrationOtpRepository.findAllByUserAndIsUsedFalse(user);
        for (RegistrationOtpEntity otp : activeOtps) {
            otp.setIsUsed(true);
        }
        if (!activeOtps.isEmpty()) {
            registrationOtpRepository.saveAll(activeOtps);
        }
    }

    private void invalidatePreviousResetCodes(UserEntity user) {
        List<PasswordResetCodeEntity> activeCodes = passwordResetCodeRepository.findAllByUserAndIsUsedFalse(user);
        for (PasswordResetCodeEntity code : activeCodes) {
            code.setIsUsed(true);
        }
        if (!activeCodes.isEmpty()) {
            passwordResetCodeRepository.saveAll(activeCodes);
        }
    }

    private void invalidatePreviousResetTokens(UserEntity user) {
        List<PasswordResetTokenEntity> activeTokens = passwordResetTokenRepository.findAllByUserAndIsUsedFalse(user);
        for (PasswordResetTokenEntity token : activeTokens) {
            token.setIsUsed(true);
        }
        if (!activeTokens.isEmpty()) {
            passwordResetTokenRepository.saveAll(activeTokens);
        }
    }


    private String generateOtp() {
        return String.format("%06d", secureRandom.nextInt(1000000));
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
