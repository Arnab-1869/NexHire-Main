import { Component, OnInit } from '@angular/core';
import { BackgroundVerificationService } from '../../services/background-verification.service';
import { ExcelImportService } from '../../services/excel-import.service';
import { ToastService } from '../../shared/services/toast.service';
import { BackgroundVerification } from '../../models/background-verification.model';

@Component({
  selector: 'app-bgv-mgmt',
  template: `
    <div class="bgv-mgmt">
      <app-page-header
        title="Background Verification Portal"
        subtitle="Bulk-update BGV status by uploading report spreadsheets received from external verification vendors."
      ></app-page-header>

      <div class="split-layout">
        <!-- Left Side: Cases List -->
        <mat-card class="table-card">
          <mat-card-header>
            <mat-card-title>BGC Verification Cases</mat-card-title>
          </mat-card-header>
          <mat-card-content>
            <app-empty-state
              *ngIf="verifications.length === 0"
              icon="verified"
              title="No BGC cases found"
              subtitle="Verification cases start automatically when candidates accept their offer letters."
            ></app-empty-state>

            <div class="table-container" *ngIf="verifications.length > 0">
              <table mat-table [dataSource]="verifications">
                <ng-container matColumnDef="candidate">
                  <th mat-header-cell *matHeaderCellDef>Candidate Details</th>
                  <td mat-cell *matCellDef="let bgv">
                    <div class="candidate-info">
                      <span class="name">{{ bgv.candidateName }}</span>
                      <span class="subtext">Job: {{ bgv.jobTitle }} | Email: {{ bgv.candidateEmail }}</span>
                    </div>
                  </td>
                </ng-container>

                <ng-container matColumnDef="initiatedDate">
                  <th mat-header-cell *matHeaderCellDef>Initiated</th>
                  <td mat-cell *matCellDef="let bgv">{{ bgv.initiatedDate | date:'shortDate' }}</td>
                </ng-container>

                <ng-container matColumnDef="status">
                  <th mat-header-cell *matHeaderCellDef>Status</th>
                  <td mat-cell *matCellDef="let bgv">
                    <app-status-badge [status]="bgv.status"></app-status-badge>
                  </td>
                </ng-container>

                <ng-container matColumnDef="actions">
                  <th mat-header-cell *matHeaderCellDef align="end">Remarks</th>
                  <td mat-cell *matCellDef="let bgv" align="end">
                    <span class="remarks-text" matTooltip="{{ bgv.remarks || 'No remarks' }}">
                      {{ bgv.remarks || 'N/A' }}
                    </span>
                  </td>
                </ng-container>

                <tr mat-header-row *matHeaderRowDef="displayedColumns"></tr>
                <tr mat-row *matRowDef="let row; columns: displayedColumns"></tr>
              </table>
            </div>
          </mat-card-content>
        </mat-card>

        <!-- Right Side: Excel Import & Logs -->
        <div class="details-panel">
          <!-- BGC Excel Import Card -->
          <mat-card class="detail-card">
            <mat-card-header>
              <mat-card-title>BGC Excel Upload</mat-card-title>
            </mat-card-header>
            <mat-card-content style="padding-top: 16px;">
              <p class="section-desc">
                NexHire simplifies background verification. Upload the verification report spreadsheet provided by your external BGV vendor to process and update candidate statuses instantly.
              </p>

              <div class="excel-upload-zone">
                <input type="file" #excelInput (change)="onExcelSelected($event)" accept=".xlsx,.xls" style="display: none;" />
                <button type="button" mat-stroked-button color="primary" (click)="excelInput.click()" [disabled]="uploadingResults">
                  <mat-icon>cloud_upload</mat-icon> Choose BGC Excel Report
                </button>
                <div class="file-name" *ngIf="excelFile">
                  Selected: {{ excelFile.name }}
                </div>
                <div class="file-name placeholder" *ngIf="!excelFile">
                  No spreadsheet file chosen
                </div>
              </div>

              <div class="action-buttons">
                <button mat-raised-button color="primary" [disabled]="!excelFile || uploadingResults" (click)="uploadBgcResults()" style="flex: 1;">
                  <span *ngIf="!uploadingResults">Process BGV Excel</span>
                  <mat-spinner diameter="20" *ngIf="uploadingResults"></mat-spinner>
                </button>
                <a mat-stroked-button [href]="getTemplateUrl('BGC')" download style="flex: 1;">
                  <mat-icon>download</mat-icon> Download Template
                </a>
              </div>
            </mat-card-content>
          </mat-card>

          <!-- BGC Import History / Logs Card -->
          <mat-card class="detail-card mt-24">
            <mat-card-header>
              <mat-card-title>BGC Import History</mat-card-title>
            </mat-card-header>
            <mat-card-content style="padding-top: 16px;">
              <app-empty-state
                *ngIf="logs.length === 0"
                icon="history"
                title="No upload logs found"
                subtitle="Import history will be tracked here."
              ></app-empty-state>

              <div class="table-container" *ngIf="logs.length > 0" style="max-height: 220px; overflow-y: auto;">
                <table mat-table [dataSource]="logs">
                  <ng-container matColumnDef="fileName">
                    <th mat-header-cell *matHeaderCellDef>File Name</th>
                    <td mat-cell *matCellDef="let l">
                      <div class="candidate-info">
                        <span class="name">{{ l.fileName }}</span>
                        <span class="subtext">Uploaded: {{ l.uploadedAt | date:'short' }}</span>
                      </div>
                    </td>
                  </ng-container>

                  <ng-container matColumnDef="stats">
                    <th mat-header-cell *matHeaderCellDef>Stats</th>
                    <td mat-cell *matCellDef="let l">
                      <span style="font-weight: 500;">T: {{ l.totalRows }}</span> |
                      <span style="color:#16a34a; font-weight: 500;">S: {{ l.successRows }}</span> |
                      <span style="color:#ef4444; font-weight: 500;">F: {{ l.failedRows }}</span>
                    </td>
                  </ng-container>

                  <ng-container matColumnDef="actions">
                    <th mat-header-cell *matHeaderCellDef align="end">Errors</th>
                    <td mat-cell *matCellDef="let l" align="end">
                      <button *ngIf="l.failedRows > 0" mat-icon-button color="warn" (click)="viewLogErrors(l.id)" matTooltip="View Errors">
                        <mat-icon>warning</mat-icon>
                      </button>
                    </td>
                  </ng-container>

                  <tr mat-header-row *matHeaderRowDef="['fileName', 'stats', 'actions']"></tr>
                  <tr mat-row *matRowDef="let row; columns: ['fileName', 'stats', 'actions']"></tr>
                </table>
              </div>

              <!-- Log Errors Sub-Section -->
              <div class="log-errors-list mt-16" *ngIf="selectedLogErrors.length > 0">
                <div class="error-panel">
                  <h4 class="error-header">Errors for Log ID {{ selectedLogId }}</h4>
                  <table mat-table [dataSource]="selectedLogErrors">
                    <ng-container matColumnDef="rowNum">
                      <th mat-header-cell *matHeaderCellDef>Row</th>
                      <td mat-cell *matCellDef="let err">R{{ err.rowNumber }}</td>
                    </ng-container>
                    <ng-container matColumnDef="errorMessage">
                      <th mat-header-cell *matHeaderCellDef>Error Message</th>
                      <td mat-cell *matCellDef="let err" class="error-text">{{ err.errorMessage }}</td>
                    </ng-container>
                    <tr mat-header-row *matHeaderRowDef="['rowNum', 'errorMessage']"></tr>
                    <tr mat-row *matRowDef="let row; columns: ['rowNum', 'errorMessage']"></tr>
                  </table>
                </div>
              </div>
            </mat-card-content>
          </mat-card>
        </div>
      </div>
    </div>
  `,
  styles: [
    `
      .bgv-mgmt {
        display: flex;
        flex-direction: column;
        gap: 24px;
      }
      .split-layout {
        display: grid;
        grid-template-columns: 1fr 1.1fr;
        gap: 24px;
      }
      .table-card, .detail-card {
        border-radius: 12px !important;
        box-shadow: 0 4px 20px rgba(0, 0, 0, 0.04) !important;
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
      .candidate-info .subtext {
        font-size: 11px;
        color: #64748b;
      }
      .remarks-text {
        font-size: 12px;
        color: #64748b;
        max-width: 120px;
        display: inline-block;
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
      }
      .section-desc {
        font-size: 14px;
        color: #475569;
        margin-bottom: 20px;
        line-height: 1.5;
      }
      .excel-upload-zone {
        border: 2px dashed #cbd5e1;
        padding: 24px;
        border-radius: 8px;
        text-align: center;
        margin-bottom: 20px;
        background: #f8fafc;
        transition: border-color 0.2s ease;
      }
      .excel-upload-zone:hover {
        border-color: #3f51b5;
      }
      .file-name {
        margin-top: 12px;
        font-weight: 500;
        color: #1e293b;
        font-size: 13px;
      }
      .file-name.placeholder {
        color: #94a3b8;
        font-weight: 400;
      }
      .action-buttons {
        display: flex;
        gap: 12px;
        margin-top: 16px;
      }
      .error-panel {
        border: 1px solid #fee2e2;
        background: #fef2f2;
        border-radius: 8px;
        padding: 12px;
      }
      .error-header {
        color: #dc2626;
        margin: 0 0 8px 0;
        font-size: 13px;
        font-weight: 600;
      }
      .error-text {
        color: #dc2626;
        font-size: 11px;
        font-weight: 500;
      }
      .mt-12 { margin-top: 12px; }
      .mt-16 { margin-top: 16px; }
      .mt-24 { margin-top: 24px; }
      mat-spinner {
        margin: 0 auto;
      }
    `,
  ],
  standalone: false,
})
export class BgvManagementComponent implements OnInit {
  verifications: BackgroundVerification[] = [];
  displayedColumns = ['candidate', 'initiatedDate', 'status', 'actions'];

