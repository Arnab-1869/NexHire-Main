import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { ToastService } from '../../../shared/services/toast.service';
import { ROLE_DEFAULT_PERMISSIONS } from '../../../models/role-permission.model';
import { CurrentUserService } from '../../../core/auth/current-user.service';

@Component({
  selector: 'app-roles-mgmt',
  template: `
    <div class="roles-mgmt">
      <app-page-header title="Roles & Permissions Configuration" subtitle="Configure system roles and assign granular security permissions."></app-page-header>

      <mat-tab-group>
        <!-- TAB 1: Roles Directory -->
        <mat-tab label="System Roles">
          <div class="tab-content">
            <mat-card class="panel-card">
              <mat-card-header>
                <mat-card-title>Configured Roles</mat-card-title>
              </mat-card-header>
              <mat-card-content>
                <div class="table-container">
                  <table mat-table [dataSource]="roles">
                    <ng-container matColumnDef="name">
                      <th mat-header-cell *matHeaderCellDef>Role</th>
                      <td mat-cell *matCellDef="let r">
                        <span class="role-badge" [class]="getRoleClass(r.name)">{{ r.name }}</span>
                      </td>
                    </ng-container>
                    <ng-container matColumnDef="description">
                      <th mat-header-cell *matHeaderCellDef>Description</th>
                      <td mat-cell *matCellDef="let r">{{ r.description }}</td>
                    </ng-container>
                    <tr mat-header-row *matHeaderRowDef="['name', 'description']"></tr>
                    <tr mat-row *matRowDef="let row; columns: ['name', 'description']"></tr>
                  </table>
                </div>
              </mat-card-content>
            </mat-card>
          </div>
        </mat-tab>

        <!-- TAB 2: Permissions Matrix -->
        <mat-tab label="Role Permissions Mapping">
          <div class="tab-content">
            <mat-card class="panel-card">
              <mat-card-header>
                <mat-card-title>Permissions Configuration Matrix</mat-card-title>
              </mat-card-header>
              <mat-card-content>
                <p style="font-size: 14px; color: #64748b; margin-bottom: 20px;">
                  Granular permission switches. Changes are applied locally for the current session.
                </p>

                <div class="matrix-container">
                  <table class="matrix-table">
                    <thead>
                      <tr>
                        <th>Security Permission</th>
                        <th *ngFor="let role of roles">{{ role.name }}</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr *ngFor="let perm of allPermissions">
                        <td class="perm-name">
                          <code>{{ perm }}</code>
                        </td>
                        <td *ngFor="let role of roles" class="checkbox-cell">
                          <mat-checkbox 
                            [checked]="hasPermission(role.name, perm)"
                            (change)="togglePermission(role.name, perm)">
                          </mat-checkbox>
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
                
                <div style="margin-top: 24px;">
                  <button mat-raised-button color="primary" (click)="savePermissions()">
                    Save Mapping Configuration
                  </button>
                </div>
              </mat-card-content>
            </mat-card>
          </div>
        </mat-tab>
      </mat-tab-group>
    </div>
  `,
  styles: [
    `
      .roles-mgmt {
        display: flex;
        flex-direction: column;
        gap: 24px;
      }
      .tab-content {
        padding: 24px 0;
      }
      .panel-card {
        border-radius: 12px !important;
        box-shadow: 0 4px 20px rgba(0, 0, 0, 0.04) !important;
        padding: 16px;
      }
      .table-container {
        width: 100%;
        overflow-x: auto;
        margin-top: 16px;
      }
      table {
        width: 100%;
      }
      .role-badge {
        padding: 4px 10px;
        border-radius: 20px;
        font-size: 12px;
        font-weight: 600;
        display: inline-block;
      }
      .role-admin { background: #f3e8ff; color: #7c3aed; }
      .role-hr { background: #dbeafe; color: #1d4ed8; }
      .role-rmg { background: #ccfbf1; color: #0f766e; }
      .role-candidate { background: #f1f5f9; color: #475569; }

      .matrix-container {
        width: 100%;
        overflow-x: auto;
        border: 1px solid #cbd5e1;
        border-radius: 8px;
      }
      .matrix-table {
        width: 100%;
        border-collapse: collapse;
        text-align: left;
      }
      .matrix-table th, .matrix-table td {
        padding: 12px 16px;
        border-bottom: 1px solid #e2e8f0;
      }
      .matrix-table th {
        background: #f8fafc;
        font-weight: 600;
        color: #475569;
      }
      .perm-name code {
        font-family: monospace;
        font-size: 13px;
        color: #0f172a;
        background: #f1f5f9;
        padding: 2px 6px;
        border-radius: 4px;
      }
      .checkbox-cell {
        text-align: center;
      }
    `
  ],
  standalone: false
})
export class RolesComponent implements OnInit {
  roles: any[] = [];
  allPermissions = [
    'VIEW_USERS',
    'CREATE_USER',
    'EDIT_USER',
    'DELETE_USER',
    'MANAGE_ROLES',
    'VIEW_PROJECTS',
    'MANAGE_PROJECTS',
    'VIEW_ASSETS',
    'MANAGE_PERMISSIONS',
    'VIEW_ACTIVITY_LOGS',
    'VIEW_APPLICATIONS',
    'UPDATE_APPLICATION_STATUS',
    'VIEW_ASSESSMENTS',
    'ASSIGN_ASSESSMENT',
    'VIEW_SELECTED_CANDIDATES',
    'VIEW_OFFERS',
    'GENERATE_OFFER',
    'VIEW_BGV',
    'UPDATE_BGV_STATUS',
    'VIEW_TRAINEES',
    'VIEW_LOCATIONS',
    'ALLOCATE_PROJECT',
    'VIEW_JOBS',
    'APPLY_JOB',
    'VIEW_OWN_APPLICATIONS',
    'VIEW_OWN_OFFERS',
    'VIEW_OWN_TRAINING'
  ];

  constructor(
    private http: HttpClient,
    private toast: ToastService,
    private currentUserService: CurrentUserService
  ) {}

  ngOnInit(): void {
    this.loadRoles();
  }

  loadRoles(): void {
    this.http.get<any[]>('/api/roles').subscribe({
      next: data => this.roles = data,
      error: () => this.toast.error('Failed to load system roles.')
    });
  }

  getRoleClass(role: string): string {
    switch (role?.toUpperCase()) {
      case 'ADMIN': return 'role-admin';
      case 'HR': return 'role-hr';
      case 'RMG': return 'role-rmg';
      default: return 'role-candidate';
    }
  }

  hasPermission(role: string, permission: string): boolean {
    const list = ROLE_DEFAULT_PERMISSIONS[role?.toUpperCase()];
    return list ? list.includes(permission) || list.includes('*') : false;
  }

  togglePermission(role: string, permission: string): void {
    const rKey = role?.toUpperCase();
    if (!ROLE_DEFAULT_PERMISSIONS[rKey]) {
      ROLE_DEFAULT_PERMISSIONS[rKey] = [];
    }
    const list = ROLE_DEFAULT_PERMISSIONS[rKey];
    const index = list.indexOf(permission);
    if (index > -1) {
      list.splice(index, 1);
    } else {
      list.push(permission);
    }
  }

  savePermissions(): void {
    const currentUser = this.currentUserService.getUser();
    if (currentUser) {
      currentUser.permissions = ROLE_DEFAULT_PERMISSIONS[currentUser.role?.toUpperCase()] ?? [];
      this.currentUserService.setUser(currentUser);
    }
    this.toast.success('Role permissions configurations saved successfully and applied to active session.');
  }
}
