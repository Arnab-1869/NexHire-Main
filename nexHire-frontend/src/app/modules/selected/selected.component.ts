import { Component, OnInit } from '@angular/core';
import { SelectionModel } from '@angular/cdk/collections';
import { TrainingService } from '../../services/training.service';
import { ToastService } from '../../shared/services/toast.service';
import { MatDialog } from '@angular/material/dialog';
import { ConfirmationDialogComponent } from '../../shared/components/confirmation-dialog/confirmation-dialog.component';
import { SelectedCandidate } from '../../models/selected.model';
import { City, Branch, Block } from '../../models/location.model';
import { Training, TrainingAssignmentResult } from '../../models/training.model';

@Component({
    selector: 'app-selected-candidates',
    template: `
    <div class="selected-candidates">
      <app-page-header title="Training Allocation Hub" subtitle="Assign selected candidates to training batches with budget/vacancy verification"></app-page-header>

      <div class="layout-grid">
        <!-- Configuration & Assignment Panel -->
        <mat-card class="panel-card config-panel">
          <mat-card-header>
            <mat-card-title>Configure Allocation Batch</mat-card-title>
          </mat-card-header>
          <mat-card-content class="panel-form">
            <!-- Training Catalog -->
            <mat-form-field appearance="outline" class="full-width">
              <mat-label>Select Training Program</mat-label>
              <mat-select [(value)]="selectedTrainingId" (selectionChange)="calculateCosts()">
                <mat-option *ngFor="let t of trainings" [value]="t.trainingId">
                  {{ t.trainingName }} (Cost/Candidate: ₹{{ t.costPerCandidate | number }})
                </mat-option>
              </mat-select>
            </mat-form-field>

            <!-- City Location -->
            <mat-form-field appearance="outline" class="full-width">
              <mat-label>Allocation City</mat-label>
              <mat-select [(value)]="selectedCityId" (selectionChange)="onCityChange()">
                <mat-option *ngFor="let c of cities" [value]="c.cityId">
                  {{ c.cityName }} (Budget Avail: ₹{{ c.availableBudget | number }})
                </mat-option>
              </mat-select>
            </mat-form-field>

            <!-- Branch Location -->
            <mat-form-field appearance="outline" class="full-width">
              <mat-label>Allocation Branch</mat-label>
              <mat-select [(value)]="selectedBranchId" (selectionChange)="onBranchChange()" [disabled]="!selectedCityId">
                <mat-option *ngFor="let b of branches" [value]="b.branchId">{{ b.branchName }}</mat-option>
              </mat-select>
            </mat-form-field>

            <!-- Block Room -->
            <mat-form-field appearance="outline" class="full-width">
              <mat-label>Allocation Block</mat-label>
              <mat-select [(value)]="selectedBlockId" (selectionChange)="onBlockChange()" [disabled]="!selectedBranchId">
                <mat-option *ngFor="let bl of blocks" [value]="bl.blockId">
                  {{ bl.blockName }} (Vacancy Avail: {{ bl.availableVacancy }} slots)
                </mat-option>
              </mat-select>
            </mat-form-field>

            <!-- Financials / Verification Card -->
            <div class="financials-card" *ngIf="selection.selected.length > 0">
              <h4>Batch Financial Summary</h4>
              <div class="row">
                <span>Selected Candidates:</span>
                <span><strong>{{ selection.selected.length }}</strong></span>
              </div>
              <div class="row">
                <span>Cost Per Candidate:</span>
                <span>₹{{ getSelectedCostPerCandidate() | number }}</span>
              </div>
              <div class="row total-row">
                <span>Required Batch Budget:</span>
                <span [class.error-text]="isBudgetInsufficient()">₹{{ batchTotalCost | number }}</span>
              </div>
              <div class="row total-row">
                <span>Block Room Capacity:</span>
                <span [class.error-text]="isVacancyInsufficient()">Vacancy Needed: {{ selection.selected.length }} / Avail: {{ selectedBlockVacancy }}</span>
              </div>
              
              <div class="warnings" *ngIf="isBudgetInsufficient() || isVacancyInsufficient()">
                <p class="error-msg" *ngIf="isBudgetInsufficient()"><mat-icon>warning</mat-icon> Insufficient budget in selected City.</p>
                <p class="error-msg" *ngIf="isVacancyInsufficient()"><mat-icon>warning</mat-icon> Selected Block has insufficient vacancies.</p>
              </div>

              <button mat-raised-button color="primary" 
                      class="allocate-btn" 
                      [disabled]="isAssignmentDisabled()" 
                      (click)="assignBatch()">
                Trigger Training Batch Mapping
              </button>
            </div>
          </mat-card-content>
        </mat-card>

      <mat-card class="result-summary-card" *ngIf="assignmentResult">
        <mat-card-header>
          <mat-card-title>Training Assignment Summary</mat-card-title>
        </mat-card-header>
        <mat-card-content>
          <div class="summary-grid">
            <span>Total Requested:</span><strong>{{ assignmentResult.totalRequested }}</strong>
            <span>Assigned:</span><strong class="success-text">{{ assignmentResult.assignedCount }}</strong>
            <span>Skipped:</span><strong class="warn-text">{{ assignmentResult.skippedCount }}</strong>
            <span>Failed:</span><strong class="error-text">{{ assignmentResult.failedCount }}</strong>
          </div>

          <div class="reason-list" *ngIf="assignmentResult && hasFailedRecords()">
            <h4>Failed Reasons</h4>
            <div *ngFor="let record of assignmentResult.failedRecords">
              <small>Selected ID {{ record.selectedId }}: {{ record.reason }}</small>
            </div>
          </div>

          <div class="reason-list" *ngIf="assignmentResult && hasSkippedRecords()">
            <h4>Skipped Reasons</h4>
            <div *ngFor="let record of assignmentResult.skippedRecords">
              <small>Selected ID {{ record.selectedId }}: {{ record.reason }}</small>
            </div>
          </div>
        </mat-card-content>
      </mat-card>

        <!-- Selected Candidate List Table -->
        <mat-card class="panel-card table-panel">
          <mat-card-header>
            <mat-card-title>Selected Candidates (Ready for Training)</mat-card-title>
          </mat-card-header>
          <mat-card-content>
            <app-empty-state *ngIf="candidates.length === 0" icon="people" title="No candidates ready" subtitle="BGV checks must be cleared for candidates to appear here."></app-empty-state>

            <div class="table-container" *ngIf="candidates.length > 0">
              <table mat-table [dataSource]="candidates">
                <!-- Checkbox -->
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
                                  [checked]="selection.isSelected(row)"
                                  (change)="calculateCosts()">
                    </mat-checkbox>
                  </td>
                </ng-container>

                <!-- Candidate -->
                <ng-container matColumnDef="candidate">
                  <th mat-header-cell *matHeaderCellDef>Candidate</th>
                  <td mat-cell *matCellDef="let c">
                    <div class="candidate-meta">
                      <span class="name">{{ c.candidateName }}</span>
                      <span class="email">{{ c.candidateEmail }}</span>
                    </div>
                  </td>
                </ng-container>

                <!-- Tech -->
                <ng-container matColumnDef="domain">
                  <th mat-header-cell *matHeaderCellDef>Domain</th>
                  <td mat-cell *matCellDef="let c">
                    <mat-chip-row>{{ c.trainingDomain }}</mat-chip-row>
                  </td>
                </ng-container>

                <tr mat-header-row *matHeaderRowDef="displayedColumns"></tr>
                <tr mat-row *matRowDef="let row; columns: displayedColumns;" (click)="selection.toggle(row); calculateCosts();"></tr>
              </table>
            </div>
          </mat-card-content>
        </mat-card>
      </div>
    </div>
  `,
    styles: [`
    .selected-candidates {
      display: flex;
      flex-direction: column;
      gap: 24px;
    }
    .layout-grid {
      display: grid;
      grid-template-columns: 1fr 2fr;
      gap: 24px;
    }
    @media (max-width: 992px) {
      .layout-grid {
        grid-template-columns: 1fr;
      }
    }
    .panel-card {
      border-radius: 12px !important;
      box-shadow: 0 4px 20px rgba(0,0,0,0.04) !important;
      padding: 16px;
    }
    .panel-form {
      padding-top: 16px !important;
      display: flex;
      flex-direction: column;
      gap: 16px;
    }
    .full-width {
      width: 100%;
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
    .candidate-meta .email {
      font-size: 11px;
      color: #64748b;
    }
    .financials-card {
      background-color: #f8fafc;
      border: 1px solid #e2e8f0;
      border-radius: 8px;
      padding: 16px;
      display: flex;
      flex-direction: column;
      gap: 12px;
    }
    .financials-card h4 {
      margin: 0;
      font-size: 14px;
      font-weight: 700;
      color: #1e293b;
      border-bottom: 1px solid #cbd5e1;
      padding-bottom: 8px;
    }
    .financials-card .row {
      display: flex;
      justify-content: space-between;
      font-size: 13px;
      color: #475569;
    }
    .total-row {
      font-weight: 700;
      color: #1e293b !important;
      border-top: 1px dashed #cbd5e1;
      padding-top: 8px;
    }
    .error-text {
      color: #dc2626 !important;
    }
    .warnings {
      display: flex;
      flex-direction: column;
      gap: 4px;
    }
    .error-msg {
      margin: 0;
      color: #dc2626;
      font-size: 12px;
      display: flex;
      align-items: center;
      gap: 4px;
      font-weight: 500;
    }
    .error-msg mat-icon {
      font-size: 14px;
      width: 14px;
      height: 14px;
    }
    .allocate-btn {
      width: 100%;
      height: 40px;
      margin-top: 8px;
      font-weight: 600;
    }
    .result-summary-card {
      background-color: #f8fafc !important;
      border: 1px solid #e2e8f0;
      border-radius: 8px !important;
      margin-top: 16px;
    }
    .summary-grid {
      display: grid;
      grid-template-columns: repeat(2, minmax(160px, 1fr));
      gap: 10px 24px;
      align-items: center;
      margin-bottom: 12px;
    }
    .reason-list h4 {
      margin: 0 0 8px 0;
      font-size: 13px;
      font-weight: 700;
      color: #334155;
    }
    .reason-list small {
      display: block;
      margin-bottom: 4px;
      color: #475569;
    }
  `],
    standalone: false
})
export class SelectedCandidatesComponent implements OnInit {
  candidates: SelectedCandidate[] = [];
  cities: City[] = [];
  branches: Branch[] = [];
  blocks: Block[] = [];
  trainings: Training[] = [];
  selection = new SelectionModel<SelectedCandidate>(true, []);

