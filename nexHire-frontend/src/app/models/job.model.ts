// ─── Job Models ───────────────────────────────────────────────────────────────

export type JobStatus = 'ACTIVE' | 'INACTIVE' | 'CLOSED' | 'DRAFT';
export type JobType =
  | 'FULL_TIME'
  | 'PART_TIME'
  | 'CONTRACT'
  | 'INTERNSHIP'
  | 'REMOTE';
export type ExperienceLevel = 'FRESHER' | 'JUNIOR' | 'MID' | 'SENIOR' | 'LEAD';

export interface Job {
  jobId: number;
  jobTitle: string;
  jobDescription: string;
  companyName?: string;
  clientName?: string;
  location: string;
  requiredSkills: string; // Comma-separated or JSON array
  experienceLevel?: ExperienceLevel;
  minExperience?: number;
  maxExperience?: number;
  jobType?: JobType;
  salaryMin?: number;
  salaryMax?: number;
  currency?: string;
  postedDate?: string;
  deadline?: string;
  status: JobStatus;
  domain?: string; // e.g. Java, Python, React
  openings?: number;
  createdBy?: number;
  createdAt?: string;
  updatedAt?: string;
  // Backend-provided fields
  locationId?: number;
}

export interface CreateJobRequest {
  jobTitle: string;
  jobDescription: string;
  companyName?: string;
  clientName?: string;
  location: string;
  requiredSkills: string;
  experienceLevel?: ExperienceLevel;
  minExperience?: number;
  maxExperience?: number;
  jobType?: JobType;
  salaryMin?: number;
  salaryMax?: number;
  deadline?: string;
  domain?: string;
  openings?: number;
}

export interface JobFilter {
  search?: string;
  location?: string;
  domain?: string;
  jobType?: JobType;
  status?: JobStatus;
  page?: number;
  size?: number;
}
