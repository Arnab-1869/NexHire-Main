import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { CandidateProfileService } from '../../../services/candidate-profile.service';
import { ToastService } from '../../../shared/services/toast.service';
import { CurrentUserService } from '../../../core/auth/current-user.service';
import { API_ENDPOINTS } from '../../../config/api-endpoints';

@Component({
  selector: 'app-candidate-profile',
  template: `
    <div class="profile-page">
      <app-page-header
        [title]="isCandidate ? 'Candidate Profile Wizard' : 'Update Profile'"
        [subtitle]="isCandidate ? 'Complete your detailed profile wizard to activate job applications.' : 'Update your personal details.'"
      ></app-page-header>

      <div class="completion-alert" *ngIf="loaded && profileCompleted && isCandidate">
        <mat-icon color="primary">check_circle</mat-icon>
        <div class="alert-content">
          <h3>Your Profile is Complete & Active!</h3>
          <p>You can now apply for jobs. You can also view or update your details below at any time.</p>
        </div>
      </div>

      <mat-card class="stepper-card" *ngIf="loaded">
        <mat-card-content>
          <mat-stepper linear #stepper>
            <!-- STEP 1: Personal Details -->
            <mat-step [stepControl]="personalForm">
              <form [formGroup]="personalForm">
                <ng-template matStepLabel>Personal Details</ng-template>
                <div class="step-content">
                  <p class="step-desc">Provide your primary contact and profile information.</p>
                  
                  <mat-form-field appearance="outline" class="full-width">
                    <mat-label>Full Name</mat-label>
                    <input matInput formControlName="name" placeholder="John Doe" />
                    <mat-error *ngIf="personalForm.get('name')?.hasError('required')">Full Name is required.</mat-error>
                  </mat-form-field>

                  <mat-form-field appearance="outline" class="full-width">
                    <mat-label>Email Address</mat-label>
                    <input matInput formControlName="email" type="email" [disabled]="true" />
                    <mat-hint>Primary email cannot be edited.</mat-hint>
                  </mat-form-field>

                  <mat-form-field appearance="outline" class="full-width">
                    <mat-label>Phone Number</mat-label>
                    <input matInput formControlName="phone" placeholder="9876543210" />
                    <mat-error *ngIf="personalForm.get('phone')?.hasError('required')">Phone is required.</mat-error>
                  </mat-form-field>

                  <div class="step-actions">
                    <button mat-flat-button color="primary" matStepperNext *ngIf="isCandidate">Next</button>
                    <button mat-raised-button color="primary" *ngIf="!isCandidate" [disabled]="saving" (click)="saveBasicProfile()">
                      <mat-icon>save</mat-icon>
                      {{ saving ? 'Saving...' : 'Save Profile' }}
                    </button>
                  </div>
                </div>
              </form>
            </mat-step>

            <!-- STEP 2: Academic Details (Candidate only) -->
            <ng-container *ngIf="isCandidate">
            <mat-step [stepControl]="academicForm">
              <form [formGroup]="academicForm">
                <ng-template matStepLabel>Academic Records</ng-template>
                <div class="step-content">
                  <p class="step-desc">Enter your educational qualifications and scores.</p>
                  
                  <div class="form-grid">
                    <mat-form-field appearance="outline">
                      <mat-label>Highest Degree</mat-label>
                      <mat-select formControlName="highestDegree">
                        <mat-option value="B.Tech">B.Tech / B.E.</mat-option>
                        <mat-option value="M.Tech">M.Tech / M.E.</mat-option>
                        <mat-option value="B.Sc">B.Sc</mat-option>
                        <mat-option value="M.Sc">M.Sc</mat-option>
                        <mat-option value="MCA">MCA</mat-option>
                        <mat-option value="BCA">BCA</mat-option>
                      </mat-select>
                      <mat-error *ngIf="academicForm.get('highestDegree')?.hasError('required')">Degree is required.</mat-error>
                    </mat-form-field>

                    <mat-form-field appearance="outline">
                      <mat-label>Graduation Year</mat-label>
                      <input matInput type="number" formControlName="gradYear" placeholder="2026" />
                      <mat-error *ngIf="academicForm.get('gradYear')?.hasError('required')">Graduation year is required.</mat-error>
                    </mat-form-field>
                  </div>

                  <div class="form-grid">
                    <mat-form-field appearance="outline">
                      <mat-label>10th Std Marks (%)</mat-label>
                      <input matInput type="number" formControlName="tenthMarks" placeholder="85.5" />
                      <mat-error *ngIf="academicForm.get('tenthMarks')?.hasError('required')">10th marks are required.</mat-error>
                    </mat-form-field>

                    <mat-form-field appearance="outline">
                      <mat-label>12th Std Marks (%)</mat-label>
                      <input matInput type="number" formControlName="twelfthMarks" placeholder="88.0" />
                      <mat-error *ngIf="academicForm.get('twelfthMarks')?.hasError('required')">12th marks are required.</mat-error>
                    </mat-form-field>
                  </div>

                  <mat-form-field appearance="outline" class="full-width">
                    <mat-label>Graduation CGPA / Marks (%)</mat-label>
                    <input matInput type="number" formControlName="gradCgpa" placeholder="8.5" />
                    <mat-error *ngIf="academicForm.get('gradCgpa')?.hasError('required')">CGPA is required.</mat-error>
                  </mat-form-field>

                  <div class="step-actions">
                    <button mat-button matStepperPrevious>Back</button>
                    <button mat-flat-button color="primary" matStepperNext>Next</button>
                  </div>
                </div>
              </form>
            </mat-step>

            <!-- STEP 3: Experience & Skills -->
            <mat-step [stepControl]="skillsForm">
              <form [formGroup]="skillsForm">
                <ng-template matStepLabel>Experience & Skills</ng-template>
                <div class="step-content">
                  <p class="step-desc">Describe your professional background and core tech competencies.</p>
                  
                  <mat-form-field appearance="outline" class="full-width">
                    <mat-label>Experience Type</mat-label>
                    <mat-select formControlName="expType">
                      <mat-option value="FRESHER">Fresher</mat-option>
                      <mat-option value="EXPERIENCED">Experienced</mat-option>
                    </mat-select>
                  </mat-form-field>

                  <mat-form-field appearance="outline" class="full-width" *ngIf="skillsForm.get('expType')?.value === 'EXPERIENCED'">
                    <mat-label>Years of Experience</mat-label>
                    <input matInput type="number" formControlName="yearsOfExp" min="0" step="0.5" />
                    <mat-error *ngIf="skillsForm.get('yearsOfExp')?.hasError('required')">Years of experience is required.</mat-error>
                  </mat-form-field>

                  <mat-form-field appearance="outline" class="full-width">
                    <mat-label>Key Skills / Technical Stack</mat-label>
                    <input matInput formControlName="skills" placeholder="Java, Spring Boot, Angular, TypeScript, SQL" />
                    <mat-error *ngIf="skillsForm.get('skills')?.hasError('required')">Key skills are required.</mat-error>
                  </mat-form-field>

                  <div class="step-actions">
                    <button mat-button matStepperPrevious>Back</button>
                    <button mat-flat-button color="primary" matStepperNext>Next</button>
                  </div>
                </div>
              </form>
            </mat-step>

            <!-- STEP 4: Preferences & Resume -->
            <mat-step [stepControl]="preferenceForm">
              <form [formGroup]="preferenceForm">
                <ng-template matStepLabel>Locations & Resume</ng-template>
                <div class="step-content">
                  <p class="step-desc">Select exactly three unique location preferences and upload your resume PDF.</p>
                  
                  <div class="pref-selectors">
                    <mat-form-field appearance="outline" class="full-width">
                      <mat-label>Location Preference 1</mat-label>
                      <mat-select formControlName="prefLocation1Id" (selectionChange)="validatePreferences()">
                        <mat-option *ngFor="let loc of locations" [value]="loc.id">{{ loc.name }}</mat-option>
                      </mat-select>
                      <mat-error *ngIf="preferenceForm.get('prefLocation1Id')?.hasError('required')">Preference 1 is required.</mat-error>
                    </mat-form-field>

                    <mat-form-field appearance="outline" class="full-width">
                      <mat-label>Location Preference 2</mat-label>
                      <mat-select formControlName="prefLocation2Id" (selectionChange)="validatePreferences()">
                        <mat-option *ngFor="let loc of locations" [value]="loc.id">{{ loc.name }}</mat-option>
                      </mat-select>
                      <mat-error *ngIf="preferenceForm.get('prefLocation2Id')?.hasError('required')">Preference 2 is required.</mat-error>
                    </mat-form-field>

                    <mat-form-field appearance="outline" class="full-width">
                      <mat-label>Location Preference 3</mat-label>
                      <mat-select formControlName="prefLocation3Id" (selectionChange)="validatePreferences()">
                        <mat-option *ngFor="let loc of locations" [value]="loc.id">{{ loc.name }}</mat-option>
                      </mat-select>
                      <mat-error *ngIf="preferenceForm.get('prefLocation3Id')?.hasError('required')">Preference 3 is required.</mat-error>
                    </mat-form-field>
                  </div>

                  <div class="pref-error" *ngIf="prefValidationError">
                    <mat-icon>warning</mat-icon>
                    <span>Please select three unique preferred locations. Duplicates are not allowed.</span>
                  </div>

                  <!-- Resume Upload Section -->
                  <div class="resume-upload-box">
                    <h3>Resume Upload (PDF only, max 5MB)</h3>
                    <div class="upload-controls">
                      <input type="file" #fileInput (change)="onFileSelected($event)" accept="application/pdf" style="display: none;" />
                      <button type="button" mat-stroked-button color="primary" (click)="fileInput.click()">
                        <mat-icon>cloud_upload</mat-icon>
                        Choose Resume PDF
                      </button>
                      <span class="file-name" *ngIf="selectedFile">{{ selectedFile.name }}</span>
                      <span class="file-name placeholder" *ngIf="!selectedFile && !resumeUploaded">No file chosen</span>
                      <span class="file-name success" *ngIf="!selectedFile && resumeUploaded">
                        <mat-icon>check_circle</mat-icon> Resume Uploaded
                      </span>
                    </div>
                  </div>

                  <div class="step-actions mt-24">
                    <button mat-button matStepperPrevious>Back</button>
                    <button mat-raised-button color="primary" [disabled]="saving || prefValidationError" (click)="submitProfile()">
                      <mat-icon>save</mat-icon>
                      {{ saving ? 'Saving Profile...' : 'Save & Activate Profile' }}
                    </button>
                  </div>
                </div>
              </form>
            </mat-step>
            </ng-container>
          </mat-stepper>
        </mat-card-content>
      </mat-card>

      <app-loader *ngIf="!loaded"></app-loader>
    </div>
  `,
  styles: [
    `
      .profile-page {
        display: flex;
        flex-direction: column;
        gap: 24px;
      }
      .completion-alert {
        display: flex;
        align-items: center;
        gap: 16px;
        background: #f0fdf4;
        border: 1px solid #bbf7d0;
        border-radius: 12px;
        padding: 16px;
      }
      .completion-alert mat-icon {
        font-size: 32px;
        width: 32px;
        height: 32px;
        color: #16a34a;
      }
      .alert-content h3 {
        margin: 0;
        color: #14532d;
      }
      .alert-content p {
        margin: 4px 0 0 0;
        color: #166534;
        font-size: 14px;
      }
      .stepper-card {
        border-radius: 12px !important;
        box-shadow: 0 4px 20px rgba(0, 0, 0, 0.04) !important;
      }
      .step-content {
        display: flex;
        flex-direction: column;
        gap: 16px;
        padding: 24px 0;
      }
      .step-desc {
        color: #64748b;
        font-size: 14px;
        margin: 0 0 12px 0;
      }
      .full-width {
        width: 100%;
      }
      .form-grid {
        display: grid;
        grid-template-columns: 1fr 1fr;
        gap: 16px;
      }
      .pref-selectors {
        display: grid;
        grid-template-columns: 1fr 1fr 1fr;
        gap: 16px;
      }
      .pref-error {
        display: flex;
        align-items: center;
        gap: 8px;
        color: #ef4444;
        background: #fef2f2;
        border: 1px solid #fee2e2;
        border-radius: 8px;
        padding: 12px;
        font-size: 14px;
      }
      .resume-upload-box {
        background: #f8fafc;
        border: 1px dashed #cbd5e1;
        border-radius: 8px;
        padding: 20px;
        margin-top: 16px;
      }
      .resume-upload-box h3 {
        margin: 0 0 16px 0;
        color: #334155;
        font-size: 16px;
      }
      .upload-controls {
        display: flex;
        align-items: center;
        gap: 16px;
        flex-wrap: wrap;
      }
      .file-name {
        font-size: 14px;
        color: #334155;
        font-weight: 500;
      }
      .file-name.placeholder {
        color: #94a3b8;
        font-style: italic;
      }
      .file-name.success {
        color: #16a34a;
        display: flex;
        align-items: center;
        gap: 4px;
      }
      .file-name.success mat-icon {
        font-size: 18px;
        width: 18px;
        height: 18px;
      }
      .resume-actions {
        margin-top: 16px;
      }
      .step-actions {
        display: flex;
        gap: 12px;
        margin-top: 12px;
      }
      .mt-24 {
        margin-top: 24px;
      }
    `,
  ],
  standalone: false,
})
export class CandidateProfileComponent implements OnInit {
  personalForm!: FormGroup;
  academicForm!: FormGroup;
  skillsForm!: FormGroup;
  preferenceForm!: FormGroup;

