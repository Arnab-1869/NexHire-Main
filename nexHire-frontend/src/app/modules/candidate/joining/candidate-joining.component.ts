import { Component, OnInit } from '@angular/core';
import { JoiningLetterService } from '../../../services/joining-letter.service';
import { ToastService } from '../../../shared/services/toast.service';
import { JoiningLetter } from '../../../models/joining-letter.model';

@Component({
  selector: 'app-candidate-joining',
  template: `
    <div class="candidate-joining">
      <app-page-header
        title="Joining Letters"
        subtitle="Review your joining letter and confirm your onboarding"
      ></app-page-header>

      <app-empty-state
        *ngIf="letters.length === 0"
        icon="how_to_reg"
        title="No joining letters yet"
        subtitle="Once you accept an offer and HR confirms resources, your joining letter appears here."
      ></app-empty-state>

      <div class="letters-grid" *ngIf="letters.length > 0">
        <mat-card class="letter-card" *ngFor="let letter of letters">
          <mat-card-header>
            <mat-icon mat-card-avatar class="letter-icon">how_to_reg</mat-icon>
            <mat-card-title>{{ letter.jobTitle }}</mat-card-title>
            <mat-card-subtitle
              >Location: {{ letter.locationName }}</mat-card-subtitle
            >
          </mat-card-header>
          <mat-card-content>
            <p class="content">{{ letter.content }}</p>
            <div class="details-grid">
              <div class="detail-item">
                <span class="label">Joining Date</span>
                <span class="value">{{
                  letter.joiningDate | date: 'mediumDate'
                }}</span>
              </div>
              <div class="detail-item">
                <span class="label">Status</span>
                <div class="value">
                  <app-status-badge [status]="letter.status"></app-status-badge>
                </div>
              </div>
            </div>
          </mat-card-content>
          <mat-card-actions class="letter-actions">
            <a mat-stroked-button color="accent" [href]="getDownloadLink(letter.id)" target="_blank">
              <mat-icon>download</mat-icon> Download PDF
            </a>
            <button
              *ngIf="letter.status === 'JOINING_LETTER_SENT'"
              mat-raised-button
              color="primary"
              (click)="accept(letter.id)"
            >
              Accept & Join
            </button>
          </mat-card-actions>
        </mat-card>
      </div>
    </div>
  `,
  styles: [
    `
      .candidate-joining {
        display: flex;
        flex-direction: column;
        gap: 24px;
      }
      .letters-grid {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(380px, 1fr));
        gap: 24px;
      }
      .letter-card {
        border-radius: 12px !important;
        box-shadow: 0 4px 20px rgba(0, 0, 0, 0.05) !important;
        padding: 16px;
      }
      .letter-icon {
        color: #4f46e5;
      }
      .content {
        color: #475569;
        font-size: 14px;
        margin: 12px 0;
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
      .letter-actions {
        display: flex;
        gap: 12px;
        justify-content: flex-end;
        padding-top: 12px !important;
        border-top: 1px solid #f1f5f9;
      }
    `,
  ],
  standalone: false,
})
export class CandidateJoiningComponent implements OnInit {
  letters: JoiningLetter[] = [];

  constructor(
    private joiningService: JoiningLetterService,
    private toast: ToastService,
  ) {}

  ngOnInit(): void {
    this.load();
  }

  load(): void {
    this.joiningService
      .getMine()
      .subscribe((letters) => (this.letters = letters));
  }

  getDownloadLink(id: number): string {
    return this.joiningService.downloadJoiningLetterPdfUrl(id);
  }

  accept(id: number): void {
    this.joiningService.accept(id).subscribe({
      next: () => {
        this.toast.success('Joining accepted! You are now a trainee.');
        this.load();
      },
      error: (err) =>
        this.toast.error(
          err.error?.message || 'Failed to accept joining letter',
        ),
    });
  }
}
