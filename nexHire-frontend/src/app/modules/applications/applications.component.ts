import { Component, OnInit } from '@angular/core';
import { ApplicationService } from '../../services/application.service';
import { AssessmentService } from '../../services/assessment.service';
import { OfferLetterService } from '../../services/offer-letter.service';
import { JoiningLetterService } from '../../services/joining-letter.service';
import { LocationBudgetService } from '../../services/location-budget.service';
import { BackgroundVerificationService } from '../../services/background-verification.service';
import { ToastService } from '../../shared/services/toast.service';
import { Application } from '../../models/application.model';
import { LocationBudget } from '../../models/location-budget.model';

@Component({
  selector: 'app-applications-mgmt',
  template: `
    <div class="applications-mgmt">
      <app-page-header
        title="Recruitment Pipeline"
        subtitle="Drive candidates through assessment, offer, and joining"
      ></app-page-header>

      <!-- Filters -->
      <mat-card class="filter-card">
        <mat-card-content class="filter-row">
          <mat-form-field appearance="outline" class="filter-item">
            <mat-label>Search candidate</mat-label>
            <input
              matInput
              [(ngModel)]="searchQuery"
              (input)="onFilterChange()"
              placeholder="Name or email"
            />
            <mat-icon matSuffix>search</mat-icon>
          </mat-form-field>
          <mat-form-field appearance="outline" class="filter-item">
            <mat-label>Status</mat-label>
            <mat-select
              [(ngModel)]="selectedStatus"
              (selectionChange)="onFilterChange()"
            >
              <mat-option value="">All Statuses</mat-option>
              <mat-option *ngFor="let s of statuses" [value]="s">{{
                s
              }}</mat-option>
            </mat-select>
          </mat-form-field>
        </mat-card-content>
      </mat-card>

      <mat-card class="table-card">
        <mat-card-content>
          <app-empty-state
            *ngIf="applications.length === 0"
            icon="search_off"
            title="No applications"
            subtitle="Adjust filters or wait for candidates to apply."
          ></app-empty-state>

          <div class="table-container" *ngIf="applications.length > 0">
            <table mat-table [dataSource]="applications">
              <ng-container matColumnDef="candidate">
                <th mat-header-cell *matHeaderCellDef>Candidate</th>
                <td mat-cell *matCellDef="let app">
                  <div class="candidate-info">
                    <span class="name">{{ app.userFullName }}</span>
                    <span class="email">{{ app.userEmail }}</span>
                  </div>
                </td>
              </ng-container>

              <ng-container matColumnDef="job">
                <th mat-header-cell *matHeaderCellDef>Job</th>
                <td mat-cell *matCellDef="let app">{{ app.jobTitle }}</td>
              </ng-container>

              <ng-container matColumnDef="status">
                <th mat-header-cell *matHeaderCellDef>Status</th>
                <td mat-cell *matCellDef="let app">
                  <app-status-badge [status]="app.status"></app-status-badge>
                  <div *ngIf="app.holdReason" class="hold-reason">
                    {{ app.holdReason }}
                  </div>
                </td>
              </ng-container>

              <ng-container matColumnDef="actions">
                <th mat-header-cell *matHeaderCellDef align="end">
                  Next Action
                </th>
                <td mat-cell *matCellDef="let app" align="end">
                  <button
                    *ngIf="app.status === 'APPLIED'"
                    mat-flat-button
                    color="primary"
                    class="row-btn"
                    (click)="startAssessment(app)"
                  >
                    Start Assessment
                  </button>

                  <button
                    *ngIf="app.status === 'ASSESSMENT_PENDING'"
                    mat-flat-button
                    color="primary"
                    class="row-btn"
                    (click)="openScore(app)"
                  >
                    Enter Score
                  </button>

                  <ng-container *ngIf="app.status === 'ASSESSMENT_COMPLETED'">
                    <button
                      mat-flat-button
                      color="primary"
                      class="row-btn"
                      (click)="qualify(app)"
                    >
                      Qualify
                    </button>
                    <button
                      mat-stroked-button
                      color="warn"
                      class="row-btn"
                      (click)="reject(app)"
                    >
                      Reject
                    </button>
                  </ng-container>

                  <button
                    *ngIf="app.status === 'QUALIFIED'"
                    mat-flat-button
                    color="primary"
                    class="row-btn"
                    (click)="openOffer(app)"
                  >
                    Send Offer
                  </button>

                  <button
                    *ngIf="
                      app.status === 'OFFER_ACCEPTED' ||
                      app.status === 'JOINING_ON_HOLD'
                    "
                    mat-flat-button
                    color="accent"
                    class="row-btn"
                    (click)="openJoining(app)"
                  >
                    Send Joining Letter
                  </button>

                  <button
                    *ngIf="
                      app.status === 'OFFER_ACCEPTED' ||
                      app.status === 'JOINING_ON_HOLD'
                    "
                    mat-stroked-button
                    color="primary"
                    class="row-btn"
                    (click)="initiateBgv(app)"
                    [disabled]="!!app.bgvStatus"
                  >
                    {{
                      app.bgvStatus ? 'BGV: ' + app.bgvStatus : 'Initiate BGV'
                    }}
                  </button>

                  <span *ngIf="isTerminal(app.status)" class="muted">—</span>
                </td>
              </ng-container>

              <tr mat-header-row *matHeaderRowDef="displayedColumns"></tr>
              <tr mat-row *matRowDef="let row; columns: displayedColumns"></tr>
            </table>
          </div>
        </mat-card-content>
      </mat-card>

      <!-- Score dialog -->
      <div class="modal-overlay" *ngIf="scoreApp" (click)="scoreApp = null">
        <div class="modal" (click)="$event.stopPropagation()">
          <h3>Enter Assessment Score</h3>
          <p class="modal-sub">
            {{ scoreApp.userFullName }} — {{ scoreApp.jobTitle }}
          </p>
          <mat-form-field appearance="outline" class="full">
            <mat-label>Score</mat-label>
            <input matInput type="number" [(ngModel)]="scoreValue" />
          </mat-form-field>
          <mat-form-field appearance="outline" class="full">
            <mat-label>Remarks</mat-label>
            <input matInput [(ngModel)]="scoreRemarks" />
          </mat-form-field>
          <div class="modal-actions">
            <button mat-button (click)="scoreApp = null">Cancel</button>
            <button mat-raised-button color="primary" (click)="submitScore()">
              Submit
            </button>
          </div>
        </div>
      </div>

      <!-- Offer dialog -->
      <div class="modal-overlay" *ngIf="offerApp" (click)="offerApp = null">
        <div class="modal" (click)="$event.stopPropagation()">
          <h3>Send Offer Letter</h3>
          <p class="modal-sub">
            {{ offerApp.userFullName }} — {{ offerApp.jobTitle }}
          </p>
          <mat-form-field appearance="outline" class="full">
            <mat-label>Offer Content</mat-label>
            <textarea matInput rows="4" [(ngModel)]="offerContent"></textarea>
          </mat-form-field>
          <div class="modal-actions">
            <button mat-button (click)="offerApp = null">Cancel</button>
            <button mat-raised-button color="primary" (click)="submitOffer()">
              Send Offer
            </button>
          </div>
        </div>
      </div>

      <!-- Joining dialog -->
      <div class="modal-overlay" *ngIf="joiningApp" (click)="joiningApp = null">
        <div class="modal" (click)="$event.stopPropagation()">
          <h3>Send Joining Letter</h3>
          <p class="modal-sub">
            {{ joiningApp.userFullName }} — {{ joiningApp.jobTitle }}
          </p>
          <mat-form-field appearance="outline" class="full">
            <mat-label>Content</mat-label>
            <textarea matInput rows="3" [(ngModel)]="joiningContent"></textarea>
          </mat-form-field>
          <mat-form-field appearance="outline" class="full">
            <mat-label>Joining Date</mat-label>
            <input matInput type="date" [(ngModel)]="joiningDate" />
          </mat-form-field>
          <mat-form-field appearance="outline" class="full">
            <mat-label>Location</mat-label>
            <mat-select [(ngModel)]="joiningLocationId">
              <mat-option *ngFor="let loc of locations" [value]="loc.id">
                {{ loc.name }} — Budget: {{ loc.budgetAvailable }}, Seats:
                {{ loc.seatsAvailable }}
              </mat-option>
            </mat-select>
          </mat-form-field>
          <div class="modal-actions">
            <button mat-button (click)="joiningApp = null">Cancel</button>
            <button mat-raised-button color="accent" (click)="submitJoining()">
              Send
            </button>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [
    `
      .applications-mgmt {
        display: flex;
        flex-direction: column;
        gap: 24px;
      }
      .filter-card,
      .table-card {
        border-radius: 12px !important;
        box-shadow: 0 4px 20px rgba(0, 0, 0, 0.04) !important;
      }
      .filter-row {
        display: flex;
        gap: 16px;
        padding: 8px 0;
        flex-wrap: wrap;
      }
      .filter-item {
        flex: 1;
        min-width: 240px;
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
        font-size: 12px;
        color: #64748b;
      }
      .hold-reason {
        font-size: 11px;
        color: #c2410c;
        margin-top: 4px;
        max-width: 260px;
      }
      .row-btn {
        margin-left: 8px;
        height: 32px;
        line-height: 32px;
        font-size: 13px;
      }
      .muted {
        color: #94a3b8;
      }
      .modal-overlay {
        position: fixed;
        inset: 0;
        background: rgba(0, 0, 0, 0.45);
        display: flex;
        align-items: center;
        justify-content: center;
        z-index: 1000;
      }
      .modal {
        background: white;
        border-radius: 12px;
        padding: 24px;
        width: 92%;
        max-width: 460px;
      }
      .modal h3 {
        margin: 0 0 4px;
      }
      .modal-sub {
        color: #64748b;
        font-size: 13px;
        margin: 0 0 16px;
      }
      .full {
        width: 100%;
      }
      .modal-actions {
        display: flex;
        justify-content: flex-end;
        gap: 8px;
        margin-top: 8px;
      }
    `,
  ],
  standalone: false,
})
export class ApplicationsManagementComponent implements OnInit {
  applications: Application[] = [];
  locations: LocationBudget[] = [];
  displayedColumns = ['candidate', 'job', 'status', 'actions'];
  searchQuery = '';
  selectedStatus = '';

  statuses = [
    'APPLIED',
    'ASSESSMENT_PENDING',
    'ASSESSMENT_COMPLETED',
    'QUALIFIED',
    'REJECTED',
    'OFFER_SENT',
    'OFFER_ACCEPTED',
    'OFFER_REJECTED',
    'JOINING_ON_HOLD',
    'JOINING_LETTER_SENT',
    'TRAINING_IN_PROGRESS',
    'TRAINING_COMPLETED',
    'PROJECT_ASSIGNED',
  ];

  // Dialog state
  scoreApp: Application | null = null;
  scoreValue = 0;
  scoreRemarks = '';

  offerApp: Application | null = null;
  offerContent = '';

  joiningApp: Application | null = null;
  joiningContent = '';
  joiningDate = '';
  joiningLocationId = 0;

  constructor(
    private appService: ApplicationService,
    private assessmentService: AssessmentService,
    private offerService: OfferLetterService,
    private joiningService: JoiningLetterService,
    private locationService: LocationBudgetService,
    private bgvService: BackgroundVerificationService,
    private toast: ToastService,
  ) {}

  initiateBgv(app: Application): void {
    this.bgvService
      .initiate(app.applicationId, 'ThirdParty BGV Inc.')
      .subscribe({
        next: () => {
          this.toast.success('BGV initiated with third-party vendor');
          this.load();
        },
        error: (e) =>
          this.toast.error(e.error?.message || 'Failed to initiate BGV'),
      });
  }

  ngOnInit(): void {
    this.load();
    this.locationService.getAll().subscribe((locs) => (this.locations = locs));
  }

  load(): void {
    this.appService
      .getAll({
        search: this.searchQuery,
        status: (this.selectedStatus || undefined) as any,
      })
      .subscribe((apps) => (this.applications = apps));
  }

  onFilterChange(): void {
    this.load();
  }

  isTerminal(status: string): boolean {
    return [
      'REJECTED',
      'OFFER_REJECTED',
      'JOINING_LETTER_SENT',
      'TRAINING_IN_PROGRESS',
      'TRAINING_COMPLETED',
      'PROJECT_ASSIGNED',
      'OFFER_SENT',
    ].includes(status);
  }

  startAssessment(app: Application): void {
    this.appService.startAssessment(app.applicationId).subscribe({
      next: () => {
        this.toast.success('Assessment started');
        this.load();
      },
      error: (e) => this.toast.error(e.error?.message || 'Failed'),
    });
  }

  openScore(app: Application): void {
    this.scoreApp = app;
    this.scoreValue = 0;
    this.scoreRemarks = '';
  }

  submitScore(): void {
    if (!this.scoreApp) return;
    this.assessmentService
      .enterScore(
        this.scoreApp.applicationId,
        this.scoreValue,
        this.scoreRemarks,
      )
      .subscribe({
        next: () => {
          this.toast.success('Score recorded');
          this.scoreApp = null;
          this.load();
        },
        error: (e) => this.toast.error(e.error?.message || 'Failed'),
      });
  }

  qualify(app: Application): void {
    this.assessmentService.qualify(app.applicationId).subscribe({
      next: () => {
        this.toast.success('Candidate qualified');
        this.load();
      },
      error: (e) => this.toast.error(e.error?.message || 'Failed'),
    });
  }

  reject(app: Application): void {
    this.assessmentService.reject(app.applicationId).subscribe({
      next: () => {
        this.toast.success('Candidate rejected');
        this.load();
      },
      error: (e) => this.toast.error(e.error?.message || 'Failed'),
    });
  }

  openOffer(app: Application): void {
    this.offerApp = app;
    this.offerContent = `We are pleased to offer you the position of ${app.jobTitle}.`;
  }

  submitOffer(): void {
    if (!this.offerApp) return;
    this.offerService
      .sendOffer(this.offerApp.applicationId, this.offerContent)
      .subscribe({
        next: () => {
          this.toast.success('Offer sent');
          this.offerApp = null;
          this.load();
        },
        error: (e) => this.toast.error(e.error?.message || 'Failed'),
      });
  }

  openJoining(app: Application): void {
    this.joiningApp = app;
    this.joiningContent = 'Welcome aboard! Please report on your joining date.';
    this.joiningDate = '';
    this.joiningLocationId = this.locations[0]?.id ?? 0;
  }

  submitJoining(): void {
    if (!this.joiningApp) return;
    this.joiningService
      .send(this.joiningApp.applicationId, {
        content: this.joiningContent,
        joiningDate: this.joiningDate,
        locationId: +this.joiningLocationId,
      })
      .subscribe({
        next: () => {
          this.toast.success('Joining letter sent');
          this.joiningApp = null;
          this.load();
          this.refreshLocations();
        },
        error: (e) => {
          // JOINING_ON_HOLD returns 400 with a clear message
          this.toast.error(e.error?.message || 'Failed to send joining letter');
          this.joiningApp = null;
          this.load();
          this.refreshLocations();
        },
      });
  }

  private refreshLocations(): void {
    this.locationService.getAll().subscribe((locs) => (this.locations = locs));
  }
}
