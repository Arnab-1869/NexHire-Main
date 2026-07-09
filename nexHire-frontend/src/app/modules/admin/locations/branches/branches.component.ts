import { Component, OnInit } from '@angular/core';
import { TrainingService } from '../../../../services/training.service';
import { ToastService } from '../../../../shared/services/toast.service';
import { Branch, City, CreateBranchRequest } from '../../../../models/location.model';

@Component({
    selector: 'app-branches',
    template: `
    <div class="locations-page">
      <app-page-header title="Branches" subtitle="Manage branch locations across cities."></app-page-header>

      <div class="locations-grid">
        <mat-card class="panel-card form-panel">
          <mat-card-header>
            <mat-card-title>Add New Branch</mat-card-title>
          </mat-card-header>
          <mat-card-content>
            <mat-form-field appearance="outline" class="full-width">
              <mat-label>Branch Name</mat-label>
              <input matInput [(ngModel)]="newBranch.branchName" placeholder="Branch name" />
            </mat-form-field>
            <mat-form-field appearance="outline" class="full-width">
              <mat-label>City</mat-label>
              <mat-select [(value)]="newBranch.cityId">
                <mat-option *ngFor="let city of cities" [value]="city.cityId">{{ city.cityName }}</mat-option>
              </mat-select>
            </mat-form-field>
            <mat-form-field appearance="outline" class="full-width">
              <mat-label>Address</mat-label>
              <input matInput [(ngModel)]="newBranch.address" placeholder="Address" />
            </mat-form-field>
            <button mat-raised-button color="primary" (click)="addBranch()">Add Branch</button>
          </mat-card-content>
        </mat-card>

        <mat-card class="panel-card table-panel">
          <mat-card-header>
            <mat-card-title>Existing Branches</mat-card-title>
          </mat-card-header>
          <mat-card-content>
            <app-empty-state *ngIf="branches.length === 0" icon="store" title="No branches configured" subtitle="Add branch locations to support training blocks."></app-empty-state>
            <div class="table-container" *ngIf="branches.length > 0">
              <table mat-table [dataSource]="branches">
                <ng-container matColumnDef="name">
                  <th mat-header-cell *matHeaderCellDef>Branch</th>
                  <td mat-cell *matCellDef="let branch">{{ branch.branchName }}</td>
                </ng-container>
                <ng-container matColumnDef="city">
                  <th mat-header-cell *matHeaderCellDef>City</th>
                  <td mat-cell *matCellDef="let branch">{{ branch.cityName }}</td>
                </ng-container>
                <ng-container matColumnDef="address">
                  <th mat-header-cell *matHeaderCellDef>Address</th>
                  <td mat-cell *matCellDef="let branch">{{ branch.address || 'N/A' }}</td>
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
export class BranchesComponent implements OnInit {
  cities: City[] = [];
  branches: Branch[] = [];
  displayedColumns = ['name', 'city', 'address'];
  newBranch: Partial<CreateBranchRequest> = {
    branchName: '',
    cityId: 0,
    address: ''
  };

  constructor(
    private trainingService: TrainingService,
    private toastService: ToastService
  ) {}

  ngOnInit(): void {
    this.loadCities();
    this.loadBranches();
  }

  loadCities(): void {
    this.trainingService.getCities().subscribe(list => this.cities = list || []);
  }

  loadBranches(): void {
    this.trainingService.getBranches().subscribe(list => this.branches = list || []);
  }

  addBranch(): void {
    if (!this.newBranch.branchName?.trim() || !this.newBranch.cityId) {
      this.toastService.error('Branch name and city are required.');
      return;
    }
    this.trainingService.createBranch(this.newBranch as CreateBranchRequest).subscribe({
      next: branch => {
        this.toastService.success('Branch added successfully.');
        this.branches = [branch, ...this.branches];
        this.newBranch = { branchName: '', cityId: 0, address: '' };
      },
      error: () => this.toastService.error('Failed to add branch.')
    });
  }
}
