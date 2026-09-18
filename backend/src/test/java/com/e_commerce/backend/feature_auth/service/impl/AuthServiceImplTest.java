package com.e_commerce.backend.feature_auth.service.impl;

import com.e_commerce.backend.feature_auth.dto.request.LoginRequest;
import com.e_commerce.backend.feature_auth.dto.request.RegisterRequest;
import com.e_commerce.backend.feature_auth.dto.request.ResetPasswordRequest;
import com.e_commerce.backend.feature_auth.dto.request.VerifyOtpRequest;
import com.e_commerce.backend.feature_auth.dto.request.VerifyResetCodeRequest;
import com.e_commerce.backend.feature_auth.dto.request.ResendOtpRequest;
import com.e_commerce.backend.feature_auth.dto.response.AuthResponse;
import com.e_commerce.backend.feature_auth.dto.response.VerifyResetCodeResponse;
import com.e_commerce.backend.feature_auth.model.PasswordResetCodeEntity;
import com.e_commerce.backend.feature_auth.model.PasswordResetTokenEntity;
import com.e_commerce.backend.feature_auth.model.RefreshTokenEntity;
import com.e_commerce.backend.feature_auth.model.RegistrationOtpEntity;
import com.e_commerce.backend.feature_auth.repository.PasswordResetCodeRepository;
import com.e_commerce.backend.feature_auth.repository.PasswordResetTokenRepository;
import com.e_commerce.backend.feature_auth.repository.RefreshTokenRepository;
import com.e_commerce.backend.feature_auth.repository.RegistrationOtpRepository;
import com.e_commerce.backend.feature_user.model.Role;
import com.e_commerce.backend.feature_user.model.UserEntity;
import com.e_commerce.backend.feature_user.repository.RoleRepository;
import com.e_commerce.backend.feature_user.repository.UserProfileRepository;
import com.e_commerce.backend.feature_user.repository.UserRepository;
import com.e_commerce.backend.security.JwtUtils;
import com.e_commerce.backend.security.UserDetailsImpl;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import com.e_commerce.backend.common.service.EmailService;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.test.util.ReflectionTestUtils;

import java.time.ZonedDateTime;
import java.util.HashSet;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
@DisplayName("AuthServiceImpl Tests")
class AuthServiceImplTest {

    @Mock private UserRepository userRepository;
    @Mock private RoleRepository roleRepository;
    @Mock private UserProfileRepository userProfileRepository;
    @Mock private RefreshTokenRepository refreshTokenRepository;
    @Mock private PasswordResetTokenRepository passwordResetTokenRepository;
    @Mock private PasswordResetCodeRepository passwordResetCodeRepository;
    @Mock private RegistrationOtpRepository registrationOtpRepository;
    @Mock private PasswordEncoder passwordEncoder;
    @Mock private AuthenticationManager authenticationManager;
    @Mock private JwtUtils jwtUtils;
    @Mock private EmailService emailService;


    @InjectMocks
    private AuthServiceImpl authService;

    private UserEntity mockUser;
    private Role customerRole;

    @BeforeEach
    void setUp() {
        ReflectionTestUtils.setField(authService, "frontendBaseUrl", "http://localhost:4200");

        customerRole = new Role();
        customerRole.setId(UUID.randomUUID());
        customerRole.setName("ROLE_CUSTOMER");

        mockUser = new UserEntity();
        mockUser.setId(UUID.randomUUID());
        mockUser.setEmail("user@example.com");
        mockUser.setPassword_hash("encodedPassword");
        mockUser.setEmailVerified(true);
        mockUser.setRoles(new HashSet<>());
        mockUser.getRoles().add(customerRole);
    }

    @Test
    @DisplayName("register: Berhasil mendaftar user baru")
    void register_Success() {
        RegisterRequest request = new RegisterRequest();
        request.setEmail("newuser@example.com");
        request.setPassword("Password123!");
        request.setPasswordConfirmation("Password123!");
        request.setFullName("New User");

        when(userRepository.findByEmailAndDeletedAtIsNull(request.getEmail())).thenReturn(Optional.empty());
        when(roleRepository.findByName("ROLE_CUSTOMER")).thenReturn(Optional.of(customerRole));
        when(passwordEncoder.encode(request.getPassword())).thenReturn("encodedPassword");
        when(userRepository.save(any(UserEntity.class))).thenAnswer(invocation -> {
            UserEntity u = invocation.getArgument(0);
            u.setId(UUID.randomUUID());
            return u;
        });
        when(emailService.sendRegistrationOtpEmail(anyString(), any(), anyString(), anyInt())).thenReturn(true);

        assertDoesNotThrow(() -> authService.register(request));

        verify(userRepository, times(1)).save(any(UserEntity.class));
        verify(userProfileRepository, times(1)).save(any());
        verify(registrationOtpRepository, times(1)).save(any(RegistrationOtpEntity.class));
        verify(emailService, times(1)).sendRegistrationOtpEmail(eq(request.getEmail()), eq(request.getFullName()), anyString(), anyInt());
    }

