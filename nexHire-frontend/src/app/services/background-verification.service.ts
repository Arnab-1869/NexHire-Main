import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import {
  BackgroundVerification,
  UpdateBgvStatusRequest,
} from '../models/background-verification.model';
import { API_ENDPOINTS } from '../config/api-endpoints';
import { BaseService } from './base.service';

/** Raw backend BgvResponse. */
interface BackendBgv {
  id: number;
  applicationId: number;
  userId: number;
  candidateName: string;
  candidateEmail: string;
  jobTitle: string;
  status: string;
  vendorName?: string;
  remarks?: string;
  initiatedAt?: string;
  completedAt?: string;
  updatedAt?: string;
}

@Injectable({ providedIn: 'root' })
export class BackgroundVerificationService extends BaseService {
  constructor(http: HttpClient) {
    super(http);
  }

  /** HR: all BGV records. */
  getAll(): Observable<BackgroundVerification[]> {
    return this.http
      .get<BackendBgv[]>(API_ENDPOINTS.BGV.BASE)
      .pipe(map((list) => (list || []).map((b) => this.toModel(b))));
  }

  /** Candidate: own BGV records. */
  getMine(): Observable<BackgroundVerification[]> {
    return this.http
      .get<BackendBgv[]>(`${API_ENDPOINTS.BGV.BASE}/my`)
      .pipe(map((list) => (list || []).map((b) => this.toModel(b))));
  }

  /** HR: initiate BGV for an application. */
  initiate(
    applicationId: number,
    vendorName?: string,
  ): Observable<BackgroundVerification> {
    return this.http
      .post<BackendBgv>(API_ENDPOINTS.BGV.INITIATE(applicationId), {
        vendorName,
      })
      .pipe(map((b) => this.toModel(b)));
  }

  /** HR / third-party: update BGV status. `id` is the BGV id. */
  updateStatus(
    id: number,
    request: UpdateBgvStatusRequest,
  ): Observable<BackgroundVerification> {
    return this.http
      .put<BackendBgv>(API_ENDPOINTS.BGV.UPDATE_STATUS(id), {
        status: request.status,
        remarks: request.remarks,
      })
      .pipe(map((b) => this.toModel(b)));
  }

  private toModel(b: BackendBgv): BackgroundVerification {
    return {
      bgvId: b.id,
      offerId: 0,
      applicationId: b.applicationId,
      userId: b.userId,
      candidateName: b.candidateName,
      candidateEmail: b.candidateEmail,
      jobTitle: b.jobTitle,
      status: b.status as any,
      remarks: b.remarks,
      vendorName: b.vendorName,
      initiatedDate: b.initiatedAt,
      completedDate: b.completedAt,
      updatedAt: b.updatedAt,
    };
  }

  uploadDocument(applicationId: number, documentType: string, file: File): Observable<any> {
    const formData = new FormData();
    formData.append('applicationId', applicationId.toString());
    formData.append('documentType', documentType);
    formData.append('file', file);
    return this.http.post<any>(`${API_ENDPOINTS.BGV.BASE}/documents`, formData);
  }

  getDocuments(bgcCaseId: number): Observable<any[]> {
    return this.http.get<any[]>(`${API_ENDPOINTS.BGV.BASE}/${bgcCaseId}/documents`);
  }

  downloadDocumentFileUrl(id: number): string {
    return `${API_ENDPOINTS.BGV.BASE}/documents/${id}/file`;
  }

  reviewDocument(id: number, status: 'APPROVED' | 'REJECTED', remarks: string): Observable<any> {
    return this.http.put<any>(`${API_ENDPOINTS.BGV.BASE}/documents/${id}/status`, { status, remarks });
  }

  sendToVendor(bgcCaseId: number, vendorName: string, vendorLink: string): Observable<any> {
    return this.http.post<any>(`${API_ENDPOINTS.BGV.BASE}/${bgcCaseId}/vendor-request`, { vendorName, vendorLink });
  }

  getVendorRequests(bgcCaseId: number): Observable<any[]> {
    return this.http.get<any[]>(`${API_ENDPOINTS.BGV.BASE}/${bgcCaseId}/vendor-requests`);
  }
}
