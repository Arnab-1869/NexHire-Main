package com.nexhire.service;

import com.nexhire.dto.RoleUpdateRequest;
import com.nexhire.dto.UserResponse;
import com.nexhire.entity.ActivityLog;
import com.nexhire.entity.User;
import com.nexhire.enums.UserRole;
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
