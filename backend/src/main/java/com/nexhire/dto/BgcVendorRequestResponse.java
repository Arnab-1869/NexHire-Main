package com.nexhire.dto;

import lombok.*;
import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class BgcVendorRequestResponse {
    private Long id;
    private Long bgcCaseId;
    private Long candidateId;
    private Long applicationId;
    private String vendorName;
    private String vendorLink;
    private String sentByName;
    private LocalDateTime sentAt;
    private String status;
    private String remarks;
}
