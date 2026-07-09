import { Component, OnInit } from '@angular/core';
import {
  ProjectRmgService,
  RmgProject,
} from '../../services/project-rmg.service';
import { TraineeRecord } from '../../services/trainee-progress.service';
import { ToastService } from '../../shared/services/toast.service';

@Component({
  selector: 'app-released-candidates',
  template: `
    <div class="released-candidates">
      <app-page-header
        title="Project Allocation (RMG)"
        subtitle="Create projects and assign training-completed trainees"
      ></app-page-header>

      <div class="allocation-grid">
        <!-- Eligible trainees -->
        <mat-card class="column-card">
          <mat-card-header>
            <mat-card-title
              >Eligible Trainees (Training Completed)</mat-card-title
            >
          </mat-card-header>
          <mat-card-content>
            <app-empty-state
              *ngIf="eligible.length === 0"
              icon="people"
              title="No eligible trainees"
              subtitle="Trainees must complete training to be eligible for allocation."
            ></app-empty-state>

            <div class="table-container" *ngIf="eligible.length > 0">
              <table mat-table [dataSource]="eligible">
                <ng-container matColumnDef="candidate">
                  <th mat-header-cell *matHeaderCellDef>Candidate</th>
                  <td mat-cell *matCellDef="let t">
                    <div class="candidate-meta">
                      <span class="name">{{ t.candidateName }}</span>
                      <span class="email">{{ t.candidateEmail }}</span>
                    </div>
                  </td>
                </ng-container>
                <ng-container matColumnDef="job">
                  <th mat-header-cell *matHeaderCellDef>Role</th>
                  <td mat-cell *matCellDef="let t">{{ t.jobTitle }}</td>
                </ng-container>
                <ng-container matColumnDef="actions">
                  <th mat-header-cell *matHeaderCellDef align="end">Assign</th>
                  <td mat-cell *matCellDef="let t" align="end">
                    <mat-form-field appearance="outline" class="proj-select">
                      <mat-label>Project</mat-label>
                      <mat-select [(ngModel)]="selectedProject[t.traineeId]">
                        <mat-option *ngFor="let p of projects" [value]="p.id">{{
                          p.name
                        }}</mat-option>
                      </mat-select>
                    </mat-form-field>
                    <button
                      mat-flat-button
                      color="primary"
                      class="row-btn"
                      [disabled]="!selectedProject[t.traineeId]"
                      (click)="assign(t)"
                    >
                      Assign
                    </button>
                  </td>
                </ng-container>
                <tr mat-header-row *matHeaderRowDef="candidateColumns"></tr>
                <tr
                  mat-row
                  *matRowDef="let row; columns: candidateColumns"
                ></tr>
              </table>
            </div>
          </mat-card-content>
        </mat-card>

        <!-- Projects (read-only; managed by Admin) -->
        <mat-card class="column-card">
          <mat-card-header>
            <mat-card-title>Active Projects</mat-card-title>
          </mat-card-header>
          <mat-card-content>
            <app-empty-state
              *ngIf="projects.length === 0"
              icon="business_center"
              title="No active projects"
              subtitle="Projects are created by an administrator."
            ></app-empty-state>

            <div class="proj-list" *ngIf="projects.length > 0">
              <div class="proj-item" *ngFor="let p of projects">
                <div>
                  <span class="pname">{{ p.name }}</span>
                  <span class="pdesc">{{ p.description }}</span>
                </div>
                <span class="team">Team: {{ p.teamSize }}</span>
              </div>
            </div>
          </mat-card-content>
        </mat-card>
      </div>
    </div>
  `,
  styles: [
    `
      .released-candidates {
        display: flex;
        flex-direction: column;
        gap: 24px;
      }
      .allocation-grid {
        display: grid;
        grid-template-columns: 2fr 1fr;
        gap: 24px;
      }
      @media (max-width: 992px) {
        .allocation-grid {
          grid-template-columns: 1fr;
        }
      }
      .column-card {
        border-radius: 12px !important;
        box-shadow: 0 4px 20px rgba(0, 0, 0, 0.04) !important;
        padding: 16px;
        height: fit-content;
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
      .proj-select {
        width: 160px;
        margin-right: 8px;
      }
      .row-btn {
        height: 40px;
      }
      .create-project {
        display: flex;
        flex-direction: column;
        gap: 8px;
        margin-bottom: 20px;
      }
      .full-width {
        width: 100%;
      }
      .proj-list {
        display: flex;
        flex-direction: column;
        gap: 8px;
      }
      .proj-item {
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding: 10px 12px;
        background: #f8fafc;
        border: 1px solid #e2e8f0;
        border-radius: 8px;
      }
      .pname {
        font-weight: 600;
        color: #1e293b;
        display: block;
      }
      .pdesc {
        font-size: 12px;
        color: #64748b;
      }
      .team {
        font-size: 12px;
        font-weight: 600;
        color: #4f46e5;
      }
    `,
  ],
  standalone: false,
})
export class ReleasedCandidatesComponent implements OnInit {
  eligible: TraineeRecord[] = [];
  projects: RmgProject[] = [];
  candidateColumns = ['candidate', 'job', 'actions'];
  selectedProject: Record<number, number> = {};

  constructor(
    private rmg: ProjectRmgService,
    private toast: ToastService,
  ) {}

  ngOnInit(): void {
    this.load();
  }

  load(): void {
    // RMG allocates to active projects only (projects are created/managed by Admin).
    this.rmg
      .getProjects()
      .subscribe(
        (list) => (this.projects = (list || []).filter((p) => p.active)),
      );
    this.rmg.getEligibleTrainees().subscribe((list) => (this.eligible = list));
  }

  assign(t: TraineeRecord): void {
    const projectId = this.selectedProject[t.traineeId];
    if (!projectId) return;
    this.rmg.assign(projectId, t.traineeId).subscribe({
      next: () => {
        this.toast.success(`${t.candidateName} assigned to project`);
        this.load();
      },
      error: (e) => this.toast.error(e.error?.message || 'Failed to assign'),
    });
  }
}
