package com.nexhire.entity;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

@Entity
@Table(name = "trainees")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Trainee {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false, unique = true)
    private User user;

    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "application_id", nullable = false, unique = true)
    private JobApplication application;

    @Column(nullable = false)
    private LocalDateTime joinedAt;

    private Long batchId;
    private Long trainingId;
    private Long blockId;
    private String employeeId;
    private Long selectedUserId;

    private Double score;
    private Double attendancePercentage;
    private String finalResult;
    private String status; // IN_PROGRESS, COMPLETED, LAP, FAILED, ON_HOLD
    
    @Builder.Default
    private Boolean lapEnabled = false;
    private String remarks;
    
    @Builder.Default
    private Boolean released = false;
    
    @Builder.Default
    private Boolean flagged = false;
    private String flagReason;
}
