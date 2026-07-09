import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of, delay } from 'rxjs';
import { map } from 'rxjs/operators';
import { SelectedCandidate, SelectedStatus } from '../models/selected.model';
import {
  City,
  Branch,
  Block,
  Budget,
  CreateCityRequest,
  CreateBranchRequest,
  CreateBlockRequest,
} from '../models/location.model';
import {
  Training,
  TrainingAssignmentRequest,
  TrainingAssignmentResult,
} from '../models/training.model';
import { ApiResponse } from '../models/api-response.model';
import { API_ENDPOINTS } from '../config/api-endpoints';
import { environment } from '../../environments/environment';
import { BaseService } from './base.service';

const MOCK_SELECTED: SelectedCandidate[] = [
  {
    selectedId: 1,
    employeeId: 101,
    candidateName: 'Rahul Singh',
    candidateEmail: 'rahul@nexhire.com',
    jobTitle: 'Java Backend Developer',
    trainingDomain: 'JAVA',
    status: 'SELECTED',
  },
  {
    selectedId: 2,
    employeeId: 102,
    candidateName: 'Priya Sharma',
    candidateEmail: 'priya@nexhire.com',
    jobTitle: 'Java Backend Developer',
    trainingDomain: 'JAVA',
    status: 'TRAINING_PENDING',
  },
];

const MOCK_CITIES: City[] = [
  {
    cityId: 1,
    cityName: 'Bangalore',
    state: 'Karnataka',
    country: 'India',
    totalBudget: 5000000,
    usedBudget: 1500000,
    availableBudget: 3500000,
    active: true,
  },
  {
    cityId: 2,
    cityName: 'Mumbai',
    state: 'Maharashtra',
    country: 'India',
    totalBudget: 4000000,
    usedBudget: 1000000,
    availableBudget: 3000000,
    active: true,
  },
];

const MOCK_BRANCHES: Branch[] = [
  { branchId: 1, branchName: 'BTM Branch', cityId: 1, active: true },
  { branchId: 2, branchName: 'Andheri Branch', cityId: 2, active: true },
];

const MOCK_BLOCKS: Block[] = [
  {
    blockId: 1,
    blockName: 'Block A',
    branchId: 1,
    totalCapacity: 20,
    usedCapacity: 5,
    availableVacancy: 15,
    active: true,
  },
  {
    blockId: 2,
    blockName: 'Block B',
    branchId: 2,
    totalCapacity: 15,
    usedCapacity: 3,
    availableVacancy: 12,
    active: true,
  },
];

const MOCK_TRAININGS: Training[] = [
  {
    trainingId: 1,
    trainingName: 'Java Enterprise Training',
    domain: 'JAVA',
    costPerCandidate: 50000,
    active: true,
  },
  {
    trainingId: 2,
    trainingName: 'Angular UI Training',
    domain: 'ANGULAR',
    costPerCandidate: 40000,
    active: true,
  },
];

@Injectable({ providedIn: 'root' })
export class TrainingService extends BaseService {
  constructor(http: HttpClient) {
    super(http);
  }

  // ─── Selected Candidates ──────────────────────────────────────────────────────

  getSelectedCandidates(): Observable<SelectedCandidate[]> {
    if (environment.useMockData) {
      // Fetch QUALIFIED applications from the real backend and map to SelectedCandidate shape.
      return this.http
        .get<any[]>(`${environment.apiBaseUrl}/api/applications`)
        .pipe(
          map((apps: any[]) =>
            (apps || [])
              .filter((a: any) => a.status === 'QUALIFIED')
              .map((a: any) => ({
                selectedId: a.id,
                employeeId: a.userId,
                candidateName: a.userName,
                candidateEmail: a.userEmail,
                jobTitle: a.jobTitle,
                trainingDomain: a.jobTitle?.includes('Java')
                  ? 'JAVA'
                  : a.jobTitle?.includes('Angular')
                    ? 'ANGULAR'
                    : 'FULLSTACK',
                status: 'SELECTED' as SelectedStatus,
                selectionDate: a.updatedAt || a.appliedAt,
              })),
          ),
        );
    }
    return this.http
      .get<
        ApiResponse<SelectedCandidate[]> | SelectedCandidate[]
      >(API_ENDPOINTS.SELECTED.BASE)
      .pipe(map((r) => this.unwrap(r) as SelectedCandidate[]));
  }

