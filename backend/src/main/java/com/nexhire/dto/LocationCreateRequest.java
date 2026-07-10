package com.nexhire.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class LocationCreateRequest {
    private String name;
    private String city;
    private Integer budgetTotalSlots;
    private Integer seatsTotalSeats;
    private Long budgetAmount;
}
