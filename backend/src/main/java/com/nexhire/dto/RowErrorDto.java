package com.nexhire.dto;

import lombok.*;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class RowErrorDto {
    private Integer rowNumber;
    private String identifier;
    private String errorMessage;
}
