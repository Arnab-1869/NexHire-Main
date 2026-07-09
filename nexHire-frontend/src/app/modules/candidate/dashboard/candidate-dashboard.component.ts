import { Component, OnInit } from '@angular/core';
import { ApplicationService } from '../../../services/application.service';
import { OfferLetterService } from '../../../services/offer-letter.service';
import { CurrentUserService } from '../../../core/auth/current-user.service';
import { Application } from '../../../models/application.model';
import { OfferLetter } from '../../../models/offer-letter.model';

@Component({
    selector: 'app-candidate-dashboard',
    template: `
    <div class="candidate-dashboard">
      <app-page-header title="Candidate Workspace" subtitle="Manage your applications, test schedules, and offer letters"></app-page-header>

      <!-- Welcome Card -->
      <mat-card class="welcome-card">
        <mat-card-content>
          <div class="welcome-grid">
            <div class="welcome-text">
              <h2>Welcome, {{ user?.fullName }}!</h2>
              <p>NexHire streamlines your recruitment journey. Find new openings, view real-time assessment statuses, and check background verification updates all in one portal.</p>
              <button mat-raised-button color="accent" routerLink="/candidate/jobs">Browse Active Jobs</button>
            </div>
            <div class="welcome-stats">
              <div class="stat-box">
                <span class="stat-num">{{ applications.length }}</span>
                <span class="stat-lbl">Applications</span>
              </div>
              <div class="stat-box">
                <span class="stat-num">{{ getPassedCount() }}</span>
                <span class="stat-lbl">Assessments Passed</span>
              </div>
              <div class="stat-box">
                <span class="stat-num">{{ offers.length }}</span>
                <span class="stat-lbl">Offers Issued</span>
              </div>
            </div>
          </div>
        </mat-card-content>
      </mat-card>

      <!-- Applications and Actions Grid -->
      <div class="dashboard-grid">
        <!-- Recent Applications -->
        <mat-card class="grid-card">
          <mat-card-header>
            <mat-card-title>My Applications</mat-card-title>
          </mat-card-header>
          <mat-card-content>
            <app-empty-state *ngIf="applications.length === 0" icon="assignment" title="No applications yet" subtitle="Start applying to jobs to track status here."></app-empty-state>
            <div class="recent-list" *ngIf="applications.length > 0">
              <div class="list-item" *ngFor="let app of applications">
                <div class="item-details">
                  <h4>{{ app.jobTitle }}</h4>
                  <span>Applied on: {{ app.appliedDate | date }}</span>
                </div>
                <app-status-badge [status]="app.status"></app-status-badge>
              </div>
            </div>
          </mat-card-content>
        </mat-card>

        <!-- Recent Offer Letters -->
        <mat-card class="grid-card">
          <mat-card-header>
            <mat-card-title>Offer Letters</mat-card-title>
          </mat-card-header>
          <mat-card-content>
            <app-empty-state *ngIf="offers.length === 0" icon="mail" title="No offers yet" subtitle="Completed assessments will trigger offer generation."></app-empty-state>
            <div class="recent-list" *ngIf="offers.length > 0">
              <div class="list-item pointer" *ngFor="let offer of offers" routerLink="/candidate/offers">
                <div class="item-details">
                  <h4>{{ offer.designation || 'Software Engineer' }}</h4>
                  <span>CTC: ₹{{ offer.ctc | number }} • Joining: {{ offer.joiningDate | date }}</span>
                </div>
                <app-status-badge [status]="offer.status"></app-status-badge>
              </div>
            </div>
          </mat-card-content>
        </mat-card>
      </div>
    </div>
  `,
    styles: [`
    .candidate-dashboard {
      display: flex;
      flex-direction: column;
      gap: 24px;
    }
    .welcome-card {
      background: linear-gradient(135deg, #3f51b5, #5c6bc0) !important;
      color: white !important;
      border-radius: 12px !important;
      overflow: hidden;
    }
    .welcome-grid {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 16px;
      flex-wrap: wrap;
      gap: 32px;
    }
    .welcome-text {
      flex: 2;
      min-width: 300px;
    }
    .welcome-text h2 {
      margin: 0 0 8px;
      font-size: 26px;
      font-weight: 700;
    }
    .welcome-text p {
      margin: 0 0 24px;
      line-height: 1.5;
      color: #e0e7ff;
    }
    .welcome-stats {
      display: flex;
      gap: 16px;
      flex: 1;
      justify-content: flex-end;
      min-width: 280px;
    }
    .stat-box {
      background: rgba(255,255,255,0.15);
      border-radius: 8px;
      padding: 16px;
      min-width: 90px;
      text-align: center;
      flex: 1;
    }
    .stat-num {
      display: block;
      font-size: 28px;
      font-weight: 700;
      margin-bottom: 4px;
    }
    .stat-lbl {
      font-size: 11px;
      color: #e0e7ff;
      text-transform: uppercase;
      font-weight: 600;
    }
    .dashboard-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(400px, 1fr));
      gap: 24px;
    }
    .grid-card {
      border-radius: 12px !important;
      box-shadow: 0 4px 20px rgba(0,0,0,0.05) !important;
    }
    .recent-list {
      display: flex;
      flex-direction: column;
      gap: 12px;
      padding-top: 12px;
    }
    .list-item {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 12px;
      background-color: #f8fafc;
      border: 1px solid #e2e8f0;
      border-radius: 8px;
      transition: background-color 0.2s;
    }
    .list-item:hover {
      background-color: #f1f5f9;
    }
    .pointer {
      cursor: pointer;
    }
    .item-details h4 {
      margin: 0 0 4px 0;
      font-size: 14px;
      font-weight: 600;
      color: #1e293b;
    }
    .item-details span {
      font-size: 12px;
      color: #64748b;
    }
  `],
    standalone: false
})
export class CandidateDashboardComponent implements OnInit {
  user: any = null;
  applications: Application[] = [];
  offers: OfferLetter[] = [];

  constructor(
    private currentUserService: CurrentUserService,
    private appService: ApplicationService,
    private offerService: OfferLetterService
  ) {}

  ngOnInit(): void {
    this.user = this.currentUserService.getUser();
    if (this.user?.userId) {
      this.appService.getByUser(this.user.userId).subscribe(apps => this.applications = apps);
      this.offerService.getByUser(this.user.userId).subscribe(offs => this.offers = offs);
    }
  }

  getPassedCount(): number {
    return this.applications.filter(a => a.assessmentStatus === 'PASSED').length;
  }
}
