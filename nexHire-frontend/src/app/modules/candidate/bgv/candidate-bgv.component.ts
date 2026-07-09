import { Component, OnInit } from '@angular/core';
import { forkJoin, of } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { BackgroundVerificationService } from '../../../services/background-verification.service';
import { BackgroundVerification as Bgv } from '../../../models/background-verification.model';
import { OfferLetterService } from '../../../services/offer-letter.service';
import { CurrentUserService } from '../../../core/auth/current-user.service';
import { ToastService } from '../../../shared/services/toast.service';

@Component({
  selector: 'app-candidate-bgv',
  template: `
    <div class="candidate-bgv">
      <app-page-header
        title="Background Verification"
        subtitle="Upload requested BGC documents to initiate your onboarding verification."
      ></app-page-header>

      <app-loader *ngIf="loading"></app-loader>

      <app-empty-state
        *ngIf="!loading && !isBgcVisible()"
        icon="verified_user"
        title="BGC not initiated"
        subtitle="This section appears after you accept an offer and background verification is initiated."
      ></app-empty-state>

      <ng-container *ngIf="!loading && isBgcVisible()">
        <mat-card class="status-card">
          <mat-card-content>
            <div class="status-layout">
              <div>
                <span class="eyebrow">Current BGC status</span>
                <h2>{{ activeCase?.status || 'INITIATED' }}</h2>
                <p>
                  {{ activeCase?.remarks || 'Upload all required documents so HR can begin verification.' }}
                </p>
              </div>
              <app-status-badge [status]="activeCase?.status || 'INITIATED'"></app-status-badge>
            </div>
          </mat-card-content>
        </mat-card>

        <div class="content-grid">
          <mat-card class="upload-card">
            <mat-card-header>
              <mat-card-title>Upload Document</mat-card-title>
              <mat-card-subtitle>PDF file up to 5 MB</mat-card-subtitle>
            </mat-card-header>
            <mat-card-content>
              <mat-form-field appearance="outline" class="full-width">
                <mat-label>Document Type</mat-label>
                <mat-select [(ngModel)]="selectedDocumentType">
                  <mat-option *ngFor="let type of documentTypes" [value]="type">
                    {{ type }}
                  </mat-option>
                </mat-select>
              </mat-form-field>

              <div class="file-drop">
                <mat-icon color="primary">cloud_upload</mat-icon>
                <div>
                  <strong>{{ selectedFile?.name || 'No file selected' }}</strong>
                  <span *ngIf="selectedFile">{{ selectedFile?.size! / 1024 | number:'1.0-0' }} KB</span>
                  <span *ngIf="!selectedFile">Choose a document to attach</span>
                </div>
                <button mat-stroked-button color="primary" type="button" (click)="fileInput.click()">
                  Choose File
                </button>
                <input
                  #fileInput
                  type="file"
                  hidden
                  accept="application/pdf"
                  (change)="onFileSelected($event)"
                />
              </div>

              <button
                mat-raised-button
                color="primary"
                class="upload-btn"
                [disabled]="!selectedDocumentType || !selectedFile || uploading"
                (click)="uploadDocument()"
              >
                {{ uploading ? 'Uploading...' : 'Upload Document' }}
              </button>
            </mat-card-content>
          </mat-card>

          <mat-card class="documents-card">
            <mat-card-header>
              <mat-card-title>Submitted Documents</mat-card-title>
            </mat-card-header>
            <mat-card-content>
              <app-empty-state
                *ngIf="documents.length === 0"
                icon="folder_open"
                title="No documents uploaded"
                subtitle="Uploaded document metadata will appear here."
              ></app-empty-state>

              <table mat-table [dataSource]="documents" *ngIf="documents.length > 0">
                <ng-container matColumnDef="documentType">
                  <th mat-header-cell *matHeaderCellDef>Type</th>
                  <td mat-cell *matCellDef="let doc">{{ doc.documentType }}</td>
                </ng-container>

                <ng-container matColumnDef="fileName">
                  <th mat-header-cell *matHeaderCellDef>File</th>
                  <td mat-cell *matCellDef="let doc">
                    <div class="file-meta">
                      <span>{{ doc.fileName }}</span>
                      <small>{{ doc.fileSize / 1024 | number:'1.0-0' }} KB</small>
                    </div>
                  </td>
                </ng-container>

                <ng-container matColumnDef="uploadedAt">
                  <th mat-header-cell *matHeaderCellDef>Uploaded</th>
                  <td mat-cell *matCellDef="let doc">{{ doc.uploadedAt | date:'short' }}</td>
                </ng-container>

                <ng-container matColumnDef="status">
                  <th mat-header-cell *matHeaderCellDef>Status</th>
                  <td mat-cell *matCellDef="let doc">
                    <app-status-badge [status]="doc.status"></app-status-badge>
                  </td>
                </ng-container>

                <ng-container matColumnDef="actions">
                  <th mat-header-cell *matHeaderCellDef>Download</th>
                  <td mat-cell *matCellDef="let doc">
                    <a mat-icon-button color="primary" [href]="getDownloadLink(doc.id)" target="_blank">
                      <mat-icon>download</mat-icon>
                    </a>
                  </td>
                </ng-container>

                <tr mat-header-row *matHeaderRowDef="displayedColumns"></tr>
                <tr mat-row *matRowDef="let row; columns: displayedColumns"></tr>
              </table>
            </mat-card-content>
          </mat-card>
        </div>
      </ng-container>
    </div>
  `,
  styles: [
    `
      .candidate-bgv {
        display: flex;
        flex-direction: column;
        gap: 24px;
      }
      .status-card,
      .upload-card,
      .documents-card {
        border-radius: 12px !important;
        box-shadow: 0 4px 20px rgba(0, 0, 0, 0.04) !important;
      }
      .status-layout {
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 20px;
      }
      .eyebrow {
        display: block;
        font-size: 11px;
        font-weight: 700;
        color: #64748b;
        text-transform: uppercase;
      }
      .status-layout h2 {
        margin: 4px 0;
        color: #1e293b;
      }
      .status-layout p {
        margin: 0;
        color: #64748b;
      }
      .content-grid {
        display: grid;
        grid-template-columns: minmax(300px, 420px) 1fr;
        gap: 24px;
      }
      .full-width {
        width: 100%;
      }
      .file-drop {
        display: grid;
        grid-template-columns: auto 1fr auto;
        gap: 14px;
        align-items: center;
        border: 1px dashed #b6c3d1;
        border-radius: 8px;
        padding: 16px;
        background: #f8fafc;
      }
      .file-drop mat-icon {
        color: #3f51b5;
      }
      .file-drop strong,
      .file-drop span {
        display: block;
      }
      .file-drop span {
        color: #64748b;
        font-size: 12px;
      }
      .upload-btn {
        width: 100%;
        margin-top: 16px;
      }
      table {
        width: 100%;
      }
      .file-meta {
        display: flex;
        flex-direction: column;
      }
      .file-meta small {
        color: #64748b;
      }
      @media (max-width: 900px) {
        .content-grid,
        .file-drop {
          grid-template-columns: 1fr;
        }
      }
    `,
  ],
  standalone: false,
})
export class CandidateBgvComponent implements OnInit {
  loading = true;
  uploading = false;
  activeCase: Bgv | null = null;
  hasAcceptedOffer = false;
  documents: any[] = [];
  selectedDocumentType = '';
  selectedFile: File | null = null;
  displayedColumns = ['documentType', 'fileName', 'uploadedAt', 'status', 'actions'];

