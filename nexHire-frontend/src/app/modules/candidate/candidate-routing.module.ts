import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { CandidateDashboardComponent } from './dashboard/candidate-dashboard.component';
import { CandidateApplicationsComponent } from './applications/candidate-applications.component';
import { CandidateOffersComponent } from './offers/candidate-offers.component';
import { JobsListComponent } from './jobs-list/jobs-list.component';
import { JobDetailsComponent } from './job-details/job-details.component';
import { ApplicationFormComponent } from './application-form/application-form.component';
import { CandidateJoiningComponent } from './joining/candidate-joining.component';
import { CandidateBgvComponent } from './bgv/candidate-bgv.component';

const routes: Routes = [
  { path: '', component: CandidateDashboardComponent },
  { path: 'jobs', component: JobsListComponent },
  { path: 'jobs/:id', component: JobDetailsComponent },
  { path: 'apply/:id', component: ApplicationFormComponent },
  { path: 'applications', component: CandidateApplicationsComponent },
  { path: 'offers', component: CandidateOffersComponent },
  { path: 'joining', component: CandidateJoiningComponent },
  { path: 'bgv', component: CandidateBgvComponent },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class CandidateRoutingModule {}
