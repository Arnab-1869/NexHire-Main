import { AbstractControl, AsyncValidatorFn, ValidationErrors, ValidatorFn, Validators } from '@angular/forms';
import { Observable, of } from 'rxjs';
import { map, catchError, debounceTime, switchMap, first } from 'rxjs/operators';

/**
 * Custom validators for business logic validation in forms
 */
export class CustomValidators {
  /**
   * Async validator to check if a name is unique
   * @param service Service with checkUnique method
   * @param field Field name to check for uniqueness
   * @returns AsyncValidatorFn that validates uniqueness
   */
  static uniqueName(service: any, field: string): AsyncValidatorFn {
    return (control: AbstractControl): Observable<ValidationErrors | null> => {
      if (!control.value) {
        return of(null);
      }

      return of(control.value).pipe(
        debounceTime(300),
        switchMap(value => service.checkUnique(field, value)),
        map(exists => exists ? { uniqueName: true } : null),
        catchError(() => of(null)),
        first()
      );
    };
  }

  /**
   * Validator to check if a date is within a specified range
   * @param minDate Minimum allowed date (optional)
   * @param maxDate Maximum allowed date (optional)
   * @returns ValidatorFn that validates date range
   */
  static dateRange(minDate?: Date, maxDate?: Date): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      if (!control.value) {
        return null;
      }

      const date = new Date(control.value);
      
      // Check if the date is valid
      if (isNaN(date.getTime())) {
        return { dateRange: true };
      }

      // Check minimum date
      if (minDate && date < minDate) {
        return { dateRange: true };
      }

      // Check maximum date
      if (maxDate && date > maxDate) {
        return { dateRange: true };
      }

      return null;
    };
  }

  /**
   * Validator to check if a value is a positive integer
   * @returns ValidatorFn that validates positive integers
   */
  static positiveInteger(): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      if (!control.value && control.value !== 0) {
        return null;
      }

      const value = Number(control.value);

      // Check if it's a number
      if (isNaN(value)) {
        return { positiveInteger: true };
      }

      // Check if it's an integer
      if (!Number.isInteger(value)) {
        return { positiveInteger: true };
      }

      // Check if it's positive
      if (value <= 0) {
        return { positiveInteger: true };
      }

      return null;
    };
  }

  /**
   * Validator to check if progress value is between 0 and 100
   * @returns ValidatorFn that validates progress range (0-100)
   */
  static progressRange(): ValidatorFn {
    return Validators.compose([
      Validators.min(0),
      Validators.max(100)
    ]) as ValidatorFn;
  }
}
