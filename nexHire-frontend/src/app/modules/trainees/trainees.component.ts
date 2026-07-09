import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { TraineeProgressService, TraineeRecord } from '../../services/trainee-progress.service';
import { JoiningBatchService } from '../../services/joining-batch.service';
import { ExcelImportService } from '../../services/excel-import.service';
import { ToastService } from '../../shared/services/toast.service';
import { API_ENDPOINTS } from '../../config/api-endpoints';

@Component({
  selector: 'app-trainees-mgmt',
  template: `
    <div class="trainees-mgmt">
      <app-page-header
        title="Training & Batch Management"
        subtitle="Manage joining batches, monitor active trainee progress, handle LAP, resolve exceptions, and check upload logs."
      ></app-page-header>

      <mat-tab-group (selectedTabChange)="onTabChange($event)">
        <!-- TAB 1: Active Trainee Batches -->
        <mat-tab label="Active Trainees">
          <div class="tab-content">
            <div class="filter-bar">
              <mat-form-field appearance="outline">
                <mat-label>Select Joining Batch</mat-label>
                <mat-select [(value)]="selectedBatchId" (selectionChange)="onBatchChange()">
                  <mat-option *ngFor="let b of batches" [value]="b.id">
                    {{ b.batchName }} ({{ b.batchCode }})
                  </mat-option>
                </mat-select>
              </mat-form-field>

              <button
                *ngIf="selectedBatchId && trainees.length > 0"
                mat-flat-button
                color="primary"
                (click)="completeBatch()"
              >
                <mat-icon>done_all</mat-icon>
                Complete Batch & Release
              </button>
            </div>

            <app-empty-state
              *ngIf="!selectedBatchId"
              icon="school"
              title="Select a Batch"
              subtitle="Please select a training batch from the dropdown above to manage its trainees."
            ></app-empty-state>

            <app-empty-state
              *ngIf="selectedBatchId && trainees.length === 0"
              icon="people"
              title="No trainees in this batch"
              subtitle="Trainees will appear here once candidates accept joining letters and the batch is assigned to training."
            ></app-empty-state>

            <div class="table-container" *ngIf="selectedBatchId && trainees.length > 0">
              <table mat-table [dataSource]="trainees">
                <ng-container matColumnDef="candidate">
                  <th mat-header-cell *matHeaderCellDef>Trainee Details</th>
                  <td mat-cell *matCellDef="let t">
                    <div class="candidate-meta">
                      <span class="name">{{ t.candidateName }}</span>
                      <span class="subtext">ID: {{ t.employeeId || 'N/A' }} | Email: {{ t.candidateEmail }}</span>
                    </div>
                  </td>
                </ng-container>

                <ng-container matColumnDef="metrics">
                  <th mat-header-cell *matHeaderCellDef>Metrics</th>
                  <td mat-cell *matCellDef="let t">
                    <div class="candidate-meta">
                      <span>Score: <strong>{{ t.score != null ? t.score : 'N/A' }}</strong></span>
                      <span>Attendance: <strong>{{ t.attendancePercentage != null ? t.attendancePercentage + '%' : 'N/A' }}</strong></span>
                    </div>
                  </td>
                </ng-container>

                <ng-container matColumnDef="progress">
                  <th mat-header-cell *matHeaderCellDef>Progress</th>
                  <td mat-cell *matCellDef="let t">
                    <div class="progress-cell">
                      <mat-progress-bar mode="determinate" [value]="t.progress" class="progress-bar"></mat-progress-bar>
                      <span class="pct-text">{{ t.progress }}%</span>
                    </div>
                  </td>
                </ng-container>

                <ng-container matColumnDef="status">
                  <th mat-header-cell *matHeaderCellDef>Status</th>
                  <td mat-cell *matCellDef="let t">
                    <div class="status-col">
                      <app-status-badge [status]="t.status || 'IN_PROGRESS'"></app-status-badge>
                      <span class="badge-flag" *ngIf="t.lapEnabled" style="background:#fef3c7; color:#d97706; padding:2px 6px; border-radius:4px; font-size:10px; font-weight:600; margin-top:4px;">LAP Active</span>
                      <span class="badge-flag" *ngIf="t.flagged" style="background:#fee2e2; color:#dc2626; padding:2px 6px; border-radius:4px; font-size:10px; font-weight:600; margin-top:4px;">Flagged</span>
                    </div>
                  </td>
                </ng-container>

                <ng-container matColumnDef="actions">
                  <th mat-header-cell *matHeaderCellDef align="end">Actions</th>
                  <td mat-cell *matCellDef="let t" align="end">
                    <div class="action-buttons">
                      <ng-container *ngIf="!t.released">
                        <button mat-stroked-button class="row-btn" (click)="bumpProgress(t)" [disabled]="t.progress >= 100">
                          +15%
                        </button>
                        
                        <button *ngIf="!t.lapEnabled" mat-stroked-button color="accent" class="row-btn" (click)="promptMoveToLap(t)">
                          Move to LAP
                        </button>

                        <button *ngIf="t.lapEnabled" mat-raised-button color="primary" class="row-btn" (click)="removeFromLap(t)">
                          Resolve LAP
                        </button>

                        <button *ngIf="!t.flagged" mat-stroked-button color="warn" class="row-btn" (click)="promptFlag(t)">
                          Flag
                        </button>
                      </ng-container>

                      <span *ngIf="t.released" style="color: #16a34a; font-weight: 600; font-size: 13px;">Released</span>
                    </div>
                  </td>
                </ng-container>

                <tr mat-header-row *matHeaderRowDef="traineeColumns"></tr>
                <tr mat-row *matRowDef="let row; columns: traineeColumns"></tr>
              </table>
            </div>
          </div>
        </mat-tab>

        <!-- TAB 2: Joining Batches Wizard & Results Upload -->
        <mat-tab label="Joining Batches Wizard">
          <div class="tab-content">
            <div class="split-layout">
              <!-- Left Side: Wizard & Batch Details -->
              <div class="left-pane">
                <mat-card class="action-card">
                  <mat-card-header>
                    <mat-card-title>Create Joining Batch</mat-card-title>
                  </mat-card-header>
                  <mat-card-content>
                    <form [formGroup]="batchForm" (ngSubmit)="createBatch()">
                      <mat-form-field appearance="outline" class="full-width">
                        <mat-label>Batch Name</mat-label>
                        <input matInput formControlName="batchName" placeholder="July 2026 Batch" />
                      </mat-form-field>

                      <div class="form-grid">
                        <mat-form-field appearance="outline">
                          <mat-label>Joining Date</mat-label>
                          <input matInput [matDatepicker]="picker" formControlName="joiningDate" />
                          <mat-datepicker-toggle matSuffix [for]="picker"></mat-datepicker-toggle>
                          <mat-datepicker #picker></mat-datepicker>
                        </mat-form-field>

                        <mat-form-field appearance="outline">
                          <mat-label>Batch Size (Capacity)</mat-label>
                          <input matInput type="number" formControlName="batchSize" />
                        </mat-form-field>
                      </div>

                      <div class="form-grid">
                        <mat-form-field appearance="outline">
                          <mat-label>Joining Location</mat-label>
                          <mat-select formControlName="joiningLocationId">
                            <mat-option *ngFor="let loc of locations" [value]="loc.id">{{ loc.name }}</mat-option>
                          </mat-select>
                        </mat-form-field>

                        <mat-form-field appearance="outline">
                          <mat-label>Training Location</mat-label>
                          <mat-select formControlName="trainingLocationId">
                            <mat-option *ngFor="let loc of locations" [value]="loc.id">{{ loc.name }}</mat-option>
                          </mat-select>
                        </mat-form-field>
                      </div>

                      <div class="form-grid">
                        <mat-form-field appearance="outline">
                          <mat-label>Training Program</mat-label>
                          <mat-select formControlName="trainingId">
                            <mat-option *ngFor="let p of trainingPrograms" [value]="p.id">{{ p.name }}</mat-option>
                          </mat-select>
                        </mat-form-field>

                        <mat-form-field appearance="outline">
                          <mat-label>Classroom Block</mat-label>
                          <mat-select formControlName="blockId">
                            <mat-option *ngFor="let blk of trainingBlocks" [value]="blk.id">
                              {{ blk.name }} (Cap: {{ blk.capacity }}, Occ: {{ blk.occupiedSeats }})
                            </mat-option>
                          </mat-select>
                        </mat-form-field>
                      </div>

                      <button mat-raised-button color="primary" type="submit" [disabled]="batchForm.invalid || creatingBatch">
                        {{ creatingBatch ? 'Creating...' : 'Create Batch' }}
                      </button>
                    </form>
                  </mat-card-content>
                </mat-card>

                <mat-card class="table-card mt-24">
                  <mat-card-header>
                    <mat-card-title>Existing Batches</mat-card-title>
                  </mat-card-header>
                  <mat-card-content>
                    <table mat-table [dataSource]="batches">
                      <ng-container matColumnDef="batchCode">
                        <th mat-header-cell *matHeaderCellDef>Code</th>
                        <td mat-cell *matCellDef="let b">{{ b.batchCode }}</td>
                      </ng-container>
                      <ng-container matColumnDef="batchName">
                        <th mat-header-cell *matHeaderCellDef>Name</th>
                        <td mat-cell *matCellDef="let b">
                          <strong>{{ b.batchName }}</strong><br />
                          <small>Date: {{ b.joiningDate | date:'shortDate' }}</small>
                        </td>
                      </ng-container>
                      <ng-container matColumnDef="headcount">
                        <th mat-header-cell *matHeaderCellDef>Headcount</th>
                        <td mat-cell *matCellDef="let b">{{ b.currentHeadcount }} / {{ b.batchSize }}</td>
                      </ng-container>
                      <ng-container matColumnDef="status">
                        <th mat-header-cell *matHeaderCellDef>Status</th>
                        <td mat-cell *matCellDef="let b">
                          <app-status-badge [status]="b.status"></app-status-badge>
                        </td>
                      </ng-container>
                      <ng-container matColumnDef="actions">
                        <th mat-header-cell *matHeaderCellDef align="end">Actions</th>
                        <td mat-cell *matCellDef="let b" align="end">
                          <button mat-stroked-button color="primary" size="small" (click)="selectBatchForAssignment(b)">
                            Manage
                          </button>
                        </td>
                      </ng-container>
                      <tr mat-header-row *matHeaderRowDef="['batchCode', 'batchName', 'headcount', 'status', 'actions']"></tr>
                      <tr mat-row *matRowDef="let row; columns: ['batchCode', 'batchName', 'headcount', 'status', 'actions']"></tr>
                    </table>
                  </mat-card-content>
                </mat-card>
              </div>

              <!-- Right Side: Candidate Allocation, Joining Letters, and Marks Upload -->
              <div class="right-pane" *ngIf="activeBatch">
                <mat-card class="detail-card">
                  <mat-card-header>
                    <mat-card-title>Manage Batch: {{ activeBatch.batchName }} ({{ activeBatch.batchCode }})</mat-card-title>
                    <mat-card-subtitle>Status: {{ activeBatch.status }}</mat-card-subtitle>
                  </mat-card-header>
                  <mat-card-content>
                    <div class="batch-meta-info">
                      <p>Joining Location: <strong>{{ activeBatch.joiningLocationName }}</strong></p>
                      <p>Training Location: <strong>{{ activeBatch.trainingLocationName }}</strong></p>
                      <p>Program: <strong>{{ activeBatch.trainingName }}</strong></p>
                      <p>Block: <strong>{{ activeBatch.blockName }}</strong></p>
                    </div>

                    <mat-divider></mat-divider>

                    <div class="action-section mt-16">
                      <h3>1. Allocate Candidates (Sorted by Preferred Location Priority)</h3>
                      <button mat-stroked-button color="primary" (click)="loadEligibleCandidatesForActiveBatch()">
                        Fetch Eligible Candidates
                      </button>

                      <div class="candidate-allocation-list mt-12" *ngIf="eligibleCandidates.length > 0">
                        <table mat-table [dataSource]="eligibleCandidates">
                          <ng-container matColumnDef="select">
                            <th mat-header-cell *matHeaderCellDef>Select</th>
                            <td mat-cell *matCellDef="let c">
                              <mat-checkbox (change)="toggleCandidateSelection(c.id)"></mat-checkbox>
                            </td>
                          </ng-container>
                          <ng-container matColumnDef="name">
                            <th mat-header-cell *matHeaderCellDef>Name</th>
                            <td mat-cell *matCellDef="let c">
                              {{ c.name }} <br />
                              <small>{{ c.email }}</small>
                            </td>
                          </ng-container>
                          <tr mat-header-row *matHeaderRowDef="['select', 'name']"></tr>
                          <tr mat-row *matRowDef="let row; columns: ['select', 'name']"></tr>
                        </table>

                        <button mat-raised-button color="primary" class="mt-12" [disabled]="selectedCandidateIds.size === 0 || allocatingCandidates" (click)="allocateSelectedCandidates()">
                          {{ allocatingCandidates ? 'Allocating...' : 'Assign Selected (' + selectedCandidateIds.size + ')' }}
                        </button>
                      </div>
                    </div>

                    <mat-divider class="mt-16"></mat-divider>

                    <div class="action-section mt-16" *ngIf="activeBatch.currentHeadcount > 0">
                      <h3>2. Distribute Joining Letters</h3>
                      <p>Issue digital joining letters to all assigned candidates in this batch.</p>
                      <button mat-raised-button color="accent" [disabled]="sendingLetters" (click)="sendLettersToBatch()">
                        {{ sendingLetters ? 'Sending Letters...' : 'Send Joining Letters Batch-wise' }}
                      </button>
                    </div>

                    <mat-divider class="mt-16"></mat-divider>

                    <div class="action-section mt-16" *ngIf="activeBatch.status === 'CREATED'">
                      <h3>3. Assign Batch to Active Training Block</h3>
                      <p>Start active training for all candidates who accepted joining letters (Deducts location budget & allocates block seats).</p>
                      <button mat-raised-button color="primary" (click)="assignBatchToTraining()">
                        Start Training Program
                      </button>
                    </div>

                    <mat-divider class="mt-16"></mat-divider>

                    <div class="action-section mt-16" *ngIf="activeBatch.status === 'TRAINING_IN_PROGRESS' || activeBatch.status === 'COMPLETED_WITH_EXCEPTIONS'">
                      <h3>4. Upload Trainee Marks Sheet (Excel)</h3>
                      <div class="file-upload-controls">
                        <input type="file" #resultsInput (change)="onExcelSelected($event)" accept=".xlsx" style="display: none;" />
                        <button mat-stroked-button color="primary" (click)="resultsInput.click()">
                          <mat-icon>cloud_upload</mat-icon>
                          Choose Trainee Sheet
                        </button>
                        <span class="file-label" *ngIf="excelFile">{{ excelFile.name }}</span>
                        <button mat-flat-button color="primary" class="ml-12" [disabled]="!excelFile || uploadingResults" (click)="uploadTraineeResults()">
                          {{ uploadingResults ? 'Uploading...' : 'Process Excel' }}
                        </button>
                      </div>
                    </div>
                  </mat-card-content>
                </mat-card>
              </div>
            </div>
          </div>
        </mat-tab>

        <!-- TAB 3: Exception Review Queue -->
        <mat-tab label="Exception Review Queue">
          <div class="tab-content">
            <app-empty-state
              *ngIf="exceptions.length === 0"
              icon="check_circle"
              title="Exception Queue is Empty!"
              subtitle="Excellent! No trainees are currently flagged with marks/attendance exceptions."
            ></app-empty-state>

            <div class="table-container" *ngIf="exceptions.length > 0">
              <table mat-table [dataSource]="exceptions">
                <ng-container matColumnDef="candidate">
                  <th mat-header-cell *matHeaderCellDef>Trainee</th>
                  <td mat-cell *matCellDef="let ex">
                    <strong>{{ ex.candidateName }}</strong><br />
                    <small>ID: {{ ex.employeeId || 'N/A' }} | Email: {{ ex.candidateEmail }}</small>
                  </td>
                </ng-container>

                <ng-container matColumnDef="metrics">
                  <th mat-header-cell *matHeaderCellDef>Metrics</th>
                  <td mat-cell *matCellDef="let ex">
                    <span>Score: <strong>{{ ex.score }}</strong></span><br />
                    <span>Attendance: <strong>{{ ex.attendancePercentage }}%</strong></span>
                  </td>
                </ng-container>

                <ng-container matColumnDef="reason">
                  <th mat-header-cell *matHeaderCellDef>Flag Reason</th>
                  <td mat-cell *matCellDef="let ex">
                    <span class="reason-text">{{ ex.flagReason || 'Failed to meet criteria.' }}</span>
                  </td>
                </ng-container>

                <ng-container matColumnDef="action">
                  <th mat-header-cell *matHeaderCellDef align="end">Review Action</th>
                  <td mat-cell *matCellDef="let ex" align="end">
                    <div class="exception-actions">
                      <mat-form-field appearance="outline" class="remarks-field">
                        <mat-label>HR Remarks</mat-label>
                        <input matInput #remarksInput placeholder="Approved manual release" />
                      </mat-form-field>

                      <button mat-flat-button color="primary" (click)="resolveException(ex.traineeId, 'RELEASE', remarksInput.value)">
                        Release
                      </button>
                      <button mat-flat-button color="warn" (click)="resolveException(ex.traineeId, 'REJECT', remarksInput.value)">
                        Fail
                      </button>
                      <button mat-stroked-button (click)="resolveException(ex.traineeId, 'EXTEND', remarksInput.value)">
                        Extend
                      </button>
                    </div>
                  </td>
                </ng-container>

                <tr mat-header-row *matHeaderRowDef="['candidate', 'metrics', 'reason', 'action']"></tr>
                <tr mat-row *matRowDef="let row; columns: ['candidate', 'metrics', 'reason', 'action']"></tr>
              </table>
            </div>
          </div>
        </mat-tab>

        <!-- TAB 4: Excel Upload Logs -->
        <mat-tab label="Upload Logs & Templates">
          <div class="tab-content">
            <div class="templates-section">
              <h3>Download Excel Templates</h3>
              <div class="template-buttons">
                <a mat-raised-button color="primary" [href]="getTemplateUrl('ASSESSMENT')" download>
                  <mat-icon>download</mat-icon> Assessment Template
                </a>
                <a mat-raised-button color="accent" [href]="getTemplateUrl('BGC')" download>
                  <mat-icon>download</mat-icon> BGC Template
                </a>
                <a mat-raised-button color="warn" [href]="getTemplateUrl('TRAINING')" download>
                  <mat-icon>download</mat-icon> Trainee Results Template
                </a>
              </div>
            </div>

            <mat-divider class="mt-24"></mat-divider>

            <div class="logs-section mt-24">
              <h3>Bulk Upload Logs Audit</h3>
              <table mat-table [dataSource]="logs">
                <ng-container matColumnDef="id">
                  <th mat-header-cell *matHeaderCellDef>Log ID</th>
                  <td mat-cell *matCellDef="let l">{{ l.id }}</td>
                </ng-container>

                <ng-container matColumnDef="type">
                  <th mat-header-cell *matHeaderCellDef>Upload Type</th>
                  <td mat-cell *matCellDef="let l">
                    <span class="type-badge">{{ l.uploadType }}</span>
                  </td>
                </ng-container>

                <ng-container matColumnDef="stats">
                  <th mat-header-cell *matHeaderCellDef>Statistics</th>
                  <td mat-cell *matCellDef="let l">
                    <span>Total Rows: {{ l.totalRows }}</span> |
                    <span style="color:#16a34a;">Success: {{ l.successRows }}</span> |
                    <span style="color:#ef4444;">Failed: {{ l.failedRows }}</span>
                  </td>
                </ng-container>

                <ng-container matColumnDef="uploadedAt">
                  <th mat-header-cell *matHeaderCellDef>Uploaded At</th>
                  <td mat-cell *matCellDef="let l">{{ l.uploadedAt | date:'medium' }}</td>
                </ng-container>

                <ng-container matColumnDef="actions">
                  <th mat-header-cell *matHeaderCellDef align="end">Errors</th>
                  <td mat-cell *matCellDef="let l" align="end">
                    <button *ngIf="l.failedRows > 0" mat-stroked-button color="warn" (click)="viewLogErrors(l.id)">
                      View Errors ({{ l.failedRows }})
                    </button>
                  </td>
                </ng-container>

                <tr mat-header-row *matHeaderRowDef="['id', 'type', 'stats', 'uploadedAt', 'actions']"></tr>
                <tr mat-row *matRowDef="let row; columns: ['id', 'type', 'stats', 'uploadedAt', 'actions']"></tr>
              </table>
            </div>

            <!-- Log Errors Modal/Section -->
            <div class="log-errors-list mt-24" *ngIf="selectedLogErrors.length > 0">
              <mat-card style="border: 1px solid #fee2e2; background: #fef2f2; border-radius: 8px;">
                <mat-card-header>
                  <mat-card-title style="color:#dc2626;">Row-level Errors for Log ID: {{ selectedLogId }}</mat-card-title>
                </mat-card-header>
                <mat-card-content>
                  <table mat-table [dataSource]="selectedLogErrors">
                    <ng-container matColumnDef="rowNum">
                      <th mat-header-cell *matHeaderCellDef>Row</th>
                      <td mat-cell *matCellDef="let err">Row {{ err.rowNumber }}</td>
                    </ng-container>
                    <ng-container matColumnDef="identifier">
                      <th mat-header-cell *matHeaderCellDef>Identifier</th>
                      <td mat-cell *matCellDef="let err">{{ err.identifier || 'N/A' }}</td>
                    </ng-container>
                    <ng-container matColumnDef="errorMessage">
                      <th mat-header-cell *matHeaderCellDef>Error Message</th>
                      <td mat-cell *matCellDef="let err" style="color:#dc2626; font-weight:500;">{{ err.errorMessage }}</td>
                    </ng-container>
                    <tr mat-header-row *matHeaderRowDef="['rowNum', 'identifier', 'errorMessage']"></tr>
                    <tr mat-row *matRowDef="let row; columns: ['rowNum', 'identifier', 'errorMessage']"></tr>
                  </table>
                </mat-card-content>
              </mat-card>
            </div>
          </div>
        </mat-tab>
      </mat-tab-group>
    </div>
  `,
  styles: [
    `
      .trainees-mgmt {
        display: flex;
        flex-direction: column;
        gap: 24px;
      }
      .tab-content {
        padding: 24px 0;
        display: flex;
        flex-direction: column;
        gap: 20px;
      }
      .filter-bar {
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 16px;
      }
      .table-card, .action-card, .detail-card {
        border-radius: 12px !important;
        box-shadow: 0 4px 20px rgba(0, 0, 0, 0.04) !important;
      }
      table {
        width: 100%;
      }
      .candidate-meta {
        display: flex;
        flex-direction: column;
      }
      .candidate-meta .name {
        font-weight: 600;
        color: #1e293b;
      }
      .candidate-meta .subtext {
        font-size: 11px;
        color: #64748b;
      }
      .progress-cell {
        display: flex;
        align-items: center;
        gap: 8px;
        min-width: 130px;
      }
      .progress-bar {
        height: 6px !important;
        border-radius: 4px;
        flex-grow: 1;
      }
      .pct-text {
        font-size: 12px;
        font-weight: 600;
        color: #475569;
      }
      .status-col {
        display: flex;
        flex-direction: column;
        align-items: flex-start;
      }
      .action-buttons {
        display: flex;
        gap: 8px;
        justify-content: flex-end;
      }
      .row-btn {
        height: 32px;
        line-height: 32px;
        font-size: 12px;
      }
      .split-layout {
        display: grid;
        grid-template-columns: 1fr 1fr;
        gap: 24px;
      }
      .full-width {
        width: 100%;
      }
      .form-grid {
        display: grid;
        grid-template-columns: 1fr 1fr;
        gap: 16px;
      }
      .mt-16 { margin-top: 16px; }
      .mt-24 { margin-top: 24px; }
      .mt-12 { margin-top: 12px; }
      .ml-12 { margin-left: 12px; }
      .batch-meta-info p {
        margin: 6px 0;
        color: #475569;
      }
      .candidate-allocation-list {
        max-height: 250px;
        overflow-y: auto;
        border: 1px solid #cbd5e1;
        border-radius: 6px;
        padding: 8px;
        background: #f8fafc;
      }
      .file-upload-controls {
        display: flex;
        align-items: center;
        margin-top: 8px;
      }
      .file-label {
        font-size: 14px;
        color: #334155;
        font-weight: 500;
        margin-left: 12px;
      }
      .exception-actions {
        display: flex;
        align-items: center;
        gap: 8px;
        justify-content: flex-end;
      }
      .remarks-field {
        max-width: 180px;
        height: 48px;
      }
      .reason-text {
        color: #dc2626;
        font-weight: 500;
        font-size: 13px;
      }
      .template-buttons {
        display: flex;
        gap: 16px;
        margin-top: 12px;
      }
      .type-badge {
        background: #e0e7ff;
        color: #4338ca;
        padding: 2px 8px;
        border-radius: 4px;
        font-size: 11px;
        font-weight: 600;
      }
    `,
  ],
  standalone: false,
})
export class TraineesManagementComponent implements OnInit {
  selectedBatchId?: number;
  batches: any[] = [];
  trainees: TraineeRecord[] = [];
  traineeColumns = ['candidate', 'metrics', 'progress', 'status', 'actions'];

