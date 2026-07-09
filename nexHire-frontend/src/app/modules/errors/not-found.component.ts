import { Component } from '@angular/core';

@Component({
    selector: 'app-not-found',
    template: `
    <div class="error-page">
      <mat-icon class="error-icon">search_off</mat-icon>
      <h1>404 - Page Not Found</h1>
      <p>The page URL you are attempting to access does not exist or has been relocated within the NexHire workspace hierarchy.</p>
      <button mat-raised-button color="primary" routerLink="/">Return Home</button>
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
      color: #cbd5e1;
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
export class NotFoundComponent {}
