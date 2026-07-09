package com.nexhire.entity;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "joining_batch_candidates", uniqueConstraints = {@UniqueConstraint(columnNames = {"batch_id", "user_id"})})
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class JoiningBatchCandidate {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "batch_id", nullable = false)
    private JoiningBatch batch;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "application_id", nullable = false)
    private JobApplication application;

    @Column(nullable = false)
    private String employeeId;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "selected_user_id")
    private SelectedUser selectedUser;

    @Column(nullable = false)
    @Builder.Default
    private String status = "ASSIGNED";
}
