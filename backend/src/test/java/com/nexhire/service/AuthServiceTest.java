package com.nexhire.service;

import com.nexhire.dto.LoginRequest;
import com.nexhire.dto.LoginResponse;
import com.nexhire.dto.RegisterRequest;
import com.nexhire.entity.User;
import com.nexhire.enums.LifecycleStatus;
import com.nexhire.enums.UserRole;
import com.nexhire.exception.DuplicateResourceException;
import com.nexhire.repository.UserRepository;
import com.nexhire.security.JwtTokenProvider;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.crypto.password.PasswordEncoder;

import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class AuthServiceTest {

    @Mock
    private UserRepository userRepository;

    @Mock
    private PasswordEncoder passwordEncoder;

    @Mock
    private JwtTokenProvider jwtTokenProvider;

    @Mock
    private AuthenticationManager authenticationManager;

    @InjectMocks
    private AuthService authService;

    private RegisterRequest registerRequest;
    private LoginRequest loginRequest;
    private User savedUser;

    @BeforeEach
    void setUp() {
        registerRequest = RegisterRequest.builder()
                .name("John Doe")
                .email("john@example.com")
                .password("password123")
                .phone("9876543210")
                .build();

        loginRequest = LoginRequest.builder()
                .email("john@example.com")
                .password("password123")
                .build();

        savedUser = User.builder()
                .id(1L)
                .name("John Doe")
                .email("john@example.com")
                .password("$2a$10$hashedpassword")
                .phone("9876543210")
                .role(UserRole.EMPLOYEE)
                .lifecycleStatus(LifecycleStatus.CANDIDATE)
                .active(true)
                .build();
    }

    @Test
    @DisplayName("Register creates user with EMPLOYEE role and CANDIDATE lifecycle status")
    void register_shouldCreateUserWithCorrectDefaults() {
        when(userRepository.existsByEmail(anyString())).thenReturn(false);
        when(passwordEncoder.encode(anyString())).thenReturn("$2a$10$hashedpassword");
        when(userRepository.save(any(User.class))).thenReturn(savedUser);

        User result = authService.register(registerRequest);

        assertThat(result.getRole()).isEqualTo(UserRole.EMPLOYEE);
        assertThat(result.getLifecycleStatus()).isEqualTo(LifecycleStatus.CANDIDATE);
        assertThat(result.getActive()).isTrue();
    }

    @Test
    @DisplayName("Register hashes password with BCrypt")
    void register_shouldHashPassword() {
        when(userRepository.existsByEmail(anyString())).thenReturn(false);
        when(passwordEncoder.encode("password123")).thenReturn("$2a$10$hashedpassword");
        when(userRepository.save(any(User.class))).thenReturn(savedUser);

        authService.register(registerRequest);

        verify(passwordEncoder).encode("password123");
        verify(userRepository).save(argThat(user ->
                user.getPassword().equals("$2a$10$hashedpassword")));
    }

    @Test
    @DisplayName("Register rejects duplicate email with DuplicateResourceException")
    void register_shouldRejectDuplicateEmail() {
        when(userRepository.existsByEmail("john@example.com")).thenReturn(true);

        assertThatThrownBy(() -> authService.register(registerRequest))
                .isInstanceOf(DuplicateResourceException.class)
                .hasMessageContaining("john@example.com");

        verify(userRepository, never()).save(any());
    }

    @Test
    @DisplayName("Login with valid credentials returns JWT token and user info")
    void login_withValidCredentials_shouldReturnTokenAndUserInfo() {
        when(authenticationManager.authenticate(any(UsernamePasswordAuthenticationToken.class)))
                .thenReturn(new UsernamePasswordAuthenticationToken("john@example.com", null));
        when(userRepository.findByEmail("john@example.com")).thenReturn(Optional.of(savedUser));
        when(jwtTokenProvider.generateToken(1L, "john@example.com", "EMPLOYEE"))
                .thenReturn("jwt-token-123");

        LoginResponse response = authService.login(loginRequest);

        assertThat(response.getToken()).isEqualTo("jwt-token-123");
        assertThat(response.getUserId()).isEqualTo(1L);
        assertThat(response.getName()).isEqualTo("John Doe");
        assertThat(response.getEmail()).isEqualTo("john@example.com");
        assertThat(response.getRole()).isEqualTo("EMPLOYEE");
        assertThat(response.getLifecycleStatus()).isEqualTo("CANDIDATE");
    }

    @Test
    @DisplayName("Login with invalid credentials throws BadCredentialsException")
    void login_withInvalidCredentials_shouldThrowException() {
        when(authenticationManager.authenticate(any(UsernamePasswordAuthenticationToken.class)))
                .thenThrow(new BadCredentialsException("Bad credentials"));

        assertThatThrownBy(() -> authService.login(loginRequest))
                .isInstanceOf(BadCredentialsException.class);
    }

    @Test
    @DisplayName("Login with inactive user throws BadCredentialsException")
    void login_withInactiveUser_shouldThrowException() {
        savedUser.setActive(false);
        when(authenticationManager.authenticate(any(UsernamePasswordAuthenticationToken.class)))
                .thenReturn(new UsernamePasswordAuthenticationToken("john@example.com", null));
        when(userRepository.findByEmail("john@example.com")).thenReturn(Optional.of(savedUser));

        assertThatThrownBy(() -> authService.login(loginRequest))
                .isInstanceOf(BadCredentialsException.class)
                .hasMessageContaining("deactivated");
    }

    @Test
    @DisplayName("Register sets active=true by default")
    void register_shouldSetActiveTrue() {
        when(userRepository.existsByEmail(anyString())).thenReturn(false);
        when(passwordEncoder.encode(anyString())).thenReturn("$2a$10$hashedpassword");
        when(userRepository.save(any(User.class))).thenReturn(savedUser);

        User result = authService.register(registerRequest);

        assertThat(result.getActive()).isTrue();
        verify(userRepository).save(argThat(User::getActive));
    }
}
