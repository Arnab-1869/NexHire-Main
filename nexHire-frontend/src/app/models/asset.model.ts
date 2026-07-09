// ─── Asset Models ─────────────────────────────────────────────────────────────

export type AssetStatus =
  | 'AVAILABLE'
  | 'ASSIGNED'
  | 'RETURNED'
  | 'DAMAGED'
  | 'LOST'
  | 'UNDER_REPAIR';

export type AssetType =
  | 'LAPTOP'
  | 'MOUSE'
  | 'KEYBOARD'
  | 'MONITOR'
  | 'HEADSET'
  | 'ID_CARD'
  | 'MOBILE'
  | string;

export interface Asset {
  assetId: number;
  assetName: string;
  assetType: AssetType;
  assetTag?: string;          // Unique asset identifier
  serialNumber?: string;
  brand?: string;
  model?: string;
  purchaseDate?: string;
  warrantyExpiryDate?: string;
  status: AssetStatus;
  currentTraineeId?: number;
  currentTraineeName?: string;
  remarks?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface CreateAssetRequest {
  assetName: string;
  assetType: AssetType;
  assetTag?: string;
  serialNumber?: string;
  brand?: string;
  model?: string;
  purchaseDate?: string;
  warrantyExpiryDate?: string;
}

export interface UpdateAssetStatusRequest {
  status: AssetStatus;
  remarks?: string;
}

// ─── Asset Assignment Models ──────────────────────────────────────────────────

export interface AssetAssignment {
  assignmentId: number;
  assetId: number;
  traineeId: number;
  // Populated joins
  assetName?: string;
  assetType?: string;
  assetTag?: string;
  serialNumber?: string;
  traineeName?: string;
  traineeEmail?: string;
  assignedDate: string;
  returnedDate?: string;
  assignedBy?: number;
  assignedByName?: string;
  remarks?: string;
  status: 'ACTIVE' | 'RETURNED' | 'OVERDUE';
}

export interface AssignAssetRequest {
  assetId: number;
  traineeId: number;
  remarks?: string;
}

export interface ReturnAssetRequest {
  returnedDate?: string;
  remarks?: string;
  conditionOnReturn?: 'GOOD' | 'DAMAGED' | 'LOST';
}
