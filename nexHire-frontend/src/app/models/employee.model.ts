export type EmployeeStatus =
  | 'ACTIVE'
  | 'INACTIVE'
  | 'ONBOARDING'
  | 'TRAINING'
  | 'PROJECT_ASSIGNED'
  | 'TERMINATED';

export interface Employee {
  employeeId: number;
  userId?: number;
  applicationId?: number;
  fullName?: string;
  email?: string;
  phone?: string;
  designation?: string;
  department?: string;
  role?: string;
  status: EmployeeStatus;
  joiningDate?: string;
  projectId?: number;
  createdAt?: string;
  updatedAt?: string;
}