    @Test
    @DisplayName("register: Berhasil mendaftar user baru dengan phone number")
    void register_WithPhoneNumber_Success() {
        RegisterRequest request = new RegisterRequest();
        request.setEmail("phoneuser@example.com");
        request.setPassword("Password123!");
        request.setPasswordConfirmation("Password123!");
        request.setFullName("Phone User");
        request.setPhoneNumber("+628123456789");

        when(userRepository.findByEmailAndDeletedAtIsNull(request.getEmail())).thenReturn(Optional.empty());
        when(roleRepository.findByName("ROLE_CUSTOMER")).thenReturn(Optional.of(customerRole));
        when(passwordEncoder.encode(request.getPassword())).thenReturn("encodedPassword");
        when(userRepository.save(any(UserEntity.class))).thenAnswer(invocation -> {
            UserEntity u = invocation.getArgument(0);
            u.setId(UUID.randomUUID());
            return u;
        });
        when(emailService.sendRegistrationOtpEmail(anyString(), any(), anyString(), anyInt())).thenReturn(true);

        assertDoesNotThrow(() -> authService.register(request));

        verify(userProfileRepository, times(1)).save(argThat(p -> 
            p != null && "+628123456789".equals(p.getPhone()) && "Phone User".equals(p.getFullName())
        ));
        verify(registrationOtpRepository, times(1)).save(any(RegistrationOtpEntity.class));
        verify(emailService, times(1)).sendRegistrationOtpEmail(eq(request.getEmail()), eq(request.getFullName()), anyString(), anyInt());
    }

    @Test
    @DisplayName("register: Password confirmation tidak cocok -> Throws IllegalArgumentException")
    void register_PasswordMismatch_ThrowsIllegalArgumentException() {
        RegisterRequest request = new RegisterRequest();
        request.setEmail("newuser@example.com");
        request.setPassword("Password123!");
        request.setPasswordConfirmation("DifferentPassword!");
        request.setFullName("New User");

        IllegalArgumentException ex = assertThrows(IllegalArgumentException.class, () -> authService.register(request));
        assertEquals("Konfirmasi password tidak cocok!", ex.getMessage());
        verify(userRepository, never()).save(any());
    }

    @Test
    @DisplayName("register: Email duplikat -> Throws IllegalArgumentException")
    void register_DuplicateEmail_ThrowsIllegalArgumentException() {
        RegisterRequest request = new RegisterRequest();
        request.setEmail("user@example.com");
        request.setPassword("Password123!");
        request.setPasswordConfirmation("Password123!");
        request.setFullName("Existing User");

        when(userRepository.findByEmailAndDeletedAtIsNull(request.getEmail())).thenReturn(Optional.of(mockUser));

        IllegalArgumentException ex = assertThrows(IllegalArgumentException.class, () -> authService.register(request));
        assertEquals("Email sudah terdaftar!", ex.getMessage());
        verify(userRepository, never()).save(any());
    }

    @Test
    @DisplayName("login: Berhasil login dan menghasilkan token")
    void login_Success() {
        LoginRequest request = new LoginRequest();
        request.setEmail("user@example.com");
        request.setPassword("Password123!");

        UserDetailsImpl userDetails = new UserDetailsImpl(mockUser);

        Authentication auth = mock(Authentication.class);
        when(auth.getPrincipal()).thenReturn(userDetails);
        when(authenticationManager.authenticate(any(UsernamePasswordAuthenticationToken.class))).thenReturn(auth);
        when(jwtUtils.generateJwtToken(auth)).thenReturn("jwt.token.here");
        when(userRepository.findById(mockUser.getId())).thenReturn(Optional.of(mockUser));

        AuthResponse response = authService.login(request);

        assertNotNull(response);
        assertEquals("jwt.token.here", response.getAccessToken());
        assertEquals("user@example.com", response.getEmail());
        verify(refreshTokenRepository, times(1)).save(any(RefreshTokenEntity.class));
    }

    @Test
    @DisplayName("logout: Berhasil menghapus refresh token")
    void logout_Success() {
        String refreshToken = "some-refresh-token";
        assertDoesNotThrow(() -> authService.logout(refreshToken));
        verify(refreshTokenRepository, times(1)).deleteByToken(refreshToken);
    }