  updateSelectedStatus(
    id: number,
    status: SelectedStatus,
  ): Observable<SelectedCandidate> {
    if (environment.useMockData) {
      const candidate = MOCK_SELECTED.find((c) => c.selectedId === id);
      if (candidate) candidate.status = status;
      return of({ ...MOCK_SELECTED[0], status }).pipe(delay(300));
    }
    return this.http
      .patch<
        ApiResponse<SelectedCandidate> | SelectedCandidate
      >(API_ENDPOINTS.SELECTED.UPDATE_STATUS(id), { status })
      .pipe(map((r) => this.unwrap(r) as SelectedCandidate));
  }

  // ─── Infrastructure Management (City, Branch, Block) ─────────────────────────

  getCities(): Observable<City[]> {
    if (environment.useMockData) return of(MOCK_CITIES).pipe(delay(300));
    return this.http
      .get<ApiResponse<City[]> | City[]>(API_ENDPOINTS.CITIES.BASE)
      .pipe(map((r) => this.unwrap(r) as City[]));
  }

  getBranches(cityId?: number): Observable<Branch[]> {
    if (environment.useMockData) {
      const branches = cityId
        ? MOCK_BRANCHES.filter((b) => b.cityId === cityId)
        : MOCK_BRANCHES;
      return of(branches).pipe(delay(300));
    }
    const url = cityId
      ? API_ENDPOINTS.BRANCHES.BY_CITY(cityId)
      : API_ENDPOINTS.BRANCHES.BASE;
    return this.http
      .get<ApiResponse<Branch[]> | Branch[]>(url)
      .pipe(map((r) => this.unwrap(r) as Branch[]));
  }

  getBlocks(branchId?: number): Observable<Block[]> {
    if (environment.useMockData) {
      const blocks = branchId
        ? MOCK_BLOCKS.filter((b) => b.branchId === branchId)
        : MOCK_BLOCKS;
      return of(blocks).pipe(delay(300));
    }
    const url = branchId
      ? API_ENDPOINTS.BLOCKS.BY_BRANCH(branchId)
      : API_ENDPOINTS.BLOCKS.BASE;
    return this.http
      .get<ApiResponse<Block[]> | Block[]>(url)
      .pipe(map((r) => this.unwrap(r) as Block[]));
  }

  getTrainingsCatalog(): Observable<Training[]> {
    if (environment.useMockData) return of(MOCK_TRAININGS).pipe(delay(300));
    return this.http
      .get<ApiResponse<Training[]> | Training[]>(API_ENDPOINTS.TRAININGS.BASE)
      .pipe(map((r) => this.unwrap(r) as Training[]));
  }

  // ─── Training Assignment ──────────────────────────────────────────────────────

  createCity(request: CreateCityRequest): Observable<City> {
    if (environment.useMockData) {
      const newCity: City = {
        cityId: Date.now(),
        cityName: request.cityName,
        state: request.state,
        country: request.country,
        totalBudget: request.totalBudget,
        usedBudget: 0,
        availableBudget: request.totalBudget ?? 0,
        active: true,
      };
      MOCK_CITIES.unshift(newCity);
      return of(newCity).pipe(delay(400));
    }
    return this.http
      .post<ApiResponse<City> | City>(API_ENDPOINTS.CITIES.CREATE, request)
      .pipe(map((r) => this.unwrap(r) as City));
  }

  createBranch(request: CreateBranchRequest): Observable<Branch> {
    if (environment.useMockData) {
      const city = MOCK_CITIES.find((c) => c.cityId === request.cityId);
      const newBranch: Branch = {
        branchId: Date.now(),
        branchName: request.branchName,
        cityId: request.cityId,
        cityName: city?.cityName,
        address: request.address,
        active: true,
      };
      MOCK_BRANCHES.unshift(newBranch);
      return of(newBranch).pipe(delay(400));
    }
    return this.http
      .post<
        ApiResponse<Branch> | Branch
      >(API_ENDPOINTS.BRANCHES.CREATE, request)
      .pipe(map((r) => this.unwrap(r) as Branch));
  }

  createBlock(request: CreateBlockRequest): Observable<Block> {
    if (environment.useMockData) {
      const branch = MOCK_BRANCHES.find((b) => b.branchId === request.branchId);
      const newBlock: Block = {
        blockId: Date.now(),
        blockName: request.blockName,
        branchId: request.branchId,
        branchName: branch?.branchName,
        cityId: branch?.cityId,
        cityName: branch?.cityName,
        totalCapacity: request.totalCapacity,
        usedCapacity: 0,
        availableVacancy: request.totalCapacity,
        active: true,
      };
      MOCK_BLOCKS.unshift(newBlock);
      return of(newBlock).pipe(delay(400));
    }
    return this.http
      .post<ApiResponse<Block> | Block>(API_ENDPOINTS.BLOCKS.CREATE, request)
      .pipe(map((r) => this.unwrap(r) as Block));
  }

