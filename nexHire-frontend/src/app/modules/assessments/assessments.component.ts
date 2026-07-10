import { Component, OnInit } from '@angular/core';
import { SelectionModel } from '@angular/cdk/collections';
import { AssessmentService } from '../../services/assessment.service';
import { ApplicationService } from '../../services/application.service';
import { ToastService } from '../../shared/services/toast.service';
import { MatDialog } from '@angular/material/dialog';
import { ConfirmationDialogComponent } from '../../shared/components/confirmation-dialog/confirmation-dialog.component';
import { Application } from '../../models/application.model';
import { Assessment, AssessmentStatus, AssessmentBulkResult } from '../../models/assessment.model';
import { ExcelImportService } from '../../services/excel-import.service';

@Component({
    selector: 'app-assessments-mgmt',
    template: `
    <div class="assessments-mgmt">
      <app-page-header title="Assessments Hub" subtitle="Assign coding tests and transition candidates to offer stage"></app-page-header>

      <div class="assessments-grid">
        <!-- Applicants Section (For Assigning Tests) -->
        <mat-card class="column-card">
          <mat-card-header>
            <mat-card-title>Eligible Applicants</mat-card-title>
            <div class="header-actions">
              <mat-form-field appearance="outline" class="job-select-field" *ngIf="eligibleJobs.length > 0">
                <mat-label>Select Job</mat-label>
                <mat-select [(value)]="selectedJobId">
                  <mat-option *ngFor="let job of eligibleJobs" [value]="job.jobId">
                    {{ job.title }}
                  </mat-option>
                </mat-select>
              </mat-form-field>
              <button mat-raised-button color="accent" 
                      [disabled]="selection.isEmpty()" 
                      (click)="assignSelected()">
                Assign Selected ({{ selection.selected.length }})
              </button>
              <button mat-stroked-button color="primary" 
                      [disabled]="!selectedJobId"
                      (click)="assignAllEligible()">
                Assign All Eligible
              </button>
            </div>
          </mat-card-header>
          <mat-card-content>
            <app-empty-state *ngIf="eligibleApps.length === 0" icon="people" title="No applicants ready" subtitle="Candidates must be shortlisted first."></app-empty-state>

            <div class="table-container" *ngIf="eligibleApps.length > 0">
              <table mat-table [dataSource]="eligibleApps">
                <!-- Checkbox Column -->
                <ng-container matColumnDef="select">
                  <th mat-header-cell *matHeaderCellDef>
                    <mat-checkbox (change)="$event ? masterToggle() : null"
                                  [checked]="selection.hasValue() && isAllSelected()"
                                  [indeterminate]="selection.hasValue() && !isAllSelected()">
                    </mat-checkbox>
                  </th>
                  <td mat-cell *matCellDef="let row">
                    <mat-checkbox (click)="$event.stopPropagation()"
                                  (change)="$event ? selection.toggle(row) : null"
                                  [checked]="selection.isSelected(row)">
                    </mat-checkbox>
                  </td>
                </ng-container>

                <!-- Candidate -->
                <ng-container matColumnDef="candidate">
                  <th mat-header-cell *matHeaderCellDef>Candidate</th>
                  <td mat-cell *matCellDef="let app">
                    <div class="candidate-info">
                      <span class="name">{{ app.userFullName }}</span>
                      <span class="email">{{ app.userEmail }}</span>
                    </div>
                  </td>
                </ng-container>

                <!-- Job -->
                <ng-container matColumnDef="job">
                  <th mat-header-cell *matHeaderCellDef>Job Position</th>
                  <td mat-cell *matCellDef="let app">{{ app.jobTitle }}</td>
                </ng-container>

                <tr mat-header-row *matHeaderRowDef="appColumns"></tr>
                <tr mat-row *matRowDef="let row; columns: appColumns;" (click)="selection.toggle(row)"></tr>
              </table>
            </div>
          </mat-card-content>
        </mat-card>

        <!-- Active Assessments Section -->
        <mat-card class="column-card">
          <mat-card-header>
            <mat-card-title>Active Assessments</mat-card-title>
          </mat-card-header>
          <mat-card-content>
            <app-empty-state *ngIf="assessments.length === 0" icon="quiz" title="No assessments assigned" subtitle="Assign tests to shortlisted applicants."></app-empty-state>

            <div class="table-container" *ngIf="assessments.length > 0">
              <table mat-table [dataSource]="assessments">
                <!-- Candidate -->
                <ng-container matColumnDef="candidate">
                  <th mat-header-cell *matHeaderCellDef>Candidate</th>
                  <td mat-cell *matCellDef="let test">{{ test.candidateName }}</td>
                </ng-container>

                <!-- Type -->
                <ng-container matColumnDef="type">
                  <th mat-header-cell *matHeaderCellDef>Type</th>
                  <td mat-cell *matCellDef="let test">{{ test.assessmentType }}</td>
                </ng-container>

                <!-- Status -->
                <ng-container matColumnDef="status">
                  <th mat-header-cell *matHeaderCellDef>Status</th>
                  <td mat-cell *matCellDef="let test">
                    <app-status-badge [status]="test.status"></app-status-badge>
                  </td>
                </ng-container>

                <!-- Action -->
                <ng-container matColumnDef="actions">
                  <th mat-header-cell *matHeaderCellDef align="end">Actions</th>
                  <td mat-cell *matCellDef="let test" align="end">
                    <ng-container *ngIf="test.status === 'ASSIGNED' || test.status === 'IN_PROGRESS'">
                      <button mat-icon-button color="primary" matTooltip="Mark Passed" (click)="transitionStatus(test.assessmentId, 'PASSED')">
                        <mat-icon>check_circle</mat-icon>
                      </button>
                      <button mat-icon-button color="warn" matTooltip="Mark Failed" (click)="transitionStatus(test.assessmentId, 'FAILED')">
                        <mat-icon>cancel</mat-icon>
                      </button>
                    </ng-container>
                    <span *ngIf="test.status === 'PASSED' || test.status === 'FAILED'" class="action-done">Completed</span>
                  </td>
                </ng-container>

                <tr mat-header-row *matHeaderRowDef="testColumns"></tr>
                <tr mat-row *matRowDef="let row; columns: testColumns;"></tr>
              </table>
            </div>
          </mat-card-content>
        </mat-card>
      </div>

      <!-- Bulk Upload Assessment Scores (Excel) -->
      <mat-card class="column-card mt-24">
        <mat-card-header>
          <mat-card-title>Bulk Upload Assessment Scores</mat-card-title>
        </mat-card-header>
        <mat-card-content style="padding-top: 16px;">
          <p class="section-desc" style="font-size: 14px; color: #475569; margin-bottom: 16px;">
            Process scores for a mass assessment by uploading the results spreadsheet. You can also specify a custom pass cutoff mark below.
          </p>
          
          <div style="display: flex; gap: 16px; align-items: center; flex-wrap: wrap; margin-bottom: 16px;">
            <mat-form-field appearance="outline" style="max-width: 180px;">
              <mat-label>Pass Cutoff Mark</mat-label>
              <input matInput type="number" [(ngModel)]="cutoffMark" placeholder="Default: 70" />
            </mat-form-field>
            
            <div style="display: flex; align-items: center; gap: 8px;">
              <input type="file" #excelInput (change)="onExcelSelected($event)" accept=".xlsx,.xls" style="display: none;" />
              <button mat-stroked-button color="primary" (click)="excelInput.click()">
                <mat-icon>cloud_upload</mat-icon> Choose Assessment Excel
              </button>
              <span style="font-size: 13px; font-weight: 500;" *ngIf="excelFile">{{ excelFile.name }}</span>
              <span style="color: #94a3b8; font-size: 13px;" *ngIf="!excelFile">No file chosen</span>
            </div>
          </div>
          
          <div style="display: flex; gap: 12px;">
            <button mat-raised-button color="primary" [disabled]="!excelFile || uploadingExcel" (click)="uploadExcelScores()">
              Process Assessment Excel
            </button>
            <a mat-stroked-button [href]="getTemplateUrl()" download>
              <mat-icon>download</mat-icon> Download Template
            </a>
          </div>
        </mat-card-content>
      </mat-card>

      <!-- Bulk Result Dialog / Drawer (Inline summary) -->
      <mat-card class="result-summary-card" *ngIf="bulkResult">
        <mat-card-content class="summary-box">
          <div class="summary-title">
            <mat-icon color="accent">info</mat-icon>
            <h4>Bulk Operation Summary</h4>
          </div>
          <div class="summary-metrics">
            <span>Requested: <strong>{{ bulkResult.totalRequested }}</strong></span>
            <span class="success-text">Assigned: <strong>{{ bulkResult.assignedCount }}</strong></span>
            <span class="warn-text">Skipped: <strong>{{ bulkResult.skippedCount }}</strong></span>
            <span class="error-text">Failed: <strong>{{ bulkResult.failedCount }}</strong></span>
          </div>
          <button mat-button (click)="bulkResult = null">Dismiss</button>
        </mat-card-content>
      </mat-card>
    </div>
  `,
    styles: [`
    .assessments-mgmt {
      display: flex;
      flex-direction: column;
      gap: 24px;
    }
    .assessments-grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 24px;
    }
    @media (max-width: 992px) {
      .assessments-grid {
        grid-template-columns: 1fr;
      }
    }
    .column-card {
      border-radius: 12px !important;
      box-shadow: 0 4px 20px rgba(0,0,0,0.04) !important;
      padding: 16px;
      display: flex;
      flex-direction: column;
    }
    mat-card-header {
      justify-content: space-between;
      align-items: center;
      margin-bottom: 16px;
    }
    .header-actions {
      display: flex;
      gap: 8px;
      flex-wrap: wrap;
    }
    .job-select-field {
      min-width: 220px;
    }
    table {
      width: 100%;
    }
    .candidate-info {
      display: flex;
      flex-direction: column;
    }
    .candidate-info .name {
      font-weight: 600;
      color: #1e293b;
    }
    .candidate-info .email {
      font-size: 11px;
      color: #64748b;
    }
    .action-done {
      font-size: 12px;
      color: #94a3b8;
      font-weight: 500;
    }
    .result-summary-card {
      background-color: #fafafa !important;
      border: 1px solid #e0e0e0;
      border-radius: 8px !important;
    }
    .summary-box {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 12px 24px !important;
      flex-wrap: wrap;
      gap: 12px;
    }
    .summary-title {
      display: flex;
      align-items: center;
      gap: 8px;
    }
    .summary-title h4 {
      margin: 0;
      font-size: 14px;
      font-weight: 600;
      color: #1e293b;
    }
    .summary-metrics {
      display: flex;
      gap: 24px;
      font-size: 14px;
    }
    .success-text { color: #16a34a; }
    .warn-text { color: #d97706; }
    .error-text { color: #dc2626; }
  `],
    standalone: false
})
export class AssessmentsManagementComponent implements OnInit {
  eligibleApps: Application[] = [];
  assessments: Assessment[] = [];
  eligibleJobs: { jobId: number; title: string }[] = [];
  selectedJobId?: number;
  selection = new SelectionModel<Application>(true, []);

