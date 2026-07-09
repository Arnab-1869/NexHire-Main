import { Pipe, PipeTransform } from '@angular/core';

/**
 * RelativeDate Pipe: Formats dates as relative time for recent events
 * and absolute date for older events.
 * 
 * - Events < 7 days old: "2 hours ago", "3 days ago"
 * - Events >= 7 days old: "Jan 15, 2024"
 */
@Pipe({
    name: 'relativeDate',
    standalone: false
})
export class RelativeDatePipe implements PipeTransform {
  transform(value: Date | string): string {
    if (!value) return '';

    const date = new Date(value);
    const now = new Date();
    const diffInMs = now.getTime() - date.getTime();
    const diffInDays = Math.floor(diffInMs / (1000 * 60 * 60 * 24));

    // If less than 7 days old, use relative format
    if (diffInDays < 7) {
      return this.getRelativeTime(diffInMs);
    }

    // If 7 days or older, use absolute format
    return this.getAbsoluteDate(date);
  }

  private getRelativeTime(diffInMs: number): string {
    const seconds = Math.floor(diffInMs / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);

    if (seconds < 60) {
      return 'Just now';
    } else if (minutes < 60) {
      return `${minutes} ${minutes === 1 ? 'minute' : 'minutes'} ago`;
    } else if (hours < 24) {
      return `${hours} ${hours === 1 ? 'hour' : 'hours'} ago`;
    } else {
      return `${days} ${days === 1 ? 'day' : 'days'} ago`;
    }
  }

  private getAbsoluteDate(date: Date): string {
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 
                    'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const month = months[date.getMonth()];
    const day = date.getDate();
    const year = date.getFullYear();
    
    return `${month} ${day}, ${year}`;
  }
}
