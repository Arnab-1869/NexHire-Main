import { Component, Input, OnInit, OnChanges } from '@angular/core';

/**
 * Timeline: Displays chronological event history with formatted timestamps.
 * Supports various event types with distinct icons and integrates with Status Badge.
 *
 * Usage:
 *   <app-timeline [events]="eventHistory" [emptyMessage]="'No activity recorded'"></app-timeline>
 */

export enum EventType {
  STATUS_CHANGE = 'status_change',
  ASSIGNMENT = 'assignment',
  UPDATE = 'update',
  CREATION = 'creation',
  DELETION = 'deletion'
}

export interface TimelineEvent {
  id: string;
  title: string;
  description: string;
  timestamp: Date;
  actorName: string;
  type: EventType;
  metadata?: Record<string, any>;
}

@Component({
    selector: 'app-timeline',
    templateUrl: './timeline.component.html',
    styleUrls: ['./timeline.component.scss'],
    standalone: false
})
export class TimelineComponent implements OnInit, OnChanges {
  @Input() events: TimelineEvent[] = [];
  @Input() emptyMessage = 'No activity recorded';

  sortedEvents: TimelineEvent[] = [];
  EventType = EventType;

  ngOnInit(): void {
    this.sortEvents();
  }

  ngOnChanges(): void {
    this.sortEvents();
  }

  private sortEvents(): void {
    if (this.events && this.events.length > 0) {
      // Sort by timestamp descending (most recent first)
      this.sortedEvents = [...this.events].sort((a, b) => {
        const dateA = new Date(a.timestamp).getTime();
        const dateB = new Date(b.timestamp).getTime();
        return dateB - dateA;
      });
    } else {
      this.sortedEvents = [];
    }
  }

  getEventIcon(type: EventType): string {
    const iconMap: Record<EventType, string> = {
      [EventType.STATUS_CHANGE]: 'sync_alt',
      [EventType.ASSIGNMENT]: 'assignment_ind',
      [EventType.UPDATE]: 'edit',
      [EventType.CREATION]: 'add_circle',
      [EventType.DELETION]: 'delete'
    };
    return iconMap[type] || 'info';
  }

  isStatusChangeEvent(event: TimelineEvent): boolean {
    return event.type === EventType.STATUS_CHANGE && 
           !!event.metadata && 
           !!(event.metadata['oldStatus'] || event.metadata['newStatus']);
  }

  getOldStatus(event: TimelineEvent): string {
    return event.metadata?.['oldStatus'] || '';
  }

  getNewStatus(event: TimelineEvent): string {
    return event.metadata?.['newStatus'] || '';
  }
}
