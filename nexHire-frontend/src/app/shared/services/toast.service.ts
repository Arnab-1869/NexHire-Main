import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

export interface Toast {
  id: string;
  type: 'success' | 'error' | 'warning' | 'info';
  message: string;
  duration?: number;
}

/**
 * ToastService: Programmatic toast notifications.
 *
 * Usage:
 *   toastService.success('Record saved successfully');
 *   toastService.error('Failed to load data');
 */
@Injectable({ providedIn: 'root' })
export class ToastService {
  private _toasts$ = new BehaviorSubject<Toast[]>([]);
  readonly toasts$ = this._toasts$.asObservable();

  success(message: string, duration = 4000): void {
    this.add({ type: 'success', message, duration });
  }

  error(message: string, duration = 6000): void {
    this.add({ type: 'error', message, duration });
  }

  warning(message: string, duration = 5000): void {
    this.add({ type: 'warning', message, duration });
  }

  info(message: string, duration = 4000): void {
    this.add({ type: 'info', message, duration });
  }

  dismiss(id: string): void {
    const toasts = this._toasts$.getValue().filter(t => t.id !== id);
    this._toasts$.next(toasts);
  }

  private add(toast: Omit<Toast, 'id'>): void {
    const id = `toast-${Date.now()}-${Math.random()}`;
    const newToast: Toast = { ...toast, id };
    this._toasts$.next([...this._toasts$.getValue(), newToast]);

    if (toast.duration) {
      setTimeout(() => this.dismiss(id), toast.duration);
    }
  }
}
