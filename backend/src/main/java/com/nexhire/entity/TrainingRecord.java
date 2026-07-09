package com.nexhire.entity;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.LocalDateTime;

@Entity
@Table(name = "training_records")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class TrainingRecord {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "trainee_id", nullable = false, unique = true)
    private Trainee trainee;

    @Column(nullable = false)
    @Builder.Default
    private Integer progress = 0;

    private String topic;

    @Column(nullable = false)
    @Builder.Default
    private Boolean completed = false;

    @UpdateTimestamp
    @Column(nullable = false)
    private LocalDateTime updatedAt;
}
