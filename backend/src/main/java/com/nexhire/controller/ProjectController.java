package com.nexhire.controller;

import com.nexhire.dto.ProjectAssignmentResponse;
import com.nexhire.dto.ProjectRequest;
import com.nexhire.dto.ProjectResponse;
import com.nexhire.dto.TraineeResponse;
import com.nexhire.service.ProjectService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/projects")
@RequiredArgsConstructor
public class ProjectController {

    private final ProjectService projectService;

    /** ADMIN + RMG: list all projects. Admin manages them; RMG views them to allocate trainees. */
    @GetMapping
    @PreAuthorize("hasAnyRole('ADMIN', 'RMG')")
    public ResponseEntity<List<ProjectResponse>> getProjects() {
        return ResponseEntity.ok(projectService.getAllProjects());
    }

    /** ADMIN: create a project. */
    @PostMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ProjectResponse> createProject(@Valid @RequestBody ProjectRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(projectService.createProject(request));
    }

    /** ADMIN: update a project. */
    @PutMapping("/{projectId}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ProjectResponse> updateProject(
            @PathVariable Long projectId,
            @Valid @RequestBody ProjectRequest request) {
        return ResponseEntity.ok(projectService.updateProject(projectId, request));
    }

    /** ADMIN: delete a project. */
    @DeleteMapping("/{projectId}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Void> deleteProject(@PathVariable Long projectId) {
        projectService.deleteProject(projectId);
        return ResponseEntity.noContent().build();
    }

    /** RMG: list eligible (TRAINING_COMPLETED) trainees. */
    @GetMapping("/eligible-trainees")
    @PreAuthorize("hasRole('RMG')")
    public ResponseEntity<List<TraineeResponse>> getEligibleTrainees() {
        return ResponseEntity.ok(projectService.getEligibleTrainees());
    }

    /** RMG: assign a trainee to a project. */
    @PostMapping("/{projectId}/assign/{traineeId}")
    @PreAuthorize("hasRole('RMG')")
    public ResponseEntity<ProjectAssignmentResponse> assignTrainee(
            @PathVariable Long projectId,
            @PathVariable Long traineeId,
            Authentication authentication) {
        Long assignedById = (Long) authentication.getPrincipal();
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(projectService.assignTrainee(projectId, traineeId, assignedById));
    }
}
