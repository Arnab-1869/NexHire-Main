package com.nexhire.service;

import com.nexhire.dto.RoleUpdateRequest;
import com.nexhire.dto.UserResponse;
import com.nexhire.entity.ActivityLog;
import com.nexhire.entity.User;
import com.nexhire.enums.UserRole;
import com.nexhire.enums.LifecycleStatus;
import org.springframework.security.crypto.password.PasswordEncoder;
import com.nexhire.exception.ResourceNotFoundException;
import com.nexhire.repository.ActivityLogRepository;
import com.nexhire.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
public class UserManagementService {

    private final UserRepository userRepository;
    private final ActivityLogRepository activityLogRepository;
    private final PasswordEncoder passwordEncoder;

    /** ADMIN: list all users. */
    public List<UserResponse> getAllUsers() {
        return userRepository.findAll().stream().map(this::toResponse).toList();
    }

    /** ADMIN: update a user's role and log the change. */
    @Transactional
    public UserResponse updateRole(Long userId, RoleUpdateRequest request, Long adminId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with id: " + userId));

        UserRole newRole;
        try {
            newRole = UserRole.valueOf(request.getRole());
        } catch (IllegalArgumentException e) {
            throw new ResourceNotFoundException("Invalid role: " + request.getRole());
        }

        UserRole oldRole = user.getRole();
        user.setRole(newRole);
        userRepository.save(user);

        User admin = userRepository.findById(adminId).orElse(null);
        activityLogRepository.save(ActivityLog.builder()
                .user(admin != null ? admin : user)
                .actionType("ROLE_CHANGE")
                .description("Role for " + user.getEmail() + " changed from " + oldRole + " to " + newRole)
                .timestamp(LocalDateTime.now())
                .build());

        return toResponse(user);
    }

    /** ADMIN: deactivate a user (prevents login). */
    @Transactional
    public UserResponse deactivate(Long userId, Long adminId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with id: " + userId));

        user.setActive(false);
        userRepository.save(user);

        User admin = userRepository.findById(adminId).orElse(null);
        activityLogRepository.save(ActivityLog.builder()
                .user(admin != null ? admin : user)
                .actionType("USER_DEACTIVATED")
                .description("User " + user.getEmail() + " deactivated")
                .timestamp(LocalDateTime.now())
                .build());

        return toResponse(user);
    }

    /** ADMIN: activate a user. */
    @Transactional
    public UserResponse activate(Long userId, Long adminId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with id: " + userId));

        user.setActive(true);
        userRepository.save(user);

        User admin = userRepository.findById(adminId).orElse(null);
        activityLogRepository.save(ActivityLog.builder()
                .user(admin != null ? admin : user)
                .actionType("USER_ACTIVATED")
                .description("User " + user.getEmail() + " activated")
                .timestamp(LocalDateTime.now())
                .build());

        return toResponse(user);
    }

    @Transactional
    public UserResponse createUser(com.nexhire.dto.UserCreateRequest request, Long adminId) {
        if (userRepository.existsByEmail(request.getEmail())) {
            throw new com.nexhire.exception.DuplicateResourceException("Email already exists: " + request.getEmail());
        }

        UserRole role;
        try {
            role = UserRole.valueOf(request.getRole().toUpperCase());
        } catch (IllegalArgumentException e) {
            throw new com.nexhire.exception.ResourceNotFoundException("Invalid role: " + request.getRole());
        }

        User user = User.builder()
                .name(request.getName())
                .email(request.getEmail())
                .password(passwordEncoder.encode(request.getPassword()))
                .phone(request.getPhone() != null && !request.getPhone().trim().isEmpty() ? request.getPhone() : "9999999999")
                .role(role)
                .lifecycleStatus(role == UserRole.EMPLOYEE ? LifecycleStatus.CANDIDATE : null)
                .active(true)
                .build();

        user = userRepository.save(user);

        User admin = userRepository.findById(adminId).orElse(null);
        activityLogRepository.save(ActivityLog.builder()
                .user(admin != null ? admin : user)
                .actionType("USER_CREATED")
                .description("Admin created user " + user.getEmail() + " with role " + role)
                .timestamp(LocalDateTime.now())
                .build());

        return toResponse(user);
    }

    private UserResponse toResponse(User user) {
        return UserResponse.builder()
                .id(user.getId())
                .name(user.getName())
                .email(user.getEmail())
                .phone(user.getPhone())
                .role(user.getRole().name())
                .lifecycleStatus(user.getLifecycleStatus() != null ? user.getLifecycleStatus().name() : null)
                .active(user.getActive())
                .createdAt(user.getCreatedAt())
                .build();
    }
}
