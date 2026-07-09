package com.nexhire.dto;

import lombok.*;
import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class BgcDocumentResponse {
    private Long id;
    private Long bgcCaseId;
    private Long candidateId;
    private String candidateName;
    private Long applicationId;
    private String documentType;
    private String fileName;
    private String fileType;
    private Long fileSize;
    private String status;
    private String remarks;
    private LocalDateTime uploadedAt;
    private String reviewedByName;
    private LocalDateTime reviewedAt;
}
