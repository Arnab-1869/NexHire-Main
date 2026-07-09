import { FormControl, ValidationErrors } from '@angular/forms';
import { Observable, of, throwError } from 'rxjs';
import { CustomValidators } from './custom-validators';

describe('CustomValidators', () => {
  describe('uniqueName', () => {
    it('should return null when control value is empty', (done) => {
      const mockService = {
        checkUnique: jasmine.createSpy('checkUnique')
      };
      const validator = CustomValidators.uniqueName(mockService, 'name');
      const control = new FormControl('');

      const result = validator(control) as Observable<ValidationErrors | null>;
      result.subscribe((res: ValidationErrors | null) => {
        expect(res).toBeNull();
        expect(mockService.checkUnique).not.toHaveBeenCalled();
        done();
      });
    });

    it('should return { uniqueName: true } when name already exists', (done) => {
      const mockService = {
        checkUnique: jasmine.createSpy('checkUnique').and.returnValue(of(true))
      };
      const validator = CustomValidators.uniqueName(mockService, 'name');
      const control = new FormControl('existingName');

      const result = validator(control) as Observable<ValidationErrors | null>;
      result.subscribe((res: ValidationErrors | null) => {
        expect(res).toEqual({ uniqueName: true });
        done();
      });
    });

    it('should return null when name is unique', (done) => {
      const mockService = {
        checkUnique: jasmine.createSpy('checkUnique').and.returnValue(of(false))
      };
      const validator = CustomValidators.uniqueName(mockService, 'name');
      const control = new FormControl('uniqueName');

      const result = validator(control) as Observable<ValidationErrors | null>;
      result.subscribe((res: ValidationErrors | null) => {
        expect(res).toBeNull();
        done();
      });
    });

    it('should return null on error', (done) => {
      const mockService = {
        checkUnique: jasmine.createSpy('checkUnique').and.returnValue(throwError(() => new Error('Service error')))
      };
      const validator = CustomValidators.uniqueName(mockService, 'name');
      const control = new FormControl('testName');

      const result = validator(control) as Observable<ValidationErrors | null>;
      result.subscribe((res: ValidationErrors | null) => {
        expect(res).toBeNull();
        done();
      });
    });
  });

  describe('dateRange', () => {
    it('should return null when control value is empty', () => {
      const validator = CustomValidators.dateRange();
      const control = new FormControl('');

      expect(validator(control)).toBeNull();
    });

    it('should return { dateRange: true } for invalid date', () => {
      const validator = CustomValidators.dateRange();
      const control = new FormControl('invalid-date');

      expect(validator(control)).toEqual({ dateRange: true });
    });

    it('should return { dateRange: true } when date is before minDate', () => {
      const minDate = new Date('2024-01-01');
      const validator = CustomValidators.dateRange(minDate);
      const control = new FormControl('2023-12-31');

      expect(validator(control)).toEqual({ dateRange: true });
    });

    it('should return { dateRange: true } when date is after maxDate', () => {
      const maxDate = new Date('2024-12-31');
      const validator = CustomValidators.dateRange(undefined, maxDate);
      const control = new FormControl('2025-01-01');

      expect(validator(control)).toEqual({ dateRange: true });
    });

    it('should return null when date is within range', () => {
      const minDate = new Date('2024-01-01');
      const maxDate = new Date('2024-12-31');
      const validator = CustomValidators.dateRange(minDate, maxDate);
      const control = new FormControl('2024-06-15');

      expect(validator(control)).toBeNull();
    });

    it('should return null when date equals minDate', () => {
      const minDate = new Date('2024-01-01');
      const validator = CustomValidators.dateRange(minDate);
      const control = new FormControl('2024-01-01');

      expect(validator(control)).toBeNull();
    });

    it('should return null when date equals maxDate', () => {
      const maxDate = new Date('2024-12-31');
      const validator = CustomValidators.dateRange(undefined, maxDate);
      const control = new FormControl('2024-12-31');

      expect(validator(control)).toBeNull();
    });
  });

  describe('positiveInteger', () => {
    it('should return null when control value is empty', () => {
      const validator = CustomValidators.positiveInteger();
      const control = new FormControl('');

      expect(validator(control)).toBeNull();
    });

    it('should return null when control value is null', () => {
      const validator = CustomValidators.positiveInteger();
      const control = new FormControl(null);

      expect(validator(control)).toBeNull();
    });

    it('should return { positiveInteger: true } for zero', () => {
      const validator = CustomValidators.positiveInteger();
      const control = new FormControl(0);

      expect(validator(control)).toEqual({ positiveInteger: true });
    });

    it('should return { positiveInteger: true } for negative integer', () => {
      const validator = CustomValidators.positiveInteger();
      const control = new FormControl(-5);

      expect(validator(control)).toEqual({ positiveInteger: true });
    });

    it('should return { positiveInteger: true } for decimal number', () => {
      const validator = CustomValidators.positiveInteger();
      const control = new FormControl(3.14);

      expect(validator(control)).toEqual({ positiveInteger: true });
    });

    it('should return { positiveInteger: true } for non-numeric value', () => {
      const validator = CustomValidators.positiveInteger();
      const control = new FormControl('abc');

      expect(validator(control)).toEqual({ positiveInteger: true });
    });

    it('should return null for positive integer', () => {
      const validator = CustomValidators.positiveInteger();
      const control = new FormControl(10);

      expect(validator(control)).toBeNull();
    });

    it('should return null for string representation of positive integer', () => {
      const validator = CustomValidators.positiveInteger();
      const control = new FormControl('25');

      expect(validator(control)).toBeNull();
    });
  });

  describe('progressRange', () => {
    it('should return null for value 0', () => {
      const validator = CustomValidators.progressRange();
      const control = new FormControl(0);

      expect(validator(control)).toBeNull();
    });

    it('should return null for value 50', () => {
      const validator = CustomValidators.progressRange();
      const control = new FormControl(50);

      expect(validator(control)).toBeNull();
    });

    it('should return null for value 100', () => {
      const validator = CustomValidators.progressRange();
      const control = new FormControl(100);

      expect(validator(control)).toBeNull();
    });

    it('should return validation error for value -10', () => {
      const validator = CustomValidators.progressRange();
      const control = new FormControl(-10);

      const result = validator(control);
      expect(result).not.toBeNull();
      expect(result?.['min']).toBeDefined();
    });

    it('should return validation error for value 150', () => {
      const validator = CustomValidators.progressRange();
      const control = new FormControl(150);

      const result = validator(control);
      expect(result).not.toBeNull();
      expect(result?.['max']).toBeDefined();
    });

    it('should return null for empty value', () => {
      const validator = CustomValidators.progressRange();
      const control = new FormControl('');

      expect(validator(control)).toBeNull();
    });
  });
});
