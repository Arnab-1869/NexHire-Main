package com.nexhire.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;
import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class JoiningLetterResponse {

    private Long id;
    private Long applicationId;
    private String jobTitle;
    private String content;
    private LocalDate joiningDate;
    private String locationName;
    private String status;
    private String holdReason;
    private String sentByName;
    private LocalDateTime sentAt;
    private LocalDateTime respondedAt;
}