  isCandidate = true;
  locations: any[] = [];
  loaded = false;
  saving = false;
  profileCompleted = false;
  prefValidationError = false;
  selectedFile: File | null = null;
  resumeUploaded = false;

  constructor(
    private fb: FormBuilder,
    private http: HttpClient,
    private profileService: CandidateProfileService,
    private toast: ToastService,
    private currentUser: CurrentUserService
  ) {}

  ngOnInit(): void {
    const role = this.currentUser.getRole()?.toUpperCase() || '';
    this.isCandidate = (role === 'CANDIDATE' || role === 'EMPLOYEE');
    this.initForms();
    if (this.isCandidate) {
      this.loadLocations();
    } else {
      this.loadBasicProfile();
    }
  }

  /** Load basic profile for non-candidate users (HR/Admin/RMG) */
  private loadBasicProfile(): void {
    this.http.get<any>(API_ENDPOINTS.AUTH.ME).subscribe({
      next: (user) => {
        this.personalForm.patchValue({
          name: user.name || '',
          email: user.email || '',
          phone: user.phone || '',
        });
        this.loaded = true;
      },
      error: () => {
        this.loaded = true;
      },
    });
  }

  /** Save basic profile for non-candidate users */
  saveBasicProfile(): void {
    if (this.personalForm.invalid) {
      this.toast.error('Please fill in all required fields.');
      return;
    }
    this.saving = true;
    const payload = {
      name: this.personalForm.get('name')?.value,
      phone: this.personalForm.get('phone')?.value,
    };
    // For non-candidate users, use a simple PUT to update basic info
    this.http.put<any>(API_ENDPOINTS.AUTH.ME, payload).subscribe({
      next: () => {
        this.saving = false;
        this.toast.success('Profile updated successfully.');
      },
      error: () => {
        this.saving = false;
        this.toast.error('Failed to update profile.');
      },
    });
  }

