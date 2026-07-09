import { Component, OnInit } from '@angular/core';
import { Observable } from 'rxjs';
import { LoaderService } from '../../services/loader.service';

/**
 * Loader: Global loading overlay shown during HTTP requests.
 * Place once in app.component.html.
 */
@Component({
    selector: 'app-loader',
    template: `
    <div class="loader-overlay" *ngIf="loading$ | async">
      <div class="loader-spinner">
        <mat-spinner diameter="48"></mat-spinner>
        <p class="loader-text">Loading...</p>
      </div>
    </div>
  `,
    styles: [`
    .loader-overlay {
      position: fixed;
      top: 0; left: 0; right: 0; bottom: 0;
      background: rgba(255, 255, 255, 0.75);
      display: flex;
      align-items: center;
      justify-content: center;
      z-index: 9999;
      backdrop-filter: blur(2px);
    }
    .loader-spinner {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 12px;
    }
    .loader-text {
      font-size: 14px;
      color: #3f51b5;
      font-weight: 500;
      margin: 0;
    }
  `],
    standalone: false
})
export class LoaderComponent implements OnInit {
  loading$!: Observable<boolean>;

  constructor(private loaderService: LoaderService) {}

  ngOnInit(): void {
    this.loading$ = this.loaderService.loading$;
  }
}
