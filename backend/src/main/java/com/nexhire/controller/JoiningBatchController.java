package com.nexhire.controller;

import com.nexhire.dto.JoiningBatchRequest;
import com.nexhire.dto.JoiningBatchResponse;
import com.nexhire.dto.UserResponse;
import com.nexhire.service.JoiningBatchService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/joining-batches")
@RequiredArgsConstructor
@PreAuthorize("hasRole('HR')")
public class JoiningBatchController {

    private final JoiningBatchService batchService;

    @GetMapping
    public ResponseEntity<List<JoiningBatchResponse>> getAllBatches() {
        return ResponseEntity.ok(batchService.getAllBatches());
    }

    @GetMapping("/{id}")
    public ResponseEntity<JoiningBatchResponse> getBatchById(@PathVariable Long id) {
        return ResponseEntity.ok(batchService.getBatchById(id));
    }

    @PostMapping
    public ResponseEntity<JoiningBatchResponse> createBatch(
            @RequestBody JoiningBatchRequest request,
            Authentication authentication) {
        Long hrUserId = (Long) authentication.getPrincipal();
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(batchService.createBatch(request, hrUserId));
    }

    @GetMapping("/eligible-candidates")
    public ResponseEntity<List<UserResponse>> getEligibleCandidates(
            @RequestParam("joiningLocId") Long joiningLocId,
            @RequestParam("trainingLocId") Long trainingLocId) {
        return ResponseEntity.ok(batchService.getSortedEligibleCandidates(joiningLocId, trainingLocId));
    }

    @PostMapping("/{batchId}/assign")
    public ResponseEntity<JoiningBatchResponse> assignCandidates(
            @PathVariable Long batchId,
            @RequestBody Map<String, List<Long>> body) {
        List<Long> userIds = body.get("userIds");
        return ResponseEntity.ok(batchService.assignCandidatesToBatch(batchId, userIds));
    }

    @PostMapping("/{batchId}/send-letters")
    public ResponseEntity<JoiningBatchResponse> sendLetters(
            @PathVariable Long batchId,
            Authentication authentication) {
        Long hrUserId = (Long) authentication.getPrincipal();
        return ResponseEntity.ok(batchService.sendJoiningLetters(batchId, hrUserId));
    }
}
