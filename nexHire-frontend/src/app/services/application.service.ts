import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import {
  Application,
  ApplyRequest,
  UpdateApplicationStatusRequest,
  ApplicationFilter,
  ApplicationStatus,
} from '../models/application.model';
import { API_ENDPOINTS } from '../config/api-endpoints';
import { BaseService } from './base.service';

/** Raw shape returned by the backend ApplicationResponse DTO. */
interface BackendApplication {
  id: number;
  userId: number;
  userName: string;
  userEmail: string;
  jobId: number;
  jobTitle: string;
  status: string;
  holdReason?: string;
  holdCreatedAt?: string;
  holdResolvedAt?: string;
  appliedAt: string;
  updatedAt?: string;
}

@Injectable({ providedIn: 'root' })
export class ApplicationService extends BaseService {
  constructor(http: HttpClient) {
    super(http);
  }

  /** HR: all applications. */
  getAll(filters?: ApplicationFilter): Observable<Application[]> {
    return this.http
      .get<BackendApplication[]>(API_ENDPOINTS.APPLICATIONS.BASE)
      .pipe(
        map((list) => (list || []).map((a) => this.toApplication(a))),
        map((apps) => this.applyClientFilters(apps, filters)),
      );
  }

  getById(id: number): Observable<Application> {
    return this.http
      .get<BackendApplication>(API_ENDPOINTS.APPLICATIONS.BY_ID(id))
      .pipe(map((a) => this.toApplication(a)));
  }

  /** Candidate: own applications. Backend derives the user from JWT, so userId is ignored. */
  getByUser(_userId: number): Observable<Application[]> {
    return this.http
      .get<BackendApplication[]>(API_ENDPOINTS.APPLICATIONS.MY)
      .pipe(map((list) => (list || []).map((a) => this.toApplication(a))));
  }

  /** Candidate: apply. Backend takes { jobId } and derives user from JWT. */
  apply(request: ApplyRequest): Observable<Application> {
    return this.http
      .post<BackendApplication>(API_ENDPOINTS.APPLICATIONS.APPLY, {
        jobId: request.jobId,
      })
      .pipe(map((a) => this.toApplication(a)));
  }

  /**
   * HR status transition. The backend exposes discrete transition endpoints.
   * The only transition wired through this method is APPLIED -> start assessment.
   */
  updateStatus(
    id: number,
    request: UpdateApplicationStatusRequest,
  ): Observable<Application> {
    return this.http
      .put<BackendApplication>(
        API_ENDPOINTS.APPLICATIONS.START_ASSESSMENT(id),
        {},
      )
      .pipe(map((a) => this.toApplication(a)));
  }

  /** Explicit: move APPLIED -> ASSESSMENT_PENDING. */
  startAssessment(id: number): Observable<Application> {
    return this.http
      .put<BackendApplication>(
        API_ENDPOINTS.APPLICATIONS.START_ASSESSMENT(id),
        {},
      )
      .pipe(map((a) => this.toApplication(a)));
  }

  // ─── Mapping ──────────────────────────────────────────────────────────────
  private toApplication(b: BackendApplication): Application {
    return {
      applicationId: b.id,
      userId: b.userId,
      jobId: b.jobId,
      userFullName: b.userName,
      userEmail: b.userEmail,
      jobTitle: b.jobTitle,
      status: b.status as ApplicationStatus,
      appliedDate: b.appliedAt,
      updatedAt: b.updatedAt,
      holdReason: b.holdReason,
      holdCreatedAt: b.holdCreatedAt,
      holdResolvedAt: b.holdResolvedAt,
    };
  }

  private applyClientFilters(
    apps: Application[],
    filters?: ApplicationFilter,
  ): Application[] {
    if (!filters) return apps;
    let result = apps;
    if (filters.jobId) result = result.filter((a) => a.jobId === filters.jobId);
    if (filters.status)
      result = result.filter((a) => a.status === filters.status);
    if (filters.search) {
      const s = filters.search.toLowerCase();
      result = result.filter(
        (a) =>
          (a.userFullName || '').toLowerCase().includes(s) ||
          (a.userEmail || '').toLowerCase().includes(s),
      );
    }
    return result;
  }
}
