import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../../core/auth/auth.service';
import { ToastService } from '../../../shared/services/toast.service';

@Component({
  selector: 'app-login',
  template: `
    <div class="login-card-container">
      <mat-card class="login-card">
        <mat-card-header class="login-header">
          <mat-card-title>Login to NexHire</mat-card-title>
          <mat-card-subtitle
            >Enter your corporate or candidate credentials</mat-card-subtitle
          >
        </mat-card-header>
        <mat-card-content>
          <form
            [formGroup]="loginForm"
            (ngSubmit)="onSubmit()"
            class="login-form"
          >
            <mat-form-field appearance="outline" class="full-width">
              <mat-label>Email Address</mat-label>
              <input
                matInput
                type="email"
                formControlName="email"
                placeholder="e.g. hr@nexhire.com"
              />
              <mat-error *ngIf="loginForm.get('email')?.hasError('required')"
                >Email is required</mat-error
              >
              <mat-error *ngIf="loginForm.get('email')?.hasError('email')"
                >Please enter a valid email</mat-error
              >
            </mat-form-field>

            <mat-form-field appearance="outline" class="full-width">
              <mat-label>Password</mat-label>
              <input
                matInput
                [type]="hidePassword ? 'password' : 'text'"
                formControlName="password"
              />
              <button
                mat-icon-button
                matSuffix
                (click)="hidePassword = !hidePassword"
                type="button"
                [attr.aria-label]="'Hide password'"
                [attr.aria-pressed]="hidePassword"
              >
                <mat-icon>{{
                  hidePassword ? 'visibility_off' : 'visibility'
                }}</mat-icon>
              </button>
              <mat-error *ngIf="loginForm.get('password')?.hasError('required')"
                >Password is required</mat-error
              >
            </mat-form-field>

            <div class="demo-accounts">
              <span class="demo-title">Seeded Accounts:</span>
              <div class="demo-chips">
                <button
                  type="button"
                  mat-stroked-button
                  (click)="fillDemo('admin@nexhire.com', 'admin123')"
                >
                  Admin
                </button>
                <button
                  type="button"
                  mat-stroked-button
                  (click)="fillDemo('hr@nexhire.com', 'hr123')"
                >
                  HR
                </button>
                <button
                  type="button"
                  mat-stroked-button
                  (click)="fillDemo('rmg@nexhire.com', 'rmg123')"
                >
                  RMG
                </button>
                <button
                  type="button"
                  mat-stroked-button
                  (click)="fillDemo('candidate1@nexhire.com', 'candidate123')"
                >
                  Candidate
                </button>
              </div>
            </div>

            <button
              mat-raised-button
              color="primary"
              type="submit"
              [disabled]="loginForm.invalid || isLoading"
              class="login-submit-btn"
            >
              <span *ngIf="!isLoading">Login</span>
              <mat-spinner diameter="20" *ngIf="isLoading"></mat-spinner>
            </button>
          </form>
        </mat-card-content>
        <mat-card-actions class="login-actions">
          <p>
            Don't have an account?
            <a routerLink="/auth/register">Register as Candidate</a>
          </p>
        </mat-card-actions>
      </mat-card>
    </div>
  `,
  styles: [
    `
      .login-card-container {
        display: flex;
        justify-content: center;
        align-items: center;
        padding: 60px 20px;
        min-height: calc(100vh - 150px);
      }
      .login-card {
        width: 100%;
        max-width: 450px;
        padding: 24px;
        border-radius: 12px;
        box-shadow: 0 10px 25px rgba(0, 0, 0, 0.05) !important;
      }
      .login-header {
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
      .login-form {
        display: flex;
        flex-direction: column;
        gap: 16px;
      }
      .full-width {
        width: 100%;
      }
      .login-submit-btn {
        width: 100%;
        height: 48px;
        margin-top: 16px;
        font-weight: 600;
        font-size: 16px;
      }
      .demo-accounts {
        background-color: #f8fafc;
        border: 1px solid #e2e8f0;
        border-radius: 8px;
        padding: 12px;
        margin-top: 8px;
      }
      .demo-title {
        font-size: 12px;
        font-weight: 600;
        color: #64748b;
        display: block;
        margin-bottom: 8px;
      }
      .demo-chips {
        display: flex;
        gap: 8px;
        flex-wrap: wrap;
      }
      .demo-chips button {
        font-size: 12px;
        padding: 0 12px;
        height: 28px;
        line-height: 28px;
      }
      .login-actions {
        justify-content: center;
        margin-top: 24px;
        padding: 0 !important;
      }
      .login-actions p {
        margin: 0;
        font-size: 14px;
        color: #64748b;
      }
      .login-actions a {
        color: #3f51b5;
        font-weight: 600;
        text-decoration: none;
      }
    `,
  ],
  standalone: false,
})
export class LoginComponent implements OnInit {
  loginForm!: FormGroup;
  hidePassword = true;
  isLoading = false;

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private toastService: ToastService,
    private router: Router,
  ) {}

  ngOnInit(): void {
    this.loginForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required]],
    });
  }

  fillDemo(email: string, pass: string): void {
    this.loginForm.patchValue({ email, password: pass });
  }

  onSubmit(): void {
    if (this.loginForm.invalid) return;

    this.isLoading = true;
    this.authService.login(this.loginForm.value).subscribe({
      next: (user) => {
        this.isLoading = false;
        this.toastService.success(`Welcome back, ${user.fullName}!`);
        // Portal navigation is handled by AuthService.navigateToPortal()
      },
      error: (err) => {
        this.isLoading = false;
        this.toastService.error(
          err.message || 'Login failed. Please check your credentials.',
        );
      },
    });
  }
}
