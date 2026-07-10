import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

// ─── Layouts ─────────────────────────────────────────────────────────────────
import { PublicLayoutComponent } from './layouts/public-layout/public-layout.component';
import { CandidateLayoutComponent } from './layouts/candidate-layout/candidate-layout.component';
import { HrLayoutComponent } from './layouts/hr-layout/hr-layout.component';
import { AdminLayoutComponent } from './layouts/admin-layout/admin-layout.component';

// ─── Guards ──────────────────────────────────────────────────────────────────
import { AuthGuard } from './core/guards/auth.guard';
import { RoleGuard } from './core/guards/role.guard';
import { PermissionGuard } from './core/guards/permission.guard';

// ─── Candidate Portal Pages ──────────────────────────────────────────────────
import { CandidateDashboardComponent } from './modules/candidate/dashboard/candidate-dashboard.component';
import { JobsListComponent } from './modules/candidate/jobs-list/jobs-list.component';
import { JobDetailsComponent } from './modules/candidate/job-details/job-details.component';
import { ApplicationFormComponent } from './modules/candidate/application-form/application-form.component';
import { CandidateApplicationsComponent } from './modules/candidate/applications/candidate-applications.component';
import { CandidateOffersComponent } from './modules/candidate/offers/candidate-offers.component';
import { CandidateJoiningComponent } from './modules/candidate/joining/candidate-joining.component';
import { CandidateTrainingComponent } from './modules/candidate/training/candidate-training.component';
import { CandidateProfileComponent } from './modules/candidate/profile/candidate-profile.component';
import { ChangePasswordComponent } from './modules/candidate/change-password/change-password.component';
import { CandidateBgvComponent } from './modules/candidate/bgv/candidate-bgv.component';

// ─── HR Portal Pages ─────────────────────────────────────────────────────────
import { HrDashboardComponent } from './modules/dashboard/hr-dashboard/hr-dashboard.component';
import { ApplicationsManagementComponent } from './modules/applications/applications.component';
import { AssessmentsManagementComponent } from './modules/assessments/assessments.component';
import { SelectedCandidatesComponent } from './modules/selected/selected.component';
import { OfferLettersManagementComponent } from './modules/offer-letters/offer-letters.component';
import { BgvManagementComponent } from './modules/bgv/bgv.component';
import { TraineesManagementComponent } from './modules/trainees/trainees.component';
import { AssetsManagementComponent } from './modules/assets/assets.component';
import { ProjectsComponent } from './modules/projects/projects.component';
import { BudgetOverviewComponent } from './modules/budget-overview/budget-overview.component';
import { ReleasedCandidatesComponent } from './modules/released/released.component';

// ─── Admin Portal Pages ──────────────────────────────────────────────────────
import { AdminDashboardComponent } from './modules/admin/admin-dashboard/admin-dashboard.component';
import { UserManagementComponent } from './modules/admin/user-management/user-management.component';
import { ActivityLogsComponent } from './modules/admin/activity-logs/activity-logs.component';
import { CitiesComponent } from './modules/admin/locations/cities/cities.component';
import { BranchesComponent } from './modules/admin/locations/branches/branches.component';
import { BlocksComponent } from './modules/admin/locations/blocks/blocks.component';
import { BudgetsComponent } from './modules/admin/budgets/budgets.component';
import { SystemSettingsComponent } from './modules/admin/system-settings/system-settings.component';
import { RolesComponent } from './modules/admin/roles/roles.component';

// ─── Error Pages ─────────────────────────────────────────────────────────────
import { UnauthorizedComponent } from './modules/errors/unauthorized.component';
import { NotFoundComponent } from './modules/errors/not-found.component';

