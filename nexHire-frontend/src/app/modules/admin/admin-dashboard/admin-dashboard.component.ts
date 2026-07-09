import { Component } from '@angular/core';

/** Admin Dashboard - shows system-wide overview for ADMIN role */
@Component({
    selector: 'app-admin-dashboard',
    template: `
    <div class="admin-dash">
      <app-page-header title="Admin Dashboard" subtitle="System administration overview"></app-page-header>

      <div class="admin-grid">
        <mat-card class="admin-card">
          <mat-card-content>
            <div class="card-icon purple"><mat-icon>manage_accounts</mat-icon></div>
            <div class="card-body">
              <span class="card-num">12</span>
              <span class="card-lbl">System Users</span>
            </div>
          </mat-card-content>
        </mat-card>
        <mat-card class="admin-card">
          <mat-card-content>
            <div class="card-icon indigo"><mat-icon>admin_panel_settings</mat-icon></div>
            <div class="card-body">
              <span class="card-num">5</span>
              <span class="card-lbl">Roles Configured</span>
            </div>
          </mat-card-content>
        </mat-card>
        <mat-card class="admin-card">
          <mat-card-content>
            <div class="card-icon teal"><mat-icon>location_city</mat-icon></div>
            <div class="card-body">
              <span class="card-num">8</span>
              <span class="card-lbl">Cities</span>
            </div>
          </mat-card-content>
        </mat-card>
        <mat-card class="admin-card">
          <mat-card-content>
            <div class="card-icon orange"><mat-icon>domain</mat-icon></div>
            <div class="card-body">
              <span class="card-num">24</span>
              <span class="card-lbl">Blocks Available</span>
            </div>
          </mat-card-content>
        </mat-card>
      </div>

      <mat-card class="quick-links-card">
        <mat-card-header>
          <mat-card-title>Quick Administration</mat-card-title>
        </mat-card-header>
        <mat-card-content class="quick-links">
          <a routerLink="/admin/roles" mat-stroked-button color="primary">
            <mat-icon>admin_panel_settings</mat-icon> Manage Roles
          </a>
          <a routerLink="/admin/role-permissions" mat-stroked-button color="primary">
            <mat-icon>lock</mat-icon> Role Permissions
          </a>
          <a routerLink="/admin/cities" mat-stroked-button color="primary">
            <mat-icon>location_city</mat-icon> Manage Cities
          </a>
          <a routerLink="/admin/branches" mat-stroked-button color="primary">
            <mat-icon>account_balance</mat-icon> Manage Branches
          </a>
          <a routerLink="/admin/blocks" mat-stroked-button color="primary">
            <mat-icon>domain</mat-icon> Manage Blocks
          </a>
        </mat-card-content>
      </mat-card>
    </div>
  `,
    styles: [`
    .admin-dash { display: flex; flex-direction: column; gap: 24px; }
    .admin-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(220px, 1fr)); gap: 20px; }
    .admin-card { border-radius: 12px !important; box-shadow: 0 4px 20px rgba(0,0,0,0.04) !important; }
    mat-card-content { display: flex; align-items: center; gap: 16px; padding: 16px !important; }
    .card-icon {
      width: 48px; height: 48px; border-radius: 10px;
      display: flex; align-items: center; justify-content: center; color: white;
    }
    .card-icon mat-icon { font-size: 24px; }
    .purple { background: #7c3aed; }
    .indigo { background: #4f46e5; }
    .teal { background: #0d9488; }
    .orange { background: #ea580c; }
    .card-body { display: flex; flex-direction: column; }
    .card-num { font-size: 26px; font-weight: 700; color: #1e293b; }
    .card-lbl { font-size: 13px; color: #64748b; font-weight: 500; }
    .quick-links-card { border-radius: 12px !important; box-shadow: 0 4px 20px rgba(0,0,0,0.04) !important; }
    .quick-links { display: flex; flex-wrap: wrap; gap: 12px; padding-top: 12px; }
    .quick-links a { display: flex; align-items: center; gap: 8px; }
  `],
    standalone: false
})
export class AdminDashboardComponent {}
