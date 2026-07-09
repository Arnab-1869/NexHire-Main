package com.nexhire.service;

import com.nexhire.dto.ChartDataResponse;
import com.nexhire.dto.DashboardStatsResponse;
import com.nexhire.entity.HiringBudget;
import com.nexhire.entity.TrainingSeat;
import com.nexhire.enums.ApplicationStatus;
import com.nexhire.enums.BgvStatus;
import com.nexhire.enums.UserRole;
import com.nexhire.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

/**
 * Computes dashboard metrics live from the persisted domain data.
 * Nothing here is mocked — every number is derived from repository queries.
 */
@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class DashboardService {

    private final UserRepository userRepository;
    private final JobRepository jobRepository;
    private final JobApplicationRepository applicationRepository;
    private final BackgroundVerificationRepository bgvRepository;
    private final ProjectRepository projectRepository;
    private final AssetAssignmentRepository assetAssignmentRepository;
    private final HiringBudgetRepository hiringBudgetRepository;
    private final TrainingSeatRepository trainingSeatRepository;

    public DashboardStatsResponse getStats() {
        long applied = applicationRepository.countByStatus(ApplicationStatus.APPLIED);
        long assessmentPending = applicationRepository.countByStatus(ApplicationStatus.ASSESSMENT_PENDING);
        long assessmentCompleted = applicationRepository.countByStatus(ApplicationStatus.ASSESSMENT_COMPLETED);
        long qualified = applicationRepository.countByStatus(ApplicationStatus.QUALIFIED);
        long rejected = applicationRepository.countByStatus(ApplicationStatus.REJECTED);
        long offerSent = applicationRepository.countByStatus(ApplicationStatus.OFFER_SENT);
        long offerAccepted = applicationRepository.countByStatus(ApplicationStatus.OFFER_ACCEPTED);
        long offerRejected = applicationRepository.countByStatus(ApplicationStatus.OFFER_REJECTED);
        long trainingInProgress = applicationRepository.countByStatus(ApplicationStatus.TRAINING_IN_PROGRESS);
        long trainingCompleted = applicationRepository.countByStatus(ApplicationStatus.TRAINING_COMPLETED);
        long projectAssigned = applicationRepository.countByStatus(ApplicationStatus.PROJECT_ASSIGNED);

        long bgvPending = bgvRepository.findAll().stream()
                .filter(b -> b.getStatus() != BgvStatus.CLEARED && b.getStatus() != BgvStatus.FAILED)
                .count();
        long bgvCleared = bgvRepository.findAll().stream()
                .filter(b -> b.getStatus() == BgvStatus.CLEARED)
                .count();

        List<HiringBudget> budgets = hiringBudgetRepository.findAll();
        long budgetUsed = budgets.stream().mapToLong(HiringBudget::getUsedSlots).sum();
        long budgetTotal = budgets.stream().mapToLong(HiringBudget::getTotalSlots).sum();

        List<TrainingSeat> seats = trainingSeatRepository.findAll();
        long seatsUsed = seats.stream().mapToLong(TrainingSeat::getOccupiedSeats).sum();
        long seatsTotal = seats.stream().mapToLong(TrainingSeat::getTotalSeats).sum();

        long employees = userRepository.countByRole(UserRole.EMPLOYEE);

        return DashboardStatsResponse.builder()
                .totalUsers(userRepository.count())
                .totalJobs(jobRepository.count())
                .totalApplications(applicationRepository.count())
                .pendingApplications(applied)
                .shortlistedApplications(qualified)
                .assessmentsAssigned(assessmentPending + assessmentCompleted)
                .assessmentsPassed(qualified)
                .assessmentsFailed(rejected)
                .offersSent(offerSent)
                .offersAccepted(offerAccepted)
                .offersRejected(offerRejected)
                .bgvPending(bgvPending)
                .bgvCleared(bgvCleared)
                .employeesCreated(employees)
                .selectedCandidates(qualified)
                .traineesActive(trainingInProgress)
                .trainingCompleted(trainingCompleted)
                .assetsAssigned(assetAssignmentRepository.countByActiveTrue())
                .releasedCandidates(trainingCompleted)
                .projectsActive(projectRepository.findByActiveTrue().size())
                .candidatesAllocated(projectAssigned)
                .totalBudgetUsed(budgetUsed)
                .totalBudgetAvailable(Math.max(0, budgetTotal - budgetUsed))
                .totalVacancyUsed(seatsUsed)
                .totalVacancyAvailable(Math.max(0, seatsTotal - seatsUsed))
                .totalEmployees(employees)
                .totalAdmins(userRepository.countByRole(UserRole.ADMIN))
                .build();
    }

    public ChartDataResponse getApplicationChart() {
        return chart("Applications",
                List.of("Applied", "In Assessment", "Qualified", "Rejected", "Offered"),
                List.of(
                        applicationRepository.countByStatus(ApplicationStatus.APPLIED),
                        applicationRepository.countByStatus(ApplicationStatus.ASSESSMENT_PENDING)
                                + applicationRepository.countByStatus(ApplicationStatus.ASSESSMENT_COMPLETED),
                        applicationRepository.countByStatus(ApplicationStatus.QUALIFIED),
                        applicationRepository.countByStatus(ApplicationStatus.REJECTED),
                        applicationRepository.countByStatus(ApplicationStatus.OFFER_SENT)
                                + applicationRepository.countByStatus(ApplicationStatus.OFFER_ACCEPTED)
                                + applicationRepository.countByStatus(ApplicationStatus.OFFER_REJECTED)),
                List.of("#3b82f6", "#f59e0b", "#22c55e", "#ef4444", "#8b5cf6"));
    }

    public ChartDataResponse getAssessmentChart() {
        return chart("Assessments",
                List.of("Assigned", "Completed", "Qualified", "Rejected"),
                List.of(
                        applicationRepository.countByStatus(ApplicationStatus.ASSESSMENT_PENDING),
                        applicationRepository.countByStatus(ApplicationStatus.ASSESSMENT_COMPLETED),
                        applicationRepository.countByStatus(ApplicationStatus.QUALIFIED),
                        applicationRepository.countByStatus(ApplicationStatus.REJECTED)),
                List.of("#3b82f6", "#f59e0b", "#22c55e", "#ef4444"));
    }

    public ChartDataResponse getBgvChart() {
        return chart("BGV",
                List.of("Initiated", "Docs Pending", "Docs Submitted", "In Progress", "Cleared", "Failed", "Recheck Required"),
                List.of(
                        countBgv(BgvStatus.INITIATED),
                        countBgv(BgvStatus.DOCUMENTS_PENDING),
                        countBgv(BgvStatus.DOCUMENTS_SUBMITTED),
                        countBgv(BgvStatus.VERIFICATION_IN_PROGRESS),
                        countBgv(BgvStatus.CLEARED),
                        countBgv(BgvStatus.FAILED),
                        countBgv(BgvStatus.RECHECK_REQUIRED)),
                List.of("#8b5cf6", "#f59e0b", "#f97316", "#3b82f6", "#22c55e", "#ef4444", "#ec4899"));
    }

    public ChartDataResponse getTrainingChart() {
        return chart("Training",
                List.of("In Progress", "Completed", "Project Assigned"),
                List.of(
                        applicationRepository.countByStatus(ApplicationStatus.TRAINING_IN_PROGRESS),
                        applicationRepository.countByStatus(ApplicationStatus.TRAINING_COMPLETED),
                        applicationRepository.countByStatus(ApplicationStatus.PROJECT_ASSIGNED)),
                List.of("#f59e0b", "#22c55e", "#3b82f6"));
    }

    private long countBgv(BgvStatus status) {
        return bgvRepository.findAll().stream().filter(b -> b.getStatus() == status).count();
    }

    private ChartDataResponse chart(String label, List<String> labels, List<Long> data, List<String> colors) {
        return ChartDataResponse.builder()
                .labels(labels)
                .datasets(List.of(ChartDataResponse.Dataset.builder()
                        .label(label)
                        .data(data)
                        .backgroundColor(colors)
                        .build()))
                .build();
    }
}