  // Wizard fields
  batchForm!: FormGroup;
  locations: any[] = [];
  trainingPrograms: any[] = [];
  trainingBlocks: any[] = [];
  creatingBatch = false;

  // Active batch side-panel
  activeBatch: any = null;
  eligibleCandidates: any[] = [];
  selectedCandidateIds = new Set<number>();
  allocatingCandidates = false;
  sendingLetters = false;

  // Excel trainee sheet
  excelFile: File | null = null;
  uploadingResults = false;

  // Exceptions queue
  exceptions: TraineeRecord[] = [];

  // Logs audit
  logs: any[] = [];
  selectedLogErrors: any[] = [];
  selectedLogId?: number;

  constructor(
    private fb: FormBuilder,
    private http: HttpClient,
    private traineeService: TraineeProgressService,
    private batchService: JoiningBatchService,
    private importService: ExcelImportService,
    private toast: ToastService
  ) {}

  ngOnInit(): void {
    this.initBatchForm();
    this.loadBatches();
    this.loadLocations();
    this.loadTrainingPrograms();
    this.loadTrainingBlocks();
  }

  initBatchForm(): void {
    this.batchForm = this.fb.group({
      batchName: ['', Validators.required],
      joiningDate: ['', Validators.required],
      batchSize: [60, [Validators.required, Validators.min(1)]],
      joiningLocationId: ['', Validators.required],
      trainingLocationId: ['', Validators.required],
      trainingId: ['', Validators.required],
      blockId: ['', Validators.required],
    });
  }

