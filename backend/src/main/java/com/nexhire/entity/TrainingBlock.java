package com.nexhire.entity;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "training_blocks", uniqueConstraints = {@UniqueConstraint(columnNames = {"name", "location_id"})})
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class TrainingBlock {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String name;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "location_id", nullable = false)
    private Location location;

    @Column(nullable = false)
    @Builder.Default
    private Integer capacity = 60;

    @Column(nullable = false)
    @Builder.Default
    private Integer occupiedSeats = 0;
}
