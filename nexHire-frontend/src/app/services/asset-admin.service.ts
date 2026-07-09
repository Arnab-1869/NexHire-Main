import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { API_ENDPOINTS } from '../config/api-endpoints';
import { BaseService } from './base.service';

export interface AdminAsset {
  id: number;
  name: string;
  type: string;
  serialNumber?: string;
  assigned: boolean;
  assignedToName?: string;
}

export interface AdminAssetAssignment {
  id: number;
  assetId: number;
  assetName: string;
  assetType: string;
  serialNumber?: string;
  userId: number;
  userName: string;
  active: boolean;
  assignedAt?: string;
  revokedAt?: string;
}

/**
 * Backend-aligned admin asset service (real nexHIRE API).
 * Distinct from the legacy mock AssetService.
 */
@Injectable({ providedIn: 'root' })
export class AssetAdminService extends BaseService {
  constructor(http: HttpClient) {
    super(http);
  }

  getAllAssets(): Observable<AdminAsset[]> {
    return this.http.get<AdminAsset[]>(API_ENDPOINTS.ASSETS.BASE);
  }

  createAsset(
    name: string,
    type: string,
    serialNumber?: string,
  ): Observable<AdminAsset> {
    return this.http.post<AdminAsset>(API_ENDPOINTS.ASSETS.CREATE, {
      name,
      type,
      serialNumber,
    });
  }

  assign(assetId: number, userId: number): Observable<AdminAssetAssignment> {
    return this.http.post<AdminAssetAssignment>(
      API_ENDPOINTS.ASSETS.ASSIGN(assetId, userId),
      {},
    );
  }

  revoke(assignmentId: number): Observable<AdminAssetAssignment> {
    return this.http.put<AdminAssetAssignment>(
      API_ENDPOINTS.ASSETS.REVOKE(assignmentId),
      {},
    );
  }

  getUserAssignments(userId: number): Observable<AdminAssetAssignment[]> {
    return this.http.get<AdminAssetAssignment[]>(
      API_ENDPOINTS.ASSETS.BY_USER(userId),
    );
  }
}