  // Excel uploading & logs state
  excelFile: File | null = null;
  uploadingResults = false;
  logs: any[] = [];
  selectedLogId: number | null = null;
  selectedLogErrors: any[] = [];

  constructor(
    private bgvService: BackgroundVerificationService,
    private importService: ExcelImportService,
    private toastService: ToastService
  ) {}

  ngOnInit(): void {
    this.loadBgvList();
    this.loadLogs();
  }

  loadBgvList(): void {
    this.bgvService.getAll().subscribe({
      next: (list) => (this.verifications = list),
      error: () => this.toastService.error('Failed to load BGV cases list.')
    });
  }

  loadLogs(): void {
    this.importService.getLogs('BGC').subscribe({
      next: (data) => (this.logs = data),
      error: () => this.toastService.error('Failed to load BGC upload logs.')
    });
  }

  onExcelSelected(event: any): void {
    this.excelFile = event.target.files[0] || null;
  }

  uploadBgcResults(): void {
    if (!this.excelFile) return;

    this.uploadingResults = true;
    this.importService.uploadBgc(this.excelFile).subscribe({
      next: (res) => {
        this.toastService.success(`Excel processed: Successful rows: ${res.successCount}. Errors: ${res.errorCount}`);
        this.excelFile = null;
        this.uploadingResults = false;
        this.loadBgvList();
        this.loadLogs();
      },
      error: (err) => {
        this.toastService.error(err.error?.message || 'Failed to upload BGC results Excel.');
        this.uploadingResults = false;
      }
    });
  }

  viewLogErrors(id: number): void {
    this.selectedLogId = id;
    this.importService.getLogErrors(id).subscribe({
      next: (data) => (this.selectedLogErrors = data),
      error: () => this.toastService.error('Failed to load log error details.')
    });
  }

  getTemplateUrl(type: 'BGC'): string {
    return this.importService.getTemplateDownloadUrl(type);
  }
}
