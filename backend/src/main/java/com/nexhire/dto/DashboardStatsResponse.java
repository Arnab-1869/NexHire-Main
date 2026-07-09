package com.nexhire.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * System-wide dashboard metrics computed live from persisted data.
 * Field names mirror the frontend DashboardStats model.
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class DashboardStatsResponse {

    private long totalUsers;
    private long totalJobs;
    private long totalApplications;
    private long pendingApplications;
    private long shortlistedApplications;
    private long assessmentsAssigned;
    private long assessmentsPassed;
    private long assessmentsFailed;
    private long offersSent;
    private long offersAccepted;
    private long offersRejected;
    private long bgvPending;
    private long bgvCleared;
    private long employeesCreated;
    private long selectedCandidates;
    private long traineesActive;
    private long trainingCompleted;
    private long assetsAssigned;
    private long releasedCandidates;
    private long projectsActive;
    private long candidatesAllocated;
    private long totalBudgetUsed;
    private long totalBudgetAvailable;
    private long totalVacancyUsed;
    private long totalVacancyAvailable;
    private long totalEmployees;
    private long totalAdmins;
}
