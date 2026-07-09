package com.nexhire.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AssetAssignmentResponse {

    private Long id;
    private Long assetId;
    private String assetName;
    private String assetType;
    private String serialNumber;
    private Long userId;
    private String userName;
    private Boolean active;
    private LocalDateTime assignedAt;
    private LocalDateTime revokedAt;
}
