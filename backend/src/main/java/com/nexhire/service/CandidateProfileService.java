package com.nexhire.service;

import com.nexhire.dto.CandidateProfileRequest;
import com.nexhire.dto.CandidateProfileResponse;
import com.nexhire.entity.CandidateProfile;
import com.nexhire.entity.Location;
import com.nexhire.entity.User;
import com.nexhire.exception.InvalidStateTransitionException;
import com.nexhire.exception.ResourceNotFoundException;
import com.nexhire.repository.CandidateProfileRepository;
import com.nexhire.repository.LocationRepository;
import com.nexhire.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.Objects;
import java.util.stream.Stream;

@Service
@RequiredArgsConstructor
public class CandidateProfileService {

    private final CandidateProfileRepository profileRepository;
    private final UserRepository userRepository;
    private final LocationRepository locationRepository;

    public CandidateProfileResponse getProfileByUserId(Long userId) {
        CandidateProfile profile = profileRepository.findByUserId(userId)
                .orElseGet(() -> {
                    User user = userRepository.findById(userId)
                            .orElseThrow(() -> new ResourceNotFoundException("User not found: " + userId));
                    CandidateProfile newProfile = CandidateProfile.builder()
                            .user(user)
                            .completed(false)
                            .build();
                    return profileRepository.save(newProfile);
                });
        return toResponse(profile);
    }

    @Transactional
    public CandidateProfileResponse saveProfile(Long userId, CandidateProfileRequest request) {
        CandidateProfile profile = profileRepository.findByUserId(userId)
                .orElseGet(() -> {
                    User user = userRepository.findById(userId)
                            .orElseThrow(() -> new ResourceNotFoundException("User not found: " + userId));
                    return CandidateProfile.builder().user(user).build();
                });

        // Validate unique location preferences
        if (request.getPrefLocation1Id() != null && request.getPrefLocation2Id() != null && request.getPrefLocation3Id() != null) {
            if (Objects.equals(request.getPrefLocation1Id(), request.getPrefLocation2Id()) ||
                Objects.equals(request.getPrefLocation1Id(), request.getPrefLocation3Id()) ||
                Objects.equals(request.getPrefLocation2Id(), request.getPrefLocation3Id())) {
                throw new InvalidStateTransitionException("Location preferences must be three unique locations.");
            }
        }

        profile.setDob(request.getDob());
        profile.setGender(request.getGender());
        profile.setAddress(request.getAddress());
        profile.setCity(request.getCity());
        profile.setState(request.getState());
        profile.setPincode(request.getPincode());

        profile.setTenthBoard(request.getTenthBoard());
        profile.setTenthYear(request.getTenthYear());
        profile.setTenthPercentage(request.getTenthPercentage());

        profile.setTwelfthBoard(request.getTwelfthBoard());
        profile.setTwelfthYear(request.getTwelfthYear());
        profile.setTwelfthPercentage(request.getTwelfthPercentage());

        profile.setGradUniversity(request.getGradUniversity());
        profile.setGradYear(request.getGradYear());
        profile.setGradCgpa(request.getGradCgpa());

        profile.setPgUniversity(request.getPgUniversity());
        profile.setPgYear(request.getPgYear());
        profile.setPgCgpa(request.getPgCgpa());

        profile.setPrimarySkills(request.getPrimarySkills());
        profile.setSecondarySkills(request.getSecondarySkills());
        profile.setCertifications(request.getCertifications());

        if (request.getPrefLocation1Id() != null) {
            profile.setPrefLocation1(locationRepository.findById(request.getPrefLocation1Id())
                    .orElseThrow(() -> new ResourceNotFoundException("Location 1 not found")));
        }
        if (request.getPrefLocation2Id() != null) {
            profile.setPrefLocation2(locationRepository.findById(request.getPrefLocation2Id())
                    .orElseThrow(() -> new ResourceNotFoundException("Location 2 not found")));
        }
        if (request.getPrefLocation3Id() != null) {
            profile.setPrefLocation3(locationRepository.findById(request.getPrefLocation3Id())
                    .orElseThrow(() -> new ResourceNotFoundException("Location 3 not found")));
        }

        profile.setCompleted(checkIfComplete(profile));

        return toResponse(profileRepository.save(profile));
    }

