import { RelativeDatePipe } from './relative-date.pipe';

describe('RelativeDatePipe', () => {
  let pipe: RelativeDatePipe;

  beforeEach(() => {
    pipe = new RelativeDatePipe();
  });

  it('should create an instance', () => {
    expect(pipe).toBeTruthy();
  });

  describe('Relative Time Format (< 7 days)', () => {
    it('should return "Just now" for events less than 60 seconds ago', () => {
      const now = new Date();
      const date = new Date(now.getTime() - 30 * 1000); // 30 seconds ago
      const result = pipe.transform(date);
      expect(result).toBe('Just now');
    });

    it('should return minutes ago for events less than 60 minutes ago', () => {
      const now = new Date();
      const date = new Date(now.getTime() - 5 * 60 * 1000); // 5 minutes ago
      const result = pipe.transform(date);
      expect(result).toBe('5 minutes ago');
    });

    it('should return "1 minute ago" for singular minute', () => {
      const now = new Date();
      const date = new Date(now.getTime() - 1 * 60 * 1000); // 1 minute ago
      const result = pipe.transform(date);
      expect(result).toBe('1 minute ago');
    });

    it('should return hours ago for events less than 24 hours ago', () => {
      const now = new Date();
      const date = new Date(now.getTime() - 3 * 60 * 60 * 1000); // 3 hours ago
      const result = pipe.transform(date);
      expect(result).toBe('3 hours ago');
    });

    it('should return "1 hour ago" for singular hour', () => {
      const now = new Date();
      const date = new Date(now.getTime() - 1 * 60 * 60 * 1000); // 1 hour ago
      const result = pipe.transform(date);
      expect(result).toBe('1 hour ago');
    });

    it('should return days ago for events less than 7 days ago', () => {
      const now = new Date();
      const date = new Date(now.getTime() - 5 * 24 * 60 * 60 * 1000); // 5 days ago
      const result = pipe.transform(date);
      expect(result).toBe('5 days ago');
    });

    it('should return "1 day ago" for singular day', () => {
      const now = new Date();
      const date = new Date(now.getTime() - 1 * 24 * 60 * 60 * 1000); // 1 day ago
      const result = pipe.transform(date);
      expect(result).toBe('1 day ago');
    });
  });

  describe('Absolute Date Format (>= 7 days)', () => {
    it('should return absolute date for events 7 days or older', () => {
      const date = new Date('2024-01-15');
      const result = pipe.transform(date);
      expect(result).toBe('Jan 15, 2024');
    });

    it('should format different months correctly', () => {
      const testCases = [
        { date: new Date('2024-02-20'), expected: 'Feb 20, 2024' },
        { date: new Date('2024-03-10'), expected: 'Mar 10, 2024' },
        { date: new Date('2024-04-05'), expected: 'Apr 5, 2024' },
        { date: new Date('2024-05-30'), expected: 'May 30, 2024' },
        { date: new Date('2024-06-15'), expected: 'Jun 15, 2024' },
        { date: new Date('2024-07-01'), expected: 'Jul 1, 2024' },
        { date: new Date('2024-08-25'), expected: 'Aug 25, 2024' },
        { date: new Date('2024-09-12'), expected: 'Sep 12, 2024' },
        { date: new Date('2024-10-08'), expected: 'Oct 8, 2024' },
        { date: new Date('2024-11-22'), expected: 'Nov 22, 2024' },
        { date: new Date('2024-12-31'), expected: 'Dec 31, 2024' }
      ];

      testCases.forEach(({ date, expected }) => {
        const result = pipe.transform(date);
        expect(result).toBe(expected);
      });
    });

    it('should handle dates from previous years', () => {
      const date = new Date('2023-06-15');
      const result = pipe.transform(date);
      expect(result).toBe('Jun 15, 2023');
    });
  });

  describe('Edge Cases', () => {
    it('should return empty string for null value', () => {
      const result = pipe.transform(null as any);
      expect(result).toBe('');
    });

    it('should return empty string for undefined value', () => {
      const result = pipe.transform(undefined as any);
      expect(result).toBe('');
    });

    it('should handle string date input', () => {
      const now = new Date();
      const date = new Date(now.getTime() - 2 * 60 * 60 * 1000); // 2 hours ago
      const result = pipe.transform(date.toISOString());
      expect(result).toBe('2 hours ago');
    });

    it('should handle string date input for absolute dates', () => {
      const result = pipe.transform('2024-01-15T10:30:00Z');
      expect(result).toBe('Jan 15, 2024');
    });
  });

  describe('Boundary Conditions', () => {
    it('should use relative format for exactly 6 days and 23 hours ago', () => {
      const now = new Date();
      const date = new Date(now.getTime() - (6 * 24 + 23) * 60 * 60 * 1000);
      const result = pipe.transform(date);
      expect(result).toBe('6 days ago');
    });

    it('should use absolute format for exactly 7 days ago', () => {
      const now = new Date();
      const date = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
      const result = pipe.transform(date);
      
      // Should be in format like "Jan 15, 2024"
      expect(result).toMatch(/^[A-Z][a-z]{2} \d{1,2}, \d{4}$/);
    });
  });
});
