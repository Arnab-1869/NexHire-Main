package com.nexhire.service;

import com.nexhire.dto.OfferRequest;
import com.nexhire.dto.OfferResponse;
import com.nexhire.entity.JobApplication;
import com.nexhire.entity.OfferLetter;
import com.nexhire.entity.User;
import com.nexhire.enums.ApplicationStatus;
import com.nexhire.exception.InvalidStateTransitionException;
import com.nexhire.exception.ResourceNotFoundException;
import com.nexhire.repository.JobApplicationRepository;
import com.nexhire.repository.OfferLetterRepository;
import com.nexhire.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
public class OfferService {

    private final OfferLetterRepository offerLetterRepository;
    private final JobApplicationRepository applicationRepository;
    private final UserRepository userRepository;
    private final NotificationService notificationService;
    private final BgvService bgvService;

    @Transactional
    public OfferResponse sendOffer(Long applicationId, OfferRequest request, Long sentById) {
        JobApplication application = applicationRepository.findById(applicationId)
                .orElseThrow(() -> new ResourceNotFoundException("Application not found with id: " + applicationId));

        if (application.getStatus() != ApplicationStatus.QUALIFIED) {
            throw new InvalidStateTransitionException(
                    "Cannot send offer: application status must be QUALIFIED, current is " + application.getStatus());
        }

        User sentBy = userRepository.findById(sentById)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        OfferLetter offer = OfferLetter.builder()
                .application(application)
                .content(request.getContent())
                .sentBy(sentBy)
                .sentAt(LocalDateTime.now())
                .build();

        application.setStatus(ApplicationStatus.OFFER_SENT);
        applicationRepository.save(application);

        OfferResponse response = toResponse(offerLetterRepository.save(offer));

        // Notify candidate
        notificationService.notify(application.getUser().getId(), "OFFER_RECEIVED",
                "Offer Letter Received",
                "You have received an offer for " + application.getJob().getTitle() + ". Check your offers.");

        return response;
    }

    public List<OfferResponse> getMyOffers(Long userId) {
        return offerLetterRepository.findByApplicationUserId(userId).stream()
                .map(this::toResponse)
                .toList();
    }

    @Transactional
    public OfferResponse acceptOffer(Long offerId, Long userId) {
        OfferLetter offer = offerLetterRepository.findById(offerId)
                .orElseThrow(() -> new ResourceNotFoundException("Offer not found with id: " + offerId));

        JobApplication application = offer.getApplication();

        if (application.getStatus() != ApplicationStatus.OFFER_SENT) {
            throw new InvalidStateTransitionException(
                    "Cannot accept offer: application status must be OFFER_SENT, current is " + application.getStatus());
        }

        if (!application.getUser().getId().equals(userId)) {
            throw new InvalidStateTransitionException("You can only accept your own offers");
        }

        application.setStatus(ApplicationStatus.OFFER_ACCEPTED);
        applicationRepository.save(application);

        offer.setRespondedAt(LocalDateTime.now());
        OfferLetter savedOffer = offerLetterRepository.save(offer);

        // Auto initiate BGC
        try {
            bgvService.initiate(application.getId(), "ThirdParty BGV Inc.");
        } catch (Exception e) {
            // Ignore if already exists, or log
        }

        return toResponse(savedOffer);
    }

    @Transactional
    public OfferResponse rejectOffer(Long offerId, Long userId) {
        OfferLetter offer = offerLetterRepository.findById(offerId)
                .orElseThrow(() -> new ResourceNotFoundException("Offer not found with id: " + offerId));

        JobApplication application = offer.getApplication();

        if (application.getStatus() != ApplicationStatus.OFFER_SENT) {
            throw new InvalidStateTransitionException(
                    "Cannot reject offer: application status must be OFFER_SENT, current is " + application.getStatus());
        }

        if (!application.getUser().getId().equals(userId)) {
            throw new InvalidStateTransitionException("You can only reject your own offers");
        }

        application.setStatus(ApplicationStatus.OFFER_REJECTED);
        applicationRepository.save(application);

        offer.setRespondedAt(LocalDateTime.now());
        return toResponse(offerLetterRepository.save(offer));
    }

    public OfferLetter getOfferLetterEntity(Long id) {
        return offerLetterRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Offer letter not found with id: " + id));
    }

    private OfferResponse toResponse(OfferLetter offer) {
        return OfferResponse.builder()
                .id(offer.getId())
                .applicationId(offer.getApplication().getId())
                .jobTitle(offer.getApplication().getJob().getTitle())
                .content(offer.getContent())
                .status(offer.getApplication().getStatus().name())
                .sentByName(offer.getSentBy().getName())
                .sentAt(offer.getSentAt())
                .respondedAt(offer.getRespondedAt())
                .build();
    }
}
