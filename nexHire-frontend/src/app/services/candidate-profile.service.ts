import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { API_ENDPOINTS } from '../config/api-endpoints';

@Injectable({ providedIn: 'root' })
export class CandidateProfileService {
  constructor(private http: HttpClient) {}

  getProfile(): Observable<any> {
    return this.http.get<any>(API_ENDPOINTS.CANDIDATE_PROFILE.BASE);
  }

  saveProfile(profile: any): Observable<any> {
    return this.http.post<any>(API_ENDPOINTS.CANDIDATE_PROFILE.BASE, profile);
  }

  uploadResume(file: File): Observable<any> {
    const formData = new FormData();
    formData.append('file', file);
    return this.http.post<any>(API_ENDPOINTS.CANDIDATE_PROFILE.RESUME, formData);
  }

  checkCompletion(): Observable<{ completed: boolean }> {
    return this.http.get<{ completed: boolean }>(API_ENDPOINTS.CANDIDATE_PROFILE.CHECK);
  }

  downloadResume(userId?: number): string {
    const query = userId ? `?userId=${userId}` : '';
    return `${API_ENDPOINTS.CANDIDATE_PROFILE.RESUME}${query}`;
  }
}
