import { Directive, Input, TemplateRef, ViewContainerRef, OnInit, OnDestroy } from '@angular/core';
import { Subscription } from 'rxjs';
import { PermissionService } from '../../core/services/permission.service';
import { CurrentUserService } from '../../core/auth/current-user.service';

/**
 * HasPermission Structural Directive
 *
 * Usage:
 *   <button *appHasPermission="'ASSIGN_ASSESSMENT_SELECTED'">Assign Selected</button>
 *   <div *appHasPermission="['VIEW_BGV', 'UPDATE_BGV_STATUS']">...</div>
 */
@Directive({
    selector: '[appHasPermission]',
    standalone: false
})
export class HasPermissionDirective implements OnInit, OnDestroy {
  @Input('appHasPermission') permission!: string | string[];

  private subscription!: Subscription;
  private hasView = false;

  constructor(
    private templateRef: TemplateRef<any>,
    private viewContainer: ViewContainerRef,
    private permissionService: PermissionService,
    private currentUserService: CurrentUserService,
  ) {}

  ngOnInit(): void {
    this.subscription = this.currentUserService.permissions$.subscribe(() => {
      this.updateView();
    });
  }

  ngOnDestroy(): void {
    if (this.subscription) {
      this.subscription.unsubscribe();
    }
  }

  private updateView(): void {
    const hasPermission = this.checkPermission();
    if (hasPermission && !this.hasView) {
      this.viewContainer.createEmbeddedView(this.templateRef);
      this.hasView = true;
    } else if (!hasPermission && this.hasView) {
      this.viewContainer.clear();
      this.hasView = false;
    }
  }

  private checkPermission(): boolean {
    if (Array.isArray(this.permission)) {
      return this.permissionService.hasAllPermissions(this.permission);
    }
    return this.permissionService.hasPermission(this.permission);
  }
}

@Directive({
    selector: '[appHasAnyPermission]',
    standalone: false
})
export class HasAnyPermissionDirective implements OnInit, OnDestroy {
  @Input('appHasAnyPermission') permissions!: string[];

  private subscription!: Subscription;
  private hasView = false;

  constructor(
    private templateRef: TemplateRef<any>,
    private viewContainer: ViewContainerRef,
    private permissionService: PermissionService,
    private currentUserService: CurrentUserService,
  ) {}

  ngOnInit(): void {
    this.subscription = this.currentUserService.permissions$.subscribe(() => {
      this.updateView();
    });
  }

  ngOnDestroy(): void {
    if (this.subscription) {
      this.subscription.unsubscribe();
    }
  }

  private updateView(): void {
    const hasPermission = this.permissionService.hasAnyPermission(this.permissions ?? []);
    if (hasPermission && !this.hasView) {
      this.viewContainer.createEmbeddedView(this.templateRef);
      this.hasView = true;
    } else if (!hasPermission && this.hasView) {
      this.viewContainer.clear();
      this.hasView = false;
    }
  }
}