  selectedTrainingId!: number;
  selectedCityId!: number;
  selectedBranchId!: number;
  selectedBlockId!: number;

  selectedCityBudget = 0;
  selectedBlockVacancy = 0;
  batchTotalCost = 0;
  assignmentResult: TrainingAssignmentResult | null = null;

  displayedColumns = ['select', 'candidate', 'domain'];

  constructor(
    private trainingService: TrainingService,
    private toastService: ToastService,
    private dialog: MatDialog
  ) {}

  ngOnInit(): void {
    this.loadCandidates();
    this.loadCatalogData();
  }

  loadCandidates(): void {
    // TRAINING_PENDING selected candidates
    this.trainingService.getSelectedCandidates().subscribe(list => {
      this.candidates = list.filter(c => c.status === 'SELECTED' || c.status === 'TRAINING_PENDING');
      this.selection.clear();
      this.calculateCosts();
    });
  }

  loadCatalogData(): void {
    this.trainingService.getCities().subscribe(list => this.cities = list);
    this.trainingService.getTrainingsCatalog().subscribe(list => this.trainings = list);
  }

  onCityChange(): void {
    this.selectedBranchId = undefined as any;
    this.selectedBlockId = undefined as any;
    this.branches = [];
    this.blocks = [];
    this.selectedBlockVacancy = 0;

    const city = this.cities.find(c => c.cityId === this.selectedCityId);
    this.selectedCityBudget = city?.availableBudget ?? 0;

    this.trainingService.getBranches(this.selectedCityId).subscribe(list => this.branches = list);
    this.calculateCosts();
  }

