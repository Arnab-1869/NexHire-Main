package com.nexhire.dto;

import lombok.*;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class JoiningBatchResponse {
    private Long id;
    private String batchCode;
    private String batchName;
    private String role;
    private LocalDate joiningDate;
    private Long joiningLocationId;
    private String joiningLocationName;
    private Long trainingLocationId;
    private String trainingLocationName;
    private Long trainingId;
    private String trainingName;
    private Long blockId;
    private String blockName;
    private Integer batchSize;
    private Integer maxHeadcount;
    private Integer currentHeadcount;
    private String status;
    private String createdByName;
    private LocalDateTime createdAt;
}