  initForms(): void {
    this.personalForm = this.fb.group({
      name: ['', Validators.required],
      email: [{ value: '', disabled: true }],
      phone: ['', Validators.required],
    });

    this.academicForm = this.fb.group({
      highestDegree: ['', Validators.required],
      gradYear: ['', Validators.required],
      tenthMarks: ['', Validators.required],
      twelfthMarks: ['', Validators.required],
      gradCgpa: ['', Validators.required],
    });

    this.skillsForm = this.fb.group({
      expType: ['FRESHER', Validators.required],
      yearsOfExp: [0],
      skills: ['', Validators.required],
    });

    this.preferenceForm = this.fb.group({
      prefLocation1Id: ['', Validators.required],
      prefLocation2Id: ['', Validators.required],
      prefLocation3Id: ['', Validators.required],
    });

    // Handle expType conditional validation
    this.skillsForm.get('expType')?.valueChanges.subscribe((type) => {
      const yearsControl = this.skillsForm.get('yearsOfExp');
      if (type === 'EXPERIENCED') {
        yearsControl?.setValidators([Validators.required, Validators.min(0.1)]);
      } else {
        yearsControl?.clearValidators();
        yearsControl?.setValue(0);
      }
      yearsControl?.updateValueAndValidity();
    });
  }

