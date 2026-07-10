package com.nexhire.controller;

import com.nexhire.dto.TraineeResponse;
import com.nexhire.dto.TrainingProgressRequest;
import com.nexhire.entity.JoiningBatch;
import com.nexhire.service.TrainingAssignmentService;
import com.nexhire.service.TrainingService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/training")
@RequiredArgsConstructor
public class TrainingController {

    private final TrainingService trainingService;
    private final TrainingAssignmentService assignmentService;
    private final com.nexhire.repository.TrainingRepository trainingRepository;
    private final com.nexhire.repository.TrainingBlockRepository trainingBlockRepository;
    private final com.nexhire.repository.LocationRepository locationRepository;

    @GetMapping("/programs")
    @PreAuthorize("hasRole('HR')")
    public ResponseEntity<List<com.nexhire.entity.Training>> getTrainingPrograms() {
        return ResponseEntity.ok(trainingRepository.findAll());
    }

    @GetMapping("/blocks")
    @PreAuthorize("hasAnyRole('HR', 'ADMIN')")
    public ResponseEntity<List<com.nexhire.entity.TrainingBlock>> getTrainingBlocks() {
        return ResponseEntity.ok(trainingBlockRepository.findAll());
    }

    @PostMapping("/blocks")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<com.nexhire.entity.TrainingBlock> createTrainingBlock(
            @RequestBody Map<String, Object> body) {
        String name = (String) body.get("name");
        Long locationId = Long.valueOf(body.get("locationId").toString());
        Integer capacity = body.containsKey("capacity") ? Integer.valueOf(body.get("capacity").toString()) : 60;

        com.nexhire.entity.Location location = locationRepository.findById(locationId)
                .orElseThrow(() -> new com.nexhire.exception.ResourceNotFoundException("Location not found"));

        com.nexhire.entity.TrainingBlock block = com.nexhire.entity.TrainingBlock.builder()
                .name(name)
                .location(location)
                .capacity(capacity)
                .occupiedSeats(0)
                .build();

        return ResponseEntity.ok(trainingBlockRepository.save(block));
    }

    /** HR: list all trainees. */
    @GetMapping("/trainees")
    @PreAuthorize("hasRole('HR')")
    public ResponseEntity<List<TraineeResponse>> getAllTrainees() {
        return ResponseEntity.ok(trainingService.getAllTrainees());
    }

    @GetMapping("/batch/{batchId}")
    @PreAuthorize("hasRole('HR')")
    public ResponseEntity<List<TraineeResponse>> getTraineesByBatch(@PathVariable Long batchId) {
        return ResponseEntity.ok(trainingService.getTraineesByBatch(batchId));
    }

    /** EMPLOYEE: own training record. */
    @GetMapping("/my")
    @PreAuthorize("hasRole('EMPLOYEE')")
    public ResponseEntity<TraineeResponse> getMyTraining(Authentication authentication) {
        Long userId = (Long) authentication.getPrincipal();
        return ResponseEntity.ok(trainingService.getMyTraining(userId));
    }

    /** HR: update training progress. */
    @PutMapping("/{traineeId}/progress")
    @PreAuthorize("hasRole('HR')")
    public ResponseEntity<TraineeResponse> updateProgress(
            @PathVariable Long traineeId,
            @Valid @RequestBody TrainingProgressRequest request) {
        return ResponseEntity.ok(trainingService.updateProgress(traineeId, request));
    }

    /** HR: assign batch to training block (hiring budget & seat validation/occupancy updates). */
    @PostMapping("/assign")
    @PreAuthorize("hasRole('HR')")
    public ResponseEntity<Map<String, String>> assignBatch(
            @RequestBody Map<String, Long> body,
            Authentication authentication) {
        Long batchId = body.get("batchId");
        Long hrUserId = (Long) authentication.getPrincipal();
        assignmentService.assignBatchToTraining(batchId, hrUserId);
        return ResponseEntity.ok(Map.of("message", "Batch assigned to training block successfully."));
    }

    /** HR: move trainee to LAP. */
    @PostMapping("/{traineeId}/lap")
    @PreAuthorize("hasRole('HR')")
    public ResponseEntity<TraineeResponse> moveToLap(
            @PathVariable Long traineeId,
            @RequestBody Map<String, String> body,
            Authentication authentication) {
        String remarks = body.getOrDefault("remarks", "Assigned to LAP due to low score/attendance.");
        Long hrUserId = (Long) authentication.getPrincipal();
        return ResponseEntity.ok(trainingService.moveToLap(traineeId, remarks, hrUserId));
    }

    /** HR: remove trainee from LAP. */
    @PostMapping("/{traineeId}/remove-lap")
    @PreAuthorize("hasRole('HR')")
    public ResponseEntity<TraineeResponse> removeFromLap(
            @PathVariable Long traineeId,
            Authentication authentication) {
        Long hrUserId = (Long) authentication.getPrincipal();
        return ResponseEntity.ok(trainingService.removeFromLap(traineeId, hrUserId));
    }

    /** HR: flag candidate. */
    @PostMapping("/{traineeId}/flag")
    @PreAuthorize("hasRole('HR')")
    public ResponseEntity<TraineeResponse> flagCandidate(
            @PathVariable Long traineeId,
            @RequestBody Map<String, String> body,
            Authentication authentication) {
        String reason = body.getOrDefault("reason", "HR Flagged");
        Long hrUserId = (Long) authentication.getPrincipal();
        return ResponseEntity.ok(trainingService.flagCandidate(traineeId, reason, hrUserId));
    }

    /** HR: complete training batch and release passed trainees. */
    @PostMapping("/batch/{batchId}/complete")
    @PreAuthorize("hasRole('HR')")
    public ResponseEntity<Map<String, String>> completeBatch(
            @PathVariable Long batchId,
            Authentication authentication) {
        Long hrUserId = (Long) authentication.getPrincipal();
        JoiningBatch completedBatch = trainingService.completeBatch(batchId, hrUserId);
        return ResponseEntity.ok(Map.of(
                "status", completedBatch.getStatus(),
                "message", "Batch completed with status: " + completedBatch.getStatus()
        ));
    }

    /** HR: get exception review queue. */
    @GetMapping("/exceptions")
    @PreAuthorize("hasRole('HR')")
    public ResponseEntity<List<TraineeResponse>> getExceptions() {
        return ResponseEntity.ok(trainingService.getExceptionQueue());
    }

    /** HR: resolve exception. */
    @PostMapping("/exceptions/{traineeId}/resolve")
    @PreAuthorize("hasRole('HR')")
    public ResponseEntity<TraineeResponse> resolveException(
            @PathVariable Long traineeId,
            @RequestBody Map<String, String> body,
            Authentication authentication) {
        String action = body.get("action"); // RELEASE, REJECT, EXTEND
        String remarks = body.get("remarks");
        Long hrUserId = (Long) authentication.getPrincipal();
        return ResponseEntity.ok(trainingService.resolveException(traineeId, action, remarks, hrUserId));
    }

    /** HR: mark training complete. */
    @PutMapping("/{traineeId}/complete")
    @PreAuthorize("hasRole('HR')")
    public ResponseEntity<TraineeResponse> completeTraining(@PathVariable Long traineeId) {
        return ResponseEntity.ok(trainingService.completeTraining(traineeId));
    }
}