  onBranchChange(): void {
    this.selectedBlockId = undefined as any;
    this.blocks = [];
    this.selectedBlockVacancy = 0;

    this.trainingService.getBlocks(this.selectedBranchId).subscribe(list => this.blocks = list);
    this.calculateCosts();
  }

  onBlockChange(): void {
    const block = this.blocks.find(b => b.blockId === this.selectedBlockId);
    this.selectedBlockVacancy = block?.availableVacancy ?? 0;
    this.calculateCosts();
  }

  getSelectedCostPerCandidate(): number {
    const training = this.trainings.find(t => t.trainingId === this.selectedTrainingId);
    return training?.costPerCandidate ?? 0;
  }

  calculateCosts(): void {
    const cost = this.getSelectedCostPerCandidate();
    this.batchTotalCost = cost * this.selection.selected.length;
  }

  isBudgetInsufficient(): boolean {
    return this.selectedCityId ? this.batchTotalCost > this.selectedCityBudget : false;
  }

  isVacancyInsufficient(): boolean {
    return this.selectedBlockId ? this.selection.selected.length > this.selectedBlockVacancy : false;
  }

  isAssignmentDisabled(): boolean {
    return !this.selectedTrainingId ||
           !this.selectedCityId ||
           !this.selectedBranchId ||
           !this.selectedBlockId ||
           this.selection.isEmpty() ||
           this.isBudgetInsufficient() ||
           this.isVacancyInsufficient();
  }