const routes: Routes = [
  // ─── Public / Auth routes ──────────────────────────────────────────────────
  {
    path: '',
    component: PublicLayoutComponent,
    children: [
      {
        path: '',
        loadChildren: () =>
          import('./modules/auth/auth.module').then((m) => m.AuthModule),
      },
      {
        path: 'auth',
        loadChildren: () =>
          import('./modules/auth/auth.module').then((m) => m.AuthModule),
      },
    ],
  },

  // ─── Candidate Portal (/candidate/**) ─────────────────────────────────────
  {
    path: 'candidate',
    component: CandidateLayoutComponent,
    canActivate: [AuthGuard, RoleGuard],
    data: { roles: ['CANDIDATE'] },
    children: [
      { path: '', component: CandidateDashboardComponent, pathMatch: 'full' },
      { path: 'jobs', component: JobsListComponent },
      { path: 'jobs/:id', component: JobDetailsComponent },
      { path: 'apply/:id', component: ApplicationFormComponent },
      { path: 'applications', component: CandidateApplicationsComponent },
      { path: 'offers', component: CandidateOffersComponent },
      { path: 'joining', component: CandidateJoiningComponent },
      { path: 'training', component: CandidateTrainingComponent },
      { path: 'profile', component: CandidateProfileComponent },
      { path: 'change-password', component: ChangePasswordComponent },
      { path: 'bgv', component: CandidateBgvComponent },
    ],
  },

  // ─── HR Portal (/hr/**) ───────────────────────────────────────────────────
  {
    path: 'hr',
    component: HrLayoutComponent,
    canActivate: [AuthGuard, RoleGuard],
    data: { roles: ['HR', 'TRAINING_MANAGER', 'RMG'] },
    children: [
      { path: '', component: HrDashboardComponent, pathMatch: 'full' },
      { path: 'profile', component: CandidateProfileComponent },
      { path: 'change-password', component: ChangePasswordComponent },
      {
        path: 'applications',
        component: ApplicationsManagementComponent,
        canActivate: [PermissionGuard],
        data: { permissions: ['VIEW_APPLICATIONS'] },
      },
      {
        path: 'assessments',
        component: AssessmentsManagementComponent,
        canActivate: [PermissionGuard],
        data: { permissions: ['VIEW_ASSESSMENTS'] },
      },
      {
        path: 'selected',
        component: SelectedCandidatesComponent,
        canActivate: [PermissionGuard],
        data: { permissions: ['VIEW_SELECTED_CANDIDATES'] },
      },
      {
        path: 'offers',
        component: OfferLettersManagementComponent,
        canActivate: [PermissionGuard],
        data: { permissions: ['VIEW_OFFERS'] },
      },
      {
        path: 'bgv',
        component: BgvManagementComponent,
        canActivate: [PermissionGuard],
        data: { permissions: ['VIEW_BGV'] },
      },
      {
        path: 'trainees',
        component: TraineesManagementComponent,
        canActivate: [PermissionGuard],
        data: { permissions: ['VIEW_TRAINEES'] },
      },
      {
        path: 'budget',
        component: BudgetOverviewComponent,
        canActivate: [PermissionGuard],
        data: { permissions: ['VIEW_LOCATIONS'] },
      },
      {
        path: 'released',
        component: ReleasedCandidatesComponent,
        canActivate: [PermissionGuard],
        data: { permissions: ['ALLOCATE_PROJECT'] },
      },
    ],
  },

  // ─── Admin Portal (/admin/**) ─────────────────────────────────────────────
  {
    path: 'admin',
    component: AdminLayoutComponent,
    canActivate: [AuthGuard, RoleGuard],
    data: { roles: ['ADMIN'] },
    children: [
      { path: '', component: AdminDashboardComponent, pathMatch: 'full' },
      { path: 'profile', component: CandidateProfileComponent },
      { path: 'change-password', component: ChangePasswordComponent },
      {
        path: 'activity-logs',
        component: ActivityLogsComponent,
        canActivate: [PermissionGuard],
        data: { permissions: ['VIEW_ACTIVITY_LOGS'] },
      },
      {
        path: 'assets',
        component: AssetsManagementComponent,
        canActivate: [PermissionGuard],
        data: { permissions: ['VIEW_ASSETS'] },
      },
      {
        path: 'projects',
        component: ProjectsComponent,
        canActivate: [PermissionGuard],
        data: { permissions: ['MANAGE_PROJECTS'] },
      },
      {
        path: 'users',
        component: UserManagementComponent,
        canActivate: [PermissionGuard],
        data: { permissions: ['MANAGE_ROLES'] },
      },
      {
        path: 'roles',
        component: RolesComponent,
        canActivate: [PermissionGuard],
        data: { permissions: ['MANAGE_ROLES'] },
      },
      {
        path: 'role-permissions',
        component: RolesComponent,
        canActivate: [PermissionGuard],
        data: { permissions: ['MANAGE_PERMISSIONS'] },
      },
      {
        path: 'cities',
        component: CitiesComponent,
        canActivate: [PermissionGuard],
        data: { permissions: ['MANAGE_PERMISSIONS'] },
      },
      {
        path: 'branches',
        component: BranchesComponent,
        canActivate: [PermissionGuard],
        data: { permissions: ['MANAGE_PERMISSIONS'] },
      },
      {
        path: 'blocks',
        component: BlocksComponent,
        canActivate: [PermissionGuard],
        data: { permissions: ['MANAGE_PERMISSIONS'] },
      },
      {
        path: 'budgets',
        component: BudgetsComponent,
        canActivate: [PermissionGuard],
        data: { permissions: ['MANAGE_PERMISSIONS'] },
      },
      {
        path: 'settings',
        component: SystemSettingsComponent,
        canActivate: [PermissionGuard],
        data: { permissions: ['MANAGE_PERMISSIONS'] },
      },
    ],
  },

  // ─── Legacy redirects from /dashboard → new portals ──────────────────────
  { path: 'dashboard', redirectTo: '/hr', pathMatch: 'full' },

  // ─── Error pages ──────────────────────────────────────────────────────────
  { path: 'error/403', component: UnauthorizedComponent },
  { path: '404', component: NotFoundComponent },
  { path: '**', redirectTo: '/404' },
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule],
})
export class AppRoutingModule {}
