package com.nexhire.controller;

import com.nexhire.dto.ApplicationResponse;
import com.nexhire.service.ApplicationService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/applications")
@RequiredArgsConstructor
public class ApplicationController {

    private final ApplicationService applicationService;

    @PostMapping
    @PreAuthorize("hasRole('EMPLOYEE')")
    public ResponseEntity<ApplicationResponse> apply(
            @RequestBody Map<String, Long> body,
            Authentication authentication) {
        Long userId = (Long) authentication.getPrincipal();
        Long jobId = body.get("jobId");
        return ResponseEntity.status(HttpStatus.CREATED).body(applicationService.applyToJob(userId, jobId));
    }

    @GetMapping("/my")
    @PreAuthorize("hasRole('EMPLOYEE')")
    public ResponseEntity<List<ApplicationResponse>> getMyApplications(Authentication authentication) {
        Long userId = (Long) authentication.getPrincipal();
        return ResponseEntity.ok(applicationService.getMyApplications(userId));
    }

    @GetMapping
    @PreAuthorize("hasRole('HR')")
    public ResponseEntity<List<ApplicationResponse>> getAllApplications() {
        return ResponseEntity.ok(applicationService.getAllApplications());
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasAnyRole('HR', 'EMPLOYEE')")
    public ResponseEntity<ApplicationResponse> getApplicationById(@PathVariable Long id) {
        return ResponseEntity.ok(applicationService.getApplicationById(id));
    }

    @PutMapping("/{id}/start-assessment")
    @PreAuthorize("hasRole('HR')")
    public ResponseEntity<ApplicationResponse> startAssessment(@PathVariable Long id) {
        return ResponseEntity.ok(applicationService.startAssessment(id));
    }
}
