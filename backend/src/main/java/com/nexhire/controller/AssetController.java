package com.nexhire.controller;

import com.nexhire.dto.AssetAssignmentResponse;
import com.nexhire.dto.AssetRequest;
import com.nexhire.dto.AssetResponse;
import com.nexhire.service.AssetService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/assets")
@RequiredArgsConstructor
public class AssetController {

    private final AssetService assetService;

    @GetMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<List<AssetResponse>> getAllAssets() {
        return ResponseEntity.ok(assetService.getAllAssets());
    }

    @PostMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<AssetResponse> createAsset(@Valid @RequestBody AssetRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(assetService.createAsset(request));
    }

    @PostMapping("/{assetId}/assign/{userId}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<AssetAssignmentResponse> assign(
            @PathVariable Long assetId,
            @PathVariable Long userId) {
        return ResponseEntity.status(HttpStatus.CREATED).body(assetService.assign(assetId, userId));
    }

    @PutMapping("/assignments/{id}/revoke")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<AssetAssignmentResponse> revoke(@PathVariable Long id) {
        return ResponseEntity.ok(assetService.revoke(id));
    }

    @GetMapping("/user/{userId}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<List<AssetAssignmentResponse>> getUserAssignments(@PathVariable Long userId) {
        return ResponseEntity.ok(assetService.getUserAssignments(userId));
    }
}
