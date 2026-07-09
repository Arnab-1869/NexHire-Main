package com.nexhire.service;

import com.nexhire.dto.JoiningLetterRequest;
import com.nexhire.dto.JoiningLetterResponse;
import com.nexhire.entity.*;
import com.nexhire.enums.ApplicationStatus;
import com.nexhire.enums.LifecycleStatus;
import com.nexhire.exception.InsufficientResourceException;
import com.nexhire.exception.InvalidStateTransitionException;
import com.nexhire.exception.ResourceNotFoundException;
import com.nexhire.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
public class JoiningLetterService {

    private final JoiningLetterRepository joiningLetterRepository;
    private final JobApplicationRepository applicationRepository;
    private final UserRepository userRepository;
    private final LocationRepository locationRepository;
    private final HiringBudgetRepository hiringBudgetRepository;
    private final TrainingSeatRepository trainingSeatRepository;
    private final TraineeRepository traineeRepository;
    private final TrainingRecordRepository trainingRecordRepository;
    private final ActivityLogRepository activityLogRepository;
    private final NotificationService notificationService;
    private final JoiningBatchCandidateRepository batchCandidateRepository;

    @Transactional
    public JoiningLetterResponse sendJoiningLetter(Long applicationId, JoiningLetterRequest request, Long sentById) {
        JobApplication application = applicationRepository.findById(applicationId)
                .orElseThrow(() -> new ResourceNotFoundException("Application not found with id: " + applicationId));

        // Allow sending from OFFER_ACCEPTED or JOINING_ON_HOLD (retry)
        if (application.getStatus() != ApplicationStatus.OFFER_ACCEPTED
                && application.getStatus() != ApplicationStatus.JOINING_ON_HOLD) {
            throw new InvalidStateTransitionException(
                    "Cannot send joining letter: application status must be OFFER_ACCEPTED or JOINING_ON_HOLD, current is " + application.getStatus());
        }

        Location location = locationRepository.findById(request.getLocationId())
                .orElseThrow(() -> new ResourceNotFoundException("Location not found with id: " + request.getLocationId()));

        HiringBudget budget = hiringBudgetRepository.findByLocationId(location.getId())
                .orElseThrow(() -> new ResourceNotFoundException("Hiring budget not found for location: " + location.getName()));

        TrainingSeat seats = trainingSeatRepository.findByLocationId(location.getId())
                .orElseThrow(() -> new ResourceNotFoundException("Training seats not found for location: " + location.getName()));

        int availableBudget = budget.getTotalSlots() - budget.getUsedSlots();
        int availableSeats = seats.getTotalSeats() - seats.getOccupiedSeats();

        // If resources are unavailable, put on hold
        if (availableBudget <= 0 || availableSeats <= 0) {
            String reason = buildHoldReason(availableBudget, availableSeats, location.getName());
            application.setStatus(ApplicationStatus.JOINING_ON_HOLD);
            application.setHoldReason(reason);
            application.setHoldCreatedAt(LocalDateTime.now());
            application.setHoldResolvedAt(null);
            applicationRepository.save(application);

            throw new InsufficientResourceException(
                    "Candidate has been put on JOINING_ON_HOLD. Reason: " + reason);
        }

        User sentBy = userRepository.findById(sentById)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        // Decrement budget and seats atomically
        budget.setUsedSlots(budget.getUsedSlots() + 1);
        // Deduct training cost from monetary budget (₹50,000 per candidate)
        long trainingCostPerCandidate = 50000L;
        budget.setUsedAmount(budget.getUsedAmount() + trainingCostPerCandidate);
        hiringBudgetRepository.save(budget);

        seats.setOccupiedSeats(seats.getOccupiedSeats() + 1);
        trainingSeatRepository.save(seats);

        // If resolving from hold, record resolution time
        if (application.getStatus() == ApplicationStatus.JOINING_ON_HOLD) {
            application.setHoldResolvedAt(LocalDateTime.now());
        }

        // Create joining letter
        JoiningLetter letter = JoiningLetter.builder()
                .application(application)
                .content(request.getContent())
                .joiningDate(request.getJoiningDate())
                .location(location)
                .sentBy(sentBy)
                .sentAt(LocalDateTime.now())
                .build();

        application.setStatus(ApplicationStatus.JOINING_LETTER_SENT);
        applicationRepository.save(application);

        JoiningLetterResponse response = toResponse(joiningLetterRepository.save(letter));

        // Notify candidate
        notificationService.notify(application.getUser().getId(), "JOINING_LETTER",
                "Joining Letter Issued",
                "Your joining letter for " + application.getJob().getTitle() + " has been issued. Please review and accept.");

        return response;
    }

