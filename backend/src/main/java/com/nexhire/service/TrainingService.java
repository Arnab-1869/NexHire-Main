package com.nexhire.service;

import com.nexhire.dto.TraineeResponse;
import com.nexhire.dto.TrainingProgressRequest;
import com.nexhire.entity.*;
import com.nexhire.enums.ApplicationStatus;
import com.nexhire.enums.LifecycleStatus;
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
public class TrainingService {

    private final TraineeRepository traineeRepository;
    private final TrainingRecordRepository trainingRecordRepository;
    private final JobApplicationRepository applicationRepository;
    private final UserRepository userRepository;
    private final JoiningBatchRepository batchRepository;
    private final ReleaseRecordRepository releaseRecordRepository;
    private final NotificationService notificationService;
    private final ActivityLogRepository activityLogRepository;

    /** HR: list all trainees with their training records. */
    public List<TraineeResponse> getAllTrainees() {
        return traineeRepository.findAll().stream().map(this::toResponse).toList();
    }

    public List<TraineeResponse> getTraineesByBatch(Long batchId) {
        return traineeRepository.findByBatchId(batchId).stream().map(this::toResponse).toList();
    }

    /** EMPLOYEE: own training record. */
    public TraineeResponse getMyTraining(Long userId) {
        Trainee trainee = traineeRepository.findByUserId(userId)
                .orElseThrow(() -> new ResourceNotFoundException("No trainee record found for current user"));
        return toResponse(trainee);
    }

    /** HR: update training progress. */
    @Transactional
    public TraineeResponse updateProgress(Long traineeId, TrainingProgressRequest request) {
        Trainee trainee = traineeRepository.findById(traineeId)
                .orElseThrow(() -> new ResourceNotFoundException("Trainee not found with id: " + traineeId));

        TrainingRecord record = trainingRecordRepository.findByTraineeId(traineeId)
                .orElseThrow(() -> new ResourceNotFoundException("Training record not found"));

        record.setProgress(request.getProgress());
        if (request.getTopic() != null) {
            record.setTopic(request.getTopic());
        }
        trainingRecordRepository.save(record);

        return toResponse(trainee);
    }

    /** Move to LAP. */
    @Transactional
    public TraineeResponse moveToLap(Long traineeId, String remarks, Long hrUserId) {
        Trainee trainee = traineeRepository.findById(traineeId)
                .orElseThrow(() -> new ResourceNotFoundException("Trainee not found"));

        User hrUser = userRepository.findById(hrUserId)
                .orElseThrow(() -> new ResourceNotFoundException("HR user not found"));

        trainee.setLapEnabled(true);
        trainee.setStatus("LAP");
        trainee.setFinalResult("LAP");
        trainee.setRemarks(remarks);
        traineeRepository.save(trainee);

        JobApplication app = trainee.getApplication();
        app.setStatus(ApplicationStatus.LAP);
        applicationRepository.save(app);

        // Audit Log
        activityLogRepository.save(ActivityLog.builder()
                .user(hrUser)
                .actionType("MOVE_TO_LAP")
                .description("HR moved candidate " + trainee.getUser().getName() + " to LAP. Remarks: " + remarks)
                .timestamp(LocalDateTime.now())
                .build());

        // Notify trainee
        notificationService.notify(trainee.getUser().getId(), "LAP_ASSIGNED",
                "Assigned to Learning Assistance Program",
                "You have been assigned to LAP. Please connect with your training coordinator. Remarks: " + remarks);

        return toResponse(trainee);
    }

    /** Remove from LAP. */
    @Transactional
    public TraineeResponse removeFromLap(Long traineeId, Long hrUserId) {
        Trainee trainee = traineeRepository.findById(traineeId)
                .orElseThrow(() -> new ResourceNotFoundException("Trainee not found"));

        User hrUser = userRepository.findById(hrUserId)
                .orElseThrow(() -> new ResourceNotFoundException("HR user not found"));

        trainee.setLapEnabled(false);
        
        // Auto evaluate current result
        JoiningBatch batch = batchRepository.findById(trainee.getBatchId()).orElse(null);
        if (batch != null) {
            double cutoff = batch.getTraining().getCutoffScore();
            double minAtt = batch.getTraining().getMinimumAttendancePercentage();
            double score = trainee.getScore() != null ? trainee.getScore() : 0.0;
            double att = trainee.getAttendancePercentage() != null ? trainee.getAttendancePercentage() : 0.0;

            if (score >= cutoff && att >= minAtt) {
                trainee.setFinalResult("PASSED");
                trainee.setStatus("COMPLETED");
            } else {
                trainee.setFinalResult("FAILED");
                trainee.setStatus("FAILED");
            }
        } else {
            trainee.setFinalResult("PASSED");
            trainee.setStatus("COMPLETED");
        }
        traineeRepository.save(trainee);

        JobApplication app = trainee.getApplication();
        app.setStatus(trainee.getFinalResult().equals("PASSED") ? ApplicationStatus.TRAINING_COMPLETED : ApplicationStatus.REJECTED);
        applicationRepository.save(app);

        // Audit Log
        activityLogRepository.save(ActivityLog.builder()
                .user(hrUser)
                .actionType("REMOVE_FROM_LAP")
                .description("HR removed candidate " + trainee.getUser().getName() + " from LAP. Final result: " + trainee.getFinalResult())
                .timestamp(LocalDateTime.now())
                .build());

        return toResponse(trainee);
    }

