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
public class ProjectAssignmentResponse {

    private Long id;
    private Long traineeId;
    private Long projectId;
    private String projectName;
    private String candidateName;
    private String candidateEmail;
    private String assignedByName;
    private LocalDateTime assignedAt;
}
