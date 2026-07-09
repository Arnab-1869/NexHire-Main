import { Component, OnInit } from '@angular/core';
import { TrainingService } from '../../../../services/training.service';
import { ToastService } from '../../../../shared/services/toast.service';
import { City, CreateCityRequest } from '../../../../models/location.model';

@Component({
    selector: 'app-cities',
    template: `
    <div class="locations-page">
      <app-page-header title="Cities" subtitle="Manage city location budgets and coverage."></app-page-header>

      <div class="locations-grid">
        <mat-card class="panel-card form-panel">
          <mat-card-header>
            <mat-card-title>Add New City</mat-card-title>
          </mat-card-header>
          <mat-card-content>
            <mat-form-field appearance="outline" class="full-width">
              <mat-label>City Name</mat-label>
              <input matInput [(ngModel)]="newCity.cityName" placeholder="Enter city name" />
            </mat-form-field>
            <mat-form-field appearance="outline" class="full-width">
              <mat-label>State</mat-label>
              <input matInput [(ngModel)]="newCity.state" placeholder="State" />
            </mat-form-field>
            <mat-form-field appearance="outline" class="full-width">
              <mat-label>Country</mat-label>
              <input matInput [(ngModel)]="newCity.country" placeholder="Country" />
            </mat-form-field>
            <mat-form-field appearance="outline" class="full-width">
              <mat-label>Budget</mat-label>
              <input matInput type="number" [(ngModel)]="newCity.totalBudget" placeholder="Total budget" />
            </mat-form-field>
            <button mat-raised-button color="primary" (click)="addCity()">Add City</button>
          </mat-card-content>
        </mat-card>

        <mat-card class="panel-card table-panel">
          <mat-card-header>
            <mat-card-title>Existing Cities</mat-card-title>
          </mat-card-header>
          <mat-card-content>
            <app-empty-state *ngIf="cities.length === 0" icon="location_city" title="No cities configured" subtitle="Add a city to manage training budgets."></app-empty-state>
            <div class="table-container" *ngIf="cities.length > 0">
              <table mat-table [dataSource]="cities">
                <ng-container matColumnDef="name">
                  <th mat-header-cell *matHeaderCellDef>City</th>
                  <td mat-cell *matCellDef="let city">{{ city.cityName }}</td>
                </ng-container>
                <ng-container matColumnDef="state">
                  <th mat-header-cell *matHeaderCellDef>State</th>
                  <td mat-cell *matCellDef="let city">{{ city.state }}</td>
                </ng-container>
                <ng-container matColumnDef="country">
                  <th mat-header-cell *matHeaderCellDef>Country</th>
                  <td mat-cell *matCellDef="let city">{{ city.country }}</td>
                </ng-container>
                <ng-container matColumnDef="budget">
                  <th mat-header-cell *matHeaderCellDef>Budget</th>
                  <td mat-cell *matCellDef="let city">₹{{ city.availableBudget | number }}</td>
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
    .locations-page {
      display: flex;
      flex-direction: column;
      gap: 24px;
    }
    .locations-grid {
      display: grid;
      grid-template-columns: 360px 1fr;
      gap: 24px;
    }
    @media (max-width: 992px) {
      .locations-grid {
        grid-template-columns: 1fr;
      }
    }
    .panel-card {
      border-radius: 12px !important;
      box-shadow: 0 4px 20px rgba(0,0,0,0.04) !important;
      padding: 16px;
    }
    .full-width {
      width: 100%;
    }
    .table-container {
      margin-top: 16px;
      overflow-x: auto;
    }
    table {
      width: 100%;
    }
  `],
    standalone: false
})
export class CitiesComponent implements OnInit {
  cities: City[] = [];
  displayedColumns = ['name', 'state', 'country', 'budget'];
  newCity: Partial<CreateCityRequest> = {
    cityName: '',
    state: '',
    country: '',
    totalBudget: 0
  };

  constructor(
    private trainingService: TrainingService,
    private toastService: ToastService
  ) {}

  ngOnInit(): void {
    this.loadCities();
  }

  loadCities(): void {
    this.trainingService.getCities().subscribe(list => this.cities = list || []);
  }

  addCity(): void {
    if (!this.newCity.cityName?.trim()) {
      this.toastService.error('City name is required.');
      return;
    }
    this.trainingService.createCity(this.newCity as CreateCityRequest).subscribe({
      next: city => {
        this.toastService.success('City added successfully.');
        this.cities = [city, ...this.cities];
        this.newCity = { cityName: '', state: '', country: '', totalBudget: 0 };
      },
      error: () => this.toastService.error('Failed to add city.')
    });
  }
}