    public List<JoiningLetterResponse> getMyJoiningLetters(Long userId) {
        return joiningLetterRepository.findByApplicationUserId(userId).stream()
                .map(this::toResponse)
                .toList();
    }

    public JoiningLetter getJoiningLetterEntity(Long id) {
        return joiningLetterRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Joining letter not found with id: " + id));
    }

    @Transactional
    public JoiningLetterResponse acceptJoiningLetter(Long letterId, Long userId) {
        JoiningLetter letter = joiningLetterRepository.findById(letterId)
                .orElseThrow(() -> new ResourceNotFoundException("Joining letter not found with id: " + letterId));

        JobApplication application = letter.getApplication();

        if (application.getStatus() != ApplicationStatus.JOINING_LETTER_SENT) {
            throw new InvalidStateTransitionException(
                    "Cannot accept joining letter: application status must be JOINING_LETTER_SENT, current is " + application.getStatus());
        }

        if (!application.getUser().getId().equals(userId)) {
            throw new InvalidStateTransitionException("You can only accept your own joining letters");
        }

        // Check if candidate is assigned to a joining batch
        List<JoiningBatchCandidate> batchCandList = batchCandidateRepository.findByUserId(userId);
        JoiningBatchCandidate batchCand = batchCandList.stream()
                .filter(bc -> !bc.getStatus().equalsIgnoreCase("REJECTED"))
                .findFirst().orElse(null);

        if (batchCand != null) {
            batchCand.setStatus("ACCEPTED");
            batchCandidateRepository.save(batchCand);

            application.setStatus(ApplicationStatus.JOINING_ACCEPTED);
            applicationRepository.save(application);

            User user = application.getUser();
            // Candidate accepted the offer & joining letter, but does not start active training yet.
            user.setLifecycleStatus(LifecycleStatus.CANDIDATE);
            userRepository.save(user);

            ActivityLog log = ActivityLog.builder()
                    .user(user)
                    .actionType("JOINING_ACCEPTED")
                    .description("User " + user.getName() + " accepted batch joining letter for job: " + application.getJob().getTitle())
                    .timestamp(LocalDateTime.now())
                    .build();
            activityLogRepository.save(log);
        } else {
            // Fallback old individual flow: create Trainee record immediately
            application.setStatus(ApplicationStatus.TRAINING_IN_PROGRESS);
            applicationRepository.save(application);

            User user = application.getUser();
            user.setLifecycleStatus(LifecycleStatus.TRAINEE);
            userRepository.save(user);

            Trainee trainee = Trainee.builder()
                    .user(user)
                    .application(application)
                    .joinedAt(LocalDateTime.now())
                    .build();
            traineeRepository.save(trainee);

            TrainingRecord trainingRecord = TrainingRecord.builder()
                    .trainee(trainee)
                    .progress(0)
                    .completed(false)
                    .build();
            trainingRecordRepository.save(trainingRecord);

            ActivityLog log = ActivityLog.builder()
                    .user(user)
                    .actionType("JOINING_ACCEPTED")
                    .description("User " + user.getName() + " accepted individual joining letter for job: " + application.getJob().getTitle())
                    .timestamp(LocalDateTime.now())
                    .build();
            activityLogRepository.save(log);
        }

        letter.setRespondedAt(LocalDateTime.now());
        return toResponse(joiningLetterRepository.save(letter));
    }

    private String buildHoldReason(int availableBudget, int availableSeats, String locationName) {
        StringBuilder reason = new StringBuilder();
        if (availableBudget <= 0) {
            reason.append("Insufficient hiring budget for location: ").append(locationName);
        }
        if (availableSeats <= 0) {
            if (!reason.isEmpty()) {
                reason.append("; ");
            }
            reason.append("Insufficient training seats for location: ").append(locationName);
        }
        return reason.toString();
    }

    private JoiningLetterResponse toResponse(JoiningLetter letter) {
        return JoiningLetterResponse.builder()
                .id(letter.getId())
                .applicationId(letter.getApplication().getId())
                .jobTitle(letter.getApplication().getJob().getTitle())
                .content(letter.getContent())
                .joiningDate(letter.getJoiningDate())
                .locationName(letter.getLocation().getName())
                .status(letter.getApplication().getStatus().name())
                .holdReason(letter.getApplication().getHoldReason())
                .sentByName(letter.getSentBy().getName())
                .sentAt(letter.getSentAt())
                .respondedAt(letter.getRespondedAt())
                .build();
    }
}