  appColumns = ['select', 'candidate', 'job'];
  testColumns = ['candidate', 'type', 'status', 'actions'];

  bulkResult: AssessmentBulkResult | null = null;

  // Excel upload properties
  excelFile: File | null = null;
  cutoffMark = 70;
  uploadingExcel = false;

  constructor(
    private appService: ApplicationService,
    private testService: AssessmentService,
    private toastService: ToastService,
    private dialog: MatDialog,
    private importService: ExcelImportService
  ) {}

  ngOnInit(): void {
    this.loadEligibleApplicants();
    this.loadAssessments();
  }

  loadEligibleApplicants(): void {
    // In our recruitment flow, SHORTLISTED applications are eligible for assessments
    this.appService.getAll({ status: 'SHORTLISTED' }).subscribe(apps => {
      this.eligibleApps = apps;
      this.selection.clear();
      this.eligibleJobs = this.buildEligibleJobs(apps);
      if (!this.selectedJobId && this.eligibleJobs.length === 1) {
        this.selectedJobId = this.eligibleJobs[0].jobId;
      }
    });
  }

  private buildEligibleJobs(apps: Application[]): { jobId: number; title: string }[] {
    const map = new Map<number, string>();
    apps.forEach(app => {
      if (app.jobId && !map.has(app.jobId)) {
        map.set(app.jobId, app.jobTitle ?? `Job ${app.jobId}`);
      }
    });
    return Array.from(map.entries()).map(([jobId, title]) => ({ jobId, title }));
  }

