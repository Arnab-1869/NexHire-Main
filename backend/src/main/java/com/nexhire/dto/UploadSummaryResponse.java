package com.nexhire.dto;

import lombok.*;
import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class UploadSummaryResponse {
    private Long logId;
    private String uploadType;
    private String fileName;
    private Integer totalRows;
    private Integer successRows;
    private Integer failedRows;
    private String status;
    private List<RowErrorDto> errors;
}
