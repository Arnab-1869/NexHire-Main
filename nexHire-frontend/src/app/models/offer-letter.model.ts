// ─── Offer Letter Models ──────────────────────────────────────────────────────

export type OfferStatus =
  | 'SENT'
  | 'ACCEPTED'
  | 'APPROVED'
  | 'REJECTED'
  | 'EXPIRED'
  | 'WITHDRAWN';

export interface OfferLetter {
  offerId: number;
  assessmentId: number;
  applicationId?: number;
  userId?: number;
  // Populated joins
  candidateName?: string;
  candidateEmail?: string;
  jobTitle?: string;
  designation?: string;
  ctc?: number;
  joiningDate?: string;
  offerLetterUrl?: string;
  status: OfferStatus;
  issuedDate?: string;
  expiryDate?: string;
  acceptedDate?: string;
  rejectedDate?: string;
  remarks?: string;
  updatedAt?: string;
}

export interface UpdateOfferStatusRequest {
  status: OfferStatus;
  remarks?: string;
}