    @Transactional
    public CandidateProfileResponse uploadResume(Long userId, MultipartFile file) throws IOException {
        CandidateProfile profile = profileRepository.findByUserId(userId)
                .orElseGet(() -> {
                    User user = userRepository.findById(userId)
                            .orElseThrow(() -> new ResourceNotFoundException("User not found: " + userId));
                    return CandidateProfile.builder().user(user).build();
                });

        profile.setResumeFileName(file.getOriginalFilename());
        profile.setResumeFileType(file.getContentType());
        profile.setResumeData(file.getBytes());
        profile.setCompleted(checkIfComplete(profile));

        return toResponse(profileRepository.save(profile));
    }

    public byte[] getResumeData(Long userId) {
        CandidateProfile profile = profileRepository.findByUserId(userId)
                .orElseThrow(() -> new ResourceNotFoundException("Profile not found"));
        if (profile.getResumeData() == null) {
            throw new ResourceNotFoundException("Resume not uploaded");
        }
        return profile.getResumeData();
    }

    public CandidateProfile getRawProfile(Long userId) {
        return profileRepository.findByUserId(userId)
                .orElseThrow(() -> new ResourceNotFoundException("Profile not found for user: " + userId));
    }

    private boolean checkIfComplete(CandidateProfile p) {
        return p.getDob() != null &&
               p.getGender() != null && !p.getGender().isBlank() &&
               p.getAddress() != null && !p.getAddress().isBlank() &&
               p.getCity() != null && !p.getCity().isBlank() &&
               p.getState() != null && !p.getState().isBlank() &&
               p.getPincode() != null && !p.getPincode().isBlank() &&
               p.getTenthBoard() != null && !p.getTenthBoard().isBlank() &&
               p.getTenthYear() != null &&
               p.getTenthPercentage() != null &&
               p.getTwelfthBoard() != null && !p.getTwelfthBoard().isBlank() &&
               p.getTwelfthYear() != null &&
               p.getTwelfthPercentage() != null &&
               p.getGradUniversity() != null && !p.getGradUniversity().isBlank() &&
               p.getGradYear() != null &&
               p.getGradCgpa() != null &&
               p.getPrimarySkills() != null && !p.getPrimarySkills().isBlank() &&
               p.getPrefLocation1() != null &&
               p.getPrefLocation2() != null &&
               p.getPrefLocation3() != null &&
               p.getResumeData() != null;
    }

    private CandidateProfileResponse toResponse(CandidateProfile p) {
        return CandidateProfileResponse.builder()
                .id(p.getId())
                .userId(p.getUser().getId())
                .name(p.getUser().getName())
                .email(p.getUser().getEmail())
                .phone(p.getUser().getPhone())
                .dob(p.getDob())
                .gender(p.getGender())
                .address(p.getAddress())
                .city(p.getCity())
                .state(p.getState())
                .pincode(p.getPincode())
                .tenthBoard(p.getTenthBoard())
                .tenthYear(p.getTenthYear())
                .tenthPercentage(p.getTenthPercentage())
                .twelfthBoard(p.getTwelfthBoard())
                .twelfthYear(p.getTwelfthYear())
                .twelfthPercentage(p.getTwelfthPercentage())
                .gradUniversity(p.getGradUniversity())
                .gradYear(p.getGradYear())
                .gradCgpa(p.getGradCgpa())
                .pgUniversity(p.getPgUniversity())
                .pgYear(p.getPgYear())
                .pgCgpa(p.getPgCgpa())
                .primarySkills(p.getPrimarySkills())
                .secondarySkills(p.getSecondarySkills())
                .certifications(p.getCertifications())
                .resumeFileName(p.getResumeFileName())
                .resumeFileType(p.getResumeFileType())
                .prefLocation1Id(p.getPrefLocation1() != null ? p.getPrefLocation1().getId() : null)
                .prefLocation1Name(p.getPrefLocation1() != null ? p.getPrefLocation1().getName() : null)
                .prefLocation2Id(p.getPrefLocation2() != null ? p.getPrefLocation2().getId() : null)
                .prefLocation2Name(p.getPrefLocation2() != null ? p.getPrefLocation2().getName() : null)
                .prefLocation3Id(p.getPrefLocation3() != null ? p.getPrefLocation3().getId() : null)
                .prefLocation3Name(p.getPrefLocation3() != null ? p.getPrefLocation3().getName() : null)
                .completed(p.getCompleted())
                .build();
    }
}
