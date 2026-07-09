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
public class ApplicationResponse {

    private Long id;
    private Long userId;
    private String userName;
    private String userEmail;
    private Long jobId;
    private String jobTitle;
    private String status;
    private String holdReason;
    private LocalDateTime holdCreatedAt;
    private LocalDateTime holdResolvedAt;
    private String bgvStatus;
    private LocalDateTime appliedAt;
    private LocalDateTime updatedAt;
}
