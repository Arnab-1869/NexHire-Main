package com.nexhire.dto;

import lombok.*;
import java.time.LocalDate;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CandidateProfileRequest {
    private LocalDate dob;
    private String gender;
    private String address;
    private String city;
    private String state;
    private String pincode;

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

    private String primarySkills;
    private String secondarySkills;
    private String certifications;

    private Long prefLocation1Id;
    private Long prefLocation2Id;
    private Long prefLocation3Id;
}