  loadBatches(): void {
    this.batchService.getAllBatches().subscribe({
      next: (data) => (this.batches = data),
      error: () => this.toast.error('Failed to load joining batches.'),
    });
  }

  loadLocations(): void {
    this.http.get<any[]>(API_ENDPOINTS.LOCATIONS.BASE).subscribe((data) => (this.locations = data));
  }

  loadTrainingPrograms(): void {
    this.traineeService.getPrograms().subscribe((data) => (this.trainingPrograms = data));
  }

  loadTrainingBlocks(): void {
    this.traineeService.getBlocks().subscribe((data) => (this.trainingBlocks = data));
  }

  onBatchChange(): void {
    if (this.selectedBatchId) {
      this.traineeService.getTraineesByBatch(this.selectedBatchId).subscribe({
        next: (list) => (this.trainees = list),
        error: () => this.toast.error('Failed to load batch trainees.'),
      });
    }
  }

  bumpProgress(t: TraineeRecord): void {
    const next = Math.min((t.progress || 0) + 15, 100);
    this.traineeService.updateProgress(t.traineeId, next).subscribe({
      next: () => {
        this.toast.success(`Progress updated to ${next}%`);
        this.onBatchChange();
      },
      error: (e) => this.toast.error(e.error?.message || 'Failed to update progress'),
    });
  }

