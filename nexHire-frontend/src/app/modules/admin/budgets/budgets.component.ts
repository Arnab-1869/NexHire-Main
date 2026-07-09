import { Component } from '@angular/core';

@Component({
    selector: 'app-budgets',
    template: `
    <div>
      <app-page-header title="Budget Management" subtitle="Configure city-level training budgets and allocations."></app-page-header>
      <mat-card style="border-radius: 12px; margin-top: 8px;">
        <mat-card-content style="padding: 48px; text-align: center; color: #64748b;">
          <mat-icon style="font-size: 56px; width: 56px; height: 56px; color: #cbd5e1; display: block; margin: 0 auto 16px;">account_balance_wallet</mat-icon>
          <h3 style="margin: 0 0 8px; color: #374151;">Budget Management</h3>
          <p style="margin: 0; font-size: 14px;">Manage per-city training budgets. Budget data is managed via the Cities page.</p>
          <a routerLink="/admin/cities" mat-raised-button color="primary" style="margin-top: 20px; display: inline-flex; align-items: center; gap: 6px;">
            <mat-icon>location_city</mat-icon> Go to Cities
          </a>
        </mat-card-content>
      </mat-card>
    </div>
  `,
    standalone: false
})
export class BudgetsComponent {}
