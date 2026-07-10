import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { ToastService } from '../../../../shared/services/toast.service';

@Component({
    selector: 'app-blocks',
    template: `
    <div class="locations-page">
      <app-page-header title="Training Blocks" subtitle="Manage classroom blocks and occupancy."></app-page-header>

      <div class="locations-grid">
        <mat-card class="panel-card form-panel">
          <mat-card-header>
            <mat-card-title>Add New Block</mat-card-title>
          </mat-card-header>
          <mat-card-content style="display: flex; flex-direction: column; gap: 16px; padding-top: 16px;">
            <mat-form-field appearance="outline" class="full-width">
              <mat-label>Block Name</mat-label>
              <input matInput [(ngModel)]="newBlock.name" placeholder="Block name" />
            </mat-form-field>
            <mat-form-field appearance="outline" class="full-width">
              <mat-label>Branch Location</mat-label>
              <mat-select [(value)]="newBlock.locationId">
                <mat-option *ngFor="let branch of branches" [value]="branch.id">{{ branch.name }} ({{ branch.city }})</mat-option>
              </mat-select>
            </mat-form-field>
            <mat-form-field appearance="outline" class="full-width">
              <mat-label>Total Seat Capacity</mat-label>
              <input matInput type="number" [(ngModel)]="newBlock.capacity" placeholder="Total capacity" />
            </mat-form-field>
            <button mat-raised-button color="primary" [disabled]="loading" (click)="addBlock()">Create Block</button>
          </mat-card-content>
        </mat-card>

        <mat-card class="panel-card table-panel">
          <mat-card-header>
            <mat-card-title>Configured Blocks</mat-card-title>
          </mat-card-header>
          <mat-card-content>
            <app-empty-state *ngIf="blocks.length === 0" icon="location_on" title="No blocks configured" subtitle="Add training blocks to support batch allocation."></app-empty-state>
            <div class="table-container" *ngIf="blocks.length > 0">
              <table mat-table [dataSource]="blocks">
                <ng-container matColumnDef="name">
                  <th mat-header-cell *matHeaderCellDef>Block</th>
                  <td mat-cell *matCellDef="let block">{{ block.name }}</td>
                </ng-container>
                <ng-container matColumnDef="branch">
                  <th mat-header-cell *matHeaderCellDef>Branch Location</th>
                  <td mat-cell *matCellDef="let block">{{ block.location?.name || 'N/A' }}</td>
                </ng-container>
                <ng-container matColumnDef="capacity">
                  <th mat-header-cell *matHeaderCellDef>Capacity</th>
                  <td mat-cell *matCellDef="let block">{{ block.capacity }}</td>
                </ng-container>
                <ng-container matColumnDef="vacancy">
                  <th mat-header-cell *matHeaderCellDef>Occupied Seats</th>
                  <td mat-cell *matCellDef="let block">{{ block.occupiedSeats }}</td>
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
export class BlocksComponent implements OnInit {
  blocks: any[] = [];
  branches: any[] = [];
  displayedColumns = ['name', 'branch', 'capacity', 'vacancy'];
  newBlock = {
    name: '',
    locationId: 0,
    capacity: 60
  };
  loading = false;

  constructor(private http: HttpClient, private toastService: ToastService) {}

  ngOnInit(): void {
    this.loadBranches();
    this.loadBlocks();
  }

  loadBranches(): void {
    this.http.get<any[]>('/api/locations').subscribe({
      next: list => this.branches = list || [],
      error: () => this.toastService.error('Failed to load branches.')
    });
  }

  loadBlocks(): void {
    this.http.get<any[]>('/api/training/blocks').subscribe({
      next: list => this.blocks = list || [],
      error: () => this.toastService.error('Failed to load training blocks.')
    });
  }

  addBlock(): void {
    if (!this.newBlock.name.trim() || !this.newBlock.locationId || !this.newBlock.capacity) {
      this.toastService.error('Block name, branch, and capacity are required.');
      return;
    }
    this.loading = true;
    this.http.post<any>('/api/training/blocks', this.newBlock).subscribe({
      next: block => {
        this.toastService.success('Block created successfully.');
        this.blocks = [block, ...this.blocks];
        this.newBlock = { name: '', locationId: 0, capacity: 60 };
        this.loading = false;
      },
      error: () => {
        this.toastService.error('Failed to create block.');
        this.loading = false;
      }
    });
  }
}
