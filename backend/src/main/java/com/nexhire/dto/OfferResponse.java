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
public class OfferResponse {

    private Long id;
    private Long applicationId;
    private String jobTitle;
    private String content;
    private String status;
    private String sentByName;
    private LocalDateTime sentAt;
    private LocalDateTime respondedAt;
}
