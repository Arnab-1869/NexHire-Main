package com.nexhire.controller;

import com.nexhire.dto.BgvResponse;
import com.nexhire.dto.BgvUpdateRequest;
import com.nexhire.dto.BgcDocumentResponse;
import com.nexhire.dto.BgcVendorRequestResponse;
import com.nexhire.entity.BgcDocument;
import com.nexhire.service.BgvService;
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
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/bgv")
@RequiredArgsConstructor
public class BgvController {

    private final BgvService bgvService;

    /** HR initiates BGV for an application. */
    @PostMapping("/{applicationId}")
    @PreAuthorize("hasRole('HR')")
    public ResponseEntity<BgvResponse> initiate(
            @PathVariable Long applicationId,
            @RequestBody(required = false) Map<String, String> body) {
        String vendor = body != null ? body.getOrDefault("vendorName", "ThirdParty BGV Inc.") : "ThirdParty BGV Inc.";
        return ResponseEntity.status(HttpStatus.CREATED).body(bgvService.initiate(applicationId, vendor));
    }

    /** HR lists all BGV records. */
    @GetMapping
    @PreAuthorize("hasRole('HR')")
    public ResponseEntity<List<BgvResponse>> getAll() {
        return ResponseEntity.ok(bgvService.getAll());
    }

    /** Candidate views own BGV records. */
    @GetMapping("/my")
    @PreAuthorize("hasRole('EMPLOYEE')")
    public ResponseEntity<List<BgvResponse>> getMine(Authentication authentication) {
        Long userId = (Long) authentication.getPrincipal();
        return ResponseEntity.ok(bgvService.getMine(userId));
    }

    @GetMapping("/application/{applicationId}")
    @PreAuthorize("hasAnyRole('HR', 'EMPLOYEE')")
    public ResponseEntity<BgvResponse> getByApplication(@PathVariable Long applicationId) {
        return ResponseEntity.ok(bgvService.getByApplication(applicationId));
    }

    /** Update BGV status. */
    @PutMapping("/{id}/status")
    @PreAuthorize("hasRole('HR')")
    public ResponseEntity<BgvResponse> updateStatus(
            @PathVariable Long id,
            @Valid @RequestBody BgvUpdateRequest request) {
        return ResponseEntity.ok(bgvService.updateStatus(id, request));
    }

    /** Candidate uploads verification documents. */
    @PostMapping("/documents")
    @PreAuthorize("hasRole('EMPLOYEE')")
    public ResponseEntity<BgcDocumentResponse> uploadDocument(
            @RequestParam("applicationId") Long applicationId,
            @RequestParam("documentType") String documentType,
            @RequestParam("file") MultipartFile file,
            Authentication authentication) throws IOException {
        Long userId = (Long) authentication.getPrincipal();
        return ResponseEntity.ok(bgvService.uploadDocument(userId, applicationId, documentType, file));
    }

    /** HR/Candidate lists BGC documents. */
    @GetMapping("/{bgcCaseId}/documents")
    @PreAuthorize("hasAnyRole('HR', 'EMPLOYEE')")
    public ResponseEntity<List<BgcDocumentResponse>> getDocuments(@PathVariable Long bgcCaseId) {
        return ResponseEntity.ok(bgvService.getDocuments(bgcCaseId));
    }

    /** HR/Candidate downloads document file. */
    @GetMapping("/documents/{id}/file")
    @PreAuthorize("hasAnyRole('HR', 'EMPLOYEE')")
    public ResponseEntity<byte[]> downloadDocumentFile(@PathVariable Long id) {
        BgcDocument doc = bgvService.getDocumentFile(id);
        return ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=\"" + doc.getFileName() + "\"")
                .contentType(MediaType.parseMediaType(doc.getFileType()))
                .body(doc.getFileData());
    }

    /** HR reviews document (approve/reject). */
    @PutMapping("/documents/{id}/status")
    @PreAuthorize("hasRole('HR')")
    public ResponseEntity<BgcDocumentResponse> reviewDocument(
            @PathVariable Long id,
            @RequestBody Map<String, String> body,
            Authentication authentication) {
        String status = body.get("status"); // APPROVED, REJECTED
        String remarks = body.get("remarks");
        Long reviewerId = (Long) authentication.getPrincipal();
        return ResponseEntity.ok(bgvService.reviewDocument(id, status, remarks, reviewerId));
    }

    /** HR sends BGC documents to vendor link. */
    @PostMapping("/{bgcCaseId}/vendor-request")
    @PreAuthorize("hasRole('HR')")
    public ResponseEntity<BgcVendorRequestResponse> sendToVendor(
            @PathVariable Long bgcCaseId,
            @RequestBody Map<String, String> body,
            Authentication authentication) {
        String vendorName = body.getOrDefault("vendorName", "SecureCheck Pvt Ltd");
        String vendorLink = body.get("vendorLink");
        Long sentById = (Long) authentication.getPrincipal();
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(bgvService.sendToVendor(bgcCaseId, vendorName, vendorLink, sentById));
    }

    /** HR gets vendor requests. */
    @GetMapping("/{bgcCaseId}/vendor-requests")
    @PreAuthorize("hasRole('HR')")
    public ResponseEntity<List<BgcVendorRequestResponse>> getVendorRequests(@PathVariable Long bgcCaseId) {
        return ResponseEntity.ok(bgvService.getVendorRequests(bgcCaseId));
    }
}
