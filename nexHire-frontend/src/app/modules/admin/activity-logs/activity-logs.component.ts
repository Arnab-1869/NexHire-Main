import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { API_ENDPOINTS } from '../../../config/api-endpoints';

interface ActivityLog {
  id: number;
  userId: number;
  userName: string;
  actionType: string;
  description: string;
  timestamp: string;
}

@Component({
  selector: 'app-activity-logs',
  template: `
    <div class="activity-logs">
      <app-page-header
        title="Activity Logs"
        subtitle="Audit trail of significant system actions"
      ></app-page-header>

      <mat-card class="table-card">
        <mat-card-content>
          <app-empty-state
            *ngIf="logs.length === 0"
            icon="history"
            title="No activity yet"
            subtitle="Significant actions will appear here."
          ></app-empty-state>

          <div class="table-container" *ngIf="logs.length > 0">
            <table mat-table [dataSource]="logs">
              <ng-container matColumnDef="timestamp">
                <th mat-header-cell *matHeaderCellDef>When</th>
                <td mat-cell *matCellDef="let l">
                  {{ l.timestamp | date: 'medium' }}
                </td>
              </ng-container>
              <ng-container matColumnDef="user">
                <th mat-header-cell *matHeaderCellDef>User</th>
                <td mat-cell *matCellDef="let l">{{ l.userName }}</td>
              </ng-container>
              <ng-container matColumnDef="action">
                <th mat-header-cell *matHeaderCellDef>Action</th>
                <td mat-cell *matCellDef="let l">
                  <span class="chip">{{ l.actionType }}</span>
                </td>
              </ng-container>
              <ng-container matColumnDef="description">
                <th mat-header-cell *matHeaderCellDef>Description</th>
                <td mat-cell *matCellDef="let l">{{ l.description }}</td>
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
      .activity-logs {
        display: flex;
        flex-direction: column;
        gap: 24px;
      }
      .table-card {
        border-radius: 12px !important;
        box-shadow: 0 4px 20px rgba(0, 0, 0, 0.04) !important;
      }
      table {
        width: 100%;
      }
      .chip {
        background: #eef2ff;
        color: #4338ca;
        padding: 3px 10px;
        border-radius: 12px;
        font-size: 11px;
        font-weight: 600;
      }
    `,
  ],
  standalone: false,
})
export class ActivityLogsComponent implements OnInit {
  logs: ActivityLog[] = [];
  displayedColumns = ['timestamp', 'user', 'action', 'description'];

  constructor(private http: HttpClient) {}

  ngOnInit(): void {
    this.http.get<ActivityLog[]>(API_ENDPOINTS.ACTIVITY_LOGS.BASE).subscribe({
      next: (list) => (this.logs = list || []),
      error: () => (this.logs = []),
    });
  }
}
