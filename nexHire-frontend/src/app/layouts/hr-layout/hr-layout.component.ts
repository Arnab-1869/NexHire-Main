import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { CurrentUserService } from '../../core/auth/current-user.service';
import { AuthService } from '../../core/auth/auth.service';
import { PermissionService } from '../../core/services/permission.service';
import {
  NotificationService,
  AppNotification,
} from '../../services/notification.service';
import { LoggedInUser } from '../../models/user.model';

interface MenuItem {
  label: string;
  icon: string;
  route: string;
  permission?: string;
  exact?: boolean;
}

@Component({
  selector: 'app-hr-layout',
  template: `
    <div class="portal-layout">
      <!-- Sidebar -->
      <aside class="sidebar" [class.collapsed]="isSidebarCollapsed">
        <div class="sidebar-brand">
          <mat-icon class="brand-icon">rocket_launch</mat-icon>
          <span class="brand-text" *ngIf="!isSidebarCollapsed">NexHire</span>
        </div>

        <div class="portal-badge" *ngIf="!isSidebarCollapsed">
          <mat-icon class="portal-icon">support_agent</mat-icon>
          <span>HR Portal</span>
        </div>

        <div class="user-profile-summary">
          <div class="avatar">{{ user?.fullName?.charAt(0) || 'H' }}</div>
          <div class="user-info" *ngIf="!isSidebarCollapsed">
            <span class="user-name">{{ user?.fullName }}</span>
            <span class="user-role">{{ user?.role }}</span>
          </div>
        </div>

        <nav class="sidebar-nav">
          <ng-container *ngFor="let item of menuItems">
            <a
              *ngIf="!item.permission || hasPermission(item.permission)"
              [routerLink]="item.route"
              routerLinkActive="active-menu"
              [routerLinkActiveOptions]="{ exact: item.exact || false }"
              class="nav-item"
              [matTooltip]="item.label"
              matTooltipPosition="right"
              [matTooltipDisabled]="!isSidebarCollapsed"
            >
              <mat-icon class="nav-icon">{{ item.icon }}</mat-icon>
              <span class="nav-label" *ngIf="!isSidebarCollapsed">{{
                item.label
              }}</span>
            </a>
          </ng-container>
        </nav>

        <div class="sidebar-footer">
          <button
            class="nav-item footer-item logout-btn"
            (click)="logout()"
            [matTooltip]="'Logout'"
            matTooltipPosition="right"
            [matTooltipDisabled]="!isSidebarCollapsed"
          >
            <mat-icon class="nav-icon">exit_to_app</mat-icon>
            <span class="nav-label" *ngIf="!isSidebarCollapsed">Logout</span>
          </button>
        </div>
      </aside>

      <!-- Main Panel -->
      <div class="main-panel">
        <!-- Top Navbar -->
        <header class="topbar">
          <div class="topbar-left">
            <button mat-icon-button (click)="toggleSidebar()">
              <mat-icon>{{
                isSidebarCollapsed ? 'menu_open' : 'menu'
              }}</mat-icon>
            </button>
            <span class="portal-title">HR Portal</span>
          </div>
          <div class="topbar-right">
            <button
              mat-icon-button
              [matMenuTriggerFor]="notifMenu"
              (click)="loadNotifications()"
            >
              <mat-icon
                [matBadge]="unreadCount > 0 ? unreadCount : null"
                matBadgeColor="warn"
                >notifications</mat-icon
              >
            </button>
            <mat-menu #notifMenu="matMenu" xPosition="before">
              <div class="notif-header" (click)="$event.stopPropagation()">
                <strong>Notifications</strong>
                <button
                  mat-button
                  color="primary"
                  *ngIf="unreadCount > 0"
                  (click)="markAllRead()"
                >
                  Mark all read
                </button>
              </div>
              <div class="notif-list" (click)="$event.stopPropagation()">
                <div *ngIf="notifications.length === 0" class="notif-empty">
                  No notifications yet.
                </div>
                <div
                  *ngFor="let n of notifications"
                  class="notif-item"
                  [class.unread]="!n.read"
                  (click)="onNotifClick(n)"
                >
                  <div class="notif-title">{{ n.title }}</div>
                  <div class="notif-msg">{{ n.message }}</div>
                  <div class="notif-time">
                    {{ n.createdAt | date: 'short' }}
                  </div>
                </div>
              </div>
            </mat-menu>
            <button
              mat-button
              [matMenuTriggerFor]="profileMenu"
              class="profile-dropdown"
            >
              <div class="avatar-sm">
                {{ user?.fullName?.charAt(0) || 'H' }}
              </div>
              <span class="profile-name">{{ user?.fullName }}</span>
              <mat-icon>arrow_drop_down</mat-icon>
            </button>
            <mat-menu #profileMenu="matMenu" xPosition="before">
              <button mat-menu-item routerLink="/hr/profile">
                <mat-icon>person</mat-icon>
                <span>My Profile</span>
              </button>
              <button mat-menu-item routerLink="/hr/change-password">
                <mat-icon>lock</mat-icon>
                <span>Change Password</span>
              </button>
              <mat-divider></mat-divider>
              <button mat-menu-item (click)="logout()">
                <mat-icon>exit_to_app</mat-icon>
                <span>Logout</span>
              </button>
            </mat-menu>
          </div>
        </header>

        <!-- Main Content -->
        <main class="content-container">
          <router-outlet></router-outlet>
        </main>
      </div>
    </div>
  `,
  styles: [
    `
      .portal-layout {
        display: flex;
        height: 100vh;
        width: 100vw;
        overflow: hidden;
        background-color: #f1f5f9;
      }
      .sidebar {
        width: 260px;
        background-color: #1e293b;
        color: #94a3b8;
        display: flex;
        flex-direction: column;
        transition: width 0.25s ease;
        z-index: 10;
        flex-shrink: 0;
      }
      .sidebar.collapsed {
        width: 70px;
      }
      .sidebar-brand {
        height: 64px;
        display: flex;
        align-items: center;
        padding: 0 18px;
        gap: 10px;
        border-bottom: 1px solid #334155;
      }
      .brand-icon {
        color: #818cf8;
        font-size: 24px;
        width: 24px;
        height: 24px;
      }
      .brand-text {
        font-weight: 700;
        font-size: 18px;
        color: white;
      }
      .portal-badge {
        display: flex;
        align-items: center;
        gap: 6px;
        padding: 6px 18px;
        background: rgba(99, 102, 241, 0.15);
        border-bottom: 1px solid #334155;
        font-size: 11px;
        font-weight: 600;
        color: #818cf8;
        text-transform: uppercase;
        letter-spacing: 0.5px;
      }
      .portal-icon {
        font-size: 14px;
        width: 14px;
        height: 14px;
      }
      .user-profile-summary {
        padding: 14px 16px;
        display: flex;
        align-items: center;
        gap: 10px;
        border-bottom: 1px solid #334155;
      }
      .collapsed .user-profile-summary {
        justify-content: center;
      }
      .avatar {
        width: 38px;
        height: 38px;
        border-radius: 50%;
        background: #4f46e5;
        color: white;
        display: flex;
        align-items: center;
        justify-content: center;
        font-weight: 700;
        font-size: 16px;
        flex-shrink: 0;
      }
      .avatar-sm {
        width: 28px;
        height: 28px;
        border-radius: 50%;
        background: #4f46e5;
        color: white;
        display: flex;
        align-items: center;
        justify-content: center;
        font-weight: 700;
        font-size: 12px;
        flex-shrink: 0;
      }
      .user-info {
        display: flex;
        flex-direction: column;
        overflow: hidden;
      }
      .user-name {
        color: white;
        font-weight: 600;
        font-size: 14px;
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
      }
      .user-role {
        font-size: 11px;
        color: #818cf8;
      }
      .sidebar-nav {
        flex: 1;
        padding: 12px 8px;
        display: flex;
        flex-direction: column;
        gap: 3px;
        overflow-y: auto;
        overflow-x: hidden;
      }
      .nav-item {
        display: flex;
        align-items: center;
        padding: 10px 12px;
        border-radius: 8px;
        color: #94a3b8;
        text-decoration: none;
        gap: 12px;
        transition: all 0.15s ease;
        cursor: pointer;
        background: none;
        border: none;
        width: 100%;
        font-family: inherit;
        font-size: 14px;
        font-weight: 500;
        white-space: nowrap;
      }
      .nav-item:hover {
        background: #334155;
        color: white;
      }
      .active-menu {
        background: #3f51b5 !important;
        color: white !important;
        font-weight: 600;
      }
      .nav-icon {
        font-size: 20px;
        width: 20px;
        height: 20px;
        flex-shrink: 0;
      }
      .nav-label {
        font-size: 14px;
        font-weight: 500;
      }
      .sidebar-footer {
        padding: 8px;
        border-top: 1px solid #334155;
        display: flex;
        flex-direction: column;
        gap: 3px;
      }
      .logout-btn {
        color: #fca5a5 !important;
      }
      .logout-btn:hover {
        background: rgba(239, 68, 68, 0.15) !important;
      }
      .main-panel {
        flex: 1;
        display: flex;
        flex-direction: column;
        height: 100%;
        overflow: hidden;
      }
      .topbar {
        height: 64px;
        background: white;
        border-bottom: 1px solid #e2e8f0;
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding: 0 24px;
        z-index: 5;
        flex-shrink: 0;
        box-shadow: 0 1px 4px rgba(0, 0, 0, 0.04);
      }
      .topbar-left {
        display: flex;
        align-items: center;
        gap: 16px;
      }
      .portal-title {
        font-size: 18px;
        font-weight: 600;
        color: #1e293b;
      }
      .topbar-right {
        display: flex;
        align-items: center;
        gap: 10px;
      }
      .profile-dropdown {
        color: #475569;
        display: flex;
        align-items: center;
        gap: 6px;
      }
      .profile-name {
        font-size: 14px;
        font-weight: 500;
      }
      .content-container {
        flex: 1;
        padding: 24px;
        overflow-y: auto;
      }
    `,
  ],
  standalone: false,
})
export class HrLayoutComponent implements OnInit {
  isSidebarCollapsed = false;
  user: LoggedInUser | null = null;

