import { Component } from '@angular/core';

@Component({
    selector: 'app-system-settings',
    template: `
    <div>
      <app-page-header title="System Settings" subtitle="Configure global application settings and preferences."></app-page-header>
      <mat-card style="border-radius: 12px; margin-top: 8px;">
        <mat-card-content style="padding: 48px; text-align: center; color: #64748b;">
          <mat-icon style="font-size: 56px; width: 56px; height: 56px; color: #cbd5e1; display: block; margin: 0 auto 16px;">settings</mat-icon>
          <h3 style="margin: 0 0 8px; color: #374151;">System Settings</h3>
          <p style="margin: 0; font-size: 14px;">System-wide configuration — connect to backend API to manage settings.</p>
        </mat-card-content>
      </mat-card>
    </div>
  `,
    standalone: false
})
export class SystemSettingsComponent {}
