// ─── Released Candidate Models ────────────────────────────────────────────────

export interface ReleasedCandidate {
  releasedId: number;
  traineeId: number;
  employeeId: number;
  // Populated joins
  candidateName?: string;
  candidateEmail?: string;
  trainingDomain?: string;
  trainingName?: string;
  releaseDate?: string;
  skills?: string;
  projectAllocationStatus?: 'NOT_ALLOCATED' | 'ALLOCATED' | 'PENDING';
  projectId?: number;
  projectName?: string;
  createdAt?: string;
}

// ─── Project Models ───────────────────────────────────────────────────────────

export type ProjectStatus = 'ACTIVE' | 'ON_HOLD' | 'COMPLETED' | 'CLOSED';

export interface Project {
  projectId: number;
  projectName: string;
  clientName?: string;
  requiredDomain: string;
  requiredSkills?: string;
  requiredCount: number;
  allocatedCount: number;
  remainingCount: number;
  status: ProjectStatus;
  startDate?: string;
  endDate?: string;
  description?: string;
  managerId?: number;
  managerName?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface CreateProjectRequest {
  projectName: string;
  clientName?: string;
  requiredDomain: string;
  requiredSkills?: string;
  requiredCount: number;
  startDate?: string;
  endDate?: string;
  description?: string;
  managerId?: number;
}

export interface UpdateProjectRequest {
  projectName?: string;
  clientName?: string;
  requiredDomain?: string;
  requiredSkills?: string;
  requiredCount?: number;
  status?: ProjectStatus;
  startDate?: string;
  endDate?: string;
}

// ─── Project Allocation Models ────────────────────────────────────────────────

export type AllocationStatus = 'ALLOCATED' | 'RELEASED' | 'ON_HOLD' | 'COMPLETED';

export interface ProjectAllocation {
  allocationId: number;
  projectId: number;
  releasedId: number;
  employeeId?: number;
  // Populated joins
  projectName?: string;
  clientName?: string;
  requiredDomain?: string;
  candidateName?: string;
  candidateEmail?: string;
  trainingDomain?: string;
  domainMatch?: boolean;
  allocationDate?: string;
  status: AllocationStatus;
  allocatedBy?: number;
  allocatedByName?: string;
  remarks?: string;
  createdAt?: string;
}

export interface AllocateProjectRequest {
  projectId: number;
  releasedId: number;
  overrideDomainMismatch?: boolean;  // Allow override if authorized
  remarks?: string;
}
