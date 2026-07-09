import { Component, OnInit } from '@angular/core';
import {
  AdminUserService,
  AdminUser,
} from '../../../services/admin-user.service';
import { ToastService } from '../../../shared/services/toast.service';

@Component({
  selector: 'app-user-management',
  template: `
    <div class="user-management-container">
      <app-page-header
        title="User Management"
        subtitle="Manage system users, update roles, and deactivate accounts."
      ></app-page-header>

      <mat-card class="table-card">
        <mat-card-content>
          <div class="table-container" *ngIf="users.length > 0">
            <table mat-table [dataSource]="users">
              <ng-container matColumnDef="user">
                <th mat-header-cell *matHeaderCellDef>User</th>
                <td mat-cell *matCellDef="let u">
                  <div class="user-meta">
                    <span class="name">{{ u.name }}</span>
                    <span class="email">{{ u.email }}</span>
                  </div>
                </td>
              </ng-container>

              <ng-container matColumnDef="lifecycle">
                <th mat-header-cell *matHeaderCellDef>Lifecycle</th>
                <td mat-cell *matCellDef="let u">
                  {{ u.lifecycleStatus || '—' }}
                </td>
              </ng-container>

              <ng-container matColumnDef="role">
                <th mat-header-cell *matHeaderCellDef>Role</th>
                <td mat-cell *matCellDef="let u">
                  <button
                    mat-button
                    [matMenuTriggerFor]="roleMenu"
                    [ngClass]="getRoleClass(u.role)"
                    class="role-btn"
                  >
                    {{ u.role }} <mat-icon>arrow_drop_down</mat-icon>
                  </button>
                  <mat-menu #roleMenu="matMenu">
                    <button mat-menu-item (click)="changeRole(u, 'EMPLOYEE')">
                      Employee
                    </button>
                    <button mat-menu-item (click)="changeRole(u, 'HR')">
                      HR
                    </button>
                    <button mat-menu-item (click)="changeRole(u, 'RMG')">
                      RMG
                    </button>
                    <button mat-menu-item (click)="changeRole(u, 'ADMIN')">
                      Admin
                    </button>
                  </mat-menu>
                </td>
              </ng-container>

              <ng-container matColumnDef="status">
                <th mat-header-cell *matHeaderCellDef>Status</th>
                <td mat-cell *matCellDef="let u">
                  <span
                    class="status-badge"
                    [class.active]="u.active"
                    [class.restricted]="!u.active"
                  >
                    {{ u.active ? 'Active' : 'Deactivated' }}
                  </span>
                </td>
              </ng-container>

              <ng-container matColumnDef="actions">
                <th mat-header-cell *matHeaderCellDef align="end">Actions</th>
                <td mat-cell *matCellDef="let u" align="end">
                  <button
                    mat-stroked-button
                    color="warn"
                    (click)="deactivate(u)"
                    [disabled]="!u.active"
                  >
                    Deactivate
                  </button>
                </td>
              </ng-container>

              <tr mat-header-row *matHeaderRowDef="displayedColumns"></tr>
              <tr mat-row *matRowDef="let row; columns: displayedColumns"></tr>
            </table>
          </div>

          <app-empty-state
            *ngIf="users.length === 0"
            icon="people_outline"
            title="No users found"
          ></app-empty-state>
        </mat-card-content>
      </mat-card>
    </div>
  `,
  styles: [
    `
      .user-management-container {
        display: flex;
        flex-direction: column;
        gap: 24px;
      }
      .table-card {
        border-radius: 12px !important;
        box-shadow: 0 4px 20px rgba(0, 0, 0, 0.04) !important;
      }
      .table-container {
        width: 100%;
        overflow-x: auto;
      }
      table {
        width: 100%;
      }
      .user-meta {
        display: flex;
        flex-direction: column;
        padding: 8px 0;
      }
      .user-meta .name {
        font-weight: 600;
        color: #1e293b;
      }
      .user-meta .email {
        font-size: 12px;
        color: #64748b;
      }
      .status-badge {
        padding: 4px 10px;
        border-radius: 20px;
        font-size: 12px;
        font-weight: 600;
      }
      .status-badge.active {
        background: #dcfce7;
        color: #15803d;
      }
      .status-badge.restricted {
        background: #fee2e2;
        color: #dc2626;
      }
      .role-btn {
        border-radius: 20px !important;
        font-size: 12px !important;
        height: 32px !important;
        line-height: 32px !important;
        padding: 0 8px 0 16px !important;
      }
      .role-admin {
        background-color: #f3e8ff !important;
        color: #7c3aed !important;
      }
      .role-hr {
        background-color: #dbeafe !important;
        color: #1d4ed8 !important;
      }
      .role-rmg {
        background-color: #ccfbf1 !important;
        color: #0f766e !important;
      }
      .role-candidate {
        background-color: #f1f5f9 !important;
        color: #475569 !important;
      }
    `,
  ],
  standalone: false,
})
export class UserManagementComponent implements OnInit {
  users: AdminUser[] = [];
  displayedColumns: string[] = [
    'user',
    'lifecycle',
    'role',
    'status',
    'actions',
  ];

  constructor(
    private adminUserService: AdminUserService,
    private toast: ToastService,
  ) {}

  ngOnInit(): void {
    this.load();
  }

  load(): void {
    this.adminUserService
      .getAllUsers()
      .subscribe((data) => (this.users = data));
  }

  getRoleClass(role: string): string {
    switch (role) {
      case 'ADMIN':
        return 'role-admin';
      case 'HR':
        return 'role-hr';
      case 'RMG':
        return 'role-rmg';
      default:
        return 'role-candidate';
    }
  }

  changeRole(user: AdminUser, newRole: string): void {
    if (user.role === newRole) return;
    this.adminUserService.updateRole(user.id, newRole).subscribe({
      next: (updated) => {
        user.role = updated.role;
        this.toast.success(`Role updated to ${updated.role}`);
      },
      error: (e) =>
        this.toast.error(e.error?.message || 'Failed to update role'),
    });
  }

  deactivate(user: AdminUser): void {
    this.adminUserService.deactivate(user.id).subscribe({
      next: () => {
        user.active = false;
        this.toast.success('User deactivated');
      },
      error: (e) =>
        this.toast.error(e.error?.message || 'Failed to deactivate user'),
    });
  }
}
