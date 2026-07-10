import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, forkJoin, of } from 'rxjs';
import { map } from 'rxjs/operators';
import {
  Assessment,
  AssignSelectedRequest,
  AssignAllEligibleRequest,
  UpdateAssessmentStatusRequest,
  AssessmentBulkResult,
} from '../models/assessment.model';
import { API_ENDPOINTS } from '../config/api-endpoints';
import { BaseService } from './base.service';

/**
 * Backend assessment model is driven by application-status transitions:
 *   POST /api/assessments/{applicationId}          -> enter score (APPLICATION goes ASSESSMENT_COMPLETED)
 *   PUT  /api/assessments/{applicationId}/qualify   -> QUALIFIED
 *   PUT  /api/assessments/{applicationId}/reject    -> REJECTED
 *
 * The transition APPLIED -> ASSESSMENT_PENDING is triggered from the applications
 * endpoint (start-assessment).
 */
@Injectable({ providedIn: 'root' })
export class AssessmentService extends BaseService {
  constructor(http: HttpClient) {
    super(http);
  }

  // ─── Real backend operations ────────────────────────────────────────────────

  /** HR enters an assessment score for an application in ASSESSMENT_PENDING. */
  enterScore(
    applicationId: number,
    score: number,
    remarks?: string,
  ): Observable<any> {
    return this.http.post(
      API_ENDPOINTS.ASSESSMENTS.ENTER_SCORE(applicationId),
      { score, remarks },
    );
  }

  /** HR qualifies an application in ASSESSMENT_COMPLETED. */
  qualify(applicationId: number): Observable<any> {
    return this.http.put(API_ENDPOINTS.ASSESSMENTS.QUALIFY(applicationId), {});
  }

  /** HR rejects an application in ASSESSMENT_COMPLETED. */
  reject(applicationId: number): Observable<any> {
    return this.http.put(API_ENDPOINTS.ASSESSMENTS.REJECT(applicationId), {});
  }

  // ─── Compatibility shims for the existing assessments UI ─────────────────────

  getAll(): Observable<Assessment[]> {
    return this.http.get<Assessment[]>(API_ENDPOINTS.ASSESSMENTS.BASE);
  }

  /**
   * "Assign selected" == start assessment for each selected application id.
   * Backend: PUT /api/applications/{id}/start-assessment
   */
  assignSelected(
    request: AssignSelectedRequest,
  ): Observable<AssessmentBulkResult> {
    const ids = Array.from(new Set(request.applicationIds));
    if (ids.length === 0) {
      return of(this.emptyBulkResult());
    }
    const calls = ids.map((id) =>
      this.http.put(API_ENDPOINTS.APPLICATIONS.START_ASSESSMENT(id), {}),
    );
    return forkJoin(calls).pipe(
      map(() => ({
        totalRequested: ids.length,
        assignedCount: ids.length,
        skippedCount: 0,
        failedCount: 0,
        skippedRecords: [],
        failedRecords: [],
      })),
    );
  }

  assignAllEligible(
    _jobId: number,
    _request: AssignAllEligibleRequest,
  ): Observable<AssessmentBulkResult> {
    return of(this.emptyBulkResult());
  }

  /** Map PASSED -> qualify, FAILED -> reject. `applicationId` is passed as id. */
  updateStatus(
    applicationId: number,
    request: UpdateAssessmentStatusRequest,
  ): Observable<any> {
    if (request.status === 'PASSED') {
      return this.qualify(applicationId);
    }
    return this.reject(applicationId);
  }

  private emptyBulkResult(): AssessmentBulkResult {
    return {
      totalRequested: 0,
      assignedCount: 0,
      skippedCount: 0,
      failedCount: 0,
      skippedRecords: [],
      failedRecords: [],
    };
  }
}
