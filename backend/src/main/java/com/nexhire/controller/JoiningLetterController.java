package com.nexhire.controller;

import com.nexhire.dto.JoiningLetterRequest;
import com.nexhire.dto.JoiningLetterResponse;
import com.nexhire.service.JoiningLetterService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/joining-letters")
@RequiredArgsConstructor
public class JoiningLetterController {

    private final JoiningLetterService joiningLetterService;
    private final com.nexhire.service.PdfGenerationService pdfGenerationService;

    @PostMapping("/{applicationId}")
    @PreAuthorize("hasRole('HR')")
    public ResponseEntity<JoiningLetterResponse> sendJoiningLetter(
            @PathVariable Long applicationId,
            @Valid @RequestBody JoiningLetterRequest request,
            Authentication authentication) {
        Long sentById = (Long) authentication.getPrincipal();
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(joiningLetterService.sendJoiningLetter(applicationId, request, sentById));
    }

    @GetMapping("/my")
    @PreAuthorize("hasRole('EMPLOYEE')")
    public ResponseEntity<List<JoiningLetterResponse>> getMyJoiningLetters(Authentication authentication) {
        Long userId = (Long) authentication.getPrincipal();
        return ResponseEntity.ok(joiningLetterService.getMyJoiningLetters(userId));
    }

    @PutMapping("/{id}/accept")
    @PreAuthorize("hasRole('EMPLOYEE')")
    public ResponseEntity<JoiningLetterResponse> acceptJoiningLetter(
            @PathVariable Long id,
            Authentication authentication) {
        Long userId = (Long) authentication.getPrincipal();
        return ResponseEntity.ok(joiningLetterService.acceptJoiningLetter(id, userId));
    }

    @GetMapping("/{id}/pdf")
    @PreAuthorize("hasAnyRole('EMPLOYEE', 'HR')")
    public ResponseEntity<byte[]> downloadJoiningPdf(@PathVariable Long id) {
        com.nexhire.entity.JoiningLetter letter = joiningLetterService.getJoiningLetterEntity(id);
        byte[] pdfBytes = pdfGenerationService.generateJoiningPdf(letter);
        return ResponseEntity.ok()
                .header(org.springframework.http.HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=\"Joining_Letter_" + id + ".pdf\"")
                .contentType(org.springframework.http.MediaType.APPLICATION_OCTET_STREAM)
                .body(pdfBytes);
    }
}
