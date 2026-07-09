import { Component } from '@angular/core';

@Component({
    selector: 'app-change-password',
    template: `
    <div>
      <app-page-header title="Change Password" subtitle="Update your account password securely."></app-page-header>
      <mat-card style="border-radius: 12px; margin-top: 8px; max-width: 480px;">
        <mat-card-content style="padding: 32px;">
          <mat-form-field appearance="outline" style="width:100%">
            <mat-label>Current Password</mat-label>
            <input matInput type="password" />
          </mat-form-field>
          <mat-form-field appearance="outline" style="width:100%">
            <mat-label>New Password</mat-label>
            <input matInput type="password" />
          </mat-form-field>
          <mat-form-field appearance="outline" style="width:100%">
            <mat-label>Confirm New Password</mat-label>
            <input matInput type="password" />
          </mat-form-field>
          <button mat-raised-button color="primary" style="width:100%">Update Password</button>
        </mat-card-content>
      </mat-card>
    </div>
  `,
    standalone: false
})
export class ChangePasswordComponent {}