  loadAssessments(): void {
    this.testService.getAll().subscribe(tests => this.assessments = tests);
  }

  isAllSelected(): boolean {
    const numSelected = this.selection.selected.length;
    const numRows = this.eligibleApps.length;
    return numSelected === numRows;
  }

  masterToggle(): void {
    this.isAllSelected() ?
        this.selection.clear() :
        this.eligibleApps.forEach(row => this.selection.select(row));
  }

  assignSelected(): void {
    if (this.selection.isEmpty()) return;

    const ids = this.selection.selected.map(a => a.applicationId);
    
    const dialogRef = this.dialog.open(ConfirmationDialogComponent, {
      data: {
        title: 'Assign Selected Assessments',
        message: `Are you sure you want to assign online coding tests to ${ids.length} selected candidate(s)?`,
        type: 'info'
      }
    });

    dialogRef.afterClosed().subscribe(confirm => {
      if (confirm) {
        this.testService.assignSelected({
          applicationIds: ids,
          assessmentType: 'JAVA',
          assessmentDate: new Date(Date.now() + 5*24*60*60*1000).toISOString().split('T')[0] // 5 days from now
        }).subscribe({
          next: (res) => {
            this.toastService.success(`Bulk assignment initiated!`);
            this.bulkResult = res;
            this.loadEligibleApplicants();
            this.loadAssessments();
          },
          error: () => this.toastService.error('Bulk assignment failed.')
        });
      }
    });
  }