  promptMoveToLap(t: TraineeRecord): void {
    const remarks = prompt('Enter LAP program remarks:');
    if (remarks) {
      this.traineeService.moveToLap(t.traineeId, remarks).subscribe({
        next: () => {
          this.toast.success(`${t.candidateName} moved to Learning Assistance Program (LAP).`);
          this.onBatchChange();
        },
        error: (e) => this.toast.error(e.error?.message || 'Failed to move to LAP.'),
      });
    }
  }

  removeFromLap(t: TraineeRecord): void {
    this.traineeService.removeFromLap(t.traineeId).subscribe({
      next: () => {
        this.toast.success(`${t.candidateName} removed from LAP. Status evaluated.`);
        this.onBatchChange();
      },
      error: (e) => this.toast.error(e.error?.message || 'Failed to remove from LAP.'),
    });
  }

  promptFlag(t: TraineeRecord): void {
    const reason = prompt('Enter Exception flag reason:');
    if (reason) {
      this.traineeService.flag(t.traineeId, reason).subscribe({
        next: () => {
          this.toast.success(`${t.candidateName} flagged for exception review.`);
          this.onBatchChange();
        },
        error: (e) => this.toast.error(e.error?.message || 'Failed to flag candidate.'),
      });
    }
  }

  completeBatch(): void {
    if (!this.selectedBatchId) return;
    if (confirm('Are you sure you want to complete this training batch? Candidates meeting criteria will be released immediately.')) {
      this.traineeService.completeBatch(this.selectedBatchId).subscribe({
        next: (res) => {
          this.toast.success(`Batch completed with status: ${res.status}`);
          this.onBatchChange();
          this.loadBatches();
        },
        error: (e) => this.toast.error(e.error?.message || 'Failed to complete batch.'),
      });
    }
  }

