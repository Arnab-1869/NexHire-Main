package com.nexhire.entity;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "trainings")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Training {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true)
    private String name;

    @Column(nullable = false)
    @Builder.Default
    private Double costPerCandidate = 0.0;

    @Column(nullable = false)
    @Builder.Default
    private Double cutoffScore = 60.0;

    @Column(nullable = false)
    @Builder.Default
    private Double minimumAttendancePercentage = 75.0;
}
