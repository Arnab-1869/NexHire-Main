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
public class BgvResponse {

    private Long id;
    private Long applicationId;
    private Long userId;
    private String candidateName;
    private String candidateEmail;
    private String jobTitle;
    private String status;
    private String vendorName;
    private String remarks;
    private LocalDateTime initiatedAt;
    private LocalDateTime completedAt;
    private LocalDateTime updatedAt;
}