  menuItems: MenuItem[] = [
    { label: 'Dashboard', icon: 'dashboard', route: '/hr', exact: true },
    {
      label: 'Applications',
      icon: 'format_list_bulleted',
      route: '/hr/applications',
      permission: 'VIEW_APPLICATIONS',
    },
    {
      label: 'Assessments',
      icon: 'quiz',
      route: '/hr/assessments',
      permission: 'VIEW_ASSESSMENTS',
    },
    {
      label: 'Selected Candidates',
      icon: 'person_add',
      route: '/hr/selected',
      permission: 'VIEW_SELECTED_CANDIDATES',
    },
    {
      label: 'Offer Letters',
      icon: 'drafts',
      route: '/hr/offers',
      permission: 'VIEW_OFFERS',
    },
    {
      label: 'Background Verif.',
      icon: 'verified_user',
      route: '/hr/bgv',
      permission: 'VIEW_BGV',
    },
    {
      label: 'Trainees',
      icon: 'school',
      route: '/hr/trainees',
      permission: 'VIEW_TRAINEES',
    },
    {
      label: 'Asset Management',
      icon: 'computer',
      route: '/hr/assets',
      permission: 'VIEW_ASSETS',
    },
    {
      label: 'Budget Overview',
      icon: 'account_balance_wallet',
      route: '/hr/budget',
      permission: 'VIEW_LOCATIONS',
    },
    {
      label: 'Project Allocation',
      icon: 'business_center',
      route: '/hr/released',
      permission: 'ALLOCATE_PROJECT',
    },
  ];

