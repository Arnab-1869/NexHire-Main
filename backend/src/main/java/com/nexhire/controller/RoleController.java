package com.nexhire.controller;

import com.nexhire.enums.UserRole;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.Arrays;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/roles")
@RequiredArgsConstructor
public class RoleController {

    /** ADMIN: list available roles with descriptions. */
    @GetMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<List<Map<String, String>>> getRoles() {
        List<Map<String, String>> roles = Arrays.stream(UserRole.values())
                .map(r -> Map.of("name", r.name(), "description", describe(r)))
                .toList();
        return ResponseEntity.ok(roles);
    }

    private String describe(UserRole role) {
        return switch (role) {
            case ADMIN -> "System administrator with full access";
            case HR -> "Manages hiring, assessments, offers, joining, training";
            case RMG -> "Assigns training-completed trainees to projects";
            case EMPLOYEE -> "Candidate/Trainee lifecycle user";
        };
    }
}