    @Test
    @DisplayName("forgotPassword: User ditemukan -> Menyimpan kode OTP dan memanggil emailService")
    void forgotPassword_UserFound_SendsEmail() {
        when(userRepository.findByEmailAndDeletedAtIsNull("user@example.com")).thenReturn(Optional.of(mockUser));
        when(emailService.sendPasswordResetOtpEmail(eq("user@example.com"), anyString(), eq(15))).thenReturn(true);

        assertDoesNotThrow(() -> authService.forgotPassword("user@example.com"));

        verify(passwordResetCodeRepository, times(1)).save(any());
        verify(emailService, times(1)).sendPasswordResetOtpEmail(eq("user@example.com"), anyString(), eq(15));
    }

    @Test
    @DisplayName("forgotPassword: User tidak ditemukan -> Tidak throw exception (anti-enumeration) & tidak kirim email")
    void forgotPassword_UserNotFound_DoesNotSendEmail() {
        when(userRepository.findByEmailAndDeletedAtIsNull("unknown@example.com")).thenReturn(Optional.empty());

        assertDoesNotThrow(() -> authService.forgotPassword("unknown@example.com"));

        verify(passwordResetCodeRepository, never()).save(any());
        verify(emailService, never()).sendPasswordResetOtpEmail(anyString(), anyString(), anyInt());
    }


    @Test
    @DisplayName("Admin password verification: Hash V6 cocok dengan Admin1234!")
    void adminPassword_MatchesValidBcrypt() {
        org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder bCrypt = 
                new org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder(12);
        String v6Hash = "$2a$12$385JT1F9Ya.APOEDyNV0eeyVnrC9o4h8wBUT1BZDAPQNBAjrNwmma";
        assertTrue(bCrypt.matches("Admin1234!", v6Hash), "BCrypt strength 12 hash must match Admin1234!");
    }

    @Test
    @DisplayName("resetPassword: Password baru dan konfirmasi cocok -> Berhasil update password & invalidate token")
    void resetPassword_Success() {
        ResetPasswordRequest request = new ResetPasswordRequest();
        request.setToken("sample-valid-token");
        request.setNewPassword("PasswordBaru123!");
        request.setConfirmPassword("PasswordBaru123!");

        PasswordResetTokenEntity tokenEntity = PasswordResetTokenEntity.builder()
                .user(mockUser)
                .tokenHash("some-hash")
                .expiryDate(ZonedDateTime.now().plusHours(1))
                .isUsed(false)
                .build();

        when(passwordResetTokenRepository.findByTokenHash(anyString())).thenReturn(Optional.of(tokenEntity));
        when(passwordEncoder.encode("PasswordBaru123!")).thenReturn("hashedPasswordNew");

        assertDoesNotThrow(() -> authService.resetPassword(request));

        assertTrue(tokenEntity.getIsUsed(), "Token harus ditandai sudah digunakan");
        assertEquals("hashedPasswordNew", mockUser.getPassword_hash(), "Password hash user harus diupdate");
        verify(userRepository, times(1)).save(mockUser);
        verify(passwordResetTokenRepository, times(1)).save(tokenEntity);
    }

    @Test
    @DisplayName("resetPassword: Password baru dan konfirmasi tidak cocok -> Throws IllegalArgumentException")
    void resetPassword_PasswordMismatch_ThrowsIllegalArgumentException() {
        ResetPasswordRequest request = new ResetPasswordRequest();
        request.setToken("sample-valid-token");
        request.setNewPassword("PasswordBaru123!");
        request.setConfirmPassword("PasswordBeda456!");

        IllegalArgumentException ex = assertThrows(IllegalArgumentException.class,
                () -> authService.resetPassword(request));

        assertEquals("Konfirmasi password baru tidak cocok!", ex.getMessage());
        verify(userRepository, never()).save(any());
        verify(passwordResetTokenRepository, never()).save(any());
    }

    @Test
    @DisplayName("resetPassword: Token tidak ditemukan / salah -> Throws IllegalArgumentException")
    void resetPassword_InvalidToken_ThrowsIllegalArgumentException() {
        ResetPasswordRequest request = new ResetPasswordRequest();
        request.setToken("invalid-or-unknown-token");
        request.setNewPassword("PasswordBaru123!");
        request.setConfirmPassword("PasswordBaru123!");

        when(passwordResetTokenRepository.findByTokenHash(anyString())).thenReturn(Optional.empty());

        IllegalArgumentException ex = assertThrows(IllegalArgumentException.class,
                () -> authService.resetPassword(request));

        assertEquals("Token tidak valid atau salah.", ex.getMessage());
        verify(userRepository, never()).save(any());
    }

