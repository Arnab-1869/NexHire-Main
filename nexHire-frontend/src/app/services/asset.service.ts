import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of, delay } from 'rxjs';
import { map } from 'rxjs/operators';
import { Asset, CreateAssetRequest, UpdateAssetStatusRequest, AssetAssignment, AssignAssetRequest, ReturnAssetRequest } from '../models/asset.model';
import { ApiResponse } from '../models/api-response.model';
import { API_ENDPOINTS } from '../config/api-endpoints';
import { environment } from '../../environments/environment';
import { BaseService } from './base.service';

const MOCK_ASSETS: Asset[] = [
  { assetId: 1, assetName: 'Dell Latitude 5520', assetType: 'LAPTOP', assetTag: 'ASSET-001', serialNumber: 'SN123456', brand: 'Dell', status: 'AVAILABLE', purchaseDate: '2025-01-15' },
  { assetId: 2, assetName: 'Logitech MX Master 3', assetType: 'MOUSE', assetTag: 'ASSET-002', brand: 'Logitech', status: 'AVAILABLE' },
  { assetId: 3, assetName: 'HP EliteBook 840', assetType: 'LAPTOP', assetTag: 'ASSET-003', serialNumber: 'SN789012', brand: 'HP', status: 'ASSIGNED', currentTraineeId: 1, currentTraineeName: 'Rahul Singh' },
];

@Injectable({ providedIn: 'root' })
export class AssetService extends BaseService {
  constructor(http: HttpClient) { super(http); }

  getAll(): Observable<Asset[]> {
    if (environment.useMockData) return of(MOCK_ASSETS).pipe(delay(400));
    return this.http.get<ApiResponse<Asset[]> | Asset[]>(API_ENDPOINTS.ASSETS.BASE).pipe(map(r => this.unwrap(r) as Asset[]));
  }

  getById(id: number): Observable<Asset> {
    if (environment.useMockData) return of(MOCK_ASSETS.find(a => a.assetId === id)!).pipe(delay(300));
    return this.http.get<ApiResponse<Asset> | Asset>(API_ENDPOINTS.ASSETS.BY_ID(id)).pipe(map(r => this.unwrap(r) as Asset));
  }

  getAvailable(): Observable<Asset[]> {
    if (environment.useMockData) return of(MOCK_ASSETS.filter(a => a.status === 'AVAILABLE')).pipe(delay(300));
    return this.http.get<ApiResponse<Asset[]> | Asset[]>(API_ENDPOINTS.ASSETS.AVAILABLE).pipe(map(r => this.unwrap(r) as Asset[]));
  }

  create(request: CreateAssetRequest): Observable<Asset> {
    if (environment.useMockData) {
      const newAsset: Asset = { ...request, assetId: Date.now(), status: 'AVAILABLE' };
      MOCK_ASSETS.push(newAsset);
      return of(newAsset).pipe(delay(600));
    }
    return this.http.post<ApiResponse<Asset> | Asset>(API_ENDPOINTS.ASSETS.CREATE, request).pipe(map(r => this.unwrap(r) as Asset));
  }

  updateStatus(id: number, request: UpdateAssetStatusRequest): Observable<Asset> {
    if (environment.useMockData) {
      const asset = MOCK_ASSETS.find(a => a.assetId === id);
      if (asset) asset.status = request.status;
      return of({ ...MOCK_ASSETS[0], status: request.status }).pipe(delay(400));
    }
    return this.http.patch<ApiResponse<Asset> | Asset>(API_ENDPOINTS.ASSETS.UPDATE_STATUS(id), request).pipe(map(r => this.unwrap(r) as Asset));
  }

  assign(request: AssignAssetRequest): Observable<AssetAssignment> {
    if (environment.useMockData) {
      const asset = MOCK_ASSETS.find(a => a.assetId === request.assetId);
      if (asset) {
        asset.status = 'ASSIGNED';
        asset.currentTraineeId = request.traineeId;
        asset.currentTraineeName = 'Trainee ' + request.traineeId;
      }
      const assignment: AssetAssignment = { assignmentId: Date.now(), assetId: request.assetId, traineeId: request.traineeId, assignedDate: new Date().toISOString(), status: 'ACTIVE' };
      return of(assignment).pipe(delay(600));
    }
    return this.http.post<ApiResponse<AssetAssignment> | AssetAssignment>(API_ENDPOINTS.ASSET_ASSIGNMENTS.ASSIGN, request).pipe(map(r => this.unwrap(r) as AssetAssignment));
  }

  returnAsset(assignmentId: number, request: ReturnAssetRequest): Observable<AssetAssignment> {
    if (environment.useMockData) return of({ assignmentId, assetId: 1, traineeId: 1, assignedDate: new Date().toISOString(), returnedDate: new Date().toISOString(), status: 'RETURNED' as const }).pipe(delay(400));
    return this.http.patch<ApiResponse<AssetAssignment> | AssetAssignment>(API_ENDPOINTS.ASSET_ASSIGNMENTS.RETURN(assignmentId), request).pipe(map(r => this.unwrap(r) as AssetAssignment));
  }

  getAssignments(): Observable<AssetAssignment[]> {
    if (environment.useMockData) return of([]).pipe(delay(400));
    return this.http.get<ApiResponse<AssetAssignment[]> | AssetAssignment[]>(API_ENDPOINTS.ASSET_ASSIGNMENTS.BASE).pipe(map(r => this.unwrap(r) as AssetAssignment[]));
  }
}
