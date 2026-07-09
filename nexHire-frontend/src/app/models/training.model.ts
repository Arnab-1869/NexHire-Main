// ─── Training Models ──────────────────────────────────────────────────────────

export type TrainingDomain =
  | 'JAVA'
  | 'PYTHON'
  | 'REACT'
  | 'ANGULAR'
  | 'TESTING'
  | 'DEVOPS'
  | 'DATA_SCIENCE'
  | 'SPRING_BOOT'
  | 'NODE_JS'
  | 'DOTNET'
  | string;  // Allow dynamic domains

export interface Training {
  trainingId: number;
  trainingName: string;
  domain: TrainingDomain;
  description?: string;
  durationWeeks?: number;
  costPerCandidate?: number;
  active: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface TrainingAssignmentRequest {
  selectedIds: number[];
  trainingId: number;
  cityId: number;
  branchId: number;
  blockId: number;
  startDate?: string;
  endDate?: string;
}

export interface TrainingAssignmentResult {
  totalRequested: number;
  assignedCount: number;
  skippedCount: number;
  failedCount: number;
  totalCost?: number;
  budgetDeducted?: number;
  vacancyUsed?: number;
  skippedRecords?: { selectedId: number; reason: string }[];
  failedRecords?: { selectedId: number; reason: string }[];
}

// ─── Trainee Models ───────────────────────────────────────────────────────────

export type TraineeStatus =
  | 'TRAINING_ASSIGNED'
  | 'IN_PROGRESS'
  | 'COMPLETED'
  | 'FAILED'
  | 'DROPPED'
  | 'ON_HOLD';

export interface Trainee {
  traineeId: number;
  employeeId: number;
  selectedId: number;
  trainingId: number;
  cityId: number;
  branchId: number;
  blockId: number;
  // Populated joins
  candidateName?: string;
  candidateEmail?: string;
  trainingName?: string;
  trainingDomain?: string;
  cityName?: string;
  branchName?: string;
  blockName?: string;
  status: TraineeStatus;
  progressPercentage: number;
  remarks?: string;
  startDate?: string;
  endDate?: string;
  updatedAt?: string;
}

export interface UpdateTraineeStatusRequest {
  status: TraineeStatus;
  progressPercentage?: number;
  remarks?: string;
  endDate?: string;
}
