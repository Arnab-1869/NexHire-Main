import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { ToastService } from '../../../../shared/services/toast.service';

@Component({
    selector: 'app-branches',
    template: `
    <div class="locations-page">
      <app-page-header title="Branches Management" subtitle="Create and monitor active branch locations in the system."></app-page-header>

      <div class="locations-grid">
        <mat-card class="panel-card form-panel">
          <mat-card-header>
            <mat-card-title>Create New Branch</mat-card-title>
          </mat-card-header>
          <mat-card-content style="display: flex; flex-direction: column; gap: 16px; padding-top: 16px;">
            <mat-form-field appearance="outline" class="full-width">
              <mat-label>Branch Name</mat-label>
              <input matInput [(ngModel)]="newBranch.name" placeholder="e.g. BTM Layout Branch" />
            </mat-form-field>
            <mat-form-field appearance="outline" class="full-width">
              <mat-label>City</mat-label>
              <input matInput [(ngModel)]="newBranch.city" placeholder="e.g. Bangalore" />
            </mat-form-field>
            <mat-form-field appearance="outline" class="full-width">
              <mat-label>Classroom Seats Capacity</mat-label>
              <input matInput type="number" [(ngModel)]="newBranch.seatsTotalSeats" placeholder="e.g. 60" />
            </mat-form-field>
            <button mat-raised-button color="primary" [disabled]="loading" (click)="addBranch()">Create Branch</button>
          </mat-card-content>
        </mat-card>

        <mat-card class="panel-card table-panel">
          <mat-card-header>
            <mat-card-title>Configured Branches</mat-card-title>
          </mat-card-header>
          <mat-card-content>
            <app-empty-state *ngIf="branches.length === 0" icon="store" title="No branches configured" subtitle="Add branch locations to get started."></app-empty-state>
            <div class="table-container" *ngIf="branches.length > 0">
              <table mat-table [dataSource]="branches">
                <ng-container matColumnDef="name">
                  <th mat-header-cell *matHeaderCellDef>Branch</th>
                  <td mat-cell *matCellDef="let br">{{ br.name }}</td>
                </ng-container>
                <ng-container matColumnDef="city">
                  <th mat-header-cell *matHeaderCellDef>City</th>
                  <td mat-cell *matCellDef="let br">{{ br.city }}</td>
                </ng-container>
                <ng-container matColumnDef="seats">
                  <th mat-header-cell *matHeaderCellDef>Classroom Seats Capacity</th>
                  <td mat-cell *matCellDef="let br">{{ br.seatsTotal }}</td>
                </ng-container>
                <tr mat-header-row *matHeaderRowDef="displayedColumns"></tr>
                <tr mat-row *matRowDef="let row; columns: displayedColumns;"></tr>
              </table>
            </div>
          </mat-card-content>
        </mat-card>
      </div>
    </div>
  `,
  styles: [`
    .locations-page { display: flex; flex-direction: column; gap: 24px; }
    .locations-grid { display: grid; grid-template-columns: 360px 1fr; gap: 24px; }
    @media (max-width: 992px) { .locations-grid { grid-template-columns: 1fr; } }
    .panel-card { border-radius: 12px !important; box-shadow: 0 4px 20px rgba(0,0,0,0.04) !important; padding: 16px; }
    .full-width { width: 100%; }
    .table-container { margin-top: 16px; overflow-x: auto; }
    table { width: 100%; }
  `],
  standalone: false
})
export class BranchesComponent implements OnInit {
  branches: any[] = [];
  displayedColumns = ['name', 'city', 'seats'];
  newBranch = {
    name: '',
    city: '',
    budgetAmount: 5000000,
    budgetTotalSlots: 60,
    seatsTotalSeats: 60
  };
  loading = false;

  constructor(private http: HttpClient, private toastService: ToastService) {}

  ngOnInit(): void {
    this.loadBranches();
  }

  loadBranches(): void {
    this.http.get<any[]>('/api/locations').subscribe({
      next: list => this.branches = list || [],
      error: () => this.toastService.error('Failed to load branches.')
    });
  }

  addBranch(): void {
    if (!this.newBranch.name.trim() || !this.newBranch.city.trim()) {
      this.toastService.error('Branch name and city are required.');
      return;
    }
    this.loading = true;
    this.http.post<any>('/api/locations', this.newBranch).subscribe({
      next: created => {
        this.toastService.success('Branch created successfully.');
        this.branches = [created, ...this.branches];
        this.newBranch = { name: '', city: '', budgetAmount: 5000000, budgetTotalSlots: 60, seatsTotalSeats: 60 };
        this.loading = false;
      },
      error: () => {
        this.toastService.error('Failed to create branch.');
        this.loading = false;
      }
    });
  }
}
