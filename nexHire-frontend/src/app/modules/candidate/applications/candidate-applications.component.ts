import { Component, OnInit } from '@angular/core';
import { ApplicationService } from '../../../services/application.service';
import { CurrentUserService } from '../../../core/auth/current-user.service';
import { Application } from '../../../models/application.model';

@Component({
    selector: 'app-candidate-applications',
    template: `
    <div class="candidate-applications">
      <app-page-header title="My Job Applications" subtitle="Track the progress of your submitted job applications"></app-page-header>

      <mat-card class="table-card">
        <mat-card-content>
          <app-empty-state *ngIf="applications.length === 0" icon="assignment" title="No applications found" subtitle="Browse openings in the Jobs Portal to start your career."></app-empty-state>
          
          <div class="table-container" *ngIf="applications.length > 0">
            <table mat-table [dataSource]="applications">
              <!-- Job Title -->
              <ng-container matColumnDef="jobTitle">
                <th mat-header-cell *matHeaderCellDef>Job Title</th>
                <td mat-cell *matCellDef="let app" class="bold-text">{{ app.jobTitle }}</td>
              </ng-container>

              <!-- Location -->
              <ng-container matColumnDef="location">
                <th mat-header-cell *matHeaderCellDef>Location</th>
                <td mat-cell *matCellDef="let app">{{ app.jobLocation || 'Remote' }}</td>
              </ng-container>

              <!-- Applied Date -->
              <ng-container matColumnDef="appliedDate">
                <th mat-header-cell *matHeaderCellDef>Applied Date</th>
                <td mat-cell *matCellDef="let app">{{ app.appliedDate | date }}</td>
              </ng-container>

              <!-- Assessment Status -->
              <ng-container matColumnDef="assessmentStatus">
                <th mat-header-cell *matHeaderCellDef>Assessment Status</th>
                <td mat-cell *matCellDef="let app">
                  <app-status-badge *ngIf="app.assessmentStatus" [status]="app.assessmentStatus"></app-status-badge>
                  <span *ngIf="!app.assessmentStatus" class="no-status">—</span>
                </td>
              </ng-container>

              <!-- Application Status -->
              <ng-container matColumnDef="status">
                <th mat-header-cell *matHeaderCellDef>Status</th>
                <td mat-cell *matCellDef="let app">
                  <app-status-badge [status]="app.status"></app-status-badge>
                </td>
              </ng-container>

              <tr mat-header-row *matHeaderRowDef="displayedColumns"></tr>
              <tr mat-row *matRowDef="let row; columns: displayedColumns;"></tr>
            </table>
          </div>
        </mat-card-content>
      </mat-card>
    </div>
  `,
    styles: [`
    .candidate-applications {
      display: flex;
      flex-direction: column;
      gap: 24px;
    }
    .table-card {
      border-radius: 12px !important;
      box-shadow: 0 4px 20px rgba(0,0,0,0.05) !important;
    }
    .bold-text {
      font-weight: 600;
      color: #1e293b;
    }
    .no-status {
      color: #94a3b8;
    }
    table {
      width: 100%;
    }
  `],
    standalone: false
})
export class CandidateApplicationsComponent implements OnInit {
  applications: Application[] = [];
  displayedColumns = ['jobTitle', 'location', 'appliedDate', 'assessmentStatus', 'status'];

  constructor(
    private appService: ApplicationService,
    private currentUserService: CurrentUserService
  ) {}

  ngOnInit(): void {
    const user = this.currentUserService.getUser();
    if (user?.userId) {
      this.appService.getByUser(user.userId).subscribe(apps => this.applications = apps);
    }
  }
}
