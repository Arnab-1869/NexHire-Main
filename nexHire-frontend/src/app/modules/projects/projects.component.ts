import { Component, OnInit } from '@angular/core';
import {
  ProjectRmgService,
  RmgProject,
} from '../../services/project-rmg.service';
import { ToastService } from '../../shared/services/toast.service';

/**
 * Admin project management: full CRUD over projects.
 * Allocation of trainees is handled separately by RMG.
 */
@Component({
  selector: 'app-projects',
  template: `
    <div class="projects-page">
      <app-page-header
        title="Projects"
        subtitle="Create and manage delivery projects. Trainee allocation is handled by RMG."
      ></app-page-header>

      <div class="projects-grid">
        <mat-card class="panel-card">
          <mat-card-header>
            <mat-card-title>{{
              editingId ? 'Edit Project' : 'Create New Project'
            }}</mat-card-title>
          </mat-card-header>
          <mat-card-content>
            <div class="form-columns">
              <mat-form-field appearance="outline" class="full-width">
                <mat-label>Project Name</mat-label>
                <input
                  matInput
                  [(ngModel)]="form.name"
                  placeholder="e.g. Banking Portal"
                />
              </mat-form-field>

              <mat-form-field appearance="outline" class="full-width">
                <mat-label>Description</mat-label>
                <textarea
                  matInput
                  rows="3"
                  [(ngModel)]="form.description"
                  placeholder="Short description of the project"
                ></textarea>
              </mat-form-field>

              <mat-checkbox *ngIf="editingId" [(ngModel)]="form.active">
                Active
              </mat-checkbox>
            </div>

            <div class="form-actions">
              <button
                mat-raised-button
                color="primary"
                class="save-btn"
                [disabled]="saving"
                (click)="save()"
              >
                {{ editingId ? 'Save Changes' : 'Create Project' }}
              </button>
              <button
                *ngIf="editingId"
                mat-stroked-button
                class="save-btn"
                [disabled]="saving"
                (click)="cancelEdit()"
              >
                Cancel
              </button>
            </div>
          </mat-card-content>
        </mat-card>

        <mat-card class="panel-card table-panel">
          <mat-card-header>
            <mat-card-title>All Projects</mat-card-title>
          </mat-card-header>
          <mat-card-content>
            <app-empty-state
              *ngIf="projects.length === 0"
              icon="business_center"
              title="No projects found"
              subtitle="Create a project to get started."
            ></app-empty-state>

            <div class="table-container" *ngIf="projects.length > 0">
              <table mat-table [dataSource]="projects">
                <ng-container matColumnDef="name">
                  <th mat-header-cell *matHeaderCellDef>Project</th>
                  <td mat-cell *matCellDef="let project">{{ project.name }}</td>
                </ng-container>

                <ng-container matColumnDef="description">
                  <th mat-header-cell *matHeaderCellDef>Description</th>
                  <td mat-cell *matCellDef="let project">
                    {{ project.description || 'N/A' }}
                  </td>
                </ng-container>

                <ng-container matColumnDef="teamSize">
                  <th mat-header-cell *matHeaderCellDef>Team Size</th>
                  <td mat-cell *matCellDef="let project">
                    {{ project.teamSize }}
                  </td>
                </ng-container>

                <ng-container matColumnDef="status">
                  <th mat-header-cell *matHeaderCellDef>Status</th>
                  <td mat-cell *matCellDef="let project">
                    <span
                      class="status-chip"
                      [class.active]="project.active"
                      [class.inactive]="!project.active"
                    >
                      {{ project.active ? 'ACTIVE' : 'INACTIVE' }}
                    </span>
                  </td>
                </ng-container>

                <ng-container matColumnDef="actions">
                  <th mat-header-cell *matHeaderCellDef align="end">Actions</th>
                  <td mat-cell *matCellDef="let project" align="end">
                    <button
                      mat-icon-button
                      color="primary"
                      matTooltip="Edit"
                      (click)="edit(project)"
                    >
                      <mat-icon>edit</mat-icon>
                    </button>
                    <button
                      mat-icon-button
                      color="warn"
                      matTooltip="Delete"
                      (click)="remove(project)"
                    >
                      <mat-icon>delete</mat-icon>
                    </button>
                  </td>
                </ng-container>

                <tr mat-header-row *matHeaderRowDef="displayedColumns"></tr>
                <tr
                  mat-row
                  *matRowDef="let row; columns: displayedColumns"
                ></tr>
              </table>
            </div>
          </mat-card-content>
        </mat-card>
      </div>
    </div>
  `,
  styles: [
    `
      .projects-page {
        display: flex;
        flex-direction: column;
        gap: 24px;
      }
      .projects-grid {
        display: grid;
        grid-template-columns: 360px 1fr;
        gap: 24px;
      }
      @media (max-width: 992px) {
        .projects-grid {
          grid-template-columns: 1fr;
        }
      }
      .panel-card {
        border-radius: 12px !important;
        box-shadow: 0 4px 20px rgba(0, 0, 0, 0.04) !important;
        padding: 16px;
      }
      .form-columns {
        display: grid;
        gap: 16px;
      }
      .full-width {
        width: 100%;
      }
      .form-actions {
        display: flex;
        gap: 12px;
        margin-top: 16px;
      }
      .table-panel {
        display: flex;
        flex-direction: column;
      }
      .table-container {
        margin-top: 16px;
        width: 100%;
        overflow-x: auto;
      }
      table {
        width: 100%;
      }
      .save-btn {
        height: 40px;
      }
      .status-chip {
        padding: 3px 10px;
        border-radius: 12px;
        font-size: 11px;
        font-weight: 600;
      }
      .status-chip.active {
        background: #dcfce7;
        color: #166534;
      }
      .status-chip.inactive {
        background: #fee2e2;
        color: #991b1b;
      }
    `,
  ],
  standalone: false,
})
export class ProjectsComponent implements OnInit {
  projects: RmgProject[] = [];
  displayedColumns = ['name', 'description', 'teamSize', 'status', 'actions'];