    /** Flag candidate for HR review. */
    @Transactional
    public TraineeResponse flagCandidate(Long traineeId, String reason, Long hrUserId) {
        Trainee trainee = traineeRepository.findById(traineeId)
                .orElseThrow(() -> new ResourceNotFoundException("Trainee not found"));
        User hrUser = userRepository.findById(hrUserId).orElseThrow(() -> new ResourceNotFoundException("User not found"));

        trainee.setFlagged(true);
        trainee.setFlagReason(reason);
        traineeRepository.save(trainee);

        activityLogRepository.save(ActivityLog.builder()
                .user(hrUser)
                .actionType("FLAG_TRAINEE")
                .description("HR flagged candidate " + trainee.getUser().getName() + " for exception review. Reason: " + reason)
                .timestamp(LocalDateTime.now())
                .build());

        return toResponse(trainee);
    }

    /** Complete Training Batch and Release Passed Trainees. */
    @Transactional
    public JoiningBatch completeBatch(Long batchId, Long hrUserId) {
        JoiningBatch batch = batchRepository.findById(batchId)
                .orElseThrow(() -> new ResourceNotFoundException("Batch not found: " + batchId));

        User hrUser = userRepository.findById(hrUserId)
                .orElseThrow(() -> new ResourceNotFoundException("HR user not found"));

        List<Trainee> trainees = traineeRepository.findByBatchId(batchId);
        if (trainees.isEmpty()) {
            throw new InvalidStateTransitionException("No trainees found in this batch to complete.");
        }

        double cutoff = batch.getTraining().getCutoffScore();
        double minAtt = batch.getTraining().getMinimumAttendancePercentage();

        boolean anyExceptions = false;
        int releasedCount = 0;

        for (Trainee t : trainees) {
            if (Boolean.TRUE.equals(t.getReleased())) {
                releasedCount++;
                continue; // Already released
            }

            double score = t.getScore() != null ? t.getScore() : 0.0;
            double att = t.getAttendancePercentage() != null ? t.getAttendancePercentage() : 0.0;

            boolean isEligible = score >= cutoff && 
                                 att >= minAtt && 
                                 "PASSED".equalsIgnoreCase(t.getFinalResult()) &&
                                 !Boolean.TRUE.equals(t.getLapEnabled()) &&
                                 !"LAP".equalsIgnoreCase(t.getStatus()) &&
                                 !"FAILED".equalsIgnoreCase(t.getStatus());

            if (isEligible) {
                t.setReleased(true);
                t.setStatus("RELEASED");
                traineeRepository.save(t);

                JobApplication app = t.getApplication();
                app.setStatus(ApplicationStatus.RELEASED);
                applicationRepository.save(app);

                // Create Release Record
                ReleaseRecord rel = ReleaseRecord.builder()
                        .trainee(t)
                        .releasedBy(hrUser)
                        .remarks("Released upon batch completion.")
                        .allocated(false)
                        .build();
                releaseRecordRepository.save(rel);

                releasedCount++;

                // Notify candidate
                notificationService.notify(t.getUser().getId(), "CANDIDATE_RELEASED",
                        "Released from Training",
                        "Congratulations! You have successfully completed training and have been released for project allocation.");
            } else {
                anyExceptions = true;
                // If not eligible, mark as flagged/LAP if not already
                if (!Boolean.TRUE.equals(t.getLapEnabled())) {
                    t.setFlagged(true);
                    t.setFlagReason("Did not meet training criteria upon batch completion.");
                    traineeRepository.save(t);
                }
            }
        }

        if (releasedCount == trainees.size()) {
            batch.setStatus("COMPLETED");
        } else {
            batch.setStatus("COMPLETED_WITH_EXCEPTIONS");
        }
        batchRepository.save(batch);

        activityLogRepository.save(ActivityLog.builder()
                .user(hrUser)
                .actionType("BATCH_COMPLETED")
                .description("HR completed training batch " + batch.getBatchName() + ". Status: " + batch.getStatus())
                .timestamp(LocalDateTime.now())
                .build());

        return batch;
    }

