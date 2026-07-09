import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { API_ENDPOINTS } from '../config/api-endpoints';
import { BaseService } from './base.service';

export interface Bgv {
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
export class BgvService extends BaseService {
  constructor(http: HttpClient) {
    super(http);
  }

  /** HR: list all BGV records. */
  getAll(): Observable<Bgv[]> {
    return this.http.get<Bgv[]>(API_ENDPOINTS.BGV.BASE);
  }

  /** Candidate: own BGV records. */
  getMine(): Observable<Bgv[]> {
    return this.http.get<Bgv[]>(`${API_ENDPOINTS.BGV.BASE}/my`);
  }

  /** HR: initiate BGV for an application. */
  initiate(applicationId: number, vendorName?: string): Observable<Bgv> {
    return this.http.post<Bgv>(API_ENDPOINTS.BGV.INITIATE(applicationId), {
      vendorName,
    });
  }

  /** HR / third-party callback: update BGV status. */
  updateStatus(id: number, status: string, remarks?: string): Observable<Bgv> {
    return this.http.put<Bgv>(API_ENDPOINTS.BGV.UPDATE_STATUS(id), {
      status,
      remarks,
    });
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
