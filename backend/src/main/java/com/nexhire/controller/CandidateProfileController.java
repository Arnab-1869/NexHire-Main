package com.nexhire.controller;

import com.nexhire.dto.CandidateProfileRequest;
import com.nexhire.dto.CandidateProfileResponse;
import com.nexhire.service.CandidateProfileService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.Map;

@RestController
@RequestMapping("/api/candidate/profile")
@RequiredArgsConstructor
public class CandidateProfileController {

    private final CandidateProfileService profileService;

    @GetMapping
    @PreAuthorize("hasRole('EMPLOYEE')")
    public ResponseEntity<CandidateProfileResponse> getProfile(Authentication authentication) {
        Long userId = (Long) authentication.getPrincipal();
        return ResponseEntity.ok(profileService.getProfileByUserId(userId));
    }

    @PostMapping
    @PreAuthorize("hasRole('EMPLOYEE')")
    public ResponseEntity<CandidateProfileResponse> saveProfile(
            @Valid @RequestBody CandidateProfileRequest request,
            Authentication authentication) {
        Long userId = (Long) authentication.getPrincipal();
        return ResponseEntity.ok(profileService.saveProfile(userId, request));
    }

    @PostMapping("/resume")
    @PreAuthorize("hasRole('EMPLOYEE')")
    public ResponseEntity<CandidateProfileResponse> uploadResume(
            @RequestParam("file") MultipartFile file,
            Authentication authentication) throws IOException {
        Long userId = (Long) authentication.getPrincipal();
        return ResponseEntity.ok(profileService.uploadResume(userId, file));
    }

    @GetMapping("/resume")
    @PreAuthorize("hasAnyRole('EMPLOYEE', 'HR')")
    public ResponseEntity<byte[]> downloadResume(@RequestParam(value = "userId", required = false) Long userId, Authentication authentication) {
        Long targetUserId = userId;
        if (targetUserId == null) {
            targetUserId = (Long) authentication.getPrincipal();
        }
        byte[] data = profileService.getResumeData(targetUserId);
        CandidateProfileResponse profile = profileService.getProfileByUserId(targetUserId);
        
        return ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=\"" + profile.getResumeFileName() + "\"")
                .contentType(MediaType.parseMediaType(profile.getResumeFileType() != null ? profile.getResumeFileType() : "application/pdf"))
                .body(data);
    }

    @GetMapping("/check-completion")
    @PreAuthorize("hasRole('EMPLOYEE')")
    public ResponseEntity<Map<String, Boolean>> checkCompletion(Authentication authentication) {
        Long userId = (Long) authentication.getPrincipal();
        CandidateProfileResponse profile = profileService.getProfileByUserId(userId);
        return ResponseEntity.ok(Map.of("completed", profile.getCompleted()));
    }
}