  documentTypes = [
    'Aadhaar Card',
    'PAN Card',
    'Photo',
    'Resume',
    'Degree Certificate',
    'Marksheets',
    'Address Proof',
  ];

  constructor(
    private bgvService: BackgroundVerificationService,
    private offerService: OfferLetterService,
    private currentUserService: CurrentUserService,
    private toast: ToastService,
  ) {}

  ngOnInit(): void {
    this.loadBgcData();
  }

  loadBgcData(): void {
    this.loading = true;
    forkJoin({
      bgv: this.bgvService.getMine().pipe(catchError(() => of([] as Bgv[]))),
      offers: this.offerService.getMyOffers().pipe(catchError(() => of([] as any[]))),
    }).subscribe({
      next: ({ bgv, offers }) => {
        this.activeCase = bgv[0] || null;
        this.hasAcceptedOffer = offers.some((o) => o.status === 'OFFER_ACCEPTED' || o.status === 'JOINING_LETTER_SENT');
        
        if (this.activeCase) {
          this.loadDocuments(this.activeCase.bgvId);
        } else {
          this.loading = false;
        }
      },
      error: () => {
        this.loading = false;
      }
    });
  }

  loadDocuments(bgvId: number): void {
    this.bgvService.getDocuments(bgvId).subscribe({
      next: (docs) => {
        this.documents = docs;
        this.loading = false;
      },
      error: () => {
        this.toast.error('Failed to load submitted documents.');
        this.loading = false;
      }
    });
  }

  isBgcVisible(): boolean {
    return !!this.activeCase || this.hasAcceptedOffer;
  }

  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0] || null;

    if (!file) {
      this.selectedFile = null;
      return;
    }

    if (file.type !== 'application/pdf') {
      this.toast.error('Only PDF files are supported.');
      input.value = '';
      this.selectedFile = null;
      return;
    }

    const maxSize = 5 * 1024 * 1024;
    if (file.size > maxSize) {
      this.toast.error('File size must be 5 MB or less.');
      input.value = '';
      this.selectedFile = null;
      return;
    }

    this.selectedFile = file;
  }

  uploadDocument(): void {
    if (!this.selectedDocumentType || !this.selectedFile || !this.activeCase) return;

    this.uploading = true;
    this.bgvService.uploadDocument(this.activeCase.applicationId!, this.selectedDocumentType, this.selectedFile).subscribe({
      next: () => {
        this.toast.success(`${this.selectedDocumentType} uploaded successfully.`);
        this.selectedDocumentType = '';
        this.selectedFile = null;
        this.uploading = false;
        this.loadBgcData();
      },
      error: (err) => {
        this.uploading = false;
        this.toast.error(err.error?.message || 'Failed to upload document.');
      }
    });
  }

  getDownloadLink(id: number): string {
    return this.bgvService.downloadDocumentFileUrl(id);
  }
}
