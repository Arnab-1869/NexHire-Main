import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { map } from 'rxjs/operators';
import {
  OfferLetter,
  UpdateOfferStatusRequest,
  OfferStatus,
} from '../models/offer-letter.model';
import { API_ENDPOINTS } from '../config/api-endpoints';
import { BaseService } from './base.service';

/** Raw shape returned by the backend OfferResponse DTO. */
interface BackendOffer {
  id: number;
  applicationId: number;
  jobTitle: string;
  content: string;
  status: string;
  sentByName: string;
  sentAt: string;
  respondedAt?: string;
}

@Injectable({ providedIn: 'root' })
export class OfferLetterService extends BaseService {
  constructor(http: HttpClient) {
    super(http);
  }

  /** Candidate: own offers. Backend derives user from JWT. */
  getByUser(_userId: number): Observable<OfferLetter[]> {
    return this.http
      .get<BackendOffer[]>(API_ENDPOINTS.OFFERS.MY)
      .pipe(map((list) => (list || []).map((o) => this.toOffer(o))));
  }

  getMyOffers(): Observable<OfferLetter[]> {
    return this.getByUser(0);
  }

  downloadOfferPdfUrl(id: number): string {
    return `${API_ENDPOINTS.OFFERS.SEND(id)}/pdf`;
  }

  /**
   * Compat for the legacy HR offer-letters list page. The backend has no
   * "all offers" endpoint (HR drives offers from the applications workflow),
   * so this returns an empty list.
   */
  getAll(): Observable<OfferLetter[]> {
    return of([]);
  }

  /**
   * HR: send an offer for an application. Backend endpoint is /api/offers/{applicationId}.
   */
  sendOffer(applicationId: number, content: string): Observable<OfferLetter> {
    return this.http
      .post<BackendOffer>(API_ENDPOINTS.OFFERS.SEND(applicationId), { content })
      .pipe(map((o) => this.toOffer(o)));
  }

  /**
   * Candidate accept/reject. `id` is the offer id.
   */
  updateStatus(
    id: number,
    request: UpdateOfferStatusRequest,
  ): Observable<OfferLetter> {
    const url =
      request.status === 'ACCEPTED'
        ? API_ENDPOINTS.OFFERS.ACCEPT(id)
        : API_ENDPOINTS.OFFERS.REJECT(id);
    return this.http
      .put<BackendOffer>(url, {})
      .pipe(map((o) => this.toOffer(o)));
  }

  // ─── Mapping ──────────────────────────────────────────────────────────────
  private toOffer(b: BackendOffer): OfferLetter {
    return {
      offerId: b.id,
      assessmentId: 0,
      applicationId: b.applicationId,
      jobTitle: b.jobTitle,
      designation: b.jobTitle,
      // Backend offer has no CTC/dates; surface content instead.
      remarks: b.content,
      status: this.mapStatus(b.status),
      issuedDate: b.sentAt,
      acceptedDate: b.status === 'OFFER_ACCEPTED' ? b.respondedAt : undefined,
      rejectedDate: b.status === 'OFFER_REJECTED' ? b.respondedAt : undefined,
    };
  }

  /**
   * Backend surfaces the application status (OFFER_SENT/OFFER_ACCEPTED/OFFER_REJECTED).
   * Map to the frontend OfferStatus vocabulary (SENT/ACCEPTED/REJECTED).
   */
  private mapStatus(backendStatus: string): OfferStatus {
    switch (backendStatus) {
      case 'OFFER_SENT':
        return 'SENT';
      case 'OFFER_ACCEPTED':
        return 'ACCEPTED';
      case 'OFFER_REJECTED':
        return 'REJECTED';
      default:
        return 'SENT';
    }
  }
}
