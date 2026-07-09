import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';
import { LayoutModule } from '@angular/cdk/layout';

// Angular Material
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTableModule } from '@angular/material/table';
import { MatPaginatorModule } from '@angular/material/paginator';
import { MatSortModule } from '@angular/material/sort';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatDialogModule } from '@angular/material/dialog';
import { MatChipsModule } from '@angular/material/chips';
import { MatMenuModule } from '@angular/material/menu';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatCardModule } from '@angular/material/card';
import { MatDividerModule } from '@angular/material/divider';
import { MatBadgeModule } from '@angular/material/badge';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { MatTabsModule } from '@angular/material/tabs';
import { MatStepperModule } from '@angular/material/stepper';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatExpansionModule } from '@angular/material/expansion';

// Shared Components
import { StatusBadgeComponent } from './components/status-badge/status-badge.component';
import { EmptyStateComponent } from './components/empty-state/empty-state.component';
import { LoaderComponent } from './components/loader/loader.component';
import { ToastComponent } from './components/toast/toast.component';
import { ConfirmationDialogComponent } from './components/confirmation-dialog/confirmation-dialog.component';
import { BulkActionBarComponent } from './components/bulk-action-bar/bulk-action-bar.component';
import { PageHeaderComponent } from './components/page-header/page-header.component';
import { DataTableComponent } from './components/data-table/data-table.component';
import { TimelineComponent } from './components/timeline/timeline.component';
import { FileUploadComponent } from './components/file-upload/file-upload.component';

// Shared Directives
import { HasPermissionDirective, HasAnyPermissionDirective } from './directives/has-permission.directive';

// Shared Pipes
import { RelativeDatePipe } from './pipes/relative-date.pipe';

const MATERIAL_MODULES = [
  MatButtonModule, MatIconModule, MatTableModule, MatPaginatorModule,
  MatSortModule, MatFormFieldModule, MatInputModule, MatSelectModule,
  MatCheckboxModule, MatDialogModule, MatChipsModule, MatMenuModule,
  MatTooltipModule, MatProgressSpinnerModule, MatCardModule, MatDividerModule,
  MatBadgeModule, MatDatepickerModule, MatNativeDateModule, MatAutocompleteModule,
  MatTabsModule, MatStepperModule, MatSlideToggleModule, MatProgressBarModule,
  MatExpansionModule,
];

const SHARED_COMPONENTS = [
  StatusBadgeComponent,
  EmptyStateComponent,
  LoaderComponent,
  ToastComponent,
  ConfirmationDialogComponent,
  BulkActionBarComponent,
  PageHeaderComponent,
  DataTableComponent,
  TimelineComponent,
  FileUploadComponent,
];

const SHARED_DIRECTIVES = [
  HasPermissionDirective,
  HasAnyPermissionDirective,
];

const SHARED_PIPES = [
  RelativeDatePipe,
];

@NgModule({
  declarations: [
    ...SHARED_COMPONENTS,
    ...SHARED_DIRECTIVES,
    ...SHARED_PIPES,
  ],
  imports: [
    CommonModule,
    RouterModule,
    ReactiveFormsModule,
    FormsModule,
    LayoutModule,
    ...MATERIAL_MODULES,
  ],
  exports: [
    CommonModule,
    RouterModule,
    ReactiveFormsModule,
    FormsModule,
    LayoutModule,
    ...MATERIAL_MODULES,
    ...SHARED_COMPONENTS,
    ...SHARED_DIRECTIVES,
    ...SHARED_PIPES,
  ],
})
export class SharedModule {}
