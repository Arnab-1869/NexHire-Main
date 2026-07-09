import { Component, OnInit } from '@angular/core';
import {
  AssetAdminService,
  AdminAsset,
} from '../../services/asset-admin.service';
import { AdminUserService, AdminUser } from '../../services/admin-user.service';
import { ToastService } from '../../shared/services/toast.service';

@Component({
  selector: 'app-assets-mgmt',
  template: `
    <div class="assets-mgmt">
      <app-page-header
        title="Asset Inventory"
        subtitle="Track company assets and assign them to users"
      >
        <button
          mat-raised-button
          color="primary"
          (click)="showCreateForm = !showCreateForm"
        >
          {{ showCreateForm ? 'Hide Form' : 'Add New Asset' }}
        </button>
      </app-page-header>

      <mat-card class="form-card" *ngIf="showCreateForm">
        <mat-card-content class="form-row">
          <mat-form-field appearance="outline" class="form-item">
            <mat-label>Asset Name</mat-label>
            <input
              matInput
              [(ngModel)]="newName"
              placeholder="e.g. Dell Latitude 5540"
            />
          </mat-form-field>
          <mat-form-field appearance="outline" class="form-item">
            <mat-label>Type</mat-label>
            <mat-select [(ngModel)]="newType">
              <mat-option value="LAPTOP">Laptop</mat-option>
              <mat-option value="MONITOR">Monitor</mat-option>
              <mat-option value="HEADSET">Headset</mat-option>
              <mat-option value="ID_CARD">ID Card</mat-option>
              <mat-option value="MOBILE">Mobile</mat-option>
            </mat-select>
          </mat-form-field>
          <mat-form-field appearance="outline" class="form-item">
            <mat-label>Serial Number</mat-label>
            <input
              matInput
              [(ngModel)]="newSerial"
              placeholder="e.g. DL-5540-0003"
            />
          </mat-form-field>
          <button
            mat-raised-button
            color="accent"
            class="submit-btn"
            [disabled]="!newName || !newType"
            (click)="create()"
          >
            Save Asset
          </button>
        </mat-card-content>
      </mat-card>

      <mat-card class="table-card">
        <mat-card-content>
          <app-empty-state
            *ngIf="assets.length === 0"
            icon="computer"
            title="No assets"
            subtitle="Add assets to begin assigning them."
          ></app-empty-state>

          <div class="table-container" *ngIf="assets.length > 0">
            <table mat-table [dataSource]="assets">
              <ng-container matColumnDef="name">
                <th mat-header-cell *matHeaderCellDef>Asset</th>
                <td mat-cell *matCellDef="let a">
                  <div class="asset-meta">
                    <span class="name">{{ a.name }}</span>
                    <span class="serial">{{ a.serialNumber }}</span>
                  </div>
                </td>
              </ng-container>
              <ng-container matColumnDef="type">
                <th mat-header-cell *matHeaderCellDef>Type</th>
                <td mat-cell *matCellDef="let a">{{ a.type }}</td>
              </ng-container>
              <ng-container matColumnDef="status">
                <th mat-header-cell *matHeaderCellDef>Status</th>
                <td mat-cell *matCellDef="let a">
                  <span class="badge" [class.assigned]="a.assigned">
                    {{
                      a.assigned
                        ? 'Assigned → ' + a.assignedToName
                        : 'Available'
                    }}
                  </span>
                </td>
              </ng-container>
              <ng-container matColumnDef="actions">
                <th mat-header-cell *matHeaderCellDef align="end">Assign</th>
                <td mat-cell *matCellDef="let a" align="end">
                  <ng-container *ngIf="!a.assigned">
                    <mat-form-field appearance="outline" class="user-select">
                      <mat-label>User</mat-label>
                      <mat-select [(ngModel)]="selectedUser[a.id]">
                        <mat-option *ngFor="let u of users" [value]="u.id"
                          >{{ u.name }} ({{ u.role }})</mat-option
                        >
                      </mat-select>
                    </mat-form-field>
                    <button
                      mat-flat-button
                      color="primary"
                      class="row-btn"
                      [disabled]="!selectedUser[a.id]"
                      (click)="assign(a)"
                    >
                      Assign
                    </button>
                  </ng-container>
                  <span *ngIf="a.assigned" class="muted">In use</span>
                </td>
              </ng-container>

              <tr mat-header-row *matHeaderRowDef="displayedColumns"></tr>
              <tr mat-row *matRowDef="let row; columns: displayedColumns"></tr>
            </table>
          </div>
        </mat-card-content>
      </mat-card>
    </div>
  `,
  styles: [
    `
      .assets-mgmt {
        display: flex;
        flex-direction: column;
        gap: 24px;
      }
      .form-card,
      .table-card {
        border-radius: 12px !important;
        box-shadow: 0 4px 20px rgba(0, 0, 0, 0.04) !important;
      }
      .form-row {
        display: flex;
        gap: 16px;
        align-items: center;
        flex-wrap: wrap;
        padding: 8px 0;
      }
      .form-item {
        flex: 1;
        min-width: 200px;
      }
      .submit-btn {
        height: 48px;
      }
      table {
        width: 100%;
      }
      .asset-meta {
        display: flex;
        flex-direction: column;
      }
      .asset-meta .name {
        font-weight: 600;
        color: #1e293b;
      }
      .asset-meta .serial {
        font-size: 11px;
        color: #64748b;
      }
      .badge {
        padding: 4px 10px;
        border-radius: 20px;
        font-size: 12px;
        font-weight: 600;
        background: #dcfce7;
        color: #15803d;
      }
      .badge.assigned {
        background: #f3e8ff;
        color: #7c3aed;
      }
      .user-select {
        width: 200px;
        margin-right: 8px;
      }
      .row-btn {
        height: 40px;
      }
      .muted {
        color: #94a3b8;
        font-size: 12px;
      }
    `,
  ],
  standalone: false,
})
export class AssetsManagementComponent implements OnInit {
  assets: AdminAsset[] = [];
  users: AdminUser[] = [];
  displayedColumns = ['name', 'type', 'status', 'actions'];
  selectedUser: Record<number, number> = {};

  showCreateForm = false;
  newName = '';
  newType = '';
  newSerial = '';

  constructor(
    private assetService: AssetAdminService,
    private userService: AdminUserService,
    private toast: ToastService,
  ) {}

  ngOnInit(): void {
    this.load();
    this.userService.getAllUsers().subscribe((u) => (this.users = u));
  }

  load(): void {
    this.assetService.getAllAssets().subscribe((list) => (this.assets = list));
  }

  create(): void {
    this.assetService
      .createAsset(this.newName, this.newType, this.newSerial)
      .subscribe({
        next: () => {
          this.toast.success('Asset created');
          this.newName = '';
          this.newType = '';
          this.newSerial = '';
          this.showCreateForm = false;
          this.load();
        },
        error: (e) =>
          this.toast.error(e.error?.message || 'Failed to create asset'),
      });
  }

  assign(a: AdminAsset): void {
    const userId = this.selectedUser[a.id];
    if (!userId) return;
    this.assetService.assign(a.id, userId).subscribe({
      next: () => {
        this.toast.success('Asset assigned');
        this.load();
      },
      error: (e) =>
        this.toast.error(e.error?.message || 'Failed to assign asset'),
    });
  }
}
