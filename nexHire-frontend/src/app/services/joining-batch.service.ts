import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { API_ENDPOINTS } from '../config/api-endpoints';

@Injectable({ providedIn: 'root' })
export class JoiningBatchService {
  constructor(private http: HttpClient) {}

  getAllBatches(): Observable<any[]> {
    return this.http.get<any[]>(API_ENDPOINTS.JOINING_BATCHES.BASE);
  }

  getBatchById(id: number): Observable<any> {
    return this.http.get<any>(API_ENDPOINTS.JOINING_BATCHES.BY_ID(id));
  }

  createBatch(batch: any): Observable<any> {
    return this.http.post<any>(API_ENDPOINTS.JOINING_BATCHES.BASE, batch);
  }

  getEligibleCandidates(joiningLocId: number, trainingLocId: number): Observable<any[]> {
    let params = new HttpParams()
      .set('joiningLocId', joiningLocId.toString())
      .set('trainingLocId', trainingLocId.toString());
    return this.http.get<any[]>(API_ENDPOINTS.JOINING_BATCHES.ELIGIBLE_CANDIDATES, { params });
  }

  assignCandidates(batchId: number, userIds: number[]): Observable<any> {
    return this.http.post<any>(API_ENDPOINTS.JOINING_BATCHES.ASSIGN(batchId), { userIds });
  }

  sendLetters(batchId: number): Observable<any> {
    return this.http.post<any>(API_ENDPOINTS.JOINING_BATCHES.SEND_LETTERS(batchId), {});
  }

  downloadJoiningLetterPdfUrl(id: number): string {
    return `${API_ENDPOINTS.JOINING_LETTERS.SEND(id)}/pdf`;
  }
}
