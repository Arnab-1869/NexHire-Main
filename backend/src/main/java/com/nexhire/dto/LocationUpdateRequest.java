package com.nexhire.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class LocationUpdateRequest {

    private Integer budgetTotalSlots;
    private Integer seatsTotalSeats;
    /** Annual training budget in ₹ (set by Admin). */
    private Long budgetAmount;
}