    @Test
    @DisplayName("resetPassword: Token sudah pernah digunakan -> Throws IllegalArgumentException")
    void resetPassword_TokenAlreadyUsed_ThrowsIllegalArgumentException() {
        ResetPasswordRequest request = new ResetPasswordRequest();
        request.setToken("used-token");
        request.setNewPassword("PasswordBaru123!");
        request.setConfirmPassword("PasswordBaru123!");

        PasswordResetTokenEntity usedTokenEntity = PasswordResetTokenEntity.builder()
                .user(mockUser)
                .tokenHash("some-hash")
                .expiryDate(ZonedDateTime.now().plusHours(1))
                .isUsed(true)
                .build();

        when(passwordResetTokenRepository.findByTokenHash(anyString())).thenReturn(Optional.of(usedTokenEntity));

        IllegalArgumentException ex = assertThrows(IllegalArgumentException.class,
                () -> authService.resetPassword(request));

        assertEquals("Token sudah pernah digunakan.", ex.getMessage());
        verify(userRepository, never()).save(any());
    }

    @Test
    @DisplayName("resetPassword: Token sudah kedaluwarsa -> Throws IllegalArgumentException")
    void resetPassword_TokenExpired_ThrowsIllegalArgumentException() {
        ResetPasswordRequest request = new ResetPasswordRequest();
        request.setToken("expired-token");
        request.setNewPassword("PasswordBaru123!");
        request.setConfirmPassword("PasswordBaru123!");

        PasswordResetTokenEntity expiredTokenEntity = PasswordResetTokenEntity.builder()
                .user(mockUser)
                .tokenHash("some-hash")
                .expiryDate(ZonedDateTime.now().minusMinutes(5))
                .isUsed(false)
                .build();

        when(passwordResetTokenRepository.findByTokenHash(anyString())).thenReturn(Optional.of(expiredTokenEntity));

        IllegalArgumentException ex = assertThrows(IllegalArgumentException.class,
                () -> authService.resetPassword(request));

        assertEquals("Token reset password sudah kedaluwarsa.", ex.getMessage());
        verify(userRepository, never()).save(any());
    }

    @Test
    @DisplayName("register: Email terdaftar tapi belum verifikasi OTP -> Update data dan kirim OTP baru")
    void register_ExistingUnverifiedUser_UpdatesAndSendsNewOtp() {
        UserEntity unverifiedUser = new UserEntity();
        unverifiedUser.setId(UUID.randomUUID());
        unverifiedUser.setEmail("pending@example.com");
        unverifiedUser.setPassword_hash("oldHash");
        unverifiedUser.setEmailVerified(false);

        RegisterRequest request = new RegisterRequest();
        request.setEmail("pending@example.com");
        request.setPassword("NewPassword123!");
        request.setPasswordConfirmation("NewPassword123!");
        request.setFullName("Updated Name");

        when(userRepository.findByEmailAndDeletedAtIsNull(request.getEmail())).thenReturn(Optional.of(unverifiedUser));
        when(passwordEncoder.encode(request.getPassword())).thenReturn("newEncodedPassword");
        when(userRepository.save(any(UserEntity.class))).thenReturn(unverifiedUser);
        when(userProfileRepository.findByUser(unverifiedUser)).thenReturn(Optional.empty());
        when(emailService.sendRegistrationOtpEmail(anyString(), any(), anyString(), anyInt())).thenReturn(true);

        assertDoesNotThrow(() -> authService.register(request));

        verify(registrationOtpRepository, times(1)).save(any(RegistrationOtpEntity.class));
        verify(emailService, times(1)).sendRegistrationOtpEmail(eq(request.getEmail()), eq(request.getFullName()), anyString(), anyInt());
    }

    @Test
    @DisplayName("verifyOtp: OTP valid -> Berhasil verifikasi akun dan tandai OTP digunakan")
    void verifyOtp_Success() {
        VerifyOtpRequest request = new VerifyOtpRequest();
        request.setEmail("user@example.com");
        request.setOtp("123456");

        UserEntity unverifiedUser = new UserEntity();
        unverifiedUser.setId(UUID.randomUUID());
        unverifiedUser.setEmail("user@example.com");
        unverifiedUser.setEmailVerified(false);

        // SHA-256 hash of "123456"
        String otpHash = "8d969eef6ecad3c29a3a629280e686cf0c3f5d5a86aff3ca12020c923adc6c92";

        RegistrationOtpEntity otpEntity = RegistrationOtpEntity.builder()
                .user(unverifiedUser)
                .otpHash(otpHash)
                .expiryDate(ZonedDateTime.now().plusMinutes(5))
                .attempts(0)
                .maxAttempts(5)
                .isUsed(false)
                .build();

        when(userRepository.findByEmailAndDeletedAtIsNull(request.getEmail())).thenReturn(Optional.of(unverifiedUser));
        when(registrationOtpRepository.findTopByUserAndIsUsedFalseOrderByCreatedAtDesc(unverifiedUser))
                .thenReturn(Optional.of(otpEntity));

        assertDoesNotThrow(() -> authService.verifyOtp(request));

        assertTrue(otpEntity.getIsUsed());
        assertTrue(unverifiedUser.getEmailVerified());
        verify(userRepository, times(1)).save(unverifiedUser);
        verify(registrationOtpRepository, times(1)).save(otpEntity);
    }

