import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import {
  JoiningLetter,
  SendJoiningLetterRequest,
} from '../models/joining-letter.model';
import { API_ENDPOINTS } from '../config/api-endpoints';
import { BaseService } from './base.service';

@Injectable({ providedIn: 'root' })
export class JoiningLetterService extends BaseService {
  constructor(http: HttpClient) {
    super(http);
  }

  /** Candidate: own joining letters (backend derives user from JWT). */
  getMine(): Observable<JoiningLetter[]> {
    return this.http.get<JoiningLetter[]>(API_ENDPOINTS.JOINING_LETTERS.MY);
  }

  /** HR: send a joining letter for an application (budget/seat checked server-side). */
  send(
    applicationId: number,
    request: SendJoiningLetterRequest,
  ): Observable<JoiningLetter> {
    return this.http.post<JoiningLetter>(
      API_ENDPOINTS.JOINING_LETTERS.SEND(applicationId),
      request,
    );
  }

  /** Candidate: accept a joining letter (becomes trainee). */
  accept(id: number): Observable<JoiningLetter> {
    return this.http.put<JoiningLetter>(
      API_ENDPOINTS.JOINING_LETTERS.ACCEPT(id),
      {},
    );
  }

  downloadJoiningLetterPdfUrl(id: number): string {
    return `${API_ENDPOINTS.JOINING_LETTERS.SEND(id)}/pdf`;
  }
}
