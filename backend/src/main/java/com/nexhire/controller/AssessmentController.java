package com.nexhire.controller;

import com.nexhire.dto.ApplicationResponse;
import com.nexhire.dto.AssessmentRequest;
import com.nexhire.entity.AssessmentResult;
import com.nexhire.entity.JobApplication;
import com.nexhire.service.AssessmentService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/assessments")
@RequiredArgsConstructor
public class AssessmentController {

    private final AssessmentService assessmentService;

    @PostMapping("/{applicationId}")
    @PreAuthorize("hasRole('HR')")
    public ResponseEntity<Map<String, Object>> enterScore(
            @PathVariable Long applicationId,
            @Valid @RequestBody AssessmentRequest request,
            Authentication authentication) {
        Long evaluatorId = (Long) authentication.getPrincipal();
        AssessmentResult result = assessmentService.enterScore(applicationId, request, evaluatorId);
        return ResponseEntity.status(HttpStatus.CREATED).body(Map.of(
                "id", result.getId(),
                "applicationId", applicationId,
                "score", result.getScore(),
                "remarks", result.getRemarks() != null ? result.getRemarks() : "",
                "status", "ASSESSMENT_COMPLETED"
        ));
    }

    @PutMapping("/{applicationId}/qualify")
    @PreAuthorize("hasRole('HR')")
    public ResponseEntity<Map<String, Object>> qualify(@PathVariable Long applicationId) {
        JobApplication application = assessmentService.qualify(applicationId);
        return ResponseEntity.ok(Map.of(
                "applicationId", application.getId(),
                "status", application.getStatus().name()
        ));
    }

    @PutMapping("/{applicationId}/reject")
    @PreAuthorize("hasRole('HR')")
    public ResponseEntity<Map<String, Object>> reject(@PathVariable Long applicationId) {
        JobApplication application = assessmentService.reject(applicationId);
        return ResponseEntity.ok(Map.of(
                "applicationId", application.getId(),
                "status", application.getStatus().name()
        ));
    }
}
