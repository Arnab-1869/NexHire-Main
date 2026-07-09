import { Component, OnInit } from '@angular/core';
import { Observable } from 'rxjs';
import { Toast, ToastService } from '../../services/toast.service';

/**
 * Toast Component: Renders active toast notifications.
 * Place once in app.component.html.
 */
@Component({
    selector: 'app-toast',
    template: `
    <div class="toast-container">
      <div *ngFor="let toast of toasts$ | async"
           class="toast-item"
           [ngClass]="'toast-' + toast.type">
        <mat-icon class="toast-icon">{{ getIcon(toast.type) }}</mat-icon>
        <span class="toast-message">{{ toast.message }}</span>
        <button mat-icon-button class="toast-close" (click)="dismiss(toast.id)">
          <mat-icon>close</mat-icon>
        </button>
      </div>
    </div>
  `,
    styles: [`
    .toast-container {
      position: fixed;
      bottom: 24px;
      right: 24px;
      z-index: 10000;
      display: flex;
      flex-direction: column;
      gap: 8px;
      max-width: 380px;
    }
    .toast-item {
      display: flex;
      align-items: center;
      gap: 12px;
      padding: 12px 16px;
      border-radius: 8px;
      box-shadow: 0 8px 24px rgba(0,0,0,0.15);
      font-size: 14px;
      font-weight: 500;
      min-width: 280px;
      background-color: white;
    }
    .toast-success { border-left: 4px solid #22c55e; color: #15803d; }
    .toast-error { border-left: 4px solid #ef4444; color: #dc2626; }
    .toast-warning { border-left: 4px solid #f59e0b; color: #d97706; }
    .toast-info { border-left: 4px solid #3b82f6; color: #1d4ed8; }
    .toast-icon { font-size: 20px; width: 20px; height: 20px; flex-shrink: 0; }
    .toast-message { flex: 1; line-height: 1.4; }
    .toast-close { width: 28px !important; height: 28px !important; line-height: 28px !important; flex-shrink: 0; }
    .toast-close mat-icon { font-size: 16px; }
  `],
    standalone: false
})
export class ToastComponent implements OnInit {
  toasts$!: Observable<Toast[]>;

  constructor(private toastService: ToastService) {}

  ngOnInit(): void {
    this.toasts$ = this.toastService.toasts$;
  }

  dismiss(id: string): void {
    this.toastService.dismiss(id);
  }

  getIcon(type: string): string {
    const icons: Record<string, string> = {
      success: 'check_circle',
      error: 'error',
      warning: 'warning',
      info: 'info',
    };
    return icons[type] ?? 'info';
  }
}