  constructor(
    private currentUserService: CurrentUserService,
    private authService: AuthService,
    private permissionService: PermissionService,
    private notificationService: NotificationService,
    private router: Router,
  ) {}

  unreadCount = 0;
  notifications: AppNotification[] = [];

  ngOnInit(): void {
    this.currentUserService.user$.subscribe((u) => (this.user = u));
    this.notificationService.startPolling();
    this.notificationService.unreadCount$.subscribe(
      (c) => (this.unreadCount = c),
    );
  }

  loadNotifications(): void {
    this.notificationService
      .loadNotifications()
      .subscribe((list) => (this.notifications = list));
  }

  onNotifClick(n: AppNotification): void {
    if (!n.read) {
      this.notificationService.markRead(n.id).subscribe(() => {
        n.read = true;
        this.unreadCount = Math.max(0, this.unreadCount - 1);
      });
    }
  }

  markAllRead(): void {
    this.notificationService.markAllRead().subscribe(() => {
      this.notifications.forEach((nn) => (nn.read = true));
      this.unreadCount = 0;
    });
  }

  toggleSidebar(): void {
    this.isSidebarCollapsed = !this.isSidebarCollapsed;
  }

  hasPermission(permission: string): boolean {
    return this.permissionService.hasPermission(permission);
  }

  logout(): void {
    this.authService.logout();
  }
}
