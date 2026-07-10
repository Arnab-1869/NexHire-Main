package com.nexhire.controller;

import com.nexhire.dto.ChartDataResponse;
import com.nexhire.dto.DashboardStatsResponse;
import com.nexhire.service.DashboardService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

/**
 * Read-only dashboard metrics, computed live from the domain data.
 * Available to management roles (ADMIN, HR, RMG).
 */
@RestController
@RequestMapping("/api/dashboard")
@RequiredArgsConstructor
@PreAuthorize("hasAnyRole('ADMIN', 'HR', 'RMG')")
public class DashboardController {

    private final DashboardService dashboardService;

    @GetMapping("/stats")
    public ResponseEntity<DashboardStatsResponse> getStats() {
        return ResponseEntity.ok(dashboardService.getStats());
    }

    @GetMapping("/charts/applications")
    public ResponseEntity<ChartDataResponse> getApplicationChart() {
        return ResponseEntity.ok(dashboardService.getApplicationChart());
    }

    @GetMapping("/charts/assessments")
    public ResponseEntity<ChartDataResponse> getAssessmentChart() {
        return ResponseEntity.ok(dashboardService.getAssessmentChart());
    }

    @GetMapping("/charts/bgv")
    public ResponseEntity<ChartDataResponse> getBgvChart() {
        return ResponseEntity.ok(dashboardService.getBgvChart());
    }

    @GetMapping("/charts/training")
    public ResponseEntity<ChartDataResponse> getTrainingChart() {
        return ResponseEntity.ok(dashboardService.getTrainingChart());
    }

    @GetMapping("/charts/budget")
    public ResponseEntity<ChartDataResponse> getBudgetChart() {
        return ResponseEntity.ok(dashboardService.getBudgetChart());
    }

    @GetMapping("/charts/projects")
    public ResponseEntity<ChartDataResponse> getProjectChart() {
        return ResponseEntity.ok(dashboardService.getProjectChart());
    }
}
