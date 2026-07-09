import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of, delay } from 'rxjs';
import { map } from 'rxjs/operators';
import { SelectedCandidate, SelectedStatus } from '../models/selected.model';
import { City, Branch, Block, Budget } from '../models/location.model';
import {
  Training,
  TrainingAssignmentRequest,
  TrainingAssignmentResult,
  Trainee,
  UpdateTraineeStatusRequest
} from '../models/training.model';
import { ApiResponse } from '../models/api-response.model';
import { API_ENDPOINTS } from '../config/api-endpoints';
import { environment } from '../../environments/environment';
import { BaseService } from './base.service';

const MOCK_SELECTED: SelectedCandidate[] = [
  { selectedId: 1, employeeId: 101, candidateName: 'Rahul Singh', candidateEmail: 'rahul@nexhire.com', jobTitle: 'Java Backend Developer', trainingDomain: 'JAVA', status: 'SELECTED' },
  { selectedId: 2, employeeId: 102, candidateName: 'Priya Sharma', candidateEmail: 'priya@nexhire.com', jobTitle: 'Java Backend Developer', trainingDomain: 'JAVA', status: 'TRAINING_PENDING' },
];

const MOCK_CITIES: City[] = [
  { cityId: 1, cityName: 'Bangalore', state: 'Karnataka', country: 'India', totalBudget: 5000000, usedBudget: 1500000, availableBudget: 3500000, active: true },
  { cityId: 2, cityName: 'Mumbai', state: 'Maharashtra', country: 'India', totalBudget: 4000000, usedBudget: 1000000, availableBudget: 3000000, active: true },
];

const MOCK_BRANCHES: Branch[] = [
  { branchId: 1, branchName: 'BTM Branch', cityId: 1, active: true },
  { branchId: 2, branchName: 'Andheri Branch', cityId: 2, active: true },
];

const MOCK_BLOCKS: Block[] = [
  { blockId: 1, blockName: 'Block A', branchId: 1, totalCapacity: 20, usedCapacity: 5, availableVacancy: 15, active: true },
  { blockId: 2, blockName: 'Block B', branchId: 2, totalCapacity: 15, usedCapacity: 3, availableVacancy: 12, active: true },
];

const MOCK_TRAININGS: Training[] = [
  { trainingId: 1, trainingName: 'Java Enterprise Training', domain: 'JAVA', costPerCandidate: 50000, active: true },
  { trainingId: 2, trainingName: 'Angular UI Training', domain: 'ANGULAR', costPerCandidate: 40000, active: true },
];

const MOCK_TRAINEES: Trainee[] = [
  {
    traineeId: 1,
    employeeId: 101,
    selectedId: 2,
    trainingId: 2,
    cityId: 1,
    branchId: 1,
    blockId: 1,
    candidateName: 'Priya Sharma',
    candidateEmail: 'priya@nexhire.com',
    trainingName: 'Angular UI Training',
    trainingDomain: 'ANGULAR',
    cityName: 'Bangalore',
    branchName: 'BTM Branch',
    blockName: 'Block A',
    status: 'IN_PROGRESS',
    progressPercentage: 65,
  }
];

@Injectable({ providedIn: 'root' })
export class TraineeService extends BaseService {
  constructor(http: HttpClient) { super(http); }

  // ─── Selected Candidates ──────────────────────────────────────────────────────

  getSelectedCandidates(): Observable<SelectedCandidate[]> {
    if (environment.useMockData) return of(MOCK_SELECTED).pipe(delay(400));
    return this.http.get<ApiResponse<SelectedCandidate[]> | SelectedCandidate[]>(API_ENDPOINTS.SELECTED.BASE).pipe(map(r => this.unwrap(r) as SelectedCandidate[]));
  }

  updateSelectedStatus(id: number, status: SelectedStatus): Observable<SelectedCandidate> {
    if (environment.useMockData) {
      const candidate = MOCK_SELECTED.find(c => c.selectedId === id);
      if (candidate) candidate.status = status;
      return of({ ...MOCK_SELECTED[0], status }).pipe(delay(300));
    }
    return this.http.patch<ApiResponse<SelectedCandidate> | SelectedCandidate>(API_ENDPOINTS.SELECTED.UPDATE_STATUS(id), { status }).pipe(map(r => this.unwrap(r) as SelectedCandidate));
  }

  // ─── Trainee Management ──────────────────────────────────────────────────────

  getAll(): Observable<Trainee[]> {
    if (environment.useMockData) return of(MOCK_TRAINEES).pipe(delay(400));
    return this.http.get<ApiResponse<Trainee[]> | Trainee[]>(API_ENDPOINTS.TRAINEES.BASE).pipe(map(r => this.unwrap(r) as Trainee[]));
  }

