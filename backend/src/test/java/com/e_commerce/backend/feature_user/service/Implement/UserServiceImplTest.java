package com.e_commerce.backend.feature_user.service.Implement;

import com.e_commerce.backend.exception.custom.ResourceNotFoundException;
import com.e_commerce.backend.feature_user.Model.Role;
import com.e_commerce.backend.feature_user.Model.UserEntity;
import com.e_commerce.backend.feature_user.Model.UserProfileEntity;
import com.e_commerce.backend.feature_user.dto.UpdateProfileRequest;
import com.e_commerce.backend.feature_user.dto.UserProfileResponse;
import com.e_commerce.backend.feature_user.dto.UserResponse;
import com.e_commerce.backend.feature_user.repository.UserProfileRepository;
import com.e_commerce.backend.feature_user.repository.UserRepository;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;

import java.time.ZoneOffset;
import java.time.ZonedDateTime;
import java.util.List;
import java.util.Optional;
import java.util.Set;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
@DisplayName("UserServiceImpl Unit Tests")
class UserServiceImplTest {

    @Mock
    private UserRepository userRepository;

    @Mock
    private UserProfileRepository userProfileRepository;

    @InjectMocks
    private UserServiceImpl userService;

    private UserEntity mockUser;
    private UserProfileEntity mockProfile;

    @BeforeEach
    void setUp() {
        mockUser = new UserEntity();
        mockUser.setId(UUID.randomUUID());
        mockUser.setEmail("test@example.com");
        mockUser.setPassword_hash("EncodedPass123!");
        mockUser.setCreatedAt(ZonedDateTime.now(ZoneOffset.UTC));

        mockProfile = UserProfileEntity.builder()
                .id(UUID.randomUUID())
                .user(mockUser)
                .fullName("John Doe")
                .phone("081234567890")
                .address("Jl. Jendral Sudirman No. 1, Jakarta")
                .build();

        UsernamePasswordAuthenticationToken auth =
                new UsernamePasswordAuthenticationToken("test@example.com", null, null);
        SecurityContextHolder.getContext().setAuthentication(auth);
    }

    @AfterEach
    void tearDown() {
        SecurityContextHolder.clearContext();
    }

    @Test
    @DisplayName("getMyProfile - returns complete profile with phone and address")
    void getMyProfile_Success() {
        when(userRepository.findByEmailAndDeletedAtIsNull("test@example.com"))
                .thenReturn(Optional.of(mockUser));
        when(userProfileRepository.findByUser(mockUser))
                .thenReturn(Optional.of(mockProfile));

        UserProfileResponse response = userService.getMyProfile();

        assertNotNull(response);
        assertEquals("test@example.com", response.getEmail());
        assertEquals("John Doe", response.getFullName());
        assertEquals("John Doe", response.getName()); // Compatibility getter
        assertEquals("081234567890", response.getPhone());
        assertEquals("081234567890", response.getPhoneNumber()); // Compatibility getter
        assertEquals("Jl. Jendral Sudirman No. 1, Jakarta", response.getAddress());
        assertNotNull(response.getJoinedAt());
    }

    @Test
    @DisplayName("getMyProfile - throws ResourceNotFoundException when user not found")
    void getMyProfile_UserNotFound() {
        when(userRepository.findByEmailAndDeletedAtIsNull("test@example.com"))
                .thenReturn(Optional.empty());

        assertThrows(ResourceNotFoundException.class, () -> userService.getMyProfile());
    }

    @Test
    @DisplayName("updateMyProfile - successfully updates fullName, phone, and address")
    void updateMyProfile_Success() {
        when(userRepository.findByEmailAndDeletedAtIsNull("test@example.com"))
                .thenReturn(Optional.of(mockUser));
        when(userProfileRepository.findByUser(mockUser))
                .thenReturn(Optional.of(mockProfile));
        when(userProfileRepository.save(any(UserProfileEntity.class)))
                .thenAnswer(invocation -> invocation.getArgument(0));

        UpdateProfileRequest request = new UpdateProfileRequest();
        request.setFullName("Jane Doe Updated");
        request.setPhone("+628987654321");
        request.setAddress("Jl. Gatot Subroto No. 45, Bandung");

        UserProfileResponse response = userService.updateMyProfile(request);

        assertNotNull(response);
        assertEquals("Jane Doe Updated", response.getFullName());
        assertEquals("+628987654321", response.getPhone());
        assertEquals("Jl. Gatot Subroto No. 45, Bandung", response.getAddress());

        verify(userProfileRepository, times(1)).save(argThat(p ->
                p.getFullName().equals("Jane Doe Updated") &&
                p.getPhone().equals("+628987654321") &&
                p.getAddress().equals("Jl. Gatot Subroto No. 45, Bandung")
        ));
    }

