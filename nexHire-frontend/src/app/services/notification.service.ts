import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, timer } from 'rxjs';
import { switchMap, tap } from 'rxjs/operators';
import { environment } from '../../environments/environment';

const BASE = environment.apiBaseUrl;

export interface AppNotification {
  id: number;
  type: string;
  title: string;
  message: string;
  read: boolean;
  createdAt: string;
}

@Injectable({ providedIn: 'root' })
export class NotificationService {
  private _unreadCount$ = new BehaviorSubject<number>(0);
  private _notifications$ = new BehaviorSubject<AppNotification[]>([]);

  readonly unreadCount$ = this._unreadCount$.asObservable();
  readonly notifications$ = this._notifications$.asObservable();

  constructor(private http: HttpClient) {}

  /** Start polling for unread count every 30 seconds. Call once after login. */
  startPolling(): void {
    timer(0, 30000)
      .pipe(switchMap(() => this.fetchUnreadCount()))
      .subscribe();
  }

  fetchUnreadCount(): Observable<{ count: number }> {
    return this.http
      .get<{ count: number }>(`${BASE}/api/notifications/unread-count`)
      .pipe(tap((res) => this._unreadCount$.next(res.count)));
  }

  loadNotifications(): Observable<AppNotification[]> {
    return this.http
      .get<AppNotification[]>(`${BASE}/api/notifications/my`)
      .pipe(tap((list) => this._notifications$.next(list)));
  }

  markRead(id: number): Observable<void> {
    return this.http.put<void>(`${BASE}/api/notifications/${id}/read`, {});
  }

  markAllRead(): Observable<void> {
    return this.http
      .put<void>(`${BASE}/api/notifications/read-all`, {})
      .pipe(tap(() => this._unreadCount$.next(0)));
  }
}
