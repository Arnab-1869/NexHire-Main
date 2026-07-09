// ─── Location / Infrastructure Models ────────────────────────────────────────

export interface City {
  cityId: number;
  cityName: string;
  state?: string;
  country?: string;
  totalBudget?: number;
  usedBudget?: number;
  availableBudget?: number;
  active: boolean;
  branchCount?: number;
  createdAt?: string;
}

export interface Branch {
  branchId: number;
  branchName: string;
  cityId: number;
  cityName?: string;
  address?: string;
  active: boolean;
  blockCount?: number;
  createdAt?: string;
}

export interface Block {
  blockId: number;
  blockName: string;
  branchId: number;
  branchName?: string;
  cityId?: number;
  cityName?: string;
  totalCapacity: number;
  usedCapacity: number;
  availableVacancy: number;
  active: boolean;
  createdAt?: string;
}

export interface Budget {
  budgetId: number;
  cityId: number;
  cityName?: string;
  totalBudget: number;
  usedBudget: number;
  availableBudget: number;
  fiscalYear?: string;
  updatedAt?: string;
}

export interface CreateCityRequest {
  cityName: string;
  state?: string;
  country?: string;
  totalBudget?: number;
}

export interface CreateBranchRequest {
  branchName: string;
  cityId: number;
  address?: string;
}

export interface CreateBlockRequest {
  blockName: string;
  branchId: number;
  totalCapacity: number;
}

export interface TrainingCapacityCheck {
  cityId: number;
  blockId: number;
  selectedCount: number;
  availableVacancy: number;
  requiredBudget: number;
  availableBudget: number;
  isVacancySufficient: boolean;
  isBudgetSufficient: boolean;
}