  isAllSelected(): boolean {
    const numSelected = this.selection.selected.length;
    const numRows = this.candidates.length;
    return numSelected === numRows;
  }

  masterToggle(): void {
    this.isAllSelected() ?
        this.selection.clear() :
        this.candidates.forEach(row => this.selection.select(row));
  }

  assignBatch(): void {
    if (this.isAssignmentDisabled()) return;

    const ids = this.selection.selected.map(c => c.selectedId);

    const dialogRef = this.dialog.open(ConfirmationDialogComponent, {
      data: {
        title: 'Confirm Batch Mapping',
        message: `This will allocate ${ids.length} candidates to the training block. This deducts ₹${this.batchTotalCost} from the city budget and reserves ${ids.length} vacancies. Proceed?`,
        type: 'info'
      }
    });

    dialogRef.afterClosed().subscribe(confirm => {
      if (confirm) {
        this.trainingService.assignTraining({
          selectedIds: ids,
          trainingId: this.selectedTrainingId,
          cityId: this.selectedCityId,
          branchId: this.selectedBranchId,
          blockId: this.selectedBlockId,
          startDate: new Date().toISOString().split('T')[0]
        }).subscribe({
          next: (res) => {
            this.toastService.success('Training batch allocation completed successfully!');
            this.assignmentResult = res;
            this.loadCandidates();
            this.loadCatalogData(); // Reload budget amounts
          },
          error: () => {
            this.assignmentResult = null;
            this.toastService.error('Allocation failed.');
          }
        });
      }
    });
  }

  hasFailedRecords(): boolean {
    const failed = this.assignmentResult?.failedRecords;
    return Array.isArray(failed) && failed.length > 0;
  }

  hasSkippedRecords(): boolean {
    const skipped = this.assignmentResult?.skippedRecords;
    return Array.isArray(skipped) && skipped.length > 0;
  }
}
