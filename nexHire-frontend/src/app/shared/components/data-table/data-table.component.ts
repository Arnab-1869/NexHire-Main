import { Component, Input, Output, EventEmitter, ViewChild, OnInit, OnDestroy, TemplateRef, ContentChild } from '@angular/core';
import { MatPaginator, PageEvent } from '@angular/material/paginator';
import { MatSort, Sort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { SelectionModel } from '@angular/cdk/collections';
import { Subject } from 'rxjs';
import { debounceTime, distinctUntilChanged, takeUntil } from 'rxjs/operators';

export interface TableColumn {
  field: string;
  label: string;
  sortable?: boolean;
  filterable?: boolean;
  filterType?: 'text' | 'select' | 'date';
  width?: string;
  cellTemplate?: TemplateRef<any>;
}

export interface SortEvent {
  column: string;
  direction: 'asc' | 'desc' | '';
}

export interface FilterEvent {
  column: string;
  value: any;
}

/**
 * DataTable: Generic reusable data table with sorting, filtering, pagination, and selection.
 *
 * Usage:
 *   <app-data-table
 *     [columns]="columns"
 *     [data]="data"
 *     [totalRecords]="totalRecords"
 *     [pageSize]="10"
 *     [selectable]="true"
 *     [loading]="loading"
 *     (sortChange)="onSort($event)"
 *     (filterChange)="onFilter($event)"
 *     (pageChange)="onPageChange($event)"
 *     (selectionChange)="onSelectionChange($event)">
 *   </app-data-table>
 */
@Component({
    selector: 'app-data-table',
    templateUrl: './data-table.component.html',
    styleUrls: ['./data-table.component.scss'],
    standalone: false
})
export class DataTableComponent<T extends { id?: string | number }> implements OnInit, OnDestroy {
  @Input() columns: TableColumn[] = [];
  @Input() data: T[] = [];
  @Input() totalRecords: number = 0;
  @Input() pageSize: number = 10;
  @Input() pageSizeOptions: number[] = [10, 25, 50, 100];
  @Input() selectable: boolean = false;
  @Input() loading: boolean = false;
  @Input() emptyMessage: string = 'No data available';

  @Output() sortChange = new EventEmitter<SortEvent>();
  @Output() filterChange = new EventEmitter<FilterEvent>();
  @Output() pageChange = new EventEmitter<PageEvent>();
  @Output() pageSizeChange = new EventEmitter<number>();
  @Output() selectionChange = new EventEmitter<T[]>();

  @ViewChild(MatPaginator, { static: false }) paginator!: MatPaginator;
  @ViewChild(MatSort, { static: false }) sort!: MatSort;

  dataSource: MatTableDataSource<T> = new MatTableDataSource<T>([]);
  selection = new SelectionModel<T>(true, []);
  displayedColumns: string[] = [];

  private filterSubjects = new Map<string, Subject<string>>();
  private destroy$ = new Subject<void>();

  ngOnInit(): void {
    this.updateDisplayedColumns();
    this.updateDataSource();
    this.setupFilterDebouncing();
    this.setupSelectionListener();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
    this.filterSubjects.forEach(subject => subject.complete());
  }

  ngOnChanges(): void {
    this.updateDataSource();
    this.updateDisplayedColumns();
  }

  private updateDisplayedColumns(): void {
    this.displayedColumns = [];
    if (this.selectable) {
      this.displayedColumns.push('select');
    }
    this.displayedColumns.push(...this.columns.map(col => col.field));
  }

  private updateDataSource(): void {
    this.dataSource.data = this.data || [];
  }

  private setupFilterDebouncing(): void {
    this.columns
      .filter(col => col.filterable)
      .forEach(col => {
        const subject = new Subject<string>();
        this.filterSubjects.set(col.field, subject);

        subject.pipe(
          debounceTime(300),
          distinctUntilChanged(),
          takeUntil(this.destroy$)
        ).subscribe(value => {
          this.filterChange.emit({ column: col.field, value });
        });
      });
  }

  private setupSelectionListener(): void {
    this.selection.changed.pipe(
      takeUntil(this.destroy$)
    ).subscribe(() => {
      this.selectionChange.emit(this.selection.selected);
    });
  }

  onFilterInput(column: string, value: string): void {
    const subject = this.filterSubjects.get(column);
    if (subject) {
      subject.next(value);
    }
  }

  onSortChange(sort: Sort): void {
    this.sortChange.emit({
      column: sort.active,
      direction: sort.direction as 'asc' | 'desc' | ''
    });
  }

  onPageChange(event: PageEvent): void {
    this.pageChange.emit(event);
  }

  onPageSizeChange(event: PageEvent): void {
    this.pageSizeChange.emit(event.pageSize);
    this.pageChange.emit(event);
  }

  /** Whether the number of selected elements matches the total number of rows. */
  isAllSelected(): boolean {
    const numSelected = this.selection.selected.length;
    const numRows = this.dataSource.data.length;
    return numSelected === numRows;
  }

  /** Selects all rows if they are not all selected; otherwise clear selection. */
  toggleAllRows(): void {
    if (this.isAllSelected()) {
      this.selection.clear();
      return;
    }

    this.selection.select(...this.dataSource.data);
  }

  /** The label for the checkbox on the passed row */
  checkboxLabel(row?: T): string {
    if (!row) {
      return `${this.isAllSelected() ? 'deselect' : 'select'} all`;
    }
    const index = this.dataSource.data.indexOf(row);
    return `${this.selection.isSelected(row) ? 'deselect' : 'select'} row ${index + 1}`;
  }

  /** Check if row is selected */
  isSelected(row: T): boolean {
    return this.selection.isSelected(row);
  }

  /** Toggle row selection */
  toggleRow(row: T): void {
    this.selection.toggle(row);
  }

  /** Track by function for ngFor optimization */
  trackByFn(index: number, item: T): any {
    return item.id ?? index;
  }

  /** ✅ FIX: Track by function for column ngFor optimization */
  trackByColumn(index: number, column: TableColumn): any {
    return column.field;
  }

  /** Get column value from row */
  getColumnValue(row: T, column: TableColumn): any {
    return (row as any)[column.field];
  }

  /** Check if data is empty */
  get isEmpty(): boolean {
    return !this.data || this.data.length === 0;
  }

  /** Check if pagination should be shown */
  get showPagination(): boolean {
    return this.totalRecords > this.pageSize;
  }
}
