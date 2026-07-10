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
  { assetId: 3, assetName: 'HP EliteBook 840', assetType: 'LAPTOP', assetTag: 'ASSET-003', serialNumber: 'SN789012', brand: 'HP', status: 'ASSIGNED', currentTraineeId: 1, currentTraineeName: 'Priya Sharma' },
  { assetId: 4, assetName: 'MacBook Pro 14"', assetType: 'LAPTOP', assetTag: 'ASSET-004', serialNumber: 'SN889013', brand: 'Apple', status: 'ASSIGNED', currentTraineeId: 2, currentTraineeName: 'Amit Sharma' },
  { assetId: 5, assetName: 'Lenovo ThinkPad L14', assetType: 'LAPTOP', assetTag: 'ASSET-005', serialNumber: 'SN991024', brand: 'Lenovo', status: 'AVAILABLE' },
  { assetId: 6, assetName: 'Dell 24" Monitor U2422H', assetType: 'MONITOR', assetTag: 'ASSET-006', serialNumber: 'SN441098', brand: 'Dell', status: 'AVAILABLE' },
  { assetId: 7, assetName: 'Jabra Evolve2 65 Headset', assetType: 'HEADSET', assetTag: 'ASSET-007', serialNumber: 'SN332014', brand: 'Jabra', status: 'ASSIGNED', currentTraineeId: 1, currentTraineeName: 'Priya Sharma' },
  { assetId: 8, assetName: 'Logitech K120 Keyboard', assetType: 'KEYBOARD', assetTag: 'ASSET-008', brand: 'Logitech', status: 'AVAILABLE' },
  { assetId: 9, assetName: 'Samsung Galaxy A34', assetType: 'MOBILE', assetTag: 'ASSET-009', serialNumber: 'SN551239', brand: 'Samsung', status: 'AVAILABLE' },
  { assetId: 10, assetName: 'NexHire Corporate ID Card', assetType: 'ID_CARD', assetTag: 'ASSET-010', brand: 'NexHire', status: 'ASSIGNED', currentTraineeId: 3, currentTraineeName: 'Kunal Sen' },
  { assetId: 11, assetName: 'Logitech MX Keys', assetType: 'KEYBOARD', assetTag: 'ASSET-011', brand: 'Logitech', status: 'AVAILABLE' },
  { assetId: 12, assetName: 'Dell Wireless Mouse WM126', assetType: 'MOUSE', assetTag: 'ASSET-012', brand: 'Dell', status: 'AVAILABLE' }
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