  createBatch(): void {
    if (this.batchForm.invalid) return;
    this.creatingBatch = true;
    const formVal = this.batchForm.value;
    // Format date to yyyy-MM-dd
    const dateObj = new Date(formVal.joiningDate);
    const dateStr = dateObj.toISOString().split('T')[0];
    const payload = { ...formVal, joiningDate: dateStr };

    this.batchService.createBatch(payload).subscribe({
      next: () => {
        this.toast.success('Joining batch created successfully.');
        this.batchForm.reset({ batchSize: 60 });
        this.loadBatches();
        this.creatingBatch = false;
      },
      error: (err) => {
        this.toast.error(err.error?.message || 'Failed to create batch.');
        this.creatingBatch = false;
      },
    });
  }

  selectBatchForAssignment(b: any): void {
    this.activeBatch = b;
    this.eligibleCandidates = [];
    this.selectedCandidateIds.clear();
  }

  loadEligibleCandidatesForActiveBatch(): void {
    if (!this.activeBatch) return;
    this.batchService.getEligibleCandidates(this.activeBatch.joiningLocationId, this.activeBatch.trainingLocationId).subscribe({
      next: (candidates) => {
        this.eligibleCandidates = candidates;
        if (candidates.length === 0) {
          this.toast.info('No eligible BGC Cleared candidates match the batch location criteria.');
        }
      },
      error: () => this.toast.error('Failed to load eligible candidates.'),
    });
  }