    @Test
    @DisplayName("updateMyProfile - clearing phone sets null")
    void updateMyProfile_ClearPhone() {
        when(userRepository.findByEmailAndDeletedAtIsNull("test@example.com"))
                .thenReturn(Optional.of(mockUser));
        when(userProfileRepository.findByUser(mockUser))
                .thenReturn(Optional.of(mockProfile));
        when(userProfileRepository.save(any(UserProfileEntity.class)))
                .thenAnswer(invocation -> invocation.getArgument(0));

        UpdateProfileRequest request = new UpdateProfileRequest();
        request.setFullName("John Doe");
        request.setPhone("");
        request.setAddress("");

        UserProfileResponse response = userService.updateMyProfile(request);

        assertNotNull(response);
        assertNull(response.getPhone());
        assertNull(response.getAddress());

        verify(userProfileRepository, times(1)).save(argThat(p ->
                p.getPhone() == null && p.getAddress() == null
        ));
    }

    @Test
    @DisplayName("getAllUsers - returns paginated list of users")
    void getAllUsers_Success() {
        Pageable pageable = PageRequest.of(0, 10);
        Page<UserEntity> userPage = new PageImpl<>(List.of(mockUser), pageable, 1);

        when(userRepository.findAll(pageable)).thenReturn(userPage);
        when(userProfileRepository.findByUser(mockUser)).thenReturn(Optional.of(mockProfile));

        Page<UserResponse> result = userService.getAllUsers(pageable);

        assertNotNull(result);
        assertEquals(1, result.getTotalElements());
        assertEquals("test@example.com", result.getContent().get(0).getEmail());
        assertEquals("John Doe", result.getContent().get(0).getFullName());
    }

    @Test
    @DisplayName("getUserById - returns user details when found")
    void getUserById_Success() {
        UUID id = mockUser.getId();
        when(userRepository.findById(id)).thenReturn(Optional.of(mockUser));
        when(userProfileRepository.findByUser(mockUser)).thenReturn(Optional.of(mockProfile));

        UserResponse response = userService.getUserById(id);

        assertNotNull(response);
        assertEquals(id, response.getId());
        assertEquals("test@example.com", response.getEmail());
        assertEquals("John Doe", response.getFullName());
    }

    @Test
    @DisplayName("getUserById - throws ResourceNotFoundException when user not found")
    void getUserById_NotFound() {
        UUID randomId = UUID.randomUUID();
        when(userRepository.findById(randomId)).thenReturn(Optional.empty());

        assertThrows(ResourceNotFoundException.class, () -> userService.getUserById(randomId));
    }

    @Test
    @DisplayName("deleteUser - successfully soft deletes target user")
    void deleteUser_Success() {
        UUID targetId = UUID.randomUUID();
        UserEntity targetUser = new UserEntity();
        targetUser.setId(targetId);
        targetUser.setEmail("other@example.com");

        when(userRepository.findByEmailAndDeletedAtIsNull("test@example.com"))
                .thenReturn(Optional.of(mockUser));
        when(userRepository.findById(targetId)).thenReturn(Optional.of(targetUser));

        userService.deleteUser(targetId);

        verify(userRepository, times(1)).delete(targetUser);
    }

    @Test
    @DisplayName("deleteUser - throws IllegalArgumentException when admin tries to delete own account")
    void deleteUser_SelfDeletion_ThrowsException() {
        when(userRepository.findByEmailAndDeletedAtIsNull("test@example.com"))
                .thenReturn(Optional.of(mockUser));

        IllegalArgumentException ex = assertThrows(IllegalArgumentException.class, () ->
                userService.deleteUser(mockUser.getId())
        );
        assertTrue(ex.getMessage().contains("tidak dapat menghapus akunnya sendiri"));
        verify(userRepository, never()).delete(any());
    }
}
