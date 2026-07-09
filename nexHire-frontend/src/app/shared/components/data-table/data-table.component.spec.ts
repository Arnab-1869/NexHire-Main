import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { DataTableComponent, TableColumn, SortEvent, FilterEvent } from './data-table.component';
import { SharedModule } from '../../shared.module';
import { PageEvent } from '@angular/material/paginator';

interface TestData {
  id: number;
  name: string;
  email: string;
  status: string;
  age: number;
}

describe('DataTableComponent', () => {
  let component: DataTableComponent<TestData>;
  let fixture: ComponentFixture<DataTableComponent<TestData>>;

  const mockColumns: TableColumn[] = [
    { field: 'name', label: 'Name', sortable: true, filterable: true },
    { field: 'email', label: 'Email', sortable: true, filterable: true },
    { field: 'status', label: 'Status', sortable: false, filterable: false },
    { field: 'age', label: 'Age', sortable: true, filterable: false }
  ];

  const mockData: TestData[] = [
    { id: 1, name: 'John Doe', email: 'john@example.com', status: 'Active', age: 30 },
    { id: 2, name: 'Jane Smith', email: 'jane@example.com', status: 'Inactive', age: 25 },
    { id: 3, name: 'Bob Wilson', email: 'bob@example.com', status: 'Active', age: 35 }
  ];

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ DataTableComponent ],
      imports: [ SharedModule, NoopAnimationsModule ]
    }).compileComponents();

    fixture = TestBed.createComponent(DataTableComponent<TestData>);
    component = fixture.componentInstance;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('Component Initialization', () => {
    it('should initialize with default values', () => {
      expect(component.columns).toEqual([]);
      expect(component.data).toEqual([]);
      expect(component.pageSize).toBe(10);
      expect(component.selectable).toBe(false);
      expect(component.loading).toBe(false);
      expect(component.emptyMessage).toBe('No data available');
    });

    it('should update displayed columns on init', () => {
      component.columns = mockColumns;
      component.ngOnInit();
      
      expect(component.displayedColumns).toEqual(['name', 'email', 'status', 'age']);
    });

    it('should include select column when selectable is true', () => {
      component.columns = mockColumns;
      component.selectable = true;
      component.ngOnInit();
      
      expect(component.displayedColumns).toEqual(['select', 'name', 'email', 'status', 'age']);
    });
  });

  describe('Data Rendering', () => {
    beforeEach(() => {
      component.columns = mockColumns;
      component.data = mockData;
      component.totalRecords = mockData.length;
      fixture.detectChanges();
    });

    it('should render all column headers', () => {
      const compiled = fixture.nativeElement;
      const headers = compiled.querySelectorAll('th.mat-mdc-header-cell');
      
      expect(headers.length).toBe(mockColumns.length);
    });

    it('should render all data rows', () => {
      const compiled = fixture.nativeElement;
      const rows = compiled.querySelectorAll('tr.mat-mdc-row');
      
      expect(rows.length).toBe(mockData.length);
    });

    it('should display correct data values', () => {
      const compiled = fixture.nativeElement;
      const firstRowCells = compiled.querySelectorAll('tr.mat-mdc-row:first-child td');
      
      expect(firstRowCells[0].textContent.trim()).toContain('John Doe');
      expect(firstRowCells[1].textContent.trim()).toContain('john@example.com');
      expect(firstRowCells[2].textContent.trim()).toContain('Active');
    });

    it('should get column value from row correctly', () => {
      const row = mockData[0];
      const column = mockColumns[0];
      
      expect(component.getColumnValue(row, column)).toBe('John Doe');
    });
  });

  describe('Empty State', () => {
    it('should show empty state when data is empty', () => {
      component.columns = mockColumns;
      component.data = [];
      component.loading = false;
      fixture.detectChanges();
      
      const compiled = fixture.nativeElement;
      const emptyState = compiled.querySelector('app-empty-state');
      
      expect(emptyState).toBeTruthy();
    });

    it('should not show empty state when data is available', () => {
      component.columns = mockColumns;
      component.data = mockData;
      component.loading = false;
      fixture.detectChanges();
      
      const compiled = fixture.nativeElement;
      const emptyState = compiled.querySelector('app-empty-state');
      
      expect(emptyState).toBeFalsy();
    });

    it('should return true for isEmpty when data is empty', () => {
      component.data = [];
      expect(component.isEmpty).toBe(true);
    });

    it('should return false for isEmpty when data exists', () => {
      component.data = mockData;
      expect(component.isEmpty).toBe(false);
    });
  });

  describe('Loading State', () => {
    it('should show loading overlay when loading is true', () => {
      component.loading = true;
      fixture.detectChanges();
      
      const compiled = fixture.nativeElement;
      const loadingOverlay = compiled.querySelector('.loading-overlay');
      
      expect(loadingOverlay).toBeTruthy();
    });

    it('should not show loading overlay when loading is false', () => {
      component.loading = false;
      fixture.detectChanges();
      
      const compiled = fixture.nativeElement;
      const loadingOverlay = compiled.querySelector('.loading-overlay');
      
      expect(loadingOverlay).toBeFalsy();
    });

    it('should apply loading class to table wrapper when loading', () => {
      component.loading = true;
      fixture.detectChanges();
      
      const compiled = fixture.nativeElement;
      const tableWrapper = compiled.querySelector('.table-wrapper');
      
      expect(tableWrapper.classList.contains('loading')).toBe(true);
    });
  });

  describe('Sorting', () => {
    beforeEach(() => {
      component.columns = mockColumns;
      component.data = mockData;
      fixture.detectChanges();
    });

    it('should emit sort event when column header is clicked', () => {
      spyOn(component.sortChange, 'emit');
      
      const sortEvent = { active: 'name', direction: 'asc' } as any;
      component.onSortChange(sortEvent);
      
      expect(component.sortChange.emit).toHaveBeenCalledWith({
        column: 'name',
        direction: 'asc'
      });
    });

    it('should emit sort event with correct direction', () => {
      spyOn(component.sortChange, 'emit');
      
      const sortEvent = { active: 'email', direction: 'desc' } as any;
      component.onSortChange(sortEvent);
      
      expect(component.sortChange.emit).toHaveBeenCalledWith({
        column: 'email',
        direction: 'desc'
      });
    });
  });

  describe('Filtering', () => {
    beforeEach(() => {
      component.columns = mockColumns;
      component.data = mockData;
      component.ngOnInit();
      fixture.detectChanges();
    });

    it('should emit filter event after debounce period', fakeAsync(() => {
      spyOn(component.filterChange, 'emit');
      
      component.onFilterInput('name', 'John');
      
      // Should not emit immediately
      expect(component.filterChange.emit).not.toHaveBeenCalled();
      
      // Wait for debounce
      tick(300);
      
      expect(component.filterChange.emit).toHaveBeenCalledWith({
        column: 'name',
        value: 'John'
      });
    }));

    it('should not emit filter event before debounce period', fakeAsync(() => {
      spyOn(component.filterChange, 'emit');
      
      component.onFilterInput('name', 'John');
      tick(100);
      
      expect(component.filterChange.emit).not.toHaveBeenCalled();
      
      tick(200);
      expect(component.filterChange.emit).toHaveBeenCalled();
    }));

    it('should debounce multiple filter inputs', fakeAsync(() => {
      spyOn(component.filterChange, 'emit');
      
      component.onFilterInput('name', 'J');
      tick(100);
      component.onFilterInput('name', 'Jo');
      tick(100);
      component.onFilterInput('name', 'John');
      tick(300);
      
      // Should only emit once with final value
      expect(component.filterChange.emit).toHaveBeenCalledTimes(1);
      expect(component.filterChange.emit).toHaveBeenCalledWith({
        column: 'name',
        value: 'John'
      });
    }));

    it('should handle filter input for different columns independently', fakeAsync(() => {
      spyOn(component.filterChange, 'emit');
      
      component.onFilterInput('name', 'John');
      tick(150);
      component.onFilterInput('email', 'john@');
      tick(300);
      
      expect(component.filterChange.emit).toHaveBeenCalledTimes(2);
    }));
  });

  describe('Pagination', () => {
    beforeEach(() => {
      component.columns = mockColumns;
      component.data = mockData;
      component.totalRecords = 50;
      component.pageSize = 10;
      fixture.detectChanges();
    });

    it('should show pagination when total records exceeds page size', () => {
      expect(component.showPagination).toBe(true);
    });

    it('should not show pagination when total records is less than page size', () => {
      component.totalRecords = 5;
      component.pageSize = 10;
      
      expect(component.showPagination).toBe(false);
    });

    it('should emit page change event when page is changed', () => {
      spyOn(component.pageChange, 'emit');
      
      const pageEvent: PageEvent = {
        pageIndex: 1,
        pageSize: 10,
        length: 50
      };
      
      component.onPageChange(pageEvent);
      
      expect(component.pageChange.emit).toHaveBeenCalledWith(pageEvent);
    });

    it('should emit page size change event when page size is changed', () => {
      spyOn(component.pageSizeChange, 'emit');
      spyOn(component.pageChange, 'emit');
      
      const pageEvent: PageEvent = {
        pageIndex: 0,
        pageSize: 25,
        length: 50
      };
      
      component.onPageSizeChange(pageEvent);
      
      expect(component.pageSizeChange.emit).toHaveBeenCalledWith(25);
      expect(component.pageChange.emit).toHaveBeenCalledWith(pageEvent);
    });

    it('should not render paginator when data is empty', () => {
      component.data = [];
      fixture.detectChanges();
      
      const compiled = fixture.nativeElement;
      const paginator = compiled.querySelector('mat-paginator');
      
      expect(paginator).toBeFalsy();
    });
  });

  describe('Selection', () => {
    beforeEach(() => {
      component.columns = mockColumns;
      component.data = mockData;
      component.selectable = true;
      component.ngOnInit();
      fixture.detectChanges();
    });

    it('should display checkboxes when selectable is true', () => {
      const compiled = fixture.nativeElement;
      const checkboxes = compiled.querySelectorAll('mat-checkbox');
      
      // Header checkbox + row checkboxes
      expect(checkboxes.length).toBe(mockData.length + 1);
    });

    it('should select all rows when header checkbox is clicked', () => {
      component.toggleAllRows();
      
      expect(component.selection.selected.length).toBe(mockData.length);
      expect(component.isAllSelected()).toBe(true);
    });

    it('should deselect all rows when header checkbox is clicked again', () => {
      component.toggleAllRows();
      expect(component.isAllSelected()).toBe(true);
      
      component.toggleAllRows();
      expect(component.selection.selected.length).toBe(0);
      expect(component.isAllSelected()).toBe(false);
    });

    it('should toggle individual row selection', () => {
      const row = mockData[0];
      
      component.toggleRow(row);
      expect(component.isSelected(row)).toBe(true);
      
      component.toggleRow(row);
      expect(component.isSelected(row)).toBe(false);
    });

    it('should emit selection change event when selection changes', (done) => {
      component.selectionChange.subscribe(selected => {
        expect(selected.length).toBe(1);
        expect(selected[0]).toBe(mockData[0]);
        done();
      });
      
      component.toggleRow(mockData[0]);
    });

    it('should return correct checkbox label for header', () => {
      const label = component.checkboxLabel();
      expect(label).toContain('select all');
      
      component.toggleAllRows();
      const labelAfterSelect = component.checkboxLabel();
      expect(labelAfterSelect).toContain('deselect all');
    });

    it('should return correct checkbox label for row', () => {
      const row = mockData[0];
      const label = component.checkboxLabel(row);
      expect(label).toContain('select row 1');
      
      component.toggleRow(row);
      const labelAfterSelect = component.checkboxLabel(row);
      expect(labelAfterSelect).toContain('deselect row 1');
    });

    it('should maintain selection state when data updates', () => {
      const row = mockData[0];
      component.toggleRow(row);
      
      expect(component.selection.selected.length).toBe(1);
      
      // Simulate data update
      component.data = [...mockData];
      component.ngOnChanges();
      
      // Selection should be maintained
      expect(component.selection.selected.length).toBe(1);
    });
  });

  describe('Track By Function', () => {
    it('should return item id if available', () => {
      const item = { id: 123, name: 'Test', email: 'test@test.com', status: 'Active', age: 30 };
      expect(component.trackByFn(0, item)).toBe(123);
    });

    it('should return index if item id is not available', () => {
      const item = { name: 'Test', email: 'test@test.com', status: 'Active', age: 30 } as any;
      expect(component.trackByFn(5, item)).toBe(5);
    });
  });

  describe('Cleanup', () => {
    it('should unsubscribe from observables on destroy', () => {
      component.columns = mockColumns;
      component.ngOnInit();
      
      spyOn(component['destroy$'], 'next');
      spyOn(component['destroy$'], 'complete');
      
      component.ngOnDestroy();
      
      expect(component['destroy$'].next).toHaveBeenCalled();
      expect(component['destroy$'].complete).toHaveBeenCalled();
    });

    it('should complete filter subjects on destroy', () => {
      component.columns = mockColumns;
      component.ngOnInit();
      
      const filterSubjects = Array.from(component['filterSubjects'].values());
      filterSubjects.forEach(subject => {
        spyOn(subject, 'complete');
      });
      
      component.ngOnDestroy();
      
      filterSubjects.forEach(subject => {
        expect(subject.complete).toHaveBeenCalled();
      });
    });
  });

  describe('Column Width', () => {
    it('should apply custom width to columns', () => {
      const columnsWithWidth: TableColumn[] = [
        { field: 'name', label: 'Name', width: '200px' },
        { field: 'email', label: 'Email', width: '300px' }
      ];
      
      component.columns = columnsWithWidth;
      component.data = mockData;
      fixture.detectChanges();
      
      const compiled = fixture.nativeElement;
      const headers = compiled.querySelectorAll('th.mat-mdc-header-cell');
      
      expect(headers[0].style.width).toBe('200px');
      expect(headers[1].style.width).toBe('300px');
    });
  });
});
