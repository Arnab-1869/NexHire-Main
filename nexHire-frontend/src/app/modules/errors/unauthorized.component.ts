import { Component } from '@angular/core';

@Component({
    selector: 'app-unauthorized',
    template: `
    <div class="error-page">
      <mat-icon class="error-icon" color="warn">gpp_bad</mat-icon>
      <h1>403 - Forbidden Access</h1>
      <p>Your logged-in corporate profile does not possess the authorization privileges required to view this module. If you believe this is incorrect, contact your administrator.</p>
      <button mat-raised-button color="primary" routerLink="/dashboard">Return to Overview</button>
    </div>
  `,
    styles: [`
    .error-page {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      padding: 60px 24px;
      text-align: center;
      color: #334155;
    }
    .error-icon {
      font-size: 80px;
      width: 80px;
      height: 80px;
      margin-bottom: 24px;
    }
    h1 {
      font-size: 32px;
      font-weight: 700;
      margin-bottom: 12px;
    }
    p {
      font-size: 15px;
      color: #64748b;
      max-width: 460px;
      line-height: 1.6;
      margin-bottom: 28px;
    }
  `],
    standalone: false
})
export class UnauthorizedComponent {}
