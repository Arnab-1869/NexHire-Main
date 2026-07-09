import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';

export interface ConfirmationDialogData {
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  type?: 'danger' | 'warning' | 'info';
}

/**
 * ConfirmationDialog: Reusable confirm modal.
 */
@Component({
    selector: 'app-confirmation-dialog',
    template: `
    <div class="confirm-dialog">
      <div class="confirm-header" [ngClass]="'header-' + data.type">
        <mat-icon class="confirm-icon">{{ getIcon() }}</mat-icon>
        <h2 mat-dialog-title>{{ data.title }}</h2>
      </div>
      <mat-dialog-content class="confirm-content">
        <p>{{ data.message }}</p>
      </mat-dialog-content>
      <mat-dialog-actions align="end">
        <button mat-stroked-button (click)="cancel()">{{ data.cancelText || 'Cancel' }}</button>
        <button mat-raised-button
                [color]="data.type === 'danger' ? 'warn' : 'primary'"
                (click)="confirm()">
          {{ data.confirmText || 'Confirm' }}
        </button>
      </mat-dialog-actions>
    </div>
  `,
    styles: [`
    .confirm-dialog { min-width: 380px; max-width: 480px; }
    .confirm-header {
      display: flex;
      align-items: center;
      gap: 12px;
      padding: 20px 24px 0;
    }
    .confirm-icon { font-size: 28px; width: 28px; height: 28px; }
    .header-danger { color: #dc2626; }
    .header-warning { color: #d97706; }
    .header-info { color: #1d4ed8; }
    h2 { margin: 0; font-size: 18px; }
    .confirm-content p { color: #374151; line-height: 1.6; margin: 0; padding-top: 8px;}
    mat-dialog-actions { padding: 16px 24px !important; gap: 8px; }
  `],
    standalone: false
})
export class ConfirmationDialogComponent {
  constructor(
    public dialogRef: MatDialogRef<ConfirmationDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: ConfirmationDialogData,
  ) {}

  confirm(): void { this.dialogRef.close(true); }
  cancel(): void { this.dialogRef.close(false); }

  getIcon(): string {
    const icons: Record<string, string> = {
      danger: 'dangerous',
      warning: 'warning',
      info: 'help',
    };
    return icons[this.data.type ?? 'info'] ?? 'help';
  }
}
