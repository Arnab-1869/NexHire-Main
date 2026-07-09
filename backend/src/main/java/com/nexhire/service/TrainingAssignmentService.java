package com.nexhire.service;

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
public class TrainingAssignmentService {

    private final JoiningBatchRepository batchRepository;
    private final JoiningBatchCandidateRepository batchCandidateRepository;
    private final SelectedUserRepository selectedUserRepository;
    private final EmployeeRepository employeeRepository;
    private final TrainingRepository trainingRepository;
    private final TrainingBlockRepository trainingBlockRepository;
    private final HiringBudgetRepository hiringBudgetRepository;
    private final TrainingSeatRepository trainingSeatRepository;
    private final TraineeRepository traineeRepository;
    private final TrainingRecordRepository trainingRecordRepository;
    private final JobApplicationRepository applicationRepository;
    private final UserRepository userRepository;
    private final ActivityLogRepository activityLogRepository;

    @Transactional
    public void assignBatchToTraining(Long batchId, Long hrUserId) {
        JoiningBatch batch = batchRepository.findById(batchId)
                .orElseThrow(() -> new ResourceNotFoundException("Joining batch not found"));

        User hrUser = userRepository.findById(hrUserId)
                .orElseThrow(() -> new ResourceNotFoundException("HR user not found"));

        // Validate logged-in HR is mapped to an employee
        Employee hrEmp = employeeRepository.findByUserId(hrUserId).orElse(null);
        if (hrEmp == null) {
            throw new InvalidStateTransitionException("Logged in HR user does not have an employee ID mapped. Please configure it in employee records.");
        }

        List<JoiningBatchCandidate> candidates = batchCandidateRepository.findByBatchId(batchId);
        // Filter candidate list: only consider those who accepted the joining letter
        List<JoiningBatchCandidate> acceptedCandidates = candidates.stream()
                .filter(c -> c.getStatus().equalsIgnoreCase("ACCEPTED") || c.getStatus().equalsIgnoreCase("LETTER_SENT"))
                .toList();

        if (acceptedCandidates.isEmpty()) {
            throw new InvalidStateTransitionException("No eligible candidates found in the batch who have accepted or received joining letters.");
        }

        int candidateCount = acceptedCandidates.size();

        // Validate seats in block
        TrainingBlock block = batch.getBlock();
        int availableSeats = block.getCapacity() - block.getOccupiedSeats();
        if (availableSeats < candidateCount) {
            throw new InvalidStateTransitionException("Insufficient seats in training block " + block.getName() +
                    ". Required: " + candidateCount + ", Available: " + availableSeats);
        }

        // Validate location city budget
        Location location = block.getLocation();
        HiringBudget budget = hiringBudgetRepository.findByLocationId(location.getId())
                .orElseThrow(() -> new ResourceNotFoundException("No hiring budget configured for location: " + location.getName()));

        double trainingCost = batch.getTraining().getCostPerCandidate() * candidateCount;
        double availableBudget = budget.getBudgetAmount() - budget.getUsedAmount();
        if (availableBudget < trainingCost) {
            throw new InvalidStateTransitionException("Insufficient hiring budget for location: " + location.getName() +
                    ". Required: " + trainingCost + ", Available: " + availableBudget);
        }

        // Perform transactional updates
        // 1. Deduct budget
        budget.setUsedAmount(budget.getUsedAmount() + (long) trainingCost);
        budget.setUsedSlots(budget.getUsedSlots() + candidateCount);
        hiringBudgetRepository.save(budget);

        // 2. Update block seats
        block.setOccupiedSeats(block.getOccupiedSeats() + candidateCount);
        trainingBlockRepository.save(block);

        // 3. Update training seats occupancy
        TrainingSeat seat = trainingSeatRepository.findByLocationId(location.getId()).orElse(null);
        if (seat != null) {
            seat.setOccupiedSeats(seat.getOccupiedSeats() + candidateCount);
            trainingSeatRepository.save(seat);
        }

        // 4. Create trainees and training records
        for (JoiningBatchCandidate cand : acceptedCandidates) {
            // Validate candidate is not already in training
            if (traineeRepository.findByUserId(cand.getUser().getId()).isPresent()) {
                continue; // Skip if already trainee
            }

            Trainee trainee = Trainee.builder()
                    .user(cand.getUser())
                    .application(cand.getApplication())
                    .joinedAt(LocalDateTime.now())
                    .batchId(batch.getId())
                    .trainingId(batch.getTraining().getId())
                    .blockId(block.getId())
                    .employeeId(cand.getEmployeeId())
                    .selectedUserId(cand.getSelectedUser().getId())
                    .status("IN_PROGRESS")
                    .lapEnabled(false)
                    .released(false)
                    .build();
            Trainee savedTrainee = traineeRepository.save(trainee);

            TrainingRecord record = TrainingRecord.builder()
                    .trainee(savedTrainee)
                    .progress(0)
                    .topic("Training Started")
                    .completed(false)
                    .build();
            trainingRecordRepository.save(record);

            // Update candidate user status
            User user = cand.getUser();
            user.setLifecycleStatus(LifecycleStatus.TRAINEE);
            userRepository.save(user);

            // Update application status
            JobApplication app = cand.getApplication();
            app.setStatus(ApplicationStatus.TRAINING_IN_PROGRESS);
            applicationRepository.save(app);
        }

        // 5. Update batch status
        batch.setStatus("TRAINING_IN_PROGRESS");
        batchRepository.save(batch);

        // 6. Audit log
        activityLogRepository.save(ActivityLog.builder()
                .user(hrUser)
                .actionType("BATCH_ASSIGNED_TO_TRAINING")
                .description("HR assigned batch " + batch.getBatchName() + " (size: " + candidateCount + ") to training and block " + block.getName())
                .timestamp(LocalDateTime.now())
                .build());
    }
}
