package com.nexhire.service;

import com.nexhire.dto.JoiningBatchRequest;
import com.nexhire.dto.JoiningBatchResponse;
import com.nexhire.dto.UserResponse;
import com.nexhire.entity.*;
import com.nexhire.enums.ApplicationStatus;
import com.nexhire.exception.InvalidStateTransitionException;
import com.nexhire.exception.ResourceNotFoundException;
import com.nexhire.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class JoiningBatchService {

    private final JoiningBatchRepository batchRepository;
    private final JoiningBatchCandidateRepository batchCandidateRepository;
    private final SelectedUserRepository selectedUserRepository;
    private final LocationRepository locationRepository;
    private final TrainingRepository trainingRepository;
    private final TrainingBlockRepository trainingBlockRepository;
    private final UserRepository userRepository;
    private final CandidateProfileRepository profileRepository;
    private final JobApplicationRepository applicationRepository;
    private final JoiningLetterRepository joiningLetterRepository;
    private final NotificationService notificationService;
    private final HiringBudgetRepository hiringBudgetRepository;
    private final TrainingSeatRepository trainingSeatRepository;

    public List<JoiningBatchResponse> getAllBatches() {
        return batchRepository.findAll().stream().map(this::toResponse).toList();
    }

    public JoiningBatchResponse getBatchById(Long id) {
        JoiningBatch batch = batchRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Batch not found with id: " + id));
        return toResponse(batch);
    }

    @Transactional
    public JoiningBatchResponse createBatch(JoiningBatchRequest request, Long hrUserId) {
        User creator = userRepository.findById(hrUserId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found: " + hrUserId));

        Location joiningLoc = locationRepository.findById(request.getJoiningLocationId())
                .orElseThrow(() -> new ResourceNotFoundException("Joining location not found"));

        Location trainingLoc = locationRepository.findById(request.getTrainingLocationId())
                .orElseThrow(() -> new ResourceNotFoundException("Training location not found"));

        Training training = trainingRepository.findById(request.getTrainingId())
                .orElseThrow(() -> new ResourceNotFoundException("Training not found"));

        TrainingBlock block = trainingBlockRepository.findById(request.getBlockId())
                .orElseThrow(() -> new ResourceNotFoundException("Training block not found"));

        Integer nextCodeNum = batchRepository.findMaxBatchCodeNumeric() + 1;
        String batchCode = "JB" + nextCodeNum;

        JoiningBatch batch = JoiningBatch.builder()
                .batchCode(batchCode)
                .batchName(request.getBatchName())
                .role("System Engineer")
                .joiningDate(request.getJoiningDate())
                .joiningLocation(joiningLoc)
                .trainingLocation(trainingLoc)
                .training(training)
                .block(block)
                .batchSize(request.getBatchSize() != null ? request.getBatchSize() : 60)
                .maxHeadcount(request.getBatchSize() != null ? request.getBatchSize() : 60)
                .currentHeadcount(0)
                .status("CREATED")
                .createdBy(creator)
                .build();

        return toResponse(batchRepository.save(batch));
    }

    /** Find eligible candidates sorted by location priority. */
    public List<UserResponse> getSortedEligibleCandidates(Long joiningLocId, Long trainingLocId) {
        List<SelectedUser> selected = selectedUserRepository.findAll();

        List<User> eligibleUsers = selected.stream()
                .map(SelectedUser::getUser)
                .filter(u -> !batchCandidateRepository.existsByUserIdAndStatusNot(u.getId(), "REJECTED"))
                .toList();

        List<CandidateSortWrapper> wrappers = new ArrayList<>();
        for (User user : eligibleUsers) {
            CandidateProfile profile = profileRepository.findByUserId(user.getId()).orElse(null);
            int priority = 4; // default lowest

            if (profile != null) {
                Long p1 = profile.getPrefLocation1() != null ? profile.getPrefLocation1().getId() : null;
                Long p2 = profile.getPrefLocation2() != null ? profile.getPrefLocation2().getId() : null;
                Long p3 = profile.getPrefLocation3() != null ? profile.getPrefLocation3().getId() : null;

                if (Objects.equals(p1, joiningLocId) || Objects.equals(p1, trainingLocId)) {
                    priority = 1;
                } else if (Objects.equals(p2, joiningLocId) || Objects.equals(p2, trainingLocId)) {
                    priority = 2;
                } else if (Objects.equals(p3, joiningLocId) || Objects.equals(p3, trainingLocId)) {
                    priority = 3;
                }
            }
            wrappers.add(new CandidateSortWrapper(user, priority));
        }

        wrappers.sort(Comparator.comparingInt(w -> w.priority));

        return wrappers.stream()
                .map(w -> UserResponse.builder()
                        .id(w.user.getId())
                        .name(w.user.getName())
                        .email(w.user.getEmail())
                        .phone(w.user.getPhone())
                        .role(w.user.getRole().name())
                        .lifecycleStatus(w.user.getLifecycleStatus() != null ? w.user.getLifecycleStatus().name() : "")
                        .active(w.user.getActive())
                        .build())
                .toList();
    }

    @Transactional
    public JoiningBatchResponse assignCandidatesToBatch(Long batchId, List<Long> userIds) {
        JoiningBatch batch = batchRepository.findById(batchId)
                .orElseThrow(() -> new ResourceNotFoundException("Batch not found"));

        if (batch.getCurrentHeadcount() + userIds.size() > batch.getBatchSize()) {
            throw new InvalidStateTransitionException("Batch capacity is " + batch.getBatchSize() + 
                    ". Please select only " + (batch.getBatchSize() - batch.getCurrentHeadcount()) + " candidates or create multiple batches.");
        }

        for (Long userId : userIds) {
            if (batchCandidateRepository.existsByUserIdAndStatusNot(userId, "REJECTED")) {
                continue; // Already assigned to another active batch
            }

            User user = userRepository.findById(userId)
                    .orElseThrow(() -> new ResourceNotFoundException("User not found: " + userId));

            SelectedUser selectedUser = selectedUserRepository.findByUserId(userId)
                    .orElseThrow(() -> new ResourceNotFoundException("SelectedUser not found for user: " + userId));

            JobApplication application = selectedUser.getApplication();

            JoiningBatchCandidate candidate = JoiningBatchCandidate.builder()
                    .batch(batch)
                    .user(user)
                    .application(application)
                    .employeeId(selectedUser.getEmployeeId())
                    .selectedUser(selectedUser)
                    .status("ASSIGNED")
                    .build();

            batchCandidateRepository.save(candidate);

            application.setStatus(ApplicationStatus.JOINING_BATCH_ASSIGNED);
            applicationRepository.save(application);
        }

        int count = batchCandidateRepository.findByBatchId(batchId).size();
        batch.setCurrentHeadcount(count);
        
        return toResponse(batchRepository.save(batch));
    }

    @Transactional
    public JoiningBatchResponse sendJoiningLetters(Long batchId, Long hrUserId) {
        JoiningBatch batch = batchRepository.findById(batchId)
                .orElseThrow(() -> new ResourceNotFoundException("Batch not found"));

        User hrUser = userRepository.findById(hrUserId)
                .orElseThrow(() -> new ResourceNotFoundException("HR user not found"));

        List<JoiningBatchCandidate> candidates = batchCandidateRepository.findByBatchId(batchId);

        // Count how many letters we are actually sending
        long lettersToSendCount = candidates.stream()
                .filter(c -> c.getStatus().equalsIgnoreCase("ASSIGNED"))
                .count();

        if (lettersToSendCount > 0) {
            Location location = batch.getJoiningLocation();
            HiringBudget budget = hiringBudgetRepository.findByLocationId(location.getId())
                    .orElseThrow(() -> new ResourceNotFoundException("Hiring budget not found for location: " + location.getName()));

            TrainingSeat seats = trainingSeatRepository.findByLocationId(location.getId())
                    .orElseThrow(() -> new ResourceNotFoundException("Training seats not found for location: " + location.getName()));

            int availableBudget = budget.getTotalSlots() - budget.getUsedSlots();
            int availableSeats = seats.getTotalSeats() - seats.getOccupiedSeats();

            if (availableBudget < lettersToSendCount || availableSeats < lettersToSendCount) {
                throw new InvalidStateTransitionException("Insufficient budget slots or training seats for location: " + location.getName());
            }

            double programCostPerCandidate = batch.getTraining().getCostPerCandidate() != null ? batch.getTraining().getCostPerCandidate() : 0.0;

            // Deduct slots and monetary budget atomically
            budget.setUsedSlots(budget.getUsedSlots() + (int) lettersToSendCount);
            budget.setUsedAmount(budget.getUsedAmount() + (long) (programCostPerCandidate * lettersToSendCount));
            hiringBudgetRepository.save(budget);

            // Deduct seats
            seats.setOccupiedSeats(seats.getOccupiedSeats() + (int) lettersToSendCount);
            trainingSeatRepository.save(seats);
        }

        for (JoiningBatchCandidate cand : candidates) {
            if (!cand.getStatus().equalsIgnoreCase("ASSIGNED")) {
                continue; // Already sent or responded
            }

            cand.setStatus("LETTER_SENT");
            batchCandidateRepository.save(cand);

            JobApplication application = cand.getApplication();
            application.setStatus(ApplicationStatus.JOINING_LETTER_SENT);
            applicationRepository.save(application);

            // Generate joining letter
            JoiningLetter letter = joiningLetterRepository.findByApplicationId(application.getId())
                    .orElse(JoiningLetter.builder().application(application).build());

            letter.setContent("Welcome to NexHire batch " + batch.getBatchName() + ". Your joining location will be " +
                    batch.getJoiningLocation().getName() + " and your training program will start at " +
                    batch.getTrainingLocation().getName() + ".");
            letter.setJoiningDate(batch.getJoiningDate());
            letter.setLocation(batch.getJoiningLocation());
            letter.setSentBy(hrUser);
            letter.setSentAt(LocalDateTime.now());
            letter.setBatchId(batchId);
            joiningLetterRepository.save(letter);

            // Notify candidate
            notificationService.notify(cand.getUser().getId(), "JOINING_LETTER_SENT",
                    "Joining Letter Received",
                    "You have received a joining letter for batch " + batch.getBatchName() + ". Please review and accept.");
        }

        batch.setStatus("JOINING_LETTER_SENT");
        return toResponse(batchRepository.save(batch));
    }

    private JoiningBatchResponse toResponse(JoiningBatch b) {
        return JoiningBatchResponse.builder()
                .id(b.getId())
                .batchCode(b.getBatchCode())
                .batchName(b.getBatchName())
                .role(b.getRole())
                .joiningDate(b.getJoiningDate())
                .joiningLocationId(b.getJoiningLocation().getId())
                .joiningLocationName(b.getJoiningLocation().getName())
                .trainingLocationId(b.getTrainingLocation().getId())
                .trainingLocationName(b.getTrainingLocation().getName())
                .trainingId(b.getTraining().getId())
                .trainingName(b.getTraining().getName())
                .blockId(b.getBlock().getId())
                .blockName(b.getBlock().getName())
                .batchSize(b.getBatchSize())
                .maxHeadcount(b.getMaxHeadcount())
                .currentHeadcount(b.getCurrentHeadcount())
                .status(b.getStatus())
                .createdByName(b.getCreatedBy().getName())
                .createdAt(b.getCreatedAt())
                .build();
    }

    private static class CandidateSortWrapper {
        User user;
        int priority;

        CandidateSortWrapper(User user, int priority) {
            this.user = user;
            this.priority = priority;
        }
    }
}
