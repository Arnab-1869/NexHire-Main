import { Injectable } from '@angular/core';
import { AbstractControl, FormGroup } from '@angular/forms';

/**
 * Error message mapping for common validation errors
 */
export const ERROR_MESSAGES: Record<string, string> = {
  required: 'This field is required',
  email: 'Please enter a valid email address',
  minlength: 'Minimum length is {requiredLength} characters',
  maxlength: 'Maximum length is {requiredLength} characters',
  min: 'Minimum value is {min}',
  max: 'Maximum value is {max}',
  uniqueName: 'This name already exists',
  positiveInteger: 'Please enter a positive integer',
  dateRange: 'Date must be within valid range',
  pattern: 'Invalid format'
};

/**
 * Service to help with form validation and error message handling
 */
@Injectable({
  providedIn: 'root'
})
export class FormHelperService {

  /**
   * Gets the error message for a form control
   * @param control The form control to check
   * @param fieldName The name of the field (optional, for context)
   * @returns The error message string, or empty string if no error or control is not touched
   */
  getErrorMessage(control: AbstractControl | null, fieldName?: string): string {
    if (!control || !control.errors || !control.touched) {
      return '';
    }

    const errorKey = Object.keys(control.errors)[0];
    let message = ERROR_MESSAGES[errorKey] || 'Invalid value';

    // Replace placeholders with actual values from the error object
    return this.interpolateMessage(message, control.errors[errorKey]);
  }

  /**
   * Interpolates dynamic values into error message template
   * @param message The message template with placeholders
   * @param errorValue The error value object containing dynamic values
   * @returns The interpolated message
   */
  private interpolateMessage(message: string, errorValue: any): string {
    if (!errorValue || typeof errorValue !== 'object') {
      return message;
    }

    let interpolated = message;
    
    // Replace {placeholder} patterns with actual values
    Object.keys(errorValue).forEach(key => {
      const placeholder = `{${key}}`;
      if (interpolated.includes(placeholder)) {
        interpolated = interpolated.replace(placeholder, errorValue[key]);
      }
    });

    return interpolated;
  }

  /**
   * Marks all controls in a FormGroup as touched, recursively handling nested FormGroups
   * @param formGroup The FormGroup to mark as touched
   */
  markFormGroupTouched(formGroup: FormGroup): void {
    Object.keys(formGroup.controls).forEach(key => {
      const control = formGroup.get(key);
      
      if (control) {
        control.markAsTouched();
        
        // Recursively mark nested FormGroups
        if (control instanceof FormGroup) {
          this.markFormGroupTouched(control);
        }
      }
    });
  }
}
