package com.nexhire.controller;

import com.nexhire.dto.OfferRequest;
import com.nexhire.dto.OfferResponse;
import com.nexhire.service.OfferService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/offers")
@RequiredArgsConstructor
public class OfferController {

    private final OfferService offerService;
    private final com.nexhire.service.PdfGenerationService pdfGenerationService;

    @PostMapping("/{applicationId}")
    @PreAuthorize("hasRole('HR')")
    public ResponseEntity<OfferResponse> sendOffer(
            @PathVariable Long applicationId,
            @Valid @RequestBody OfferRequest request,
            Authentication authentication) {
        Long sentById = (Long) authentication.getPrincipal();
        return ResponseEntity.status(HttpStatus.CREATED).body(offerService.sendOffer(applicationId, request, sentById));
    }

    @GetMapping("/my")
    @PreAuthorize("hasRole('EMPLOYEE')")
    public ResponseEntity<List<OfferResponse>> getMyOffers(Authentication authentication) {
        Long userId = (Long) authentication.getPrincipal();
        return ResponseEntity.ok(offerService.getMyOffers(userId));
    }

    @PutMapping("/{id}/accept")
    @PreAuthorize("hasRole('EMPLOYEE')")
    public ResponseEntity<OfferResponse> acceptOffer(
            @PathVariable Long id,
            Authentication authentication) {
        Long userId = (Long) authentication.getPrincipal();
        return ResponseEntity.ok(offerService.acceptOffer(id, userId));
    }

    @PutMapping("/{id}/reject")
    @PreAuthorize("hasRole('EMPLOYEE')")
    public ResponseEntity<OfferResponse> rejectOffer(
            @PathVariable Long id,
            Authentication authentication) {
        Long userId = (Long) authentication.getPrincipal();
        return ResponseEntity.ok(offerService.rejectOffer(id, userId));
    }

    @GetMapping("/{id}/pdf")
    @PreAuthorize("hasAnyRole('EMPLOYEE', 'HR')")
    public ResponseEntity<byte[]> downloadOfferPdf(@PathVariable Long id) {
        com.nexhire.entity.OfferLetter offer = offerService.getOfferLetterEntity(id);
        byte[] pdfBytes = pdfGenerationService.generateOfferPdf(offer);
        return ResponseEntity.ok()
                .header(org.springframework.http.HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=\"Offer_Letter_" + id + ".pdf\"")
                .contentType(org.springframework.http.MediaType.APPLICATION_OCTET_STREAM)
                .body(pdfBytes);
    }
}