    public List<TraineeResponse> getExceptionQueue() {
        return traineeRepository.findByFlaggedTrue().stream()
                .map(this::toResponse)
                .toList();
    }

    @Transactional
    public TraineeResponse resolveException(Long traineeId, String action, String remarks, Long hrUserId) {
        Trainee trainee = traineeRepository.findById(traineeId)
                .orElseThrow(() -> new ResourceNotFoundException("Trainee not found"));
        User hrUser = userRepository.findById(hrUserId)
                .orElseThrow(() -> new ResourceNotFoundException("HR user not found"));

        trainee.setFlagged(false);
        trainee.setFlagReason(null);

        if (action.equalsIgnoreCase("RELEASE")) {
            trainee.setReleased(true);
            trainee.setStatus("RELEASED");
            trainee.setFinalResult("PASSED");
            traineeRepository.save(trainee);

            JobApplication app = trainee.getApplication();
            app.setStatus(ApplicationStatus.RELEASED);
            applicationRepository.save(app);

            ReleaseRecord rel = ReleaseRecord.builder()
                    .trainee(trainee)
                    .releasedBy(hrUser)
                    .remarks("Manually released: " + remarks)
                    .allocated(false)
                    .build();
            releaseRecordRepository.save(rel);
        } else if (action.equalsIgnoreCase("REJECT")) {
            trainee.setStatus("FAILED");
            trainee.setFinalResult("FAILED");
            traineeRepository.save(trainee);

            JobApplication app = trainee.getApplication();
            app.setStatus(ApplicationStatus.REJECTED);
            applicationRepository.save(app);
        } else if (action.equalsIgnoreCase("EXTEND")) {
            trainee.setStatus("IN_PROGRESS");
            traineeRepository.save(trainee);

            JobApplication app = trainee.getApplication();
            app.setStatus(ApplicationStatus.TRAINING_IN_PROGRESS);
            applicationRepository.save(app);
        }

        traineeRepository.save(trainee);

        activityLogRepository.save(ActivityLog.builder()
                .user(hrUser)
                .actionType("RESOLVE_EXCEPTION")
                .description("HR resolved exception for " + trainee.getUser().getName() + " with action: " + action)
                .timestamp(LocalDateTime.now())
                .build());

        return toResponse(trainee);
    }

    @Transactional
    public TraineeResponse completeTraining(Long traineeId) {
        Trainee trainee = traineeRepository.findById(traineeId)
                .orElseThrow(() -> new ResourceNotFoundException("Trainee not found with id: " + traineeId));

        TrainingRecord record = trainingRecordRepository.findByTraineeId(traineeId)
                .orElseThrow(() -> new ResourceNotFoundException("Training record not found"));
        record.setProgress(100);
        record.setCompleted(true);
        trainingRecordRepository.save(record);

        trainee.setReleased(true);
        trainee.setStatus("RELEASED");
        trainee.setFinalResult("PASSED");
        traineeRepository.save(trainee);

        JobApplication application = trainee.getApplication();
        application.setStatus(ApplicationStatus.RELEASED);
        applicationRepository.save(application);

        // Create release record
        ReleaseRecord rel = ReleaseRecord.builder()
                .trainee(trainee)
                .releasedBy(userRepository.findAll().stream().filter(u -> u.getRole() == com.nexhire.enums.UserRole.HR).findFirst().orElse(null))
                .remarks("Graduated individually.")
                .allocated(false)
                .build();
        releaseRecordRepository.save(rel);

        return toResponse(trainee);
    }

    private TraineeResponse toResponse(Trainee trainee) {
        TrainingRecord record = trainingRecordRepository.findByTraineeId(trainee.getId()).orElse(null);
        JobApplication app = trainee.getApplication();
        return TraineeResponse.builder()
                .traineeId(trainee.getId())
                .userId(trainee.getUser().getId())
                .applicationId(app.getId())
                .candidateName(trainee.getUser().getName())
                .candidateEmail(trainee.getUser().getEmail())
                .jobTitle(app.getJob().getTitle())
                .applicationStatus(app.getStatus().name())
                .progress(record != null ? record.getProgress() : 0)
                .topic(record != null ? record.getTopic() : null)
                .completed(record != null ? record.getCompleted() : false)
                .joinedAt(trainee.getJoinedAt())
                .updatedAt(record != null ? record.getUpdatedAt() : null)
                .score(trainee.getScore())
                .attendancePercentage(trainee.getAttendancePercentage())
                .finalResult(trainee.getFinalResult())
                .status(trainee.getStatus())
                .lapEnabled(trainee.getLapEnabled())
                .remarks(trainee.getRemarks())
                .released(trainee.getReleased())
                .flagged(trainee.getFlagged())
                .flagReason(trainee.getFlagReason())
                .employeeId(trainee.getEmployeeId())
                .build();
    }
}
