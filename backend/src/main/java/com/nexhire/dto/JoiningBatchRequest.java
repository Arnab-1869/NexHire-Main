package com.nexhire.dto;

import lombok.*;
import java.time.LocalDate;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class JoiningBatchRequest {
    private String batchName;
    private LocalDate joiningDate;
    private Long joiningLocationId;
    private Long trainingLocationId;
    private Long trainingId;
    private Long blockId;
    private Integer batchSize;
}
