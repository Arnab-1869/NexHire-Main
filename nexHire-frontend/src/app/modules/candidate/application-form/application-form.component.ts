import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { ApplicationService } from '../../../services/application.service';
import { CurrentUserService } from '../../../core/auth/current-user.service';
import { JobService } from '../../../services/job.service';
import { ToastService } from '../../../shared/services/toast.service';
import { Job } from '../../../models/job.model';
import { LoggedInUser } from '../../../models/user.model';

@Component({
  selector: 'app-application-form',
  template: `
    <div class="apply-page-wrapper">
      <!-- Left side: Job Info (Sticky) -->
      <div class="job-context-sidebar">
        <button
          mat-icon-button
          class="back-btn"
          (click)="goBack()"
          matTooltip="Back to Job"
        >
          <mat-icon>arrow_back</mat-icon>
        </button>

        <div class="job-context-content" *ngIf="!loading && job">
          <div class="brand-logo">
            <mat-icon>business</mat-icon>
          </div>
          <h1>{{ job.jobTitle }}</h1>
          <p class="company-text">{{ job.companyName || 'NexHire' }}</p>

          <div class="job-meta-tags">
            <span class="tag"
              ><mat-icon>location_on</mat-icon> {{ job.location }}</span
            >
            <span class="tag"><mat-icon>schedule</mat-icon> Full-time</span>
          </div>

          <div class="about-role">
            <h3>About this role</h3>
            <p>{{ job.jobDescription }}</p>
          </div>

          <div class="skills-section">
            <h3>Required Skills</h3>
            <div class="skills-chips">
              <span
                class="skill-pill"
                *ngFor="let skill of getSkillsArray(job.requiredSkills)"
                >{{ skill }}</span
              >
            </div>
          </div>
        </div>

        <div class="skeleton-loader" *ngIf="loading">
          <!-- Add skeleton if desired, or just show app-loader below -->
        </div>
      </div>

      <!-- Right side: Application Form -->
      <div class="application-form-area">
        <mat-card class="premium-form-card">
          <mat-card-header>
            <mat-card-title>Submit Your Application</mat-card-title>
            <mat-card-subtitle
              >We're excited to learn more about you.</mat-card-subtitle
            >
          </mat-card-header>

          <mat-card-content>
            <form #applicationForm="ngForm" (ngSubmit)="submitApplication()">
              <div class="form-row two-cols">
                <mat-form-field appearance="outline" class="premium-field">
                  <mat-label>Full Name</mat-label>
                  <input matInput [value]="user?.fullName" disabled />
                  <mat-icon matSuffix class="disabled-icon">lock</mat-icon>
                </mat-form-field>

                <mat-form-field appearance="outline" class="premium-field">
                  <mat-label>Email Address</mat-label>
                  <input matInput [value]="user?.email" disabled />
                  <mat-icon matSuffix class="disabled-icon">lock</mat-icon>
                </mat-form-field>
              </div>

              <!-- Resume Upload Zone -->
              <div class="resume-upload-section">
                <h3 class="section-title">
                  Resume / CV <span class="required">*</span>
                </h3>
                <div
                  class="upload-dropzone"
                  [class.has-file]="resumeFile"
                  (click)="resumeInput.click()"
                >
                  <input
                    type="file"
                    hidden
                    #resumeInput
                    (change)="onFileSelected($event)"
                    accept=".pdf,.doc,.docx"
                  />

                  <div class="dropzone-content" *ngIf="!resumeFile">
                    <div class="icon-circle">
                      <mat-icon>cloud_upload</mat-icon>
                    </div>
                    <h4>Click to upload or drag and drop</h4>
                    <p>PDF, DOC, DOCX (Max 5MB)</p>
                  </div>

                  <div class="dropzone-success" *ngIf="resumeFile">
                    <mat-icon class="success-icon">task_alt</mat-icon>
                    <div class="file-details">
                      <span class="filename">{{ resumeFile.name }}</span>
                      <span class="filesize"
                        >{{
                          (resumeFile.size / 1024 / 1024).toFixed(2)
                        }}
                        MB</span
                      >
                    </div>
                    <button
                      mat-icon-button
                      class="remove-btn"
                      (click)="removeFile($event)"
                      matTooltip="Remove"
                    >
                      <mat-icon>close</mat-icon>
                    </button>
                  </div>
                </div>
                <mat-error class="custom-error" *ngIf="submitted && !resumeFile"
                  >Resume is required to apply.</mat-error
                >
              </div>

              <div class="cover-letter-section">
                <h3 class="section-title">
                  Cover Letter <span class="required">*</span>
                </h3>
                <mat-form-field
                  appearance="outline"
                  class="premium-field full-width"
                >
                  <textarea
                    matInput
                    name="coverLetter"
                    rows="6"
                    [(ngModel)]="coverLetter"
                    required
                    placeholder="Tell us why you're a great fit for this role..."
                  ></textarea>
                  <mat-error *ngIf="submitted && !coverLetter?.trim()"
                    >Please share a brief cover letter.</mat-error
                  >
                </mat-form-field>
              </div>

              <div class="alert-box error" *ngIf="alreadyApplied">
                <mat-icon>error_outline</mat-icon>
                <div>
                  <strong>Already Applied</strong>
                  <p>
                    You have already submitted an application for this role.
                    Please check your dashboard for updates.
                  </p>
                </div>
              </div>

              <div class="form-actions">
                <button
                  mat-raised-button
                  class="submit-btn"
                  type="submit"
                  [disabled]="isSubmitting || alreadyApplied"
                >
                  <span *ngIf="!isSubmitting">Submit Application</span>
                  <mat-spinner
                    diameter="20"
                    *ngIf="isSubmitting"
                    color="accent"
                  ></mat-spinner>
                </button>
              </div>
            </form>
          </mat-card-content>
        </mat-card>
      </div>

      <app-loader *ngIf="loading"></app-loader>
    </div>
  `,
  styleUrls: ['./application-form.component.scss'],
  standalone: false,
})
export class ApplicationFormComponent implements OnInit {
  user: LoggedInUser | null = null;
  job: Job | null = null;
  coverLetter = '';
  resumeFile: File | null = null;
  loading = false;
  isSubmitting = false;
  submitted = false;
  alreadyApplied = false;
  private jobId = 0;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private currentUserService: CurrentUserService,
    private jobService: JobService,
    private appService: ApplicationService,
    private toastService: ToastService,
  ) {}

  ngOnInit(): void {
    this.route.params.subscribe((params) => {
      this.jobId = +params['id'];
      this.user = this.currentUserService.getUser();
      if (!this.user?.userId) {
        this.router.navigate(['/dashboard/jobs']);
        return;
      }
      this.loadJob();
      this.checkExistingApplication();
    });
  }

  getSkillsArray(skills: string): string[] {
    return skills?.split(',').map((skill) => skill.trim()) || [];
  }

  loadJob(): void {
    this.loading = true;
    this.jobService.getById(this.jobId).subscribe({
      next: (job) => {
        this.job = job;
        this.loading = false;
      },
      error: () => {
        this.loading = false;
      },
    });
  }

  checkExistingApplication(): void {
    if (!this.user?.userId) {
      return;
    }
    this.appService.getByUser(this.user.userId).subscribe((apps) => {
      this.alreadyApplied = apps.some((app) => app.jobId === this.jobId);
    });
  }

  onFileSelected(event: any): void {
    const file = event.target.files[0];
    if (file) {
      this.resumeFile = file;
    }
  }

  removeFile(event: Event): void {
    event.stopPropagation();
    this.resumeFile = null;
  }

  submitApplication(): void {
    this.submitted = true;
    if (this.alreadyApplied || !this.coverLetter?.trim()) {
      return;
    }
    this.isSubmitting = true;

    const userId = this.user?.userId;
    if (!userId) {
      this.toastService.error('Unable to determine user. Please log in again.');
      this.isSubmitting = false;
      return;
    }

    this.appService
      .apply({
        jobId: this.jobId,
        userId,
        coverLetter: this.coverLetter.trim(),
        resumeUrl: this.resumeFile?.name,
      })
      .subscribe({
        next: () => {
          this.isSubmitting = false;
          this.toastService.success(
            'Your application has been submitted successfully.',
          );
          this.router.navigate(['/candidate/applications']);
        },
        error: (err) => {
          this.isSubmitting = false;
          this.toastService.error(
            err.error?.message ||
              'Unable to submit application. Please try again later.',
          );
        },
      });
  }

  goBack(): void {
    this.router.navigate(['/candidate/jobs']);
  }
}
