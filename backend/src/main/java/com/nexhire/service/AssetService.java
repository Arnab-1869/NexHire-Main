package com.nexhire.service;

import com.nexhire.dto.AssetAssignmentResponse;
import com.nexhire.dto.AssetRequest;
import com.nexhire.dto.AssetResponse;
import com.nexhire.entity.Asset;
import com.nexhire.entity.AssetAssignment;
import com.nexhire.entity.User;
import com.nexhire.exception.DuplicateResourceException;
import com.nexhire.exception.ResourceNotFoundException;
import com.nexhire.repository.AssetAssignmentRepository;
import com.nexhire.repository.AssetRepository;
import com.nexhire.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
public class AssetService {

    private final AssetRepository assetRepository;
    private final AssetAssignmentRepository assetAssignmentRepository;
    private final UserRepository userRepository;

    /** ADMIN: list all assets. */
    public List<AssetResponse> getAllAssets() {
        return assetRepository.findAll().stream().map(this::toAssetResponse).toList();
    }

    /** ADMIN: create asset. */
    @Transactional
    public AssetResponse createAsset(AssetRequest request) {
        Asset asset = Asset.builder()
                .name(request.getName())
                .type(request.getType())
                .serialNumber(request.getSerialNumber())
                .build();
        return toAssetResponse(assetRepository.save(asset));
    }

    /** ADMIN: assign an asset to a user. */
    @Transactional
    public AssetAssignmentResponse assign(Long assetId, Long userId) {
        Asset asset = assetRepository.findById(assetId)
                .orElseThrow(() -> new ResourceNotFoundException("Asset not found with id: " + assetId));
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with id: " + userId));

        if (assetAssignmentRepository.findByAssetIdAndActiveTrue(assetId).isPresent()) {
            throw new DuplicateResourceException("Asset is already assigned");
        }

        AssetAssignment assignment = AssetAssignment.builder()
                .asset(asset)
                .user(user)
                .assignedAt(LocalDateTime.now())
                .active(true)
                .build();
        return toAssignmentResponse(assetAssignmentRepository.save(assignment));
    }

    /** ADMIN: revoke an active assignment. */
    @Transactional
    public AssetAssignmentResponse revoke(Long assignmentId) {
        AssetAssignment assignment = assetAssignmentRepository.findById(assignmentId)
                .orElseThrow(() -> new ResourceNotFoundException("Assignment not found with id: " + assignmentId));
        assignment.setActive(false);
        assignment.setRevokedAt(LocalDateTime.now());
        return toAssignmentResponse(assetAssignmentRepository.save(assignment));
    }

    /** ADMIN: user's asset assignments (active + historical). */
    public List<AssetAssignmentResponse> getUserAssignments(Long userId) {
        return assetAssignmentRepository.findByUserId(userId).stream()
                .map(this::toAssignmentResponse).toList();
    }

    private AssetResponse toAssetResponse(Asset asset) {
        AssetAssignment active = assetAssignmentRepository.findByAssetIdAndActiveTrue(asset.getId()).orElse(null);
        return AssetResponse.builder()
                .id(asset.getId())
                .name(asset.getName())
                .type(asset.getType())
                .serialNumber(asset.getSerialNumber())
                .assigned(active != null)
                .assignedToName(active != null ? active.getUser().getName() : null)
                .build();
    }

    private AssetAssignmentResponse toAssignmentResponse(AssetAssignment a) {
        return AssetAssignmentResponse.builder()
                .id(a.getId())
                .assetId(a.getAsset().getId())
                .assetName(a.getAsset().getName())
                .assetType(a.getAsset().getType())
                .serialNumber(a.getAsset().getSerialNumber())
                .userId(a.getUser().getId())
                .userName(a.getUser().getName())
                .active(a.getActive())
                .assignedAt(a.getAssignedAt())
                .revokedAt(a.getRevokedAt())
                .build();
    }
}
