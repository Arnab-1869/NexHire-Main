import { Component, OnInit } from '@angular/core';
import { OfferLetterService } from '../../services/offer-letter.service';
import { ToastService } from '../../shared/services/toast.service';
import { OfferLetter, OfferStatus } from '../../models/offer-letter.model';

@Component({
    selector: 'app-offer-letters-mgmt',
    template: `
    <div class="offer-letters-mgmt">
      <app-page-header title="Offer Letters Hub" subtitle="Manage and monitor corporate offer documents and candidate acceptances"></app-page-header>

      <mat-card class="table-card">
        <mat-card-content>
          <app-empty-state *ngIf="offers.length === 0" icon="mail" title="No offer letters" subtitle="PASSED assessments automatically trigger offer creation."></app-empty-state>

          <div class="table-container" *ngIf="offers.length > 0">
            <table mat-table [dataSource]="offers">
              <!-- Candidate -->
              <ng-container matColumnDef="candidate">
                <th mat-header-cell *matHeaderCellDef>Candidate</th>
                <td mat-cell *matCellDef="let offer">
                  <div class="candidate-info">
                    <span class="name">{{ offer.candidateName }}</span>
                    <span class="email">{{ offer.candidateEmail }}</span>
                  </div>
                </td>
              </ng-container>

              <!-- Position -->
              <ng-container matColumnDef="designation">
                <th mat-header-cell *matHeaderCellDef>Designation</th>
                <td mat-cell *matCellDef="let offer">{{ offer.designation || 'Software Engineer' }}</td>
              </ng-container>

              <!-- Compensation -->
              <ng-container matColumnDef="ctc">
                <th mat-header-cell *matHeaderCellDef>CTC</th>
                <td mat-cell *matCellDef="let offer">₹{{ offer.ctc | number }}</td>
              </ng-container>

              <!-- Joining Date -->
              <ng-container matColumnDef="joiningDate">
                <th mat-header-cell *matHeaderCellDef>Joining Date</th>
                <td mat-cell *matCellDef="let offer">{{ offer.joiningDate | date }}</td>
              </ng-container>

              <!-- Status -->
              <ng-container matColumnDef="status">
                <th mat-header-cell *matHeaderCellDef>Status</th>
                <td mat-cell *matCellDef="let offer">
                  <app-status-badge [status]="offer.status"></app-status-badge>
                </td>
              </ng-container>

              <!-- Actions -->
              <ng-container matColumnDef="actions">
                <th mat-header-cell *matHeaderCellDef align="end">Actions</th>
                <td mat-cell *matCellDef="let offer" align="end">
                  <ng-container *ngIf="offer.status === 'ACCEPTED'">
                    <button mat-raised-button color="primary" class="row-btn" (click)="approve(offer.offerId)">Approve & BGV</button>
                  </ng-container>
                  <span *ngIf="offer.status !== 'ACCEPTED'" class="status-done">No Actions Needed</span>
                </td>
              </ng-container>

              <tr mat-header-row *matHeaderRowDef="displayedColumns"></tr>
              <tr mat-row *matRowDef="let row; columns: displayedColumns;"></tr>
            </table>
          </div>
        </mat-card-content>
      </mat-card>
    </div>
  `,
    styles: [`
    .offer-letters-mgmt {
      display: flex;
      flex-direction: column;
      gap: 24px;
    }
    .table-card {
      border-radius: 12px !important;
      box-shadow: 0 4px 20px rgba(0,0,0,0.04) !important;
    }
    table {
      width: 100%;
    }
    .candidate-info {
      display: flex;
      flex-direction: column;
    }
    .candidate-info .name {
      font-weight: 600;
      color: #1e293b;
    }
    .candidate-info .email {
      font-size: 11px;
      color: #64748b;
    }
    .row-btn {
      height: 32px;
      line-height: 32px;
      font-size: 13px;
    }
    .status-done {
      font-size: 12px;
      color: #94a3b8;
      font-weight: 500;
    }
  `],
    standalone: false
})
export class OfferLettersManagementComponent implements OnInit {
  offers: OfferLetter[] = [];
  displayedColumns = ['candidate', 'designation', 'ctc', 'joiningDate', 'status', 'actions'];

  constructor(
    private offerService: OfferLetterService,
    private toastService: ToastService
  ) {}

  ngOnInit(): void {
    this.loadOffers();
  }

  loadOffers(): void {
    this.offerService.getAll().subscribe(offs => this.offers = offs);
  }

  approve(id: number): void {
    this.offerService.updateStatus(id, { status: 'APPROVED' }).subscribe({
      next: () => {
        this.toastService.success('Offer approved. BGV has been initiated.');
        this.loadOffers();
      },
      error: () => this.toastService.error('Approval failed.')
    });
  }
}
