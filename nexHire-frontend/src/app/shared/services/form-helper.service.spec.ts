import { TestBed } from '@angular/core/testing';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { FormHelperService, ERROR_MESSAGES } from './form-helper.service';

describe('FormHelperService', () => {
  let service: FormHelperService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [FormHelperService]
    });
    service = TestBed.inject(FormHelperService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('getErrorMessage', () => {
    it('should return empty string for null control', () => {
      const message = service.getErrorMessage(null);
      expect(message).toBe('');
    });

    it('should return empty string for control without errors', () => {
      const control = new FormControl('value');
      const message = service.getErrorMessage(control);
      expect(message).toBe('');
    });

    it('should return empty string for untouched control with errors', () => {
      const control = new FormControl('', Validators.required);
      const message = service.getErrorMessage(control);
      expect(message).toBe('');
    });

    it('should return error message for touched control with required error', () => {
      const control = new FormControl('', Validators.required);
      control.markAsTouched();
      const message = service.getErrorMessage(control);
      expect(message).toBe('This field is required');
    });

    it('should return error message for touched control with email error', () => {
      const control = new FormControl('invalid-email', Validators.email);
      control.markAsTouched();
      const message = service.getErrorMessage(control);
      expect(message).toBe('Please enter a valid email address');
    });

    it('should interpolate requiredLength for minlength error', () => {
      const control = new FormControl('ab', Validators.minLength(5));
      control.markAsTouched();
      const message = service.getErrorMessage(control);
      expect(message).toBe('Minimum length is 5 characters');
    });

    it('should interpolate requiredLength for maxlength error', () => {
      const control = new FormControl('toolongtext', Validators.maxLength(5));
      control.markAsTouched();
      const message = service.getErrorMessage(control);
      expect(message).toBe('Maximum length is 5 characters');
    });

    it('should interpolate min value for min error', () => {
      const control = new FormControl(3, Validators.min(10));
      control.markAsTouched();
      const message = service.getErrorMessage(control);
      expect(message).toBe('Minimum value is 10');
    });

    it('should interpolate max value for max error', () => {
      const control = new FormControl(150, Validators.max(100));
      control.markAsTouched();
      const message = service.getErrorMessage(control);
      expect(message).toBe('Maximum value is 100');
    });

    it('should return message for custom error (uniqueName)', () => {
      const control = new FormControl('existing-name');
      control.setErrors({ uniqueName: true });
      control.markAsTouched();
      const message = service.getErrorMessage(control);
      expect(message).toBe('This name already exists');
    });

    it('should return message for custom error (positiveInteger)', () => {
      const control = new FormControl(-5);
      control.setErrors({ positiveInteger: true });
      control.markAsTouched();
      const message = service.getErrorMessage(control);
      expect(message).toBe('Please enter a positive integer');
    });

    it('should return message for custom error (dateRange)', () => {
      const control = new FormControl(new Date());
      control.setErrors({ dateRange: true });
      control.markAsTouched();
      const message = service.getErrorMessage(control);
      expect(message).toBe('Date must be within valid range');
    });

    it('should return message for pattern error', () => {
      const control = new FormControl('abc123', Validators.pattern(/^[0-9]+$/));
      control.markAsTouched();
      const message = service.getErrorMessage(control);
      expect(message).toBe('Invalid format');
    });

    it('should return generic message for unknown error type', () => {
      const control = new FormControl('value');
      control.setErrors({ unknownError: true });
      control.markAsTouched();
      const message = service.getErrorMessage(control);
      expect(message).toBe('Invalid value');
    });

    it('should handle error value with multiple properties', () => {
      const control = new FormControl('ab');
      control.setErrors({ 
        minlength: { 
          requiredLength: 5, 
          actualLength: 2 
        } 
      });
      control.markAsTouched();
      const message = service.getErrorMessage(control);
      expect(message).toBe('Minimum length is 5 characters');
    });

    it('should accept optional fieldName parameter without affecting behavior', () => {
      const control = new FormControl('', Validators.required);
      control.markAsTouched();
      const message = service.getErrorMessage(control, 'username');
      expect(message).toBe('This field is required');
    });
  });

  describe('markFormGroupTouched', () => {
    it('should mark all controls in FormGroup as touched', () => {
      const formGroup = new FormGroup({
        name: new FormControl(''),
        email: new FormControl(''),
        age: new FormControl('')
      });

      service.markFormGroupTouched(formGroup);

      expect(formGroup.get('name')?.touched).toBeTrue();
      expect(formGroup.get('email')?.touched).toBeTrue();
      expect(formGroup.get('age')?.touched).toBeTrue();
    });

    it('should recursively mark nested FormGroup controls as touched', () => {
      const formGroup = new FormGroup({
        name: new FormControl(''),
        address: new FormGroup({
          street: new FormControl(''),
          city: new FormControl(''),
          country: new FormGroup({
            name: new FormControl(''),
            code: new FormControl('')
          })
        })
      });

      service.markFormGroupTouched(formGroup);

      expect(formGroup.get('name')?.touched).toBeTrue();
      expect(formGroup.get('address')?.touched).toBeTrue();
      expect(formGroup.get('address.street')?.touched).toBeTrue();
      expect(formGroup.get('address.city')?.touched).toBeTrue();
      expect(formGroup.get('address.country')?.touched).toBeTrue();
      expect(formGroup.get('address.country.name')?.touched).toBeTrue();
      expect(formGroup.get('address.country.code')?.touched).toBeTrue();
    });

    it('should handle FormGroup with no controls', () => {
      const formGroup = new FormGroup({});

      expect(() => service.markFormGroupTouched(formGroup)).not.toThrow();
    });

    it('should handle FormGroup with mixed control types', () => {
      const formGroup = new FormGroup({
        name: new FormControl(''),
        contact: new FormGroup({
          email: new FormControl(''),
          phone: new FormControl('')
        }),
        age: new FormControl('')
      });

      service.markFormGroupTouched(formGroup);

      expect(formGroup.get('name')?.touched).toBeTrue();
      expect(formGroup.get('contact')?.touched).toBeTrue();
      expect(formGroup.get('contact.email')?.touched).toBeTrue();
      expect(formGroup.get('contact.phone')?.touched).toBeTrue();
      expect(formGroup.get('age')?.touched).toBeTrue();
    });

    it('should mark already touched controls as touched (idempotent)', () => {
      const formGroup = new FormGroup({
        name: new FormControl(''),
        email: new FormControl('')
      });

      formGroup.get('name')?.markAsTouched();
      
      service.markFormGroupTouched(formGroup);

      expect(formGroup.get('name')?.touched).toBeTrue();
      expect(formGroup.get('email')?.touched).toBeTrue();
    });
  });

  describe('ERROR_MESSAGES constant', () => {
    it('should contain all required error message mappings', () => {
      expect(ERROR_MESSAGES['required']).toBeDefined();
      expect(ERROR_MESSAGES['email']).toBeDefined();
      expect(ERROR_MESSAGES['minlength']).toBeDefined();
      expect(ERROR_MESSAGES['maxlength']).toBeDefined();
      expect(ERROR_MESSAGES['min']).toBeDefined();
      expect(ERROR_MESSAGES['max']).toBeDefined();
      expect(ERROR_MESSAGES['uniqueName']).toBeDefined();
      expect(ERROR_MESSAGES['positiveInteger']).toBeDefined();
      expect(ERROR_MESSAGES['dateRange']).toBeDefined();
      expect(ERROR_MESSAGES['pattern']).toBeDefined();
    });
  });

  describe('Message Interpolation', () => {
    it('should handle error value as non-object (boolean)', () => {
      const control = new FormControl('value');
      control.setErrors({ required: true });
      control.markAsTouched();
      const message = service.getErrorMessage(control);
      expect(message).toBe('This field is required');
    });

    it('should handle error value as null', () => {
      const control = new FormControl('value');
      control.setErrors({ required: null });
      control.markAsTouched();
      const message = service.getErrorMessage(control);
      expect(message).toBe('This field is required');
    });

    it('should not replace non-existent placeholders', () => {
      const control = new FormControl('value');
      control.setErrors({ 
        minlength: { 
          actualLength: 2 
          // requiredLength is missing
        } 
      });
      control.markAsTouched();
      const message = service.getErrorMessage(control);
      // Placeholder should remain in message since value is missing
      expect(message).toContain('{requiredLength}');
    });
  });
});