  editingId: number | null = null;
  saving = false;
  form: { name: string; description: string; active: boolean } = {
    name: '',
    description: '',
    active: true,
  };

  constructor(
    private projectService: ProjectRmgService,
    private toastService: ToastService,
  ) {}

  ngOnInit(): void {
    this.loadProjects();
  }

  loadProjects(): void {
    this.projectService
      .getProjects()
      .subscribe((list) => (this.projects = list || []));
  }

  save(): void {
    if (!this.form.name.trim()) {
      this.toastService.error('Please provide a project name.');
      return;
    }
    this.saving = true;

    if (this.editingId) {
      this.projectService
        .updateProject(this.editingId, {
          name: this.form.name,
          description: this.form.description,
          active: this.form.active,
        })
        .subscribe({
          next: () => {
            this.toastService.success('Project updated.');
            this.resetForm();
            this.loadProjects();
          },
          error: (e) => {
            this.saving = false;
            this.toastService.error(
              e.error?.message || 'Failed to update project.',
            );
          },
        });
    } else {
      this.projectService
        .createProject(this.form.name, this.form.description)
        .subscribe({
          next: () => {
            this.toastService.success('Project created.');
            this.resetForm();
            this.loadProjects();
          },
          error: (e) => {
            this.saving = false;
            this.toastService.error(
              e.error?.message || 'Failed to create project.',
            );
          },
        });
    }
  }

  edit(project: RmgProject): void {
    this.editingId = project.id;
    this.form = {
      name: project.name,
      description: project.description || '',
      active: project.active,
    };
  }

  cancelEdit(): void {
    this.resetForm();
  }

  remove(project: RmgProject): void {
    if (!confirm(`Delete project "${project.name}"? This cannot be undone.`)) {
      return;
    }
    this.projectService.deleteProject(project.id).subscribe({
      next: () => {
        this.toastService.success('Project deleted.');
        if (this.editingId === project.id) {
          this.resetForm();
        }
        this.loadProjects();
      },
      error: (e) =>
        this.toastService.error(
          e.error?.message || 'Failed to delete project.',
        ),
    });
  }

  private resetForm(): void {
    this.editingId = null;
    this.saving = false;
    this.form = { name: '', description: '', active: true };
  }
}
