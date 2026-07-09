# Timeline Component Usage Examples

## Basic Usage

```typescript
import { Component } from '@angular/core';
import { TimelineEvent, EventType } from './shared/components/timeline/timeline.component';

@Component({
  selector: 'app-application-details',
  template: `
    <div class="application-details">
      <h2>Application History</h2>
      <app-timeline [events]="applicationHistory"></app-timeline>
    </div>
  `
})
export class ApplicationDetailsComponent {
  applicationHistory: TimelineEvent[] = [
    {
      id: '1',
      title: 'Application Created',
      description: 'New application submitted for Software Engineer position',
      timestamp: new Date('2024-01-15T10:30:00'),
      actorName: 'John Doe',
      type: EventType.CREATION
    },
    {
      id: '2',
      title: 'Status Changed',
      description: 'Application moved to review stage',
      timestamp: new Date('2024-01-16T14:20:00'),
      actorName: 'HR Manager',
      type: EventType.STATUS_CHANGE,
      metadata: {
        oldStatus: 'SUBMITTED',
        newStatus: 'UNDER_REVIEW'
      }
    },
    {
      id: '3',
      title: 'Assessment Assigned',
      description: 'Technical assessment assigned to candidate',
      timestamp: new Date('2024-01-17T09:15:00'),
      actorName: 'Technical Lead',
      type: EventType.ASSIGNMENT
    },
    {
      id: '4',
      title: 'Status Changed',
      description: 'Application approved',
      timestamp: new Date('2024-01-20T16:45:00'),
      actorName: 'Hiring Manager',
      type: EventType.STATUS_CHANGE,
      metadata: {
        oldStatus: 'UNDER_REVIEW',
        newStatus: 'APPROVED'
      }
    }
  ];
}
```

## Custom Empty Message

```typescript
@Component({
  selector: 'app-trainee-timeline',
  template: `
    <app-timeline 
      [events]="traineeEvents" 
      [emptyMessage]="'No training activity recorded yet'">
    </app-timeline>
  `
})
export class TraineeTimelineComponent {
  traineeEvents: TimelineEvent[] = [];
}
```

## All Event Types

```typescript
const allEventTypes: TimelineEvent[] = [
  {
    id: '1',
    title: 'Record Created',
    description: 'New trainee record created',
    timestamp: new Date(),
    actorName: 'Admin',
    type: EventType.CREATION  // Icon: add_circle, Color: Purple
  },
  {
    id: '2',
    title: 'Batch Assigned',
    description: 'Assigned to Training Batch A',
    timestamp: new Date(),
    actorName: 'Training Coordinator',
    type: EventType.ASSIGNMENT  // Icon: assignment_ind, Color: Green
  },
  {
    id: '3',
    title: 'Progress Updated',
    description: 'Training progress updated to 75%',
    timestamp: new Date(),
    actorName: 'Trainer',
    type: EventType.UPDATE  // Icon: edit, Color: Yellow
  },
  {
    id: '4',
    title: 'Status Changed',
    description: 'Trainee marked as completed',
    timestamp: new Date(),
    actorName: 'HR Manager',
    type: EventType.STATUS_CHANGE  // Icon: sync_alt, Color: Blue
  },
  {
    id: '5',
    title: 'Record Deleted',
    description: 'Trainee record archived',
    timestamp: new Date(),
    actorName: 'Admin',
    type: EventType.DELETION  // Icon: delete, Color: Red
  }
];
```

## With Additional Metadata

```typescript
const eventWithMetadata: TimelineEvent = {
  id: '1',
  title: 'Offer Letter Sent',
  description: 'Offer letter sent to candidate via email',
  timestamp: new Date(),
  actorName: 'HR Team',
  type: EventType.UPDATE,
  metadata: {
    offerAmount: '$80,000',
    position: 'Senior Developer',
    emailSent: true,
    attachments: ['offer_letter.pdf', 'benefits_summary.pdf']
  }
};
```

## Features

### 1. Automatic Sorting
Events are automatically sorted by timestamp in descending order (most recent first).

### 2. Timestamp Formatting
- **Recent events (< 7 days)**: "Just now", "5 minutes ago", "2 hours ago", "3 days ago"
- **Older events (>= 7 days)**: "Jan 15, 2024"

### 3. Status Change Events
When event type is `STATUS_CHANGE` and metadata contains `oldStatus` and `newStatus`, the timeline automatically displays status badges showing the transition.

### 4. Empty State
When no events are provided, displays a friendly empty state with customizable message.

### 5. Responsive Design
Timeline adapts to mobile devices with adjusted spacing and layout.

### 6. Event Type Icons
Each event type has a distinct Material Icon:
- **CREATION**: add_circle (Purple)
- **ASSIGNMENT**: assignment_ind (Green)
- **UPDATE**: edit (Yellow)
- **STATUS_CHANGE**: sync_alt (Blue)
- **DELETION**: delete (Red)

## Integration with Services

```typescript
@Component({
  selector: 'app-application-view',
  template: `
    <app-timeline [events]="events$ | async"></app-timeline>
  `
})
export class ApplicationViewComponent implements OnInit {
  events$: Observable<TimelineEvent[]>;

  constructor(private applicationService: ApplicationService) {}

  ngOnInit(): void {
    this.events$ = this.applicationService.getApplicationHistory(this.applicationId)
      .pipe(
        map(history => history.map(h => ({
          id: h.id,
          title: h.eventTitle,
          description: h.eventDescription,
          timestamp: new Date(h.createdAt),
          actorName: h.performedBy,
          type: this.mapEventType(h.eventType),
          metadata: h.metadata
        })))
      );
  }

  private mapEventType(type: string): EventType {
    // Map your API event types to TimelineEvent EventType enum
    switch (type) {
      case 'created': return EventType.CREATION;
      case 'assigned': return EventType.ASSIGNMENT;
      case 'updated': return EventType.UPDATE;
      case 'status_changed': return EventType.STATUS_CHANGE;
      case 'deleted': return EventType.DELETION;
      default: return EventType.UPDATE;
    }
  }
}
```
