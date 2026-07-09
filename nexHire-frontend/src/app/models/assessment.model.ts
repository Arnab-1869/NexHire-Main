// ─── Assessment Models ────────────────────────────────────────────────────────

export type AssessmentStatus =
  | 'ASSIGNED'
  | 'IN_PROGRESS'
  | 'SUBMITTED'
  | 'PASSED'
  | 'FAILED';

export interface Assessment {
  assessmentId: number;
  applicationId: number;
  userId?: number;
  jobId?: number;
  // Populated joins
  candidateName?: string;
  candidateEmail?: string;
  jobTitle?: string;
  assessmentType: string;   // e.g. JAVA, PYTHON, REACT
  assessmentDate?: string;
  status: AssessmentStatus;
  score?: number;
  maxScore?: number;
  remarks?: string;
  assignedBy?: number;
  assignedAt?: string;
  updatedAt?: string;
}

export interface AssignSelectedRequest {
  applicationIds: number[];
  assessmentType: string;
  assessmentDate?: string;
}

export interface AssignAllEligibleRequest {
  assessmentType: string;
  assessmentDate?: string;
}

export interface UpdateAssessmentStatusRequest {
  status: AssessmentStatus;
  score?: number;
  remarks?: string;
}

export interface AssessmentBulkResult {
  totalRequested: number;
  assignedCount: number;
  skippedCount: number;
  failedCount: number;
  skippedRecords?: AssessmentSkipRecord[];
  failedRecords?: AssessmentSkipRecord[];
}

export interface AssessmentSkipRecord {
  applicationId: number;
  candidateName?: string;
  reason: string;
}
