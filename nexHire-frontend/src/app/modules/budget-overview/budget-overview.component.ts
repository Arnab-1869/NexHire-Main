import { Component, OnInit } from '@angular/core';
import { LocationBudgetService } from '../../services/location-budget.service';
import { LocationBudget } from '../../models/location-budget.model';

@Component({
  selector: 'app-budget-overview',
  template: `
    <div class="budget-page">
      <app-page-header
        title="Budget & Capacity Overview"
        subtitle="Monitor hiring budget slots and training seat usage per location."
      ></app-page-header>

      <app-empty-state
        *ngIf="!loading && locations.length === 0"
        icon="account_balance_wallet"
        title="No locations configured"
        subtitle="Ask an administrator to set up locations with budgets."
      ></app-empty-state>

      <div class="location-cards" *ngIf="locations.length > 0">
        <mat-card class="loc-card" *ngFor="let loc of locations">
          <mat-card-header>
            <mat-card-title>{{ loc.name }}</mat-card-title>
            <mat-card-subtitle>{{ loc.city }}</mat-card-subtitle>
          </mat-card-header>
          <mat-card-content>
            <div class="metrics-grid">
              <div class="metric budget-metric">
                <span class="metric-label">Training Budget (₹)</span>
                <div class="budget-numbers">
                  <div class="budget-big">
                    <span class="amount remaining-amount"
                      >₹{{ loc.remainingAmount || 0 | number }}</span
                    >
                    <span class="sub-label">remaining</span>
                  </div>
                  <div class="budget-detail">
                    <span>Total: ₹{{ loc.budgetAmount || 0 | number }}</span>
                    <span>Used: ₹{{ loc.usedAmount || 0 | number }}</span>
                  </div>
                </div>
                <mat-progress-bar
                  mode="determinate"
                  [value]="percent(loc.usedAmount || 0, loc.budgetAmount || 1)"
                  [color]="
                    percent(loc.usedAmount || 0, loc.budgetAmount || 1) > 80
                      ? 'warn'
                      : 'primary'
                  "
                ></mat-progress-bar>
              </div>

              <div class="metric">
                <span class="metric-label">Hiring Slots</span>
                <div class="progress-row">
                  <mat-progress-bar
                    mode="determinate"
                    [value]="percent(loc.budgetUsed, loc.budgetTotal)"
                    color="primary"
                  ></mat-progress-bar>
                  <span class="progress-text"
                    >{{ loc.budgetUsed }} / {{ loc.budgetTotal }} used</span
                  >
                </div>
                <span class="remaining"
                  >Remaining:
                  <strong>{{ loc.budgetAvailable }}</strong> slots</span
                >
              </div>

              <div class="metric">
                <span class="metric-label">Training Seats</span>
                <div class="progress-row">
                  <mat-progress-bar
                    mode="determinate"
                    [value]="percent(loc.seatsOccupied, loc.seatsTotal)"
                    color="accent"
                  ></mat-progress-bar>
                  <span class="progress-text"
                    >{{ loc.seatsOccupied }} /
                    {{ loc.seatsTotal }} occupied</span
                  >
                </div>
                <span class="remaining"
                  >Available:
                  <strong>{{ loc.seatsAvailable }}</strong> seats</span
                >
              </div>
            </div>
          </mat-card-content>
        </mat-card>
      </div>

      <app-loader *ngIf="loading"></app-loader>
    </div>
  `,
  styles: [
    `
      .budget-page {
        display: flex;
        flex-direction: column;
        gap: 24px;
      }
      .location-cards {
        display: grid;
        grid-template-columns: repeat(auto-fill, minmax(360px, 1fr));
        gap: 20px;
      }
      .loc-card {
        border-radius: 12px !important;
        box-shadow: 0 4px 20px rgba(0, 0, 0, 0.04) !important;
        padding: 16px;
      }
      .metrics-grid {
        display: flex;
        flex-direction: column;
        gap: 20px;
        margin-top: 12px;
      }
      .budget-metric {
        background: #f8fafc;
        border: 1px solid #e2e8f0;
        border-radius: 10px;
        padding: 16px;
      }
      .budget-numbers {
        display: flex;
        justify-content: space-between;
        align-items: flex-end;
        margin: 8px 0 12px;
      }
      .budget-big {
        display: flex;
        flex-direction: column;
      }
      .remaining-amount {
        font-size: 24px;
        font-weight: 700;
        color: #059669;
      }
      .sub-label {
        font-size: 11px;
        color: #64748b;
        text-transform: uppercase;
      }
      .budget-detail {
        display: flex;
        flex-direction: column;
        align-items: flex-end;
        font-size: 12px;
        color: #475569;
        gap: 2px;
      }
      .metric {
        display: flex;
        flex-direction: column;
        gap: 6px;
      }
      .metric-label {
        font-size: 12px;
        font-weight: 600;
        color: #475569;
        text-transform: uppercase;
        letter-spacing: 0.04em;
      }
      .progress-row {
        display: flex;
        align-items: center;
        gap: 12px;
      }
      .progress-row mat-progress-bar {
        flex: 1;
      }
      .progress-text {
        font-size: 12px;
        color: #64748b;
        white-space: nowrap;
      }
      .remaining {
        font-size: 13px;
        color: #1e293b;
      }
    `,
  ],
  standalone: false,
})
export class BudgetOverviewComponent implements OnInit {
  locations: LocationBudget[] = [];
  loading = false;

  constructor(private locationBudgetService: LocationBudgetService) {}

  ngOnInit(): void {
    this.loading = true;
    this.locationBudgetService.getAll().subscribe({
      next: (list) => {
        this.locations = list;
        this.loading = false;
      },
      error: () => (this.loading = false),
    });
  }

  percent(used: number, total: number): number {
    return total > 0 ? Math.round((used / total) * 100) : 0;
  }
}
