import { Injectable } from '@angular/core';
import { CurrentUserService } from '../auth/current-user.service';

/**
 * Centralized permission checking service.
 * Components and directives use this instead of inline role checks.
 *
 * Usage:
 *   permissionService.hasPermission('VIEW_APPLICATIONS')
 *   permissionService.hasAnyPermission(['ASSIGN_ASSESSMENT_SELECTED', 'ASSIGN_ASSESSMENT_ALL'])
 *   permissionService.hasAllPermissions(['VIEW_BGV', 'UPDATE_BGV_STATUS'])
 */
@Injectable({ providedIn: 'root' })
export class PermissionService {
  constructor(private currentUserService: CurrentUserService) {}

  /**
   * Check if the logged-in user has a specific permission.
   */
  hasPermission(permission: string): boolean {
    const permissions = this.currentUserService.getPermissions();
    return permissions.includes(permission);
  }

  /**
   * Check if the user has at least ONE of the given permissions.
   */
  hasAnyPermission(permissions: string[]): boolean {
    return permissions.some(p => this.hasPermission(p));
  }

  /**
   * Check if the user has ALL of the given permissions.
   */
  hasAllPermissions(permissions: string[]): boolean {
    return permissions.every(p => this.hasPermission(p));
  }

  /**
   * Check if the user has a specific role.
   * Prefer hasPermission() over hasRole() for future-proofing.
   */
  hasRole(role: string): boolean {
    return this.currentUserService.getRole()?.toUpperCase() === role.toUpperCase();
  }

  /**
   * Check if user has any of the given roles.
   */
  hasAnyRole(roles: string[]): boolean {
    const role = this.currentUserService.getRole()?.toUpperCase() ?? '';
    return roles.some(r => r.toUpperCase() === role);
  }

  /**
   * Returns true if the user is an ADMIN (full access).
   */
  isAdmin(): boolean {
    return this.hasRole('ADMIN');
  }

  /**
   * Returns true if the user is a CANDIDATE (limited access).
   */
  isCandidate(): boolean {
    return this.hasRole('CANDIDATE');
  }
}