  assignTraining(
    request: TrainingAssignmentRequest,
  ): Observable<TrainingAssignmentResult> {
    if (environment.useMockData) {
      const training = MOCK_TRAININGS.find(
        (t) => t.trainingId === request.trainingId,
      );
      const city = MOCK_CITIES.find((c) => c.cityId === request.cityId);
      const block = MOCK_BLOCKS.find(
        (b) => b.blockId === request.blockId && b.branchId === request.branchId,
      );

      const result: TrainingAssignmentResult = {
        totalRequested: request.selectedIds.length,
        assignedCount: 0,
        skippedCount: 0,
        failedCount: 0,
        totalCost: 0,
        budgetDeducted: 0,
        vacancyUsed: 0,
        skippedRecords: [],
        failedRecords: [],
      };

      if (!training) {
        result.failedCount = request.selectedIds.length;
        result.failedRecords = request.selectedIds.map((selectedId) => ({
          selectedId,
          reason: 'Training program not found.',
        }));
        return of(result).pipe(delay(800));
      }

      if (!training.active) {
        result.failedCount = request.selectedIds.length;
        result.failedRecords = request.selectedIds.map((selectedId) => ({
          selectedId,
          reason: 'Selected training program is currently inactive.',
        }));
        return of(result).pipe(delay(800));
      }

      if (!city || !block) {
        result.failedCount = request.selectedIds.length;
        result.failedRecords = request.selectedIds.map((selectedId) => ({
          selectedId,
          reason: 'Invalid city, branch, or block selection.',
        }));
        return of(result).pipe(delay(800));
      }

      const costPerCandidate = training.costPerCandidate ?? 0;
      const requiredBudget = costPerCandidate * request.selectedIds.length;

      if (
        city.availableBudget === undefined ||
        city.availableBudget < requiredBudget
      ) {
        result.failedCount = request.selectedIds.length;
        result.failedRecords = request.selectedIds.map((selectedId) => ({
          selectedId,
          reason: 'City budget is insufficient for this batch.',
        }));
        return of(result).pipe(delay(800));
      }

      if (
        block.availableVacancy === undefined ||
        block.availableVacancy < request.selectedIds.length
      ) {
        result.failedCount = request.selectedIds.length;
        result.failedRecords = request.selectedIds.map((selectedId) => ({
          selectedId,
          reason: 'Block vacancy is insufficient for this batch.',
        }));
        return of(result).pipe(delay(800));
      }

      request.selectedIds.forEach((selectedId) => {
        const candidate = MOCK_SELECTED.find(
          (c) => c.selectedId === selectedId,
        );
        if (!candidate) {
          result.failedCount++;
          result.failedRecords?.push({
            selectedId,
            reason: 'Selected candidate not found.',
          });
          return;
        }

        if (
          candidate.status === 'TRAINING_ASSIGNED' ||
          candidate.status === 'MOVED_TO_TRAINEE'
        ) {
          result.skippedCount++;
          result.skippedRecords?.push({
            selectedId,
            reason:
              'Candidate is already assigned to training or has already progressed.',
          });
          return;
        }

        candidate.status = 'TRAINING_ASSIGNED';
        candidate.trainingDomain = training.domain;
        candidate.cityId = request.cityId;
        candidate.cityName = city.cityName;
        candidate.branchId = request.branchId;
        candidate.branchName = MOCK_BRANCHES.find(
          (b) => b.branchId === request.branchId,
        )?.branchName;
        candidate.blockId = request.blockId;
        candidate.blockName = block.blockName;
        result.assignedCount++;
      });

      if (result.assignedCount > 0) {
        const assignedCost = costPerCandidate * result.assignedCount;
        city.usedBudget = (city.usedBudget ?? 0) + assignedCost;
        city.availableBudget -= assignedCost;
        block.usedCapacity += result.assignedCount;
        block.availableVacancy -= result.assignedCount;
        result.totalCost = assignedCost;
        result.budgetDeducted = assignedCost;
        result.vacancyUsed = result.assignedCount;
      }

      return of(result).pipe(delay(800));
    }
    return this.http
      .post<
        ApiResponse<TrainingAssignmentResult> | TrainingAssignmentResult
      >(API_ENDPOINTS.TRAINING_ASSIGNMENTS.BULK_ASSIGN, request)
      .pipe(map((r) => this.unwrap(r) as TrainingAssignmentResult));
  }
}
