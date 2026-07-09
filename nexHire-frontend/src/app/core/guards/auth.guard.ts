import { Injectable } from '@angular/core';
import { CanActivate, ActivatedRouteSnapshot, Router, UrlTree } from '@angular/router';
import { CurrentUserService } from '../auth/current-user.service';

/**
 * AuthGuard: Redirects unauthenticated users to /auth/login.
 * Apply to all routes that require authentication.
 */
@Injectable({ providedIn: 'root' })
export class AuthGuard implements CanActivate {
  constructor(
    private currentUserService: CurrentUserService,
    private router: Router,
  ) {}

  canActivate(route: ActivatedRouteSnapshot): boolean | UrlTree {
    if (this.currentUserService.isLoggedIn()) {
      return true;
    }
    return this.router.parseUrl('/auth/login');
  }
}
