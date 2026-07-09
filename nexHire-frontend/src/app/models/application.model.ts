// ─── Application Models ───────────────────────────────────────────────────────

// Aligned with backend com.nexhire.enums.ApplicationStatus
export type ApplicationStatus =
  | 'APPLIED'
  | 'ASSESSMENT_PENDING'
  | 'ASSESSMENT_COMPLETED'
  | 'QUALIFIED'
  | 'REJECTED'
  | 'OFFER_SENT'
  | 'OFFER_ACCEPTED'
  | 'OFFER_REJECTED'
  | 'JOINING_ON_HOLD'
  | 'JOINING_LETTER_SENT'
  | 'TRAINING_IN_PROGRESS'
  | 'TRAINING_COMPLETED'
  | 'PROJECT_ASSIGNED'
  // legacy values still referenced by not-yet-migrated mock modules
  | 'SHORTLISTED'
  | 'WITHDRAWN';

export interface Application {
  applicationId: number;
  userId: number;
  jobId: number;
  // Populated joins
  userFullName?: string;
  userEmail?: string;
  userPhone?: string;
  userResumeUrl?: string;
  coverLetter?: string;
  jobTitle?: string;
  jobLocation?: string;
  status: ApplicationStatus;
  appliedDate: string;
  updatedAt?: string;
  remarks?: string;
  // Hold info (backend JOINING_ON_HOLD edge case)
  holdReason?: string;
  holdCreatedAt?: string;
  holdResolvedAt?: string;
  // Assessment info (if exists)
  assessmentId?: number;
  assessmentStatus?: string;
  // Offer info (if exists)
  offerId?: number;
  offerStatus?: string;
  // BGV info (if exists)
  bgvStatus?: string;
}

export interface ApplyRequest {
  jobId: number;
  userId: number;
  coverLetter?: string;
  resumeUrl?: string;
}

export interface UpdateApplicationStatusRequest {
  status: ApplicationStatus;
  remarks?: string;
}

export interface ApplicationFilter {
  jobId?: number;
  status?: ApplicationStatus;
  search?: string;
  startDate?: string;
  endDate?: string;
  page?: number;
  size?: number;
}
