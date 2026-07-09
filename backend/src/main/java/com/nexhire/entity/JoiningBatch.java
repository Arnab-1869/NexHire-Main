package com.nexhire.entity;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity
@Table(name = "joining_batches")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class JoiningBatch {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "batch_code", nullable = false, unique = true)
    private String batchCode;

    @Column(name = "batch_name", nullable = false)
    private String batchName;

    @Column(nullable = false)
    @Builder.Default
    private String role = "System Engineer";

    @Column(nullable = false)
    private LocalDate joiningDate;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "joining_location_id", nullable = false)
    private Location joiningLocation;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "training_location_id", nullable = false)
    private Location trainingLocation;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "training_id", nullable = false)
    private Training training;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "block_id", nullable = false)
    private TrainingBlock block;

    @Column(nullable = false)
    @Builder.Default
    private Integer batchSize = 60;

    @Column(nullable = false)
    @Builder.Default
    private Integer maxHeadcount = 60;

    @Column(nullable = false)
    @Builder.Default
    private Integer currentHeadcount = 0;

    @Column(nullable = false)
    @Builder.Default
    private String status = "CREATED";

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "created_by", nullable = false)
    private User createdBy;

    @CreationTimestamp
    @Column(nullable = false, updatable = false)
    private LocalDateTime createdAt;
}
