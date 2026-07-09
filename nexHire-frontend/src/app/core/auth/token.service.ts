import { Injectable } from '@angular/core';
import { environment } from '../../../environments/environment';
import { LoggedInUser } from '../../models/user.model';

/**
 * Handles JWT token storage and retrieval.
 * Centralizes all localStorage/sessionStorage access for auth tokens.
 */
@Injectable({ providedIn: 'root' })
export class TokenService {
  private readonly TOKEN_KEY = environment.tokenKey;
  private readonly USER_KEY = environment.userKey;

  // ─── Token ────────────────────────────────────────────────────────────────────

  getToken(): string | null {
    return localStorage.getItem(this.TOKEN_KEY);
  }

  setToken(token: string): void {
    localStorage.setItem(this.TOKEN_KEY, token);
  }

  removeToken(): void {
    localStorage.removeItem(this.TOKEN_KEY);
  }

  hasToken(): boolean {
    return !!this.getToken();
  }

  isTokenExpired(): boolean {
    const token = this.getToken();
    if (!token) return true;
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      const expiry = payload.exp * 1000;
      return Date.now() > expiry;
    } catch {
      // Token is not a valid JWT (e.g., opaque session token)
      return false;
    }
  }

  // ─── User ─────────────────────────────────────────────────────────────────────

  getUser(): LoggedInUser | null {
    const raw = localStorage.getItem(this.USER_KEY);
    if (!raw) return null;
    try {
      return JSON.parse(raw) as LoggedInUser;
    } catch {
      return null;
    }
  }

  setUser(user: LoggedInUser): void {
    localStorage.setItem(this.USER_KEY, JSON.stringify(user));
  }

  removeUser(): void {
    localStorage.removeItem(this.USER_KEY);
  }

  // ─── Clear All ────────────────────────────────────────────────────────────────

  clearAll(): void {
    this.removeToken();
    this.removeUser();
  }
}
