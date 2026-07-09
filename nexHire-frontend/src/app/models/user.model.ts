// ─── User / Auth Models ───────────────────────────────────────────────────────

export type UserGender = 'MALE' | 'FEMALE' | 'OTHER' | 'PREFER_NOT_TO_SAY';

export interface User {
  userId: number;
  fullName: string;
  email: string;
  phone: string;
  dateOfBirth?: string;
  gender?: UserGender;
  addressLine?: string;
  city?: string;
  state?: string;
  country?: string;
  pinCode?: string;
  highestQualification?: string;
  universityName?: string;
  graduationYear?: number;
  cgpa?: number;
  resumeUrl?: string;
  profilePhotoUrl?: string;
  active: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface RegisterRequest {
  fullName: string;
  email: string;
  phone: string;
  password: string;
  confirmPassword?: string; // FE validation only
  dateOfBirth?: string;
  gender?: UserGender;
  addressLine?: string;
  city?: string;
  state?: string;
  country?: string;
  pinCode?: string;
  highestQualification?: string;
  universityName?: string;
  graduationYear?: number;
  cgpa?: number;
  resumeUrl?: string;
  profilePhotoUrl?: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface AuthResponse {
  token?: string; // JWT token (when backend returns JWT)
  tokenType?: string; // Bearer
  expiresIn?: number; // seconds
  user?: LoggedInUser; // user data
  // Direct fields if backend returns flat object
  userId?: number;
  fullName?: string;
  email?: string;
  role?: string;
  permissions?: string[];
}

/**
 * The logged-in user object stored in memory.
 * Supports both role-only and role+permissions modes.
 */
export interface LoggedInUser {
  userId?: number;
  employeeId?: number;
  fullName: string;
  email: string;
  role: string;
  lifecycleStatus?: string; // CANDIDATE | TRAINEE | PROJECT_ASSIGNED (backend EMPLOYEE users)
  permissions: string[]; // Empty if backend hasn't implemented yet — use role mapping
  profilePhotoUrl?: string;
  active?: boolean;
}

export interface ChangePasswordRequest {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
}
