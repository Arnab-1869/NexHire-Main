import { Component, Input, Output, EventEmitter } from '@angular/core';

export interface BulkAction {
  id: string;
  label: string;
  icon?: string;
  color?: 'primary' | 'warn' | 'accent';
  permission?: string;
  disabled?: boolean;
}

/**
 * BulkActionBar: Shows selected count and bulk action buttons.
 * Appears when at least one row is selected in a data table.
 */
@Component({
    selector: 'app-bulk-action-bar',
    template: `
    <div class="bulk-bar" *ngIf="selectedCount > 0">
      <div class="bulk-info">
        <mat-icon>check_box</mat-icon>
        <span>{{ selectedCount }} item{{ selectedCount !== 1 ? 's' : '' }} selected</span>
        <button mat-icon-button matTooltip="Clear selection" (click)="selectionCleared.emit()">
          <mat-icon>close</mat-icon>
        </button>
      </div>
      <div class="bulk-actions">
        <button *ngFor="let action of actions"
                mat-raised-button
                [color]="action.color || 'primary'"
                [disabled]="action.disabled"
                (click)="actionClicked.emit(action.id)">
          <mat-icon *ngIf="action.icon">{{ action.icon }}</mat-icon>
          {{ action.label }}
        </button>
      </div>
    </div>
  `,
    styles: [`
    .bulk-bar {
      display: flex;
      align-items: center;
      justify-content: space-between;
      background: linear-gradient(135deg, #3f51b5, #5c6bc0);
      color: white;
      padding: 10px 20px;
      border-radius: 8px;
      margin-bottom: 12px;
      flex-wrap: wrap;
      gap: 12px;
    }
    .bulk-info {
      display: flex;
      align-items: center;
      gap: 8px;
      font-weight: 600;
      font-size: 14px;
    }
    .bulk-info mat-icon { font-size: 18px; width: 18px; height: 18px; }
    .bulk-actions { display: flex; gap: 8px; flex-wrap: wrap; }
    .bulk-actions button { height: 34px; font-size: 13px; }
  `],
    standalone: false
})
export class BulkActionBarComponent {
  @Input() selectedCount = 0;
  @Input() actions: BulkAction[] = [];
  @Output() actionClicked = new EventEmitter<string>();
  @Output() selectionCleared = new EventEmitter<void>();
}
