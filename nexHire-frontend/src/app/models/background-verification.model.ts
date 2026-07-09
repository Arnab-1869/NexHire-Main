// ─── Background Verification Models ──────────────────────────────────────────

export type BgvStatus =
  | 'PENDING'
  | 'IN_PROGRESS'
  | 'CLEARED'
  | 'PASSED'
  | 'FAILED'
  | 'ON_HOLD';

export interface BackgroundVerification {
  bgvId: number;
  offerId: number;
  applicationId?: number;
  userId?: number;
  // Populated joins
  candidateName?: string;
  candidateEmail?: string;
  candidatePhone?: string;
  jobTitle?: string;
  status: BgvStatus;
  initiatedDate?: string;
  completedDate?: string;
  verifiedBy?: number;
  remarks?: string;
  vendorName?: string;
  documentVerificationStatus?: string;
  addressVerificationStatus?: string;
  educationVerificationStatus?: string;
  previousEmploymentStatus?: string;
  updatedAt?: string;
}

export interface UpdateBgvStatusRequest {
  status: BgvStatus;
  remarks?: string;
  completedDate?: string;
}