    @Test
    @DisplayName("verifyOtp: User tidak ditemukan -> Throws IllegalArgumentException")
    void verifyOtp_UserNotFound_ThrowsIllegalArgumentException() {
        VerifyOtpRequest request = new VerifyOtpRequest();
        request.setEmail("notfound@example.com");
        request.setOtp("123456");

        when(userRepository.findByEmailAndDeletedAtIsNull(request.getEmail())).thenReturn(Optional.empty());

        IllegalArgumentException ex = assertThrows(IllegalArgumentException.class, () -> authService.verifyOtp(request));
        assertEquals("Akun tidak ditemukan atau email salah.", ex.getMessage());
    }

    @Test
    @DisplayName("verifyOtp: Akun sudah terverifikasi -> Throws IllegalArgumentException")
    void verifyOtp_AlreadyVerified_ThrowsIllegalArgumentException() {
        VerifyOtpRequest request = new VerifyOtpRequest();
        request.setEmail("user@example.com");
        request.setOtp("123456");

        mockUser.setEmailVerified(true);
        when(userRepository.findByEmailAndDeletedAtIsNull(request.getEmail())).thenReturn(Optional.of(mockUser));

        IllegalArgumentException ex = assertThrows(IllegalArgumentException.class, () -> authService.verifyOtp(request));
        assertEquals("Akun sudah terverifikasi. Silakan login.", ex.getMessage());
    }

    @Test
    @DisplayName("verifyOtp: OTP kedaluwarsa -> Throws IllegalArgumentException")
    void verifyOtp_ExpiredOtp_ThrowsIllegalArgumentException() {
        VerifyOtpRequest request = new VerifyOtpRequest();
        request.setEmail("user@example.com");
        request.setOtp("123456");

        UserEntity unverifiedUser = new UserEntity();
        unverifiedUser.setId(UUID.randomUUID());
        unverifiedUser.setEmail("user@example.com");
        unverifiedUser.setEmailVerified(false);

        RegistrationOtpEntity expiredOtp = RegistrationOtpEntity.builder()
                .user(unverifiedUser)
                .otpHash("hash")
                .expiryDate(ZonedDateTime.now().minusMinutes(1))
                .attempts(0)
                .maxAttempts(5)
                .isUsed(false)
                .build();

        when(userRepository.findByEmailAndDeletedAtIsNull(request.getEmail())).thenReturn(Optional.of(unverifiedUser));
        when(registrationOtpRepository.findTopByUserAndIsUsedFalseOrderByCreatedAtDesc(unverifiedUser))
                .thenReturn(Optional.of(expiredOtp));

        IllegalArgumentException ex = assertThrows(IllegalArgumentException.class, () -> authService.verifyOtp(request));
        assertEquals("Kode OTP sudah kedaluwarsa. Silakan minta kode baru.", ex.getMessage());
        assertTrue(expiredOtp.getIsUsed());
        verify(registrationOtpRepository, times(1)).save(expiredOtp);
    }

    @Test
    @DisplayName("verifyOtp: OTP salah -> Increment attempts & Throws IllegalArgumentException")
    void verifyOtp_WrongOtp_IncrementsAttempts() {
        VerifyOtpRequest request = new VerifyOtpRequest();
        request.setEmail("user@example.com");
        request.setOtp("000000"); // wrong otp

        UserEntity unverifiedUser = new UserEntity();
        unverifiedUser.setId(UUID.randomUUID());
        unverifiedUser.setEmail("user@example.com");
        unverifiedUser.setEmailVerified(false);

        // SHA-256 hash of "123456"
        String otpHash = "8d969eef6ecad3c29a3a629280e686cf0c3f5d5a86aff3ca12020c923adc6c92";

        RegistrationOtpEntity otpEntity = RegistrationOtpEntity.builder()
                .user(unverifiedUser)
                .otpHash(otpHash)
                .expiryDate(ZonedDateTime.now().plusMinutes(5))
                .attempts(2)
                .maxAttempts(5)
                .isUsed(false)
                .build();

        when(userRepository.findByEmailAndDeletedAtIsNull(request.getEmail())).thenReturn(Optional.of(unverifiedUser));
        when(registrationOtpRepository.findTopByUserAndIsUsedFalseOrderByCreatedAtDesc(unverifiedUser))
                .thenReturn(Optional.of(otpEntity));

        IllegalArgumentException ex = assertThrows(IllegalArgumentException.class, () -> authService.verifyOtp(request));
        assertTrue(ex.getMessage().contains("Kode OTP salah. Sisa percobaan: 2"));
        assertEquals(3, otpEntity.getAttempts());
        assertFalse(otpEntity.getIsUsed());
        verify(registrationOtpRepository, times(1)).save(otpEntity);
    }