  updateStatus(id: number, request: UpdateTraineeStatusRequest): Observable<Trainee> {
    if (environment.useMockData) {
      const trainee = MOCK_TRAINEES.find(t => t.traineeId === id);
      if (trainee) {
        trainee.status = request.status;
        if (request.progressPercentage !== undefined) trainee.progressPercentage = request.progressPercentage;
        if (request.remarks !== undefined) trainee.remarks = request.remarks;
        if (request.endDate !== undefined) trainee.endDate = request.endDate;
      }
      return of({ ...MOCK_TRAINEES[0], ...trainee }).pipe(delay(300));
    }
    return this.http.patch<ApiResponse<Trainee> | Trainee>(API_ENDPOINTS.TRAINEES.UPDATE_STATUS(id), request).pipe(map(r => this.unwrap(r) as Trainee));
  }

  // ─── Infrastructure Management (City, Branch, Block) ─────────────────────────

  getCities(): Observable<City[]> {
    if (environment.useMockData) return of(MOCK_CITIES).pipe(delay(300));
    return this.http.get<ApiResponse<City[]> | City[]>(API_ENDPOINTS.CITIES.BASE).pipe(map(r => this.unwrap(r) as City[]));
  }

  getBranches(cityId?: number): Observable<Branch[]> {
    if (environment.useMockData) {
      const branches = cityId ? MOCK_BRANCHES.filter(b => b.cityId === cityId) : MOCK_BRANCHES;
      return of(branches).pipe(delay(300));
    }
    const url = cityId ? API_ENDPOINTS.BRANCHES.BY_CITY(cityId) : API_ENDPOINTS.BRANCHES.BASE;
    return this.http.get<ApiResponse<Branch[]> | Branch[]>(url).pipe(map(r => this.unwrap(r) as Branch[]));
  }

  getBlocks(branchId?: number): Observable<Block[]> {
    if (environment.useMockData) {
      const blocks = branchId ? MOCK_BLOCKS.filter(b => b.branchId === branchId) : MOCK_BLOCKS;
      return of(blocks).pipe(delay(300));
    }
    const url = branchId ? API_ENDPOINTS.BLOCKS.BY_BRANCH(branchId) : API_ENDPOINTS.BLOCKS.BASE;
    return this.http.get<ApiResponse<Block[]> | Block[]>(url).pipe(map(r => this.unwrap(r) as Block[]));
  }

  getTrainingsCatalog(): Observable<Training[]> {
    if (environment.useMockData) return of(MOCK_TRAININGS).pipe(delay(300));
    return this.http.get<ApiResponse<Training[]> | Training[]>(API_ENDPOINTS.TRAININGS.BASE).pipe(map(r => this.unwrap(r) as Training[]));
  }

  // ─── Training Assignment ──────────────────────────────────────────────────────

  assignTraining(request: TrainingAssignmentRequest): Observable<TrainingAssignmentResult> {
    if (environment.useMockData) {
      const training = MOCK_TRAININGS.find(t => t.trainingId === request.trainingId);
      const cost = (training?.costPerCandidate ?? 0) * request.selectedIds.length;

      const city = MOCK_CITIES.find(c => c.cityId === request.cityId);
      const block = MOCK_BLOCKS.find(b => b.blockId === request.blockId);

      // ✅ FIX: Added null checks for city budget properties
      if (city && block) {
        if (city.usedBudget !== undefined) city.usedBudget += cost;
        if (city.availableBudget !== undefined) city.availableBudget -= cost;
        block.usedCapacity += request.selectedIds.length;
        block.availableVacancy -= request.selectedIds.length;
      }

      request.selectedIds.forEach(id => {
        const candidate = MOCK_SELECTED.find(c => c.selectedId === id);
        if (candidate) {
          candidate.status = 'TRAINING_ASSIGNED';
          candidate.cityId = request.cityId;
          candidate.cityName = city?.cityName;
          candidate.branchId = request.branchId;
          candidate.branchName = MOCK_BRANCHES.find(b => b.branchId === request.branchId)?.branchName;
          candidate.blockId = request.blockId;
          candidate.blockName = block?.blockName;
          candidate.trainingDomain = training?.domain;
        }
      });

      const result: TrainingAssignmentResult = {
        totalRequested: request.selectedIds.length,
        assignedCount: request.selectedIds.length,
        skippedCount: 0,
        failedCount: 0,
        totalCost: cost,
        budgetDeducted: cost,
        vacancyUsed: request.selectedIds.length,
      };
      return of(result).pipe(delay(800));
    }
    return this.http.post<ApiResponse<TrainingAssignmentResult> | TrainingAssignmentResult>(
      API_ENDPOINTS.TRAINING_ASSIGNMENTS.BULK_ASSIGN, request
    ).pipe(map(r => this.unwrap(r) as TrainingAssignmentResult));
  }
}