  toggleCandidateSelection(id: number): void {
    if (this.selectedCandidateIds.has(id)) {
      this.selectedCandidateIds.delete(id);
    } else {
      this.selectedCandidateIds.add(id);
    }
  }

  allocateSelectedCandidates(): void {
    if (!this.activeBatch) return;
    this.allocatingCandidates = true;
    const ids = Array.from(this.selectedCandidateIds);
    this.batchService.assignCandidates(this.activeBatch.id, ids).subscribe({
      next: (res) => {
        this.toast.success(`${ids.length} candidates assigned to batch successfully.`);
        this.activeBatch = res;
        this.eligibleCandidates = [];
        this.selectedCandidateIds.clear();
        this.allocatingCandidates = false;
        this.loadBatches();
      },
      error: (err) => {
        this.toast.error(err.error?.message || 'Failed to assign candidates.');
        this.allocatingCandidates = false;
      },
    });
  }

  sendLettersToBatch(): void {
    if (!this.activeBatch) return;
    this.sendingLetters = true;
    this.batchService.sendLetters(this.activeBatch.id).subscribe({
      next: (res) => {
        this.toast.success('Joining letters dispatched to all batch members.');
        this.activeBatch = res;
        this.sendingLetters = false;
        this.loadBatches();
      },
      error: () => {
        this.toast.error('Failed to dispatch joining letters.');
        this.sendingLetters = false;
      },
    });
  }

