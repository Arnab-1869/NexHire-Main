import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { LoggedInUser } from '../../models/user.model';
import { TokenService } from './token.service';
import { ROLE_DEFAULT_PERMISSIONS } from '../../models/role-permission.model';

/**
 * Single source of truth for the currently logged-in user.
 * Exposes reactive user$ and permissions$ for components to subscribe to.
 */
@Injectable({ providedIn: 'root' })
export class CurrentUserService {
  private _user$ = new BehaviorSubject<LoggedInUser | null>(null);
  private _permissions$ = new BehaviorSubject<string[]>([]);

  readonly user$: Observable<LoggedInUser | null> = this._user$.asObservable();
  readonly permissions$: Observable<string[]> = this._permissions$.asObservable();

  constructor(private tokenService: TokenService) {
    // Restore user from storage on app startup
    this.restoreFromStorage();
  }

  private restoreFromStorage(): void {
    const user = this.tokenService.getUser();
    if (user) {
      this.setUser(user);
    }
  }

  setUser(user: LoggedInUser): void {
    // If backend sends empty permissions, map role to default permissions
    if (!user.permissions || user.permissions.length === 0) {
      user.permissions = this.getDefaultPermissionsForRole(user.role);
    }
    this._user$.next(user);
    this._permissions$.next(user.permissions);
    this.tokenService.setUser(user);
  }

  getUser(): LoggedInUser | null {
    return this._user$.getValue();
  }

  getPermissions(): string[] {
    return this._permissions$.getValue();
  }

  getRole(): string | null {
    return this._user$.getValue()?.role ?? null;
  }

  isLoggedIn(): boolean {
    return !!this._user$.getValue() && this.tokenService.hasToken();
  }

  clearUser(): void {
    this._user$.next(null);
    this._permissions$.next([]);
    this.tokenService.clearAll();
  }

  /**
   * Maps a role string to default permissions.
   * Used when backend only returns role (no permissions yet).
   * Later, when backend provides permissions, this mapping is ignored.
   */
  private getDefaultPermissionsForRole(role: string): string[] {
    return ROLE_DEFAULT_PERMISSIONS[role?.toUpperCase()] ?? [];
  }
}