    @Test
    @DisplayName("verifyOtp: Melebihi batas percobaan -> OTP di-invalidate & Throws IllegalArgumentException")
    void verifyOtp_MaxAttemptsReached_InvalidatesOtp() {
        VerifyOtpRequest request = new VerifyOtpRequest();
        request.setEmail("user@example.com");
        request.setOtp("000000");

        UserEntity unverifiedUser = new UserEntity();
        unverifiedUser.setId(UUID.randomUUID());
        unverifiedUser.setEmail("user@example.com");
        unverifiedUser.setEmailVerified(false);

        RegistrationOtpEntity otpEntity = RegistrationOtpEntity.builder()
                .user(unverifiedUser)
                .otpHash("differentHash")
                .expiryDate(ZonedDateTime.now().plusMinutes(5))
                .attempts(4)
                .maxAttempts(5)
                .isUsed(false)
                .build();

        when(userRepository.findByEmailAndDeletedAtIsNull(request.getEmail())).thenReturn(Optional.of(unverifiedUser));
        when(registrationOtpRepository.findTopByUserAndIsUsedFalseOrderByCreatedAtDesc(unverifiedUser))
                .thenReturn(Optional.of(otpEntity));

        IllegalArgumentException ex = assertThrows(IllegalArgumentException.class, () -> authService.verifyOtp(request));
        assertTrue(ex.getMessage().contains("Batas percobaan telah habis"));
        assertTrue(otpEntity.getIsUsed());
        verify(registrationOtpRepository, times(1)).save(otpEntity);
    }

    @Test
    @DisplayName("resendOtp: Berhasil mengirim ulang OTP baru dan membatalkan OTP lama")
    void resendOtp_Success() {
        ResendOtpRequest request = new ResendOtpRequest("user@example.com");

        UserEntity unverifiedUser = new UserEntity();
        unverifiedUser.setId(UUID.randomUUID());
        unverifiedUser.setEmail("user@example.com");
        unverifiedUser.setEmailVerified(false);

        RegistrationOtpEntity oldOtp = RegistrationOtpEntity.builder()
                .user(unverifiedUser)
                .otpHash("oldHash")
                .expiryDate(ZonedDateTime.now().plusMinutes(3))
                .attempts(1)
                .maxAttempts(5)
                .isUsed(false)
                .lastResendAt(ZonedDateTime.now().minusSeconds(70)) // cooldown passed (>60s)
                .build();

        when(userRepository.findByEmailAndDeletedAtIsNull(request.getEmail())).thenReturn(Optional.of(unverifiedUser));
        when(registrationOtpRepository.findTopByUserAndIsUsedFalseOrderByCreatedAtDesc(unverifiedUser))
                .thenReturn(Optional.of(oldOtp));
        when(registrationOtpRepository.findAllByUserAndIsUsedFalse(unverifiedUser))
                .thenReturn(List.of(oldOtp));
        when(userProfileRepository.findByUser(unverifiedUser)).thenReturn(Optional.empty());
        when(emailService.sendRegistrationOtpEmail(anyString(), any(), anyString(), anyInt())).thenReturn(true);

        assertDoesNotThrow(() -> authService.resendOtp(request));

        assertTrue(oldOtp.getIsUsed());
        verify(registrationOtpRepository, times(1)).save(any(RegistrationOtpEntity.class));
        verify(emailService, times(1)).sendRegistrationOtpEmail(eq(unverifiedUser.getEmail()), anyString(), anyString(), anyInt());
    }

    @Test
    @DisplayName("resendOtp: Cooldown masih aktif -> Throws IllegalArgumentException")
    void resendOtp_CooldownActive_ThrowsIllegalArgumentException() {
        ResendOtpRequest request = new ResendOtpRequest("user@example.com");

        UserEntity unverifiedUser = new UserEntity();
        unverifiedUser.setId(UUID.randomUUID());
        unverifiedUser.setEmail("user@example.com");
        unverifiedUser.setEmailVerified(false);

        RegistrationOtpEntity recentOtp = RegistrationOtpEntity.builder()
                .user(unverifiedUser)
                .otpHash("recentHash")
                .expiryDate(ZonedDateTime.now().plusMinutes(5))
                .attempts(0)
                .maxAttempts(5)
                .isUsed(false)
                .lastResendAt(ZonedDateTime.now().minusSeconds(20)) // only 20 seconds ago (< 60s)
                .build();

        when(userRepository.findByEmailAndDeletedAtIsNull(request.getEmail())).thenReturn(Optional.of(unverifiedUser));
        when(registrationOtpRepository.findTopByUserAndIsUsedFalseOrderByCreatedAtDesc(unverifiedUser))
                .thenReturn(Optional.of(recentOtp));

        IllegalArgumentException ex = assertThrows(IllegalArgumentException.class, () -> authService.resendOtp(request));
        assertTrue(ex.getMessage().contains("Harap tunggu"));
        verify(registrationOtpRepository, never()).save(argThat(otp -> otp != recentOtp));
    }

