import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import {
  HTTP_INTERCEPTORS,
  provideHttpClient,
  withInterceptorsFromDi,
} from '@angular/common/http';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { CoreModule } from './core/core.module';
import { SharedModule } from './shared/shared.module';

// ─── Layouts ─────────────────────────────────────────────────────────────────
import { PublicLayoutComponent } from './layouts/public-layout/public-layout.component';
import { CandidateLayoutComponent } from './layouts/candidate-layout/candidate-layout.component';
import { HrLayoutComponent } from './layouts/hr-layout/hr-layout.component';
import { AdminLayoutComponent } from './layouts/admin-layout/admin-layout.component';

// ─── Candidate Portal Components ─────────────────────────────────────────────
import { CandidateProfileComponent } from './modules/candidate/profile/candidate-profile.component';
import { ChangePasswordComponent } from './modules/candidate/change-password/change-password.component';
import { CandidateDashboardComponent } from './modules/candidate/dashboard/candidate-dashboard.component';
import { CandidateApplicationsComponent } from './modules/candidate/applications/candidate-applications.component';
import { CandidateOffersComponent } from './modules/candidate/offers/candidate-offers.component';
import { JobsListComponent } from './modules/candidate/jobs-list/jobs-list.component';
import { JobDetailsComponent } from './modules/candidate/job-details/job-details.component';
import { ApplicationFormComponent } from './modules/candidate/application-form/application-form.component';
import { CandidateJoiningComponent } from './modules/candidate/joining/candidate-joining.component';
import { CandidateTrainingComponent } from './modules/candidate/training/candidate-training.component';
import { CandidateBgvComponent } from './modules/candidate/bgv/candidate-bgv.component';

// ─── HR Portal Components ─────────────────────────────────────────────────────
import { HrDashboardComponent } from './modules/dashboard/hr-dashboard/hr-dashboard.component';
import { ApplicationsManagementComponent } from './modules/applications/applications.component';
import { AssessmentsManagementComponent } from './modules/assessments/assessments.component';
import { OfferLettersManagementComponent } from './modules/offer-letters/offer-letters.component';
import { BgvManagementComponent } from './modules/bgv/bgv.component';
import { SelectedCandidatesComponent } from './modules/selected/selected.component';
import { TraineesManagementComponent } from './modules/trainees/trainees.component';
import { AssetsManagementComponent } from './modules/assets/assets.component';
import { ReleasedCandidatesComponent } from './modules/released/released.component';
import { ProjectsComponent } from './modules/projects/projects.component';
import { BudgetOverviewComponent } from './modules/budget-overview/budget-overview.component';

// ─── Admin Portal Components ─────────────────────────────────────────────────
import { AdminDashboardComponent } from './modules/admin/admin-dashboard/admin-dashboard.component';
import { UserManagementComponent } from './modules/admin/user-management/user-management.component';
import { CreateUserDialogComponent } from './modules/admin/user-management/create-user-dialog.component';
import { ActivityLogsComponent } from './modules/admin/activity-logs/activity-logs.component';
import { BudgetsComponent } from './modules/admin/budgets/budgets.component';
import { SystemSettingsComponent } from './modules/admin/system-settings/system-settings.component';
import { CitiesComponent } from './modules/admin/locations/cities/cities.component';
import { BranchesComponent } from './modules/admin/locations/branches/branches.component';
import { BlocksComponent } from './modules/admin/locations/blocks/blocks.component';
import { RolesComponent } from './modules/admin/roles/roles.component';

// ─── Error Components ─────────────────────────────────────────────────────────
import { UnauthorizedComponent } from './modules/errors/unauthorized.component';
import { NotFoundComponent } from './modules/errors/not-found.component';

@NgModule({
  declarations: [
    AppComponent,
    // Layouts
    PublicLayoutComponent,
    CandidateLayoutComponent,
    HrLayoutComponent,
    AdminLayoutComponent,
    // Candidate Portal
    CandidateProfileComponent,
    ChangePasswordComponent,
    CandidateDashboardComponent,
    CandidateApplicationsComponent,
    CandidateOffersComponent,
    JobsListComponent,
    JobDetailsComponent,
    ApplicationFormComponent,
    CandidateJoiningComponent,
    CandidateTrainingComponent,
    CandidateBgvComponent,
    // HR Portal
    HrDashboardComponent,
    ApplicationsManagementComponent,
    AssessmentsManagementComponent,
    OfferLettersManagementComponent,
    BgvManagementComponent,
    SelectedCandidatesComponent,
    TraineesManagementComponent,
    AssetsManagementComponent,
    ReleasedCandidatesComponent,
    ProjectsComponent,
    BudgetOverviewComponent,
    // Admin Portal
    AdminDashboardComponent,
    UserManagementComponent,
    CreateUserDialogComponent,
    ActivityLogsComponent,
    BudgetsComponent,
    SystemSettingsComponent,
    CitiesComponent,
    BranchesComponent,
    BlocksComponent,
    RolesComponent,
    // Errors
    UnauthorizedComponent,
    NotFoundComponent,
  ],
  bootstrap: [AppComponent],
  imports: [
    BrowserModule,
    BrowserAnimationsModule,
    AppRoutingModule,
    CoreModule,
    SharedModule,
  ],
  providers: [provideHttpClient(withInterceptorsFromDi())],
})
export class AppModule {}
