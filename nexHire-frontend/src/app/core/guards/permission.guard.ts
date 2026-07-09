import { Injectable } from '@angular/core';
import { CanActivate, ActivatedRouteSnapshot, Router, UrlTree } from '@angular/router';
import { PermissionService } from '../services/permission.service';
import { CurrentUserService } from '../auth/current-user.service';

/**
 * PermissionGuard: Checks if the user has the required permission(s).
 *
 * Route data should include:
 *   data: { permissions: ['VIEW_ASSESSMENTS'] }         -- requires ALL
 *   data: { anyPermissions: ['ASSIGN_ASSESSMENT_SELECTED', 'ASSIGN_ASSESSMENT_ALL'] } -- requires ANY
 *
 * Redirects to /error/403 if permission check fails.
 */
@Injectable({ providedIn: 'root' })
export class PermissionGuard implements CanActivate {
  constructor(
    private permissionService: PermissionService,
    private currentUserService: CurrentUserService,
    private router: Router,
  ) {}

  canActivate(route: ActivatedRouteSnapshot): boolean | UrlTree {
    if (!this.currentUserService.isLoggedIn()) {
      return this.router.parseUrl('/auth/login');
    }

    const requiredPermissions: string[] = route.data?.['permissions'] ?? [];
    const anyPermissions: string[] = route.data?.['anyPermissions'] ?? [];

    // No permission restriction
    if (requiredPermissions.length === 0 && anyPermissions.length === 0) {
      return true;
    }

    // Admin bypasses all permission checks
    if (this.permissionService.isAdmin()) {
      return true;
    }

    // Check ALL required permissions
    if (requiredPermissions.length > 0) {
      if (!this.permissionService.hasAllPermissions(requiredPermissions)) {
        return this.router.parseUrl('/error/403');
      }
    }

    // Check ANY of the given permissions
    if (anyPermissions.length > 0) {
      if (!this.permissionService.hasAnyPermission(anyPermissions)) {
        return this.router.parseUrl('/error/403');
      }
    }

    return true;
  }
}