  assignBatchToTraining(): void {
    if (!this.activeBatch) return;
    if (confirm('Assign this batch to active training? This checks seat/budget details.')) {
      this.traineeService.assignBatch(this.activeBatch.id).subscribe({
        next: () => {
          this.toast.success('Batch has successfully commenced training!');
          this.activeBatch = null;
          this.loadBatches();
        },
        error: (err) => this.toast.error(err.error?.message || 'Failed to assign batch to training.'),
      });
    }
  }

  onExcelSelected(event: any): void {
    this.excelFile = event.target.files[0] || null;
  }

  uploadTraineeResults(): void {
    if (!this.excelFile || !this.activeBatch) return;
    this.uploadingResults = true;
    this.importService.uploadTraining(this.activeBatch.id, this.excelFile).subscribe({
      next: (res) => {
        this.toast.success(`Excel processed: Successful rows: ${res.successCount}. Errors: ${res.errorCount}`);
        this.excelFile = null;
        this.uploadingResults = false;
        this.activeBatch = null;
        this.loadBatches();
      },
      error: (err) => {
        this.toast.error(err.error?.message || 'Failed to upload training results Excel.');
        this.uploadingResults = false;
      },
    });
  }

  loadExceptions(): void {
    this.traineeService.getExceptions().subscribe({
      next: (data) => (this.exceptions = data),
      error: () => this.toast.error('Failed to load exceptions.'),
    });
  }