    @Test
    @DisplayName("resendOtp: Akun sudah terverifikasi -> Throws IllegalArgumentException")
    void resendOtp_AlreadyVerifiedUser_ThrowsIllegalArgumentException() {
        ResendOtpRequest request = new ResendOtpRequest("user@example.com");
        mockUser.setEmailVerified(true);

        when(userRepository.findByEmailAndDeletedAtIsNull(request.getEmail())).thenReturn(Optional.of(mockUser));

        IllegalArgumentException ex = assertThrows(IllegalArgumentException.class, () -> authService.resendOtp(request));
        assertEquals("Akun sudah aktif dan terverifikasi. Silakan login.", ex.getMessage());
        verify(registrationOtpRepository, never()).save(any());
    }

    @Test
    @DisplayName("register: Pengiriman email OTP gagal -> Throws IllegalStateException")
    void register_EmailDeliveryFailure_ThrowsIllegalStateException() {
        RegisterRequest request = new RegisterRequest();
        request.setEmail("newuser@example.com");
        request.setPassword("Password123!");
        request.setPasswordConfirmation("Password123!");
        request.setFullName("New User");

        when(userRepository.findByEmailAndDeletedAtIsNull(request.getEmail())).thenReturn(Optional.empty());
        when(roleRepository.findByName("ROLE_CUSTOMER")).thenReturn(Optional.of(customerRole));
        when(passwordEncoder.encode(request.getPassword())).thenReturn("encodedPassword");
        when(userRepository.save(any(UserEntity.class))).thenAnswer(invocation -> {
            UserEntity u = invocation.getArgument(0);
            u.setId(UUID.randomUUID());
            return u;
        });
        when(emailService.sendRegistrationOtpEmail(anyString(), any(), anyString(), anyInt())).thenReturn(false);

        IllegalStateException ex = assertThrows(IllegalStateException.class, () -> authService.register(request));
        assertTrue(ex.getMessage().contains("Gagal mengirimkan kode verifikasi OTP"));
    }

    @Test
    @DisplayName("resendOtp: Pengiriman email OTP gagal -> Throws IllegalStateException")
    void resendOtp_EmailDeliveryFailure_ThrowsIllegalStateException() {
        ResendOtpRequest request = new ResendOtpRequest("user@example.com");

        UserEntity unverifiedUser = new UserEntity();
        unverifiedUser.setId(UUID.randomUUID());
        unverifiedUser.setEmail("user@example.com");
        unverifiedUser.setEmailVerified(false);

        RegistrationOtpEntity oldOtp = RegistrationOtpEntity.builder()
                .user(unverifiedUser)
                .otpHash("oldHash")
                .expiryDate(ZonedDateTime.now().plusMinutes(3))
                .attempts(1)
                .maxAttempts(5)
                .isUsed(false)
                .lastResendAt(ZonedDateTime.now().minusSeconds(70))
                .build();

        when(userRepository.findByEmailAndDeletedAtIsNull(request.getEmail())).thenReturn(Optional.of(unverifiedUser));
        when(registrationOtpRepository.findTopByUserAndIsUsedFalseOrderByCreatedAtDesc(unverifiedUser))
                .thenReturn(Optional.of(oldOtp));
        when(registrationOtpRepository.findAllByUserAndIsUsedFalse(unverifiedUser))
                .thenReturn(List.of(oldOtp));
        when(userProfileRepository.findByUser(unverifiedUser)).thenReturn(Optional.empty());
        when(emailService.sendRegistrationOtpEmail(anyString(), any(), anyString(), anyInt())).thenReturn(false);

        IllegalStateException ex = assertThrows(IllegalStateException.class, () -> authService.resendOtp(request));
        assertTrue(ex.getMessage().contains("Gagal mengirimkan kode OTP baru"));
    }

    @Test
    @DisplayName("forgotPassword: User ditemukan tapi pengiriman email gagal -> Throws IllegalStateException")
    void forgotPassword_EmailDeliveryFailure_ThrowsIllegalStateException() {
        when(userRepository.findByEmailAndDeletedAtIsNull(mockUser.getEmail())).thenReturn(Optional.of(mockUser));
        when(emailService.sendPasswordResetOtpEmail(eq(mockUser.getEmail()), anyString(), eq(15))).thenReturn(false);

        IllegalStateException ex = assertThrows(IllegalStateException.class, () -> authService.forgotPassword(mockUser.getEmail()));
        assertTrue(ex.getMessage().contains("Gagal mengirimkan kode reset password"));
    }

