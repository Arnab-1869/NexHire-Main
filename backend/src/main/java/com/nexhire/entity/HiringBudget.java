package com.nexhire.entity;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "hiring_budgets")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class HiringBudget {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "location_id", nullable = false, unique = true)
    private Location location;

    @Column(nullable = false)
    private Integer totalSlots;

    @Column(nullable = false)
    @Builder.Default
    private Integer usedSlots = 0;

    /** Total annual training budget (in ₹) assigned by Admin for this location. */
    @Column(nullable = false)
    @Builder.Default
    private Long budgetAmount = 0L;

    /** Amount already consumed (sum of CTC allocations for candidates sent to training). */
    @Column(nullable = false)
    @Builder.Default
    private Long usedAmount = 0L;
}
