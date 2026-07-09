// ─── Admin Models ─────────────────────────────────────────────────────────────

export interface Admin {
  adminId: number;
  fullName: string;
  email: string;
  phone?: string;
  active: boolean;
  createdAt?: string;
}

export interface CreateAdminRequest {
  fullName: string;
  email: string;
  phone?: string;
  password: string;
}

// ─── Dashboard Stats Model ────────────────────────────────────────────────────

export interface DashboardStats {
  totalUsers: number;
  totalJobs: number;
  totalApplications: number;
  pendingApplications: number;
  shortlistedApplications: number;
  assessmentsAssigned: number;
  assessmentsPassed: number;
  assessmentsFailed: number;
  offersSent: number;
  offersAccepted: number;
  offersRejected: number;
  bgvPending: number;
  bgvCleared: number;
  employeesCreated: number;
  selectedCandidates: number;
  traineesActive: number;
  trainingCompleted: number;
  assetsAssigned: number;
  releasedCandidates: number;
  projectsActive: number;
  candidatesAllocated: number;
  totalBudgetUsed?: number;
  totalBudgetAvailable?: number;
  totalVacancyUsed?: number;
  totalVacancyAvailable?: number;
  totalEmployees?: number;
  totalAdmins?: number;
}

export interface ChartData {
  labels: string[];
  datasets: {
    label: string;
    data: number[];
    backgroundColor?: string | string[];
    borderColor?: string | string[];
  }[];
}