  loadLocations(): void {
    this.http.get<any[]>(API_ENDPOINTS.LOCATIONS.BASE).subscribe({
      next: (locs) => {
        this.locations = locs;
        this.loadProfile();
      },
      error: () => {
        this.toast.error('Failed to load location choices.');
        this.loadProfile();
      },
    });
  }

  loadProfile(): void {
    this.profileService.getProfile().subscribe({
      next: (profile) => {
        if (profile) {
          this.personalForm.patchValue({
            name: profile.name,
            email: profile.email,
            phone: profile.phone,
          });

          this.academicForm.patchValue({
            highestDegree: profile.highestDegree,
            gradYear: profile.gradYear,
            tenthMarks: profile.tenthMarks,
            twelfthMarks: profile.twelfthMarks,
            gradCgpa: profile.gradCgpa,
          });

          this.skillsForm.patchValue({
            expType: profile.expType || 'FRESHER',
            yearsOfExp: profile.yearsOfExp || 0,
            skills: profile.skills,
          });

          this.preferenceForm.patchValue({
            prefLocation1Id: profile.prefLocation1Id,
            prefLocation2Id: profile.prefLocation2Id,
            prefLocation3Id: profile.prefLocation3Id,
          });

          this.resumeUploaded = profile.resumeUploaded;
          this.profileCompleted = profile.completed;
        }
        this.loaded = true;
      },
      error: () => {
        // Safe defaults if profile not created yet, pull user email from /me
        this.http.get<any>(API_ENDPOINTS.AUTH.ME).subscribe({
          next: (user) => {
            this.personalForm.patchValue({ name: user.name, email: user.email, phone: user.phone });
            this.loaded = true;
          },
          error: () => {
            this.loaded = true;
          }
        });
      },
    });
  }

