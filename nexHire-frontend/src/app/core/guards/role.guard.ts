import { Injectable } from '@angular/core';
import { CanActivate, ActivatedRouteSnapshot, Router, UrlTree } from '@angular/router';
import { CurrentUserService } from '../auth/current-user.service';

/**
 * RoleGuard: Checks if the user has the required role(s).
 *
 * Route data should include:
 *   data: { roles: ['ADMIN', 'HR'] }
 *
 * Redirects to /error/403 if role check fails.
 */
@Injectable({ providedIn: 'root' })
export class RoleGuard implements CanActivate {
  constructor(
    private currentUserService: CurrentUserService,
    private router: Router,
  ) {}

  canActivate(route: ActivatedRouteSnapshot): boolean | UrlTree {
    const requiredRoles: string[] = route.data?.['roles'] ?? [];

    if (!this.currentUserService.isLoggedIn()) {
      return this.router.parseUrl('/auth/login');
    }

    if (requiredRoles.length === 0) {
      return true; // No roles required
    }

    const userRole = this.currentUserService.getRole()?.toUpperCase() ?? '';
    const hasRole = requiredRoles.some(r => r.toUpperCase() === userRole);

    if (hasRole) {
      return true;
    }

    return this.router.parseUrl('/error/403');
  }
}
