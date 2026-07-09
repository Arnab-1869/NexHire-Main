package com.nexhire.dto;

import lombok.*;
import java.time.LocalDate;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CandidateProfileResponse {
    private Long id;
    private Long userId;
    private String name;
    private String email;
    private String phone;
    
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

    private String resumeFileName;
    private String resumeFileType;
    private Long prefLocation1Id;
    private String prefLocation1Name;
    private Long prefLocation2Id;
    private String prefLocation2Name;
    private Long prefLocation3Id;
    private String prefLocation3Name;
    private Boolean completed;
}