  assignAllEligible(): void {
    const jobId = this.selectedJobId ?? this.eligibleJobs[0]?.jobId;
    if (!jobId) {
      this.toastService.warning('Please choose a job to assign eligible candidates.');
      return;
    }

    const dialogRef = this.dialog.open(ConfirmationDialogComponent, {
      data: {
        title: 'Assign All Eligible Assessments',
        message: `This will assign coding tests to all eligible shortlisted candidates for the selected job. Proceed?`,
        type: 'warning'
      }
    });

    dialogRef.afterClosed().subscribe(confirm => {
      if (confirm) {
        this.testService.assignAllEligible(jobId, {
          assessmentType: 'JAVA',
          assessmentDate: new Date(Date.now() + 5*24*60*60*1000).toISOString().split('T')[0]
        }).subscribe({
          next: (res) => {
            this.toastService.success(`Assigned tests to all eligible applicants for the selected job.`);
            this.bulkResult = res;
            this.loadEligibleApplicants();
            this.loadAssessments();
          },
          error: () => this.toastService.error('All Eligible assignment failed.')
        });
      }
    });
  }

  transitionStatus(id: number, status: AssessmentStatus): void {
    const dialogRef = this.dialog.open(ConfirmationDialogComponent, {
      data: {
        title: 'Change Assessment Status',
        message: `Set assessment status to ${status}? This will trigger automatic offer letter generation if PASSED.`,
        type: 'warning'
      }
    });

    dialogRef.afterClosed().subscribe(confirm => {
      if (confirm) {
        this.testService.updateStatus(id, { status }).subscribe({
          next: () => {
            this.toastService.success(`Assessment updated to ${status}`);
            this.loadAssessments();
          },
          error: () => this.toastService.error('Status update failed.')
        });
      }
    });
  }

  onExcelSelected(event: any): void {
    this.excelFile = event.target.files[0] || null;
  }

  uploadExcelScores(): void {
    if (!this.excelFile) return;
    this.uploadingExcel = true;
    this.importService.uploadAssessment(this.excelFile, this.cutoffMark).subscribe({
      next: (res) => {
        this.toastService.success(`Assessment scores processed! Imported ${res.successRows || 0} rows.`);
        this.excelFile = null;
        this.uploadingExcel = false;
        this.loadEligibleApplicants();
        this.loadAssessments();
      },
      error: (err) => {
        this.toastService.error(err.error?.message || 'Failed to upload assessment scores.');
        this.uploadingExcel = false;
      }
    });
  }

  getTemplateUrl(): string {
    return this.importService.getTemplateDownloadUrl('ASSESSMENT');
  }
}
