import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { forkJoin } from 'rxjs';
import { JobService } from '../../../services/job.service';
import { ApplicationService } from '../../../services/application.service';
import { Job } from '../../../models/job.model';

@Component({
  selector: 'app-jobs-list',
  template: `
    <div class="jobs-page">
      <app-page-header
        title="Open Positions"
        subtitle="Browse active roles and apply"
      ></app-page-header>

      <app-empty-state
        *ngIf="!loading && jobs.length === 0"
        icon="work_off"
        title="No active jobs"
        subtitle="Please check back later."
      ></app-empty-state>

      <div class="jobs-grid" *ngIf="jobs.length > 0">
        <mat-card class="job-card" *ngFor="let job of jobs">
          <mat-card-content>
            <div class="job-card-head">
              <div class="logo"><mat-icon>work</mat-icon></div>
              <div>
                <h3>{{ job.jobTitle }}</h3>
                <span class="loc"
                  ><mat-icon>location_on</mat-icon> {{ job.location }}</span
                >
              </div>
            </div>
            <p class="desc">{{ job.jobDescription }}</p>
            <div class="skills" *ngIf="job.requiredSkills">
              <span class="pill" *ngFor="let s of skills(job.requiredSkills)">{{
                s
              }}</span>
            </div>
            <div class="actions">
              <button
                *ngIf="!isApplied(job.jobId)"
                mat-stroked-button
                color="primary"
                (click)="apply(job.jobId)"
              >
                Apply Now
              </button>
              <button
                *ngIf="isApplied(job.jobId)"
                mat-flat-button
                class="applied-btn"
                matTooltip="You have already applied. View it in My Applications."
                (click)="goToApplications()"
              >
                <mat-icon>check_circle</mat-icon> Applied
              </button>
            </div>
          </mat-card-content>
        </mat-card>
      </div>

      <app-loader *ngIf="loading"></app-loader>
    </div>
  `,
  styles: [
    `
      .jobs-page {
        display: flex;
        flex-direction: column;
        gap: 24px;
      }
      .jobs-grid {
        display: grid;
        grid-template-columns: repeat(auto-fill, minmax(340px, 1fr));
        gap: 20px;
      }
      .job-card {
        border-radius: 12px !important;
        box-shadow: 0 4px 20px rgba(0, 0, 0, 0.05) !important;
      }
      .job-card-head {
        display: flex;
        gap: 12px;
        align-items: center;
        margin-bottom: 12px;
      }
      .logo {
        width: 44px;
        height: 44px;
        border-radius: 10px;
        background: #eef2ff;
        color: #4f46e5;
        display: flex;
        align-items: center;
        justify-content: center;
      }
      .job-card-head h3 {
        margin: 0;
        font-size: 17px;
        color: #1e293b;
      }
      .loc {
        display: inline-flex;
        align-items: center;
        gap: 4px;
        font-size: 12px;
        color: #64748b;
      }
      .loc mat-icon {
        font-size: 14px;
        width: 14px;
        height: 14px;
      }
      .desc {
        color: #475569;
        font-size: 14px;
        line-height: 1.5;
        margin: 0 0 12px;
        display: -webkit-box;
        -webkit-line-clamp: 3;
        -webkit-box-orient: vertical;
        overflow: hidden;
      }
      .skills {
        display: flex;
        flex-wrap: wrap;
        gap: 6px;
        margin-bottom: 16px;
      }
      .pill {
        background: #f1f5f9;
        color: #475569;
        font-size: 11px;
        padding: 3px 10px;
        border-radius: 12px;
      }
      .actions {
        display: flex;
        justify-content: flex-end;
      }
      .applied-btn {
        background: #ecfdf5 !important;
        color: #059669 !important;
        display: inline-flex;
        align-items: center;
        gap: 6px;
      }
      .applied-btn mat-icon {
        font-size: 18px;
        width: 18px;
        height: 18px;
      }
    `,
  ],
  standalone: false,
})
export class JobsListComponent implements OnInit {
  jobs: Job[] = [];
  loading = false;
  private appliedJobIds = new Set<number>();

  constructor(
    private jobService: JobService,
    private applicationService: ApplicationService,
    private router: Router,
  ) {}

  ngOnInit(): void {
    this.loading = true;
    // Load open jobs and the candidate's own applications together so we can
    // mark jobs that have already been applied to.
    forkJoin({
      jobs: this.jobService.getAll(),
      applications: this.applicationService.getByUser(0),
    }).subscribe({
      next: ({ jobs, applications }) => {
        this.jobs = jobs;
        this.appliedJobIds = new Set((applications || []).map((a) => a.jobId));
        this.loading = false;
      },
      error: () => {
        this.loading = false;
      },
    });
  }

  isApplied(jobId: number): boolean {
    return this.appliedJobIds.has(jobId);
  }

  skills(raw: string): string[] {
    return raw
      .split(',')
      .map((s) => s.trim())
      .filter(Boolean);
  }

  apply(jobId: number): void {
    this.router.navigate(['/candidate/apply', jobId]);
  }

  goToApplications(): void {
    this.router.navigate(['/candidate/applications']);
  }
}