    @Test
    @DisplayName("verifyResetCode: Kode valid -> Menandai kode used, membuat token reset, dan mengembalikan resetToken")
    void verifyResetCode_Success() {
        VerifyResetCodeRequest request = new VerifyResetCodeRequest("user@example.com", "123456");
        
        // SHA-256 for "123456"
        String validHash = "8d969eef6ecad3c29a3a629280e686cf0c3f5d5a86aff3ca12020c923adc6c92";
        PasswordResetCodeEntity codeEntity = PasswordResetCodeEntity.builder()
                .id(UUID.randomUUID())
                .user(mockUser)
                .codeHash(validHash)
                .expiryDate(ZonedDateTime.now().plusMinutes(10))
                .attempts(0)
                .maxAttempts(5)
                .isUsed(false)
                .build();

        when(userRepository.findByEmailAndDeletedAtIsNull(request.getEmail())).thenReturn(Optional.of(mockUser));
        when(passwordResetCodeRepository.findTopByUserAndIsUsedFalseOrderByCreatedAtDesc(mockUser))
                .thenReturn(Optional.of(codeEntity));

        VerifyResetCodeResponse response = authService.verifyResetCode(request);

        assertNotNull(response);
        assertNotNull(response.getResetToken());
        assertEquals("user@example.com", response.getEmail());
        assertTrue(codeEntity.getIsUsed());
        verify(passwordResetCodeRepository, times(1)).save(codeEntity);
        verify(passwordResetTokenRepository, times(1)).save(any());
    }

    @Test
    @DisplayName("verifyResetCode: User tidak ditemukan -> Throws IllegalArgumentException")
    void verifyResetCode_UserNotFound() {
        VerifyResetCodeRequest request = new VerifyResetCodeRequest("unknown@example.com", "123456");
        when(userRepository.findByEmailAndDeletedAtIsNull(request.getEmail())).thenReturn(Optional.empty());

        IllegalArgumentException ex = assertThrows(IllegalArgumentException.class, () -> authService.verifyResetCode(request));
        assertTrue(ex.getMessage().contains("Akun tidak ditemukan atau email salah"));
    }

    @Test
    @DisplayName("verifyResetCode: Kode sudah kedaluwarsa -> Throws IllegalArgumentException")
    void verifyResetCode_Expired() {
        VerifyResetCodeRequest request = new VerifyResetCodeRequest("user@example.com", "123456");
        PasswordResetCodeEntity expiredCode = PasswordResetCodeEntity.builder()
                .user(mockUser)
                .codeHash("dummyHash")
                .expiryDate(ZonedDateTime.now().minusMinutes(1))
                .attempts(0)
                .maxAttempts(5)
                .isUsed(false)
                .build();

        when(userRepository.findByEmailAndDeletedAtIsNull(request.getEmail())).thenReturn(Optional.of(mockUser));
        when(passwordResetCodeRepository.findTopByUserAndIsUsedFalseOrderByCreatedAtDesc(mockUser))
                .thenReturn(Optional.of(expiredCode));

        IllegalArgumentException ex = assertThrows(IllegalArgumentException.class, () -> authService.verifyResetCode(request));
        assertTrue(ex.getMessage().contains("kedaluwarsa"));
        assertTrue(expiredCode.getIsUsed());
    }

    @Test
    @DisplayName("verifyResetCode: Kode salah -> Menambah attempts dan throws IllegalArgumentException")
    void verifyResetCode_IncorrectCode() {
        VerifyResetCodeRequest request = new VerifyResetCodeRequest("user@example.com", "000000");
        String correctHash = "8d969eef6ecad3c29a3a629280e686cf0c3f5d5a86aff3ca12020c923adc6c92";
        PasswordResetCodeEntity codeEntity = PasswordResetCodeEntity.builder()
                .user(mockUser)
                .codeHash(correctHash)
                .expiryDate(ZonedDateTime.now().plusMinutes(10))
                .attempts(0)
                .maxAttempts(5)
                .isUsed(false)
                .build();

        when(userRepository.findByEmailAndDeletedAtIsNull(request.getEmail())).thenReturn(Optional.of(mockUser));
        when(passwordResetCodeRepository.findTopByUserAndIsUsedFalseOrderByCreatedAtDesc(mockUser))
                .thenReturn(Optional.of(codeEntity));

        IllegalArgumentException ex = assertThrows(IllegalArgumentException.class, () -> authService.verifyResetCode(request));
        assertTrue(ex.getMessage().contains("Kode reset password salah"));
        assertEquals(1, codeEntity.getAttempts());
        assertFalse(codeEntity.getIsUsed());
    }
}

