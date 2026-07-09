import { Component, Input } from '@angular/core';

/**
 * PageHeader: Consistent page title + breadcrumb + action slot.
 *
 * Usage:
 *   <app-page-header title="Assessment Management" subtitle="Manage and assign assessments">
 *     <button mat-raised-button color="primary">Add New</button>
 *   </app-page-header>
 */
@Component({
    selector: 'app-page-header',
    template: `
    <div class="page-header">
      <div class="page-header-left">
        <h1 class="page-title">{{ title }}</h1>
        <p class="page-subtitle" *ngIf="subtitle">{{ subtitle }}</p>
      </div>
      <div class="page-header-actions">
        <ng-content></ng-content>
      </div>
    </div>
  `,
    styles: [`
    .page-header {
      display: flex;
      align-items: flex-start;
      justify-content: space-between;
      margin-bottom: 24px;
      flex-wrap: wrap;
      gap: 12px;
    }
    .page-title {
      font-size: 22px;
      font-weight: 700;
      color: #1e293b;
      margin: 0 0 4px;
      line-height: 1.2;
    }
    .page-subtitle {
      font-size: 14px;
      color: #64748b;
      margin: 0;
    }
    .page-header-actions {
      display: flex;
      align-items: center;
      gap: 8px;
      flex-wrap: wrap;
    }
  `],
    standalone: false
})
export class PageHeaderComponent {
  @Input() title = '';
  @Input() subtitle = '';
}
