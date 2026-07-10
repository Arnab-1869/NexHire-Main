import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { ToastService } from '../../../../shared/services/toast.service';
import { API_ENDPOINTS } from '../../../../config/api-endpoints';

@Component({
    selector: 'app-cities',
    template: `
    <div class="locations-page">
      <app-page-header title="Locations & Budgets" subtitle="Manage city branch locations, annual training budgets, and seats."></app-page-header>

      <div class="locations-grid">
        <mat-card class="panel-card form-panel">
          <mat-card-header>
            <mat-card-title>Add New Location</mat-card-title>
          </mat-card-header>
          <mat-card-content style="display: flex; flex-direction: column; gap: 16px; padding-top: 16px;">
            <mat-form-field appearance="outline" class="full-width">
              <mat-label>Branch Name</mat-label>
              <input matInput [(ngModel)]="newLocation.name" placeholder="e.g. BTM Layout Branch" />
            </mat-form-field>
            <mat-form-field appearance="outline" class="full-width">
              <mat-label>City</mat-label>
              <input matInput [(ngModel)]="newLocation.city" placeholder="e.g. Bangalore" />
            </mat-form-field>
            <mat-form-field appearance="outline" class="full-width">
              <mat-label>Annual Monetary Budget (₹)</mat-label>
              <input matInput type="number" [(ngModel)]="newLocation.budgetAmount" placeholder="e.g. 5000000" />
            </mat-form-field>
            <mat-form-field appearance="outline" class="full-width">
              <mat-label>Budget Capacity Slots</mat-label>
              <input matInput type="number" [(ngModel)]="newLocation.budgetTotalSlots" placeholder="e.g. 60" />
            </mat-form-field>
            <mat-form-field appearance="outline" class="full-width">
              <mat-label>Classroom Seats Capacity</mat-label>
              <input matInput type="number" [(ngModel)]="newLocation.seatsTotalSeats" placeholder="e.g. 60" />
            </mat-form-field>
            <button mat-raised-button color="primary" [disabled]="loading" (click)="addLocation()">Create Location</button>
          </mat-card-content>
        </mat-card>

        <mat-card class="panel-card table-panel">
          <mat-card-header>
            <mat-card-title>Configured Locations</mat-card-title>
          </mat-card-header>
          <mat-card-content>
            <app-empty-state *ngIf="locations.length === 0" icon="location_city" title="No locations configured" subtitle="Add a location to manage budgets."></app-empty-state>
            <div class="table-container" *ngIf="locations.length > 0">
              <table mat-table [dataSource]="locations">
                <ng-container matColumnDef="name">
                  <th mat-header-cell *matHeaderCellDef>Branch Location</th>
                  <td mat-cell *matCellDef="let loc">{{ loc.name }}</td>
                </ng-container>
                <ng-container matColumnDef="city">
                  <th mat-header-cell *matHeaderCellDef>City</th>
                  <td mat-cell *matCellDef="let loc">{{ loc.city }}</td>
                </ng-container>
                <ng-container matColumnDef="budgetAmount">
                  <th mat-header-cell *matHeaderCellDef>Monetary Budget</th>
                  <td mat-cell *matCellDef="let loc">₹{{ loc.budgetAmount | number }}</td>
                </ng-container>
                <ng-container matColumnDef="budgetSlots">
                  <th mat-header-cell *matHeaderCellDef>Budget Slots</th>
                  <td mat-cell *matCellDef="let loc">{{ loc.budgetUsed }} / {{ loc.budgetTotal }}</td>
                </ng-container>
                <ng-container matColumnDef="seats">
                  <th mat-header-cell *matHeaderCellDef>Training Seats</th>
                  <td mat-cell *matCellDef="let loc">{{ loc.seatsOccupied }} / {{ loc.seatsTotal }}</td>
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
export class CitiesComponent implements OnInit {
  locations: any[] = [];
  displayedColumns = ['name', 'city', 'budgetAmount', 'budgetSlots', 'seats'];
  newLocation = {
    name: '',
    city: '',
    budgetAmount: 5000000,
    budgetTotalSlots: 60,
    seatsTotalSeats: 60
  };
  loading = false;

  constructor(private http: HttpClient, private toastService: ToastService) {}

  ngOnInit(): void {
    this.loadLocations();
  }

  loadLocations(): void {
    this.http.get<any[]>(API_ENDPOINTS.LOCATIONS.BASE).subscribe({
      next: list => this.locations = list || [],
      error: () => this.toastService.error('Failed to load locations.')
    });
  }

  addLocation(): void {
    if (!this.newLocation.name.trim() || !this.newLocation.city.trim()) {
      this.toastService.error('Branch name and city are required.');
      return;
    }
    this.loading = true;
    this.http.post<any>(API_ENDPOINTS.LOCATIONS.BASE, this.newLocation).subscribe({
      next: created => {
        this.toastService.success('Location created successfully.');
        this.locations = [created, ...this.locations];
        this.newLocation = { name: '', city: '', budgetAmount: 5000000, budgetTotalSlots: 60, seatsTotalSeats: 60 };
        this.loading = false;
      },
      error: () => {
        this.toastService.error('Failed to create location.');
        this.loading = false;
      }
    });
  }
}
