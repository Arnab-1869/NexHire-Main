import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Job } from '../../../models/job.model';
import { JobService } from '../../../services/job.service';

@Component({
    selector: 'app-job-details',
    templateUrl: './job-details.component.html',
    styleUrls: ['./job-details.component.scss'],
    standalone: false
})
export class JobDetailsComponent implements OnInit {
  job: Job | null = null;
  loading = false;
  jobId: number = 0;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private jobService: JobService
  ) {}

  ngOnInit(): void {
    this.route.params.subscribe(params => {
      this.jobId = +params['id'];
      this.loadJobDetails();
    });
  }

  loadJobDetails(): void {
    this.loading = true;
    this.jobService.getById(this.jobId).subscribe({
      next: (job) => {
        this.job = job;
        this.loading = false;
      },
      error: (error) => {
        console.error('Error loading job details:', error);
        this.loading = false;
      }
    });
  }

  applyForJob(): void {
    this.router.navigate(['/dashboard/candidate/apply', this.jobId]);
  }

  goBack(): void {
    this.router.navigate(['/dashboard/candidate/jobs']);
  }
}
