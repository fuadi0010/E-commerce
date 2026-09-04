package com.e_commerce.backend.security;

import com.e_commerce.backend.feature_user.Model.Role;
import com.e_commerce.backend.feature_user.Model.UserEntity;
import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.io.Decoders;
import io.jsonwebtoken.security.Keys;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.test.util.ReflectionTestUtils;

import java.util.Collections;
import java.util.List;
import java.util.Set;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.*;

@DisplayName("JwtUtils Tests")
class JwtUtilsTest {

    private JwtUtils jwtUtils;
    private final String testSecret = "dGhpcy1pcy1hLXZlcnktc2VjdXJlLWtleS1mb3Itand0LXRlc3RpbmctcHVycG9zZXMtb25seS0xMjM0NTY3ODkwMTIzNDU2Nzg5MDEyMzQ1Njc4OTA=";

    @BeforeEach
    void setUp() {
        jwtUtils = new JwtUtils();
        ReflectionTestUtils.setField(jwtUtils, "jwtSecret", testSecret);
        ReflectionTestUtils.setField(jwtUtils, "jwtExpirationMs", 3600000);
    }

    @Test
    @DisplayName("generateJwtToken: Menyertakan subject dan roles claim")
    void generateJwtToken_IncludesRolesClaim() {
        Role adminRole = new Role();
        adminRole.setId(UUID.randomUUID());
        adminRole.setName("ROLE_ADMIN");

        UserEntity user = new UserEntity();
        user.setId(UUID.randomUUID());
        user.setEmail("admin@test.com");
        user.setPassword_hash("hash");
        user.setRoles(Set.of(adminRole));

        UserDetailsImpl userDetails = new UserDetailsImpl(user);
        Authentication auth = new UsernamePasswordAuthenticationToken(userDetails, null, userDetails.getAuthorities());

        String token = jwtUtils.generateJwtToken(auth);
        assertNotNull(token);
        assertTrue(jwtUtils.validateJwtToken(token));
        assertEquals("admin@test.com", jwtUtils.getUserNameFromJwtToken(token));

        Claims claims = Jwts.parserBuilder()
                .setSigningKey(Keys.hmacShaKeyFor(Decoders.BASE64.decode(testSecret)))
                .build()
                .parseClaimsJws(token)
                .getBody();

        List<?> roles = claims.get("roles", List.class);
        assertNotNull(roles);
        assertTrue(roles.contains("ROLE_ADMIN"));
    }

    @Test
    @DisplayName("generateJwtTokenFromEmail: Menyertakan roles list")
    void generateJwtTokenFromEmail_IncludesRoles() {
        String token = jwtUtils.generateJwtTokenFromEmail("admin@test.com", List.of("ROLE_ADMIN"));
        assertNotNull(token);
        assertTrue(jwtUtils.validateJwtToken(token));

        Claims claims = Jwts.parserBuilder()
                .setSigningKey(Keys.hmacShaKeyFor(Decoders.BASE64.decode(testSecret)))
                .build()
                .parseClaimsJws(token)
                .getBody();

        List<?> roles = claims.get("roles", List.class);
        assertNotNull(roles);
        assertEquals(List.of("ROLE_ADMIN"), roles);
    }
}
