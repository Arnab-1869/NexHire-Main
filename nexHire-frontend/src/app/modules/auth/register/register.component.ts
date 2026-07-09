import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, AbstractControl, ValidationErrors } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../../core/auth/auth.service';
import { ToastService } from '../../../shared/services/toast.service';

@Component({
    selector: 'app-register',
    template: `
    <div class="register-container">
      <mat-card class="register-card">
        <mat-card-header class="register-header">
          <mat-card-title>Candidate Registration</mat-card-title>
          <mat-card-subtitle>Create an account to explore jobs and track applications</mat-card-subtitle>
        </mat-card-header>
        <mat-card-content>
          <form [formGroup]="registerForm" (ngSubmit)="onSubmit()" class="register-form">
            <!-- Account Credentials -->
            <div class="form-section">
              <h3>Account Credentials</h3>
              <div class="form-row">
                <mat-form-field appearance="outline" class="half-width">
                  <mat-label>Full Name</mat-label>
                  <input matInput formControlName="fullName" placeholder="John Doe">
                  <mat-error *ngIf="registerForm.get('fullName')?.hasError('required')">Full Name is required</mat-error>
                </mat-form-field>

                <mat-form-field appearance="outline" class="half-width">
                  <mat-label>Email Address</mat-label>
                  <input matInput type="email" formControlName="email" placeholder="john&#64;example.com">
                  <mat-error *ngIf="registerForm.get('email')?.hasError('required')">Email is required</mat-error>
                  <mat-error *ngIf="registerForm.get('email')?.hasError('email')">Please enter a valid email</mat-error>
                </mat-form-field>
              </div>

              <div class="form-row">
                <mat-form-field appearance="outline" class="full-width">
                  <mat-label>Phone Number</mat-label>
                  <input matInput formControlName="phone" placeholder="9876543210">
                  <mat-error *ngIf="registerForm.get('phone')?.hasError('required')">Phone is required</mat-error>
                  <mat-error *ngIf="registerForm.get('phone')?.hasError('pattern')">Enter a valid 10-digit number</mat-error>
                </mat-form-field>
              </div>

              <div class="form-row">
                <mat-form-field appearance="outline" class="half-width">
                  <mat-label>Password</mat-label>
                  <input matInput [type]="hidePassword ? 'password' : 'text'" formControlName="password">
                  <button mat-icon-button matSuffix (click)="hidePassword = !hidePassword" type="button">
                    <mat-icon>{{hidePassword ? 'visibility_off' : 'visibility'}}</mat-icon>
                  </button>
                  <mat-error *ngIf="registerForm.get('password')?.hasError('required')">Password is required</mat-error>
                  <mat-error *ngIf="registerForm.get('password')?.hasError('minlength')">Must be at least 6 characters</mat-error>
                </mat-form-field>

                <mat-form-field appearance="outline" class="half-width">
                  <mat-label>Confirm Password</mat-label>
                  <input matInput [type]="hideConfirmPassword ? 'password' : 'text'" formControlName="confirmPassword">
                  <button mat-icon-button matSuffix (click)="hideConfirmPassword = !hideConfirmPassword" type="button">
                    <mat-icon>{{hideConfirmPassword ? 'visibility_off' : 'visibility'}}</mat-icon>
                  </button>
                  <mat-error *ngIf="registerForm.get('confirmPassword')?.hasError('required')">Confirm Password is required</mat-error>
                  <mat-error *ngIf="registerForm.get('confirmPassword')?.hasError('passwordMismatch')">Passwords do not match</mat-error>
                </mat-form-field>
              </div>
            </div>

            <button mat-raised-button color="primary" type="submit" [disabled]="registerForm.invalid || isLoading" class="register-submit-btn">
              <span *ngIf="!isLoading">Register Account</span>
              <mat-spinner diameter="20" *ngIf="isLoading"></mat-spinner>
            </button>
          </form>
        </mat-card-content>
        <mat-card-actions class="register-actions">
          <p>Already have an account? <a routerLink="/auth/login">Login here</a></p>
        </mat-card-actions>
      </mat-card>
    </div>
  `,
    styles: [`
    .register-container {
      display: flex;
      justify-content: center;
      align-items: center;
      padding: 40px 20px;
      background-color: #f8fafc;
    }
    .register-card {
      width: 100%;
      max-width: 700px;
      padding: 24px;
      border-radius: 12px;
      box-shadow: 0 10px 25px rgba(0,0,0,0.05) !important;
    }
    .register-header {
      margin-bottom: 24px;
      flex-direction: column;
      align-items: flex-start;
      padding: 0 !important;
    }
    mat-card-title {
      font-size: 24px !important;
      font-weight: 700 !important;
      color: #1e293b;
      margin-bottom: 8px !important;
    }
    mat-card-subtitle {
      font-size: 14px !important;
      color: #64748b;
    }
    .register-form {
      display: flex;
      flex-direction: column;
      gap: 24px;
    }
    .form-section {
      display: flex;
      flex-direction: column;
      gap: 12px;
    }
    .form-section h3 {
      margin: 0 0 8px 0;
      font-size: 15px;
      font-weight: 600;
      color: #334155;
    }
    .form-row {
      display: flex;
      gap: 16px;
      flex-wrap: wrap;
    }
    .half-width {
      flex: 1;
      min-width: 280px;
    }
    .full-width {
      flex: 1;
      min-width: 100%;
    }
    .register-submit-btn {
      width: 100%;
      height: 48px;
      margin-top: 16px;
      font-weight: 600;
      font-size: 16px;
    }
    .register-actions {
      justify-content: center;
      margin-top: 24px;
      padding: 0 !important;
    }
    .register-actions p {
      margin: 0;
      font-size: 14px;
      color: #64748b;
    }
    .register-actions a {
      color: #3f51b5;
      font-weight: 600;
      text-decoration: none;
    }
  `],
    standalone: false
})
export class RegisterComponent implements OnInit {
  registerForm!: FormGroup;
  hidePassword = true;
  hideConfirmPassword = true;
  isLoading = false;

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private toastService: ToastService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.registerForm = this.fb.group({
      fullName: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      phone: ['', [Validators.required, Validators.pattern(/^\d{10}$/)]],
      password: ['', [Validators.required, Validators.minLength(6)]],
      confirmPassword: ['', [Validators.required]],
    });

    // Add cross-field validation for confirm password
    this.registerForm.get('confirmPassword')?.addValidators(
      this.passwordMatchValidator.bind(this)
    );

    // Re-validate confirm password when password changes
    this.registerForm.get('password')?.valueChanges.subscribe(() => {
      this.registerForm.get('confirmPassword')?.updateValueAndValidity();
    });
  }

  /**
   * Custom validator: confirm password must match password
   */
  private passwordMatchValidator(control: AbstractControl): ValidationErrors | null {
    const password = this.registerForm?.get('password')?.value;
    if (control.value !== password) {
      return { passwordMismatch: true };
    }
    return null;
  }

  onSubmit(): void {
    if (this.registerForm.invalid) return;

    this.isLoading = true;
    // Send only the fields the backend expects (exclude confirmPassword)
    const { confirmPassword, ...payload } = this.registerForm.value;
    this.authService.register(payload).subscribe({
      next: () => {
        this.isLoading = false;
        this.toastService.success('Registration successful! Please login.');
        this.router.navigate(['/auth/login']);
      },
      error: (err) => {
        this.isLoading = false;
        this.toastService.error(err.message || 'Registration failed. Try again.');
      }
    });
  }
}
