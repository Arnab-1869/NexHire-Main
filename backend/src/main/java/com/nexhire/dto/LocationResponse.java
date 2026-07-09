package com.nexhire.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class LocationResponse {

    private Long id;
    private String name;
    private String city;
    private Integer budgetTotal;
    private Integer budgetUsed;
    private Integer budgetAvailable;
    private Integer seatsTotal;
    private Integer seatsOccupied;
    private Integer seatsAvailable;

    /** Annual training budget in ₹ (set by Admin). */
    private Long budgetAmount;
    /** Budget consumed so far in ₹. */
    private Long usedAmount;
    /** Remaining budget in ₹. */
    private Long remainingAmount;
}
