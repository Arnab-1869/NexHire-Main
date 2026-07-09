import { ComponentFixture, TestBed } from '@angular/core/testing';
import { TimelineComponent, EventType, TimelineEvent } from './timeline.component';
import { EmptyStateComponent } from '../empty-state/empty-state.component';
import { StatusBadgeComponent } from '../status-badge/status-badge.component';
import { RelativeDatePipe } from '../../pipes/relative-date.pipe';
import { MatIconModule } from '@angular/material/icon';
import { DebugElement } from '@angular/core';
import { By } from '@angular/platform-browser';

describe('TimelineComponent', () => {
  let component: TimelineComponent;
  let fixture: ComponentFixture<TimelineComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [
        TimelineComponent,
        EmptyStateComponent,
        StatusBadgeComponent,
        RelativeDatePipe
      ],
      imports: [MatIconModule]
    }).compileComponents();

    fixture = TestBed.createComponent(TimelineComponent);
    component = fixture.componentInstance;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('Event Sorting', () => {
    it('should sort events by timestamp in descending order', () => {
      const mockEvents: TimelineEvent[] = [
        {
          id: '1',
          title: 'Event 1',
          description: 'First event',
          timestamp: new Date('2024-01-01'),
          actorName: 'John Doe',
          type: EventType.CREATION
        },
        {
          id: '2',
          title: 'Event 2',
          description: 'Second event',
          timestamp: new Date('2024-01-03'),
          actorName: 'Jane Smith',
          type: EventType.UPDATE
        },
        {
          id: '3',
          title: 'Event 3',
          description: 'Third event',
          timestamp: new Date('2024-01-02'),
          actorName: 'Bob Johnson',
          type: EventType.STATUS_CHANGE
        }
      ];

      component.events = mockEvents;
      component.ngOnInit();

      expect(component.sortedEvents[0].id).toBe('2'); // Most recent
      expect(component.sortedEvents[1].id).toBe('3'); // Middle
      expect(component.sortedEvents[2].id).toBe('1'); // Oldest
    });

    it('should handle empty events array', () => {
      component.events = [];
      component.ngOnInit();

      expect(component.sortedEvents).toEqual([]);
    });

    it('should re-sort events when events input changes', () => {
      const initialEvents: TimelineEvent[] = [
        {
          id: '1',
          title: 'Event 1',
          description: 'First event',
          timestamp: new Date('2024-01-01'),
          actorName: 'John Doe',
          type: EventType.CREATION
        }
      ];

      component.events = initialEvents;
      component.ngOnInit();
      expect(component.sortedEvents.length).toBe(1);

      const newEvents: TimelineEvent[] = [
        ...initialEvents,
        {
          id: '2',
          title: 'Event 2',
          description: 'Second event',
          timestamp: new Date('2024-01-02'),
          actorName: 'Jane Smith',
          type: EventType.UPDATE
        }
      ];

      component.events = newEvents;
      component.ngOnChanges();
      expect(component.sortedEvents.length).toBe(2);
    });
  });

  describe('Event Icon Mapping', () => {
    it('should return correct icon for STATUS_CHANGE event', () => {
      const icon = component.getEventIcon(EventType.STATUS_CHANGE);
      expect(icon).toBe('sync_alt');
    });

    it('should return correct icon for ASSIGNMENT event', () => {
      const icon = component.getEventIcon(EventType.ASSIGNMENT);
      expect(icon).toBe('assignment_ind');
    });

    it('should return correct icon for UPDATE event', () => {
      const icon = component.getEventIcon(EventType.UPDATE);
      expect(icon).toBe('edit');
    });

    it('should return correct icon for CREATION event', () => {
      const icon = component.getEventIcon(EventType.CREATION);
      expect(icon).toBe('add_circle');
    });

    it('should return correct icon for DELETION event', () => {
      const icon = component.getEventIcon(EventType.DELETION);
      expect(icon).toBe('delete');
    });
  });

  describe('Status Change Detection', () => {
    it('should identify status change events with old and new status', () => {
      const statusChangeEvent: TimelineEvent = {
        id: '1',
        title: 'Status Changed',
        description: 'Application status updated',
        timestamp: new Date(),
        actorName: 'HR Manager',
        type: EventType.STATUS_CHANGE,
        metadata: {
          oldStatus: 'SUBMITTED',
          newStatus: 'APPROVED'
        }
      };

      expect(component.isStatusChangeEvent(statusChangeEvent)).toBe(true);
    });

    it('should return false for non-status-change events', () => {
      const updateEvent: TimelineEvent = {
        id: '1',
        title: 'Updated',
        description: 'Record updated',
        timestamp: new Date(),
        actorName: 'User',
        type: EventType.UPDATE
      };

      expect(component.isStatusChangeEvent(updateEvent)).toBe(false);
    });

    it('should return false for status change event without metadata', () => {
      const statusChangeEvent: TimelineEvent = {
        id: '1',
        title: 'Status Changed',
        description: 'Application status updated',
        timestamp: new Date(),
        actorName: 'HR Manager',
        type: EventType.STATUS_CHANGE
      };

      expect(component.isStatusChangeEvent(statusChangeEvent)).toBe(false);
    });

    it('should extract old status from metadata', () => {
      const event: TimelineEvent = {
        id: '1',
        title: 'Status Changed',
        description: 'Status updated',
        timestamp: new Date(),
        actorName: 'User',
        type: EventType.STATUS_CHANGE,
        metadata: { oldStatus: 'PENDING', newStatus: 'APPROVED' }
      };

      expect(component.getOldStatus(event)).toBe('PENDING');
    });

    it('should extract new status from metadata', () => {
      const event: TimelineEvent = {
        id: '1',
        title: 'Status Changed',
        description: 'Status updated',
        timestamp: new Date(),
        actorName: 'User',
        type: EventType.STATUS_CHANGE,
        metadata: { oldStatus: 'PENDING', newStatus: 'APPROVED' }
      };

      expect(component.getNewStatus(event)).toBe('APPROVED');
    });

    it('should return empty string for missing old status', () => {
      const event: TimelineEvent = {
        id: '1',
        title: 'Status Changed',
        description: 'Status updated',
        timestamp: new Date(),
        actorName: 'User',
        type: EventType.STATUS_CHANGE,
        metadata: { newStatus: 'APPROVED' }
      };

      expect(component.getOldStatus(event)).toBe('');
    });
  });

  describe('Template Rendering', () => {
    it('should display empty state when no events', () => {
      component.events = [];
      fixture.detectChanges();

      const emptyState = fixture.debugElement.query(By.css('.timeline-empty'));
      expect(emptyState).toBeTruthy();
    });

    it('should display timeline items when events exist', () => {
      const mockEvents: TimelineEvent[] = [
        {
          id: '1',
          title: 'Event 1',
          description: 'First event',
          timestamp: new Date(),
          actorName: 'John Doe',
          type: EventType.CREATION
        },
        {
          id: '2',
          title: 'Event 2',
          description: 'Second event',
          timestamp: new Date(),
          actorName: 'Jane Smith',
          type: EventType.UPDATE
        }
      ];

      component.events = mockEvents;
      fixture.detectChanges();

      const timelineItems = fixture.debugElement.queryAll(By.css('.timeline-item'));
      expect(timelineItems.length).toBe(2);
    });

    it('should display event title and description', () => {
      const mockEvent: TimelineEvent = {
        id: '1',
        title: 'Test Event',
        description: 'This is a test event',
        timestamp: new Date(),
        actorName: 'Test User',
        type: EventType.CREATION
      };

      component.events = [mockEvent];
      fixture.detectChanges();

      const title = fixture.debugElement.query(By.css('.timeline-title'));
      const description = fixture.debugElement.query(By.css('.timeline-description'));

      expect(title.nativeElement.textContent).toContain('Test Event');
      expect(description.nativeElement.textContent).toContain('This is a test event');
    });

    it('should display actor name', () => {
      const mockEvent: TimelineEvent = {
        id: '1',
        title: 'Event',
        description: 'Description',
        timestamp: new Date(),
        actorName: 'John Doe',
        type: EventType.UPDATE
      };

      component.events = [mockEvent];
      fixture.detectChanges();

      const actor = fixture.debugElement.query(By.css('.timeline-actor'));
      expect(actor.nativeElement.textContent).toContain('John Doe');
    });

    it('should display status badges for status change events', () => {
      const statusChangeEvent: TimelineEvent = {
        id: '1',
        title: 'Status Changed',
        description: 'Status updated',
        timestamp: new Date(),
        actorName: 'HR Manager',
        type: EventType.STATUS_CHANGE,
        metadata: {
          oldStatus: 'PENDING',
          newStatus: 'APPROVED'
        }
      };

      component.events = [statusChangeEvent];
      fixture.detectChanges();

      const statusBadges = fixture.debugElement.queryAll(By.directive(StatusBadgeComponent));
      expect(statusBadges.length).toBe(2); // Old and new status
    });

    it('should use custom empty message', () => {
      const customMessage = 'Custom empty message';
      component.events = [];
      component.emptyMessage = customMessage;
      fixture.detectChanges();

      const emptyState = fixture.debugElement.query(By.directive(EmptyStateComponent));
      expect(emptyState.componentInstance.title).toBe(customMessage);
    });
  });
});