  validatePreferences(): void {
    const p1 = this.preferenceForm.get('prefLocation1Id')?.value;
    const p2 = this.preferenceForm.get('prefLocation2Id')?.value;
    const p3 = this.preferenceForm.get('prefLocation3Id')?.value;

    if (p1 && p2 && p3) {
      this.prefValidationError = (p1 === p2 || p2 === p3 || p1 === p3);
    } else {
      this.prefValidationError = false;
    }
  }

  onFileSelected(event: any): void {
    const file = event.target.files[0];
    if (file) {
      if (file.type !== 'application/pdf') {
        this.toast.error('Only PDF files are supported.');
        return;
      }
      if (file.size > 5 * 1024 * 1024) {
        this.toast.error('File size cannot exceed 5MB.');
        return;
      }
      this.selectedFile = file;
    }
  }

  submitProfile(): void {
    this.validatePreferences();
    if (this.prefValidationError) {
      this.toast.error('Please select three unique preferred locations.');
      return;
    }

    if (
      this.personalForm.invalid ||
      this.academicForm.invalid ||
      this.skillsForm.invalid ||
      this.preferenceForm.invalid
    ) {
      this.toast.error('Please complete all wizard steps with valid inputs.');
      return;
    }

    this.saving = true;

    const payload = {
      name: this.personalForm.get('name')?.value,
      phone: this.personalForm.get('phone')?.value,
      highestDegree: this.academicForm.get('highestDegree')?.value,
      gradYear: this.academicForm.get('gradYear')?.value,
      tenthMarks: this.academicForm.get('tenthMarks')?.value,
      twelfthMarks: this.academicForm.get('twelfthMarks')?.value,
      gradCgpa: this.academicForm.get('gradCgpa')?.value,
      expType: this.skillsForm.get('expType')?.value,
      yearsOfExp: this.skillsForm.get('yearsOfExp')?.value,
      skills: this.skillsForm.get('skills')?.value,
      prefLocation1Id: this.preferenceForm.get('prefLocation1Id')?.value,
      prefLocation2Id: this.preferenceForm.get('prefLocation2Id')?.value,
      prefLocation3Id: this.preferenceForm.get('prefLocation3Id')?.value,
    };

    // Save profile metadata
    this.profileService.saveProfile(payload).subscribe({
      next: (res) => {
        // If there's an selected resume, upload it
        if (this.selectedFile) {
          this.profileService.uploadResume(this.selectedFile).subscribe({
            next: () => {
              this.toast.success('Profile and resume saved successfully.');
              this.selectedFile = null;
              this.resumeUploaded = true;
              this.profileCompleted = res.completed;
              this.saving = false;
            },
            error: (err) => {
              this.saving = false;
              this.toast.error(err.error?.message || 'Profile saved, but resume upload failed.');
            },
          });
        } else {
          this.toast.success('Profile saved successfully.');
          this.profileCompleted = res.completed;
          this.saving = false;
        }
      },
      error: (err) => {
        this.saving = false;
        this.toast.error(err.error?.message || 'Failed to save profile.');
      },
    });
  }

  getResumeDownloadLink(): string {
    return this.profileService.downloadResume();
  }
}
