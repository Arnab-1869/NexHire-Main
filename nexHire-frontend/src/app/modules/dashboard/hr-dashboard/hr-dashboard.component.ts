import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { DashboardService } from '../../../services/dashboard.service';
import { CurrentUserService } from '../../../core/auth/current-user.service';
import { DashboardStats } from '../../../models/admin.model';

/** HR Dashboard - mirrors the existing dashboard.component but scoped to HR portal */
@Component({
  selector: 'app-hr-dashboard',
  template: `
    <div class="dashboard-overview">
      <app-page-header
        title="HR Dashboard"
        subtitle="Real-time recruitment metrics & corporate training statuses"
      ></app-page-header>

      <!-- Stats Grid -->
      <div class="stats-grid" *ngIf="stats">
        <mat-card class="stat-card">
          <mat-card-content>
            <div class="stat-icon-wrapper blue">
              <mat-icon>people</mat-icon>
            </div>
            <div class="stat-data">
              <span class="stat-number">{{ stats.totalUsers }}</span>
              <span class="stat-label">Total Users</span>
            </div>
          </mat-card-content>
        </mat-card>
        <mat-card class="stat-card">
          <mat-card-content>
            <div class="stat-icon-wrapper green">
              <mat-icon>assignment</mat-icon>
            </div>
            <div class="stat-data">
              <span class="stat-number">{{ stats.totalApplications }}</span>
              <span class="stat-label">Applications</span>
            </div>
          </mat-card-content>
        </mat-card>
        <mat-card class="stat-card">
          <mat-card-content>
            <div class="stat-icon-wrapper purple">
              <mat-icon>fact_check</mat-icon>
            </div>
            <div class="stat-data">
              <span class="stat-number">{{ stats.assessmentsPassed }}</span>
              <span class="stat-label">Passed Tests</span>
            </div>
          </mat-card-content>
        </mat-card>
        <mat-card class="stat-card">
          <mat-card-content>
            <div class="stat-icon-wrapper orange">
              <mat-icon>domain</mat-icon>
            </div>
            <div class="stat-data">
              <span class="stat-number">{{ stats.traineesActive }}</span>
              <span class="stat-label">Active Trainees</span>
            </div>
          </mat-card-content>
        </mat-card>
      </div>

      <!-- Charts Section -->
      <div class="charts-container" *ngIf="stats">
        <mat-card class="chart-card">
          <mat-card-header>
            <mat-card-title>Infrastructure Vacancy</mat-card-title>
          </mat-card-header>
          <mat-card-content class="vacancy-overview">
            <div class="vacancy-circle">
              <span class="circle-num">{{
                stats.totalVacancyAvailable || 0
              }}</span>
              <span class="circle-lbl">Open Blocks Vacancy</span>
            </div>
            <div class="vacancy-meta">
              <div class="meta-item">
                <span class="dot green-dot"></span>
                <span
                  >Used capacity:
                  <strong>{{ stats.totalVacancyUsed || 0 }}</strong> slots</span
                >
              </div>
              <div class="meta-item">
                <span class="dot blue-dot"></span>
                <span
                  >Available budget:
                  <strong
                    >₹{{ stats.totalBudgetAvailable || 0 | number }}</strong
                  ></span
                >
              </div>
            </div>
          </mat-card-content>
        </mat-card>
      </div>
    </div>
  `,
  styles: [
    `
      .dashboard-overview {
        display: flex;
        flex-direction: column;
        gap: 24px;
      }
      .stats-grid {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
        gap: 20px;
      }
      .stat-card {
        border-radius: 12px !important;
        box-shadow: 0 4px 20px rgba(0, 0, 0, 0.04) !important;
      }
      mat-card-content {
        display: flex;
        align-items: center;
        gap: 16px;
        padding: 16px !important;
      }
      .stat-icon-wrapper {
        width: 48px;
        height: 48px;
        border-radius: 8px;
        display: flex;
        align-items: center;
        justify-content: center;
        color: white;
      }
      .stat-icon-wrapper mat-icon {
        font-size: 24px;
      }
      .blue {
        background-color: #3b82f6;
      }
      .green {
        background-color: #22c55e;
      }
      .purple {
        background-color: #a855f7;
      }
      .orange {
        background-color: #f97316;
      }
      .stat-data {
        display: flex;
        flex-direction: column;
      }
      .stat-number {
        font-size: 24px;
        font-weight: 700;
        color: #1e293b;
      }
      .stat-label {
        font-size: 13px;
        color: #64748b;
        font-weight: 500;
      }
      .charts-container {
        display: grid;
        grid-template-columns: 1fr;
        gap: 20px;
      }
      @media (max-width: 900px) {
        .charts-container {
          grid-template-columns: 1fr;
        }
      }
      .chart-card {
        border-radius: 12px !important;
        box-shadow: 0 4px 20px rgba(0, 0, 0, 0.04) !important;
        padding: 16px;
      }
      .chart-content {
        padding: 24px 0 0 0 !important;
        display: flex;
        flex-direction: column;
        gap: 12px;
      }
      .custom-funnel {
        display: flex;
        flex-direction: column;
        gap: 8px;
        width: 100%;
      }
      .funnel-stage {
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding: 12px 16px;
        color: white;
        border-radius: 6px;
        font-size: 14px;
        font-weight: 600;
        min-width: 120px;
      }
      .stage-applied {
        background-color: #3b82f6;
        width: 100%;
      }
      .stage-shortlisted {
        background-color: #6366f1;
      }
      .stage-offered {
        background-color: #8b5cf6;
      }
      .stage-accepted {
        background-color: #10b981;
      }
      .vacancy-overview {
        padding: 24px 0 0 0 !important;
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: 20px;
      }
      .vacancy-circle {
        width: 130px;
        height: 130px;
        border-radius: 50%;
        border: 8px solid #e2e8f0;
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        text-align: center;
      }
      .circle-num {
        font-size: 28px;
        font-weight: 700;
        color: #1e293b;
      }
      .circle-lbl {
        font-size: 9px;
        color: #64748b;
        font-weight: 600;
        text-transform: uppercase;
      }
      .vacancy-meta {
        display: flex;
        flex-direction: column;
        gap: 8px;
        width: 100%;
      }
      .meta-item {
        display: flex;
        align-items: center;
        gap: 8px;
        font-size: 13px;
        color: #475569;
      }
      .dot {
        width: 8px;
        height: 8px;
        border-radius: 50%;
      }
      .green-dot {
        background-color: #10b981;
      }
      .blue-dot {
        background-color: #3b82f6;
      }
    `,
  ],
  standalone: false,
})
export class HrDashboardComponent implements OnInit {
  stats: DashboardStats | null = null;
  constructor(
    private dashboardService: DashboardService,
    private currentUserService: CurrentUserService,
    private router: Router,
  ) {}
  ngOnInit(): void {
    // RMG doesn't need the HR dashboard — redirect straight to allocation.
    if (this.currentUserService.getRole()?.toUpperCase() === 'RMG') {
      this.router.navigate(['/hr/released']);
      return;
    }
    this.dashboardService.getStats().subscribe((s) => (this.stats = s));
  }
}
