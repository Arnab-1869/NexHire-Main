// ─── Selected Candidate Models ────────────────────────────────────────────────

export type SelectedStatus =
  | 'SELECTED'
  | 'TRAINING_PENDING'
  | 'TRAINING_ASSIGNED'
  | 'MOVED_TO_TRAINEE';

export interface SelectedCandidate {
  selectedId: number;
  employeeId: number;
  bgvId?: number;
  // Populated joins
  candidateName?: string;
  candidateEmail?: string;
  jobTitle?: string;
  trainingDomain?: string;
  status: SelectedStatus;
  selectionDate?: string;
  trainingAssignedDate?: string;
  cityId?: number;
  cityName?: string;
  branchId?: number;
  branchName?: string;
  blockId?: number;
  blockName?: string;
  updatedAt?: string;
}
