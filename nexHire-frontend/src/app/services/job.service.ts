import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import {
  Job,
  CreateJobRequest,
  JobFilter,
  JobStatus,
} from '../models/job.model';
import { API_ENDPOINTS } from '../config/api-endpoints';
import { BaseService } from './base.service';

/** Raw shape returned by the backend JobResponse DTO. */
interface BackendJob {
  id: number;
  title: string;
  description: string;
  requirements: string;
  locationName: string;
  locationId: number;
  active: boolean;
  createdAt: string;
}

@Injectable({ providedIn: 'root' })
export class JobService extends BaseService {
  constructor(http: HttpClient) {
    super(http);
  }

  getAll(filters?: JobFilter): Observable<Job[]> {
    return this.http.get<BackendJob[]>(API_ENDPOINTS.JOBS.BASE).pipe(
      map((list) => (list || []).map((j) => this.toJob(j))),
      map((jobs) => this.applyClientFilters(jobs, filters)),
    );
  }

  getById(id: number): Observable<Job> {
    return this.http
      .get<BackendJob>(API_ENDPOINTS.JOBS.BY_ID(id))
      .pipe(map((j) => this.toJob(j)));
  }

  create(request: CreateJobRequest): Observable<Job> {
    // Map frontend job form → backend JobRequest { title, description, requirements, locationId }
    const payload = {
      title: request.jobTitle,
      description: request.jobDescription,
      requirements: request.requiredSkills,
      locationId: (request as any).locationId ?? 1,
    };
    return this.http
      .post<BackendJob>(API_ENDPOINTS.JOBS.CREATE, payload)
      .pipe(map((j) => this.toJob(j)));
  }

  // ─── Mapping ──────────────────────────────────────────────────────────────
  private toJob(b: BackendJob): Job {
    return {
      jobId: b.id,
      jobTitle: b.title,
      jobDescription: b.description,
      requiredSkills: b.requirements ?? '',
      location: b.locationName ?? '',
      locationId: b.locationId,
      status: (b.active ? 'ACTIVE' : 'CLOSED') as JobStatus,
      postedDate: b.createdAt,
      companyName: 'NexHire',
    };
  }

  private applyClientFilters(jobs: Job[], filters?: JobFilter): Job[] {
    if (!filters) return jobs;
    let result = jobs;
    if (filters.search) {
      const s = filters.search.toLowerCase();
      result = result.filter(
        (j) =>
          j.jobTitle.toLowerCase().includes(s) ||
          (j.requiredSkills || '').toLowerCase().includes(s),
      );
    }
    if (filters.status)
      result = result.filter((j) => j.status === filters.status);
    if (filters.location) {
      result = result.filter((j) =>
        j.location.toLowerCase().includes(filters.location!.toLowerCase()),
      );
    }
    return result;
  }
}
