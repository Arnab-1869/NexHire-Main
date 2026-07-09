import { Injectable } from '@angular/core';
import { HttpInterceptor, HttpRequest, HttpHandler, HttpEvent, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { Router } from '@angular/router';
import { CurrentUserService } from '../auth/current-user.service';
import { ToastService } from '../../shared/services/toast.service';

/**
 * ErrorInterceptor: Handles HTTP errors globally.
 *
 * - 401: Token expired → logout + redirect to login with message
 * - 403: Forbidden → redirect to 403 page
 * - 404: Not Found → show toast
 * - 500: Server Error → show generic error toast
 * - Network errors → show connection error
 */
@Injectable()
export class ErrorInterceptor implements HttpInterceptor {
  constructor(
    private currentUserService: CurrentUserService,
    private router: Router,
    private toastService: ToastService,
  ) {}

  intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    return next.handle(req).pipe(
      catchError((error: HttpErrorResponse) => {
        if (error.status === 401) {
          this.currentUserService.clearUser();
          this.toastService.error('Session expired. Please log in again.');
          this.router.navigate(['/auth/login']);
        } else if (error.status === 403) {
          this.toastService.warning('You do not have permission to perform this action.');
          this.router.navigate(['/error/403']);
        } else if (error.status === 404) {
          this.toastService.error('The requested resource was not found.');
        } else if (error.status === 0) {
          this.toastService.error('Unable to connect to server. Please check your connection.');
        } else if (error.status >= 500) {
          const msg = error.error?.message ?? 'An unexpected server error occurred.';
          this.toastService.error(msg);
        } else if (error.status >= 400) {
          // Client errors (400, 409, 422 etc.) - show backend message
          const msg = error.error?.message ?? error.message ?? 'An error occurred.';
          this.toastService.error(msg);
        }

        return throwError(() => error);
      })
    );
  }
}
