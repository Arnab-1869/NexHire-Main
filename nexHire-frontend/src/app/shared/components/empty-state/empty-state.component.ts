import { Component, Input } from '@angular/core';

/**
 * EmptyState: Shows a friendly empty state when no data is available.
 * Usage:
 *   <app-empty-state icon="search_off" title="No applications found" subtitle="Try adjusting your filters"></app-empty-state>
 */
@Component({
    selector: 'app-empty-state',
    template: `
    <div class="empty-state">
      <mat-icon class="empty-icon">{{ icon }}</mat-icon>
      <h3 class="empty-title">{{ title }}</h3>
      <p class="empty-subtitle" *ngIf="subtitle">{{ subtitle }}</p>
      <ng-content></ng-content>
    </div>
  `,
    styles: [`
    .empty-state {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      padding: 60px 20px;
      text-align: center;
      color: #64748b;
    }
    .empty-icon {
      font-size: 64px;
      width: 64px;
      height: 64px;
      color: #cbd5e1;
      margin-bottom: 16px;
    }
    .empty-title {
      font-size: 18px;
      font-weight: 600;
      color: #374151;
      margin: 0 0 8px;
    }
    .empty-subtitle {
      font-size: 14px;
      color: #94a3b8;
      margin: 0 0 24px;
      max-width: 320px;
    }
  `],
    standalone: false
})
export class EmptyStateComponent {
  @Input() icon = 'inbox';
  @Input() title = 'No data found';
  @Input() subtitle = '';
}
