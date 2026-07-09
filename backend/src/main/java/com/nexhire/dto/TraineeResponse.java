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
public class TraineeResponse {

    private Long traineeId;
    private Long userId;
    private Long applicationId;
    private String candidateName;
    private String candidateEmail;
    private String jobTitle;
    private String applicationStatus;
    private Integer progress;
    private String topic;
    private Boolean completed;
    private LocalDateTime joinedAt;
    private LocalDateTime updatedAt;

    private Double score;
    private Double attendancePercentage;
    private String finalResult;
    private String status;
    private Boolean lapEnabled;
    private String remarks;
    private Boolean released;
    private Boolean flagged;
    private String flagReason;
    private String employeeId;
}
