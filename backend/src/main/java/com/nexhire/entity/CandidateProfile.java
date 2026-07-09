package com.nexhire.entity;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDate;

@Entity
@Table(name = "candidate_profiles")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CandidateProfile {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false, unique = true)
    private User user;

    private LocalDate dob;
    private String gender;
    private String address;
    private String city;
    private String state;
    private String pincode;

    // Academic Details
    private String tenthBoard;
    private Integer tenthYear;
    private Double tenthPercentage;

    private String twelfthBoard;
    private Integer twelfthYear;
    private Double twelfthPercentage;

    private String gradUniversity;
    private Integer gradYear;
    private Double gradCgpa;

    private String pgUniversity;
    private Integer pgYear;
    private Double pgCgpa;

    // Skills
    private String primarySkills;
    private String secondarySkills;
    private String certifications;

    // Resume
    private String resumeFileName;
    private String resumeFileType;

    @Lob
    @Column(name = "resume_data", length = 10485760)
    private byte[] resumeData;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "pref_location_1_id")
    private Location prefLocation1;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "pref_location_2_id")
    private Location prefLocation2;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "pref_location_3_id")
    private Location prefLocation3;

    @Column(nullable = false)
    @Builder.Default
    private Boolean completed = false;
}