  resolveException(traineeId: number, action: 'RELEASE' | 'REJECT' | 'EXTEND', remarks: string): void {
    if (!remarks.trim()) {
      this.toast.error('Please enter HR remarks for exception audit.');
      return;
    }
    this.traineeService.resolveException(traineeId, action, remarks).subscribe({
      next: () => {
        this.toast.success(`Exception resolved with action: ${action}`);
        this.loadExceptions();
        this.onBatchChange();
      },
      error: (e) => this.toast.error(e.error?.message || 'Resolution failed.'),
    });
  }

  loadLogs(): void {
    this.importService.getLogs().subscribe({
      next: (data) => (this.logs = data),
      error: () => this.toast.error('Failed to load upload history.'),
    });
  }

  viewLogErrors(id: number): void {
    this.selectedLogId = id;
    this.importService.getLogErrors(id).subscribe({
      next: (data) => (this.selectedLogErrors = data),
      error: () => this.toast.error('Failed to load log errors.'),
    });
  }

  getTemplateUrl(type: 'ASSESSMENT' | 'BGC' | 'TRAINING'): string {
    return this.importService.getTemplateDownloadUrl(type);
  }

  onTabChange(event: any): void {
    const label = event.tab.textLabel;
    if (label === 'Exception Review Queue') {
      this.loadExceptions();
    } else if (label === 'Upload Logs & Templates') {
      this.loadLogs();
      this.selectedLogErrors = [];
      this.selectedLogId = undefined;
    }
  }
}
