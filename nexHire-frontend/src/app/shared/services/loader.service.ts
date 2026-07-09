import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

/**
 * LoaderService: Controls global loading spinner visibility.
 * Used by LoaderInterceptor + components that need manual control.
 */
@Injectable({ providedIn: 'root' })
export class LoaderService {
  private _loading$ = new BehaviorSubject<boolean>(false);
  readonly loading$ = this._loading$.asObservable();

  show(): void {
    this._loading$.next(true);
  }

  hide(): void {
    this._loading$.next(false);
  }

  isLoading(): boolean {
    return this._loading$.getValue();
  }
}
