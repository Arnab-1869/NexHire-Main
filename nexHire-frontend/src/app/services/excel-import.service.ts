import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { API_ENDPOINTS } from '../config/api-endpoints';

@Injectable({ providedIn: 'root' })
export class ExcelImportService {
  constructor(private http: HttpClient) {}

  uploadAssessment(file: File, cutoff?: number): Observable<any> {
    const formData = new FormData();
    formData.append('file', file);
    let params = new HttpParams();
    if (cutoff !== undefined && cutoff !== null) {
      params = params.set('cutoff', cutoff.toString());
    }
    return this.http.post<any>(API_ENDPOINTS.EXCEL_IMPORT.ASSESSMENT, formData, { params });
  }

  uploadBgc(file: File): Observable<any> {
    const formData = new FormData();
    formData.append('file', file);
    return this.http.post<any>(API_ENDPOINTS.EXCEL_IMPORT.BGC, formData);
  }

  uploadTraining(batchId: number, file: File): Observable<any> {
    const formData = new FormData();
    formData.append('file', file);
    return this.http.post<any>(API_ENDPOINTS.EXCEL_IMPORT.TRAINING(batchId), formData);
  }

  getLogs(type?: string): Observable<any[]> {
    let params = new HttpParams();
    if (type) {
      params = params.set('type', type);
    }
    return this.http.get<any[]>(API_ENDPOINTS.EXCEL_IMPORT.LOGS, { params });
  }

  getLogErrors(logId: number): Observable<any[]> {
    return this.http.get<any[]>(API_ENDPOINTS.EXCEL_IMPORT.ERRORS(logId));
  }

  getTemplateDownloadUrl(type: 'ASSESSMENT' | 'BGC' | 'TRAINING'): string {
    if (type === 'ASSESSMENT') {
      return API_ENDPOINTS.EXCEL_IMPORT.TEMPLATE_ASSESSMENT;
    } else if (type === 'BGC') {
      return API_ENDPOINTS.EXCEL_IMPORT.TEMPLATE_BGC;
    } else {
      return API_ENDPOINTS.EXCEL_IMPORT.TEMPLATE_TRAINING;
    }
  }
}
