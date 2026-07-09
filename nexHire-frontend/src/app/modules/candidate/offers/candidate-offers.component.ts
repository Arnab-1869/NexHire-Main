import { Component, OnInit } from '@angular/core';
import { OfferLetterService } from '../../../services/offer-letter.service';
import { CurrentUserService } from '../../../core/auth/current-user.service';
import { ToastService } from '../../../shared/services/toast.service';
import { OfferLetter } from '../../../models/offer-letter.model';

@Component({
    selector: 'app-candidate-offers',
    template: `
    <div class="candidate-offers">
      <app-page-header title="My Offers" subtitle="Review and accept/reject your job offers"></app-page-header>

      <app-empty-state *ngIf="offers.length === 0" icon="mail" title="No offers found" subtitle="Complete coding assessments. Offers will appear here once generated."></app-empty-state>

      <div class="offers-grid" *ngIf="offers.length > 0">
        <mat-card class="offer-card" *ngFor="let offer of offers">
          <mat-card-header>
            <mat-icon mat-card-avatar class="offer-icon">verified</mat-icon>
            <mat-card-title>{{ offer.designation || 'Software Engineer' }}</mat-card-title>
            <mat-card-subtitle>Job Title: {{ offer.jobTitle }}</mat-card-subtitle>
          </mat-card-header>
          <mat-card-content class="offer-details">
            <div class="details-grid">
              <div class="detail-item">
                <span class="label">Compensation (CTC)</span>
                <span class="value">₹{{ offer.ctc | number }} per annum</span>
              </div>
              <div class="detail-item">
                <span class="label">Joining Date</span>
                <span class="value">{{ offer.joiningDate | date:'mediumDate' }}</span>
              </div>
              <div class="detail-item">
                <span class="label">Status</span>
                <div class="value">
                  <app-status-badge [status]="offer.status"></app-status-badge>
                </div>
              </div>
              <div class="detail-item">
                <span class="label">Expiry Date</span>
                <span class="value warn-text">{{ offer.expiryDate | date:'mediumDate' }}</span>
              </div>
            </div>
          </mat-card-content>
          <mat-card-actions class="offer-actions">
            <a mat-stroked-button color="accent" [href]="getDownloadLink(offer.offerId)" target="_blank">
              <mat-icon>download</mat-icon> Download PDF
            </a>
            <ng-container *ngIf="offer.status === 'SENT'">
              <button mat-raised-button color="primary" (click)="accept(offer.offerId)">Accept</button>
              <button mat-stroked-button color="warn" (click)="reject(offer.offerId)">Reject</button>
            </ng-container>
          </mat-card-actions>
        </mat-card>
      </div>
    </div>
  `,
    styles: [`
    .candidate-offers {
      display: flex;
      flex-direction: column;
      gap: 24px;
    }
    .offers-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(380px, 1fr));
      gap: 24px;
    }
    .offer-card {
      border-radius: 12px !important;
      box-shadow: 0 4px 20px rgba(0,0,0,0.05) !important;
      padding: 16px;
    }
    .offer-icon {
      color: #3f51b5;
      font-size: 40px;
      width: 40px;
      height: 40px;
      margin-right: 12px;
    }
    .offer-details {
      margin: 20px 0;
    }
    .details-grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 16px;
    }
    .detail-item {
      display: flex;
      flex-direction: column;
      gap: 4px;
    }
    .detail-item .label {
      font-size: 12px;
      color: #64748b;
      font-weight: 500;
    }
    .detail-item .value {
      font-size: 15px;
      font-weight: 600;
      color: #1e293b;
    }
    .warn-text {
      color: #b45309 !important;
    }
    .offer-actions {
      display: flex;
      gap: 12px;
      justify-content: flex-end;
      padding-top: 16px !important;
      border-top: 1px solid #f1f5f9;
    }
  `],
    standalone: false
})
export class CandidateOffersComponent implements OnInit {
  offers: OfferLetter[] = [];

  constructor(
    private offerService: OfferLetterService,
    private currentUserService: CurrentUserService,
    private toastService: ToastService
  ) {}

  ngOnInit(): void {
    const user = this.currentUserService.getUser();
    if (user?.userId) {
      this.offerService.getByUser(user.userId).subscribe(offs => this.offers = offs);
    }
  }

  getDownloadLink(id: number): string {
    return this.offerService.downloadOfferPdfUrl(id);
  }

  accept(id: number): void {
    this.offerService.updateStatus(id, { status: 'ACCEPTED' }).subscribe({
      next: () => {
        this.toastService.success('Offer Accepted! Background verification has been initiated.');
        this.ngOnInit();
      },
      error: () => this.toastService.error('Action failed')
    });
  }

  reject(id: number): void {
    this.offerService.updateStatus(id, { status: 'REJECTED' }).subscribe({
      next: () => {
        this.toastService.success('Offer Rejected.');
        this.ngOnInit();
      },
      error: () => this.toastService.error('Action failed')
    });
  }
}
