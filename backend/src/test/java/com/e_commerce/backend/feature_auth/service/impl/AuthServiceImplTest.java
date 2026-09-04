package com.e_commerce.backend.feature_auth.service.impl;

import com.e_commerce.backend.feature_auth.dto.request.LoginRequest;
import com.e_commerce.backend.feature_auth.dto.request.RegisterRequest;
import com.e_commerce.backend.feature_auth.dto.request.ResetPasswordRequest;
import com.e_commerce.backend.feature_auth.dto.response.AuthResponse;
import com.e_commerce.backend.feature_auth.model.PasswordResetTokenEntity;
import com.e_commerce.backend.feature_auth.model.RefreshTokenEntity;
import com.e_commerce.backend.feature_auth.repository.PasswordResetTokenRepository;
import com.e_commerce.backend.feature_auth.repository.RefreshTokenRepository;
import com.e_commerce.backend.feature_user.Model.Role;
import com.e_commerce.backend.feature_user.Model.UserEntity;
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

import java.time.ZonedDateTime;
import java.util.HashSet;
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
        customerRole = new Role();
        customerRole.setId(UUID.randomUUID());
        customerRole.setName("ROLE_CUSTOMER");

        mockUser = new UserEntity();
        mockUser.setId(UUID.randomUUID());
        mockUser.setEmail("user@example.com");
        mockUser.setPassword_hash("encodedPassword");
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

        assertDoesNotThrow(() -> authService.register(request));

        verify(userRepository, times(1)).save(any(UserEntity.class));
        verify(userProfileRepository, times(1)).save(any());
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

        assertDoesNotThrow(() -> authService.register(request));

        verify(userProfileRepository, times(1)).save(argThat(p -> 
            p != null && "+628123456789".equals(p.getPhone()) && "Phone User".equals(p.getFullName())
        ));
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
    @DisplayName("forgotPassword: User ditemukan -> Menyimpan token dan memanggil emailService")
    void forgotPassword_UserFound_SendsEmail() {
        when(userRepository.findByEmailAndDeletedAtIsNull("user@example.com")).thenReturn(Optional.of(mockUser));

        assertDoesNotThrow(() -> authService.forgotPassword("user@example.com"));

        verify(passwordResetTokenRepository, times(1)).save(any());
        verify(emailService, times(1)).sendPasswordResetEmail(eq("user@example.com"), anyString());
    }

    @Test
    @DisplayName("forgotPassword: User tidak ditemukan -> Tidak throw exception (anti-enumeration) & tidak kirim email")
    void forgotPassword_UserNotFound_DoesNotSendEmail() {
        when(userRepository.findByEmailAndDeletedAtIsNull("unknown@example.com")).thenReturn(Optional.empty());

        assertDoesNotThrow(() -> authService.forgotPassword("unknown@example.com"));

        verify(passwordResetTokenRepository, never()).save(any());
        verify(emailService, never()).sendPasswordResetEmail(anyString(), anyString());
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
}
