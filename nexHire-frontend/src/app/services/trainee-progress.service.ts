import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { API_ENDPOINTS } from '../config/api-endpoints';
import { BaseService } from './base.service';

export interface TraineeRecord {
  traineeId: number;
  userId: number;
  applicationId: number;
  candidateName: string;
  candidateEmail: string;
  jobTitle: string;
  applicationStatus: string;
  progress: number;
  topic?: string;
  completed: boolean;
  joinedAt?: string;
  updatedAt?: string;
  score?: number;
  attendancePercentage?: number;
  finalResult?: string;
  status?: string;
  lapEnabled?: boolean;
  remarks?: string;
  released?: boolean;
  flagged?: boolean;
  flagReason?: string;
  employeeId?: string;
}

/**
 * Backend-aligned training/trainee service (real nexHIRE API).
 * Distinct from the legacy mock TrainingService (selected candidates / catalog).
 */
@Injectable({ providedIn: 'root' })
export class TraineeProgressService extends BaseService {
  constructor(http: HttpClient) {
    super(http);
  }

  /** HR: list all trainees. */
  getAllTrainees(): Observable<TraineeRecord[]> {
    return this.http.get<TraineeRecord[]>(API_ENDPOINTS.TRAINEES.BASE);
  }

  getTraineesByBatch(batchId: number): Observable<TraineeRecord[]> {
    return this.http.get<TraineeRecord[]>(API_ENDPOINTS.TRAINEES.BY_BATCH(batchId));
  }

  /** EMPLOYEE: own training record. */
  getMyTraining(): Observable<TraineeRecord> {
    return this.http.get<TraineeRecord>(API_ENDPOINTS.TRAINEES.MY);
  }

  /** HR: update training progress (0-100). */
  updateProgress(
    traineeId: number,
    progress: number,
    topic?: string,
  ): Observable<TraineeRecord> {
    return this.http.put<TraineeRecord>(
      API_ENDPOINTS.TRAINEES.UPDATE_PROGRESS(traineeId),
      { progress, topic },
    );
  }

  /** HR: mark training complete. */
  complete(traineeId: number): Observable<TraineeRecord> {
    return this.http.put<TraineeRecord>(
      API_ENDPOINTS.TRAINEES.COMPLETE(traineeId),
      {},
    );
  }

  assignBatch(batchId: number): Observable<any> {
    return this.http.post<any>(API_ENDPOINTS.TRAINEES.ASSIGN_BATCH, { batchId });
  }

  moveToLap(traineeId: number, remarks: string): Observable<TraineeRecord> {
    return this.http.post<TraineeRecord>(API_ENDPOINTS.TRAINEES.MOVE_TO_LAP(traineeId), { remarks });
  }

  removeFromLap(traineeId: number): Observable<TraineeRecord> {
    return this.http.post<TraineeRecord>(API_ENDPOINTS.TRAINEES.REMOVE_LAP(traineeId), {});
  }

  flag(traineeId: number, reason: string): Observable<TraineeRecord> {
    return this.http.post<TraineeRecord>(API_ENDPOINTS.TRAINEES.FLAG(traineeId), { reason });
  }

  completeBatch(batchId: number): Observable<any> {
    return this.http.post<any>(API_ENDPOINTS.TRAINEES.COMPLETE_BATCH(batchId), {});
  }

  getExceptions(): Observable<TraineeRecord[]> {
    return this.http.get<TraineeRecord[]>(API_ENDPOINTS.TRAINEES.EXCEPTIONS);
  }

  resolveException(traineeId: number, action: 'RELEASE' | 'REJECT' | 'EXTEND', remarks: string): Observable<TraineeRecord> {
    return this.http.post<TraineeRecord>(API_ENDPOINTS.TRAINEES.RESOLVE_EXCEPTION(traineeId), { action, remarks });
  }

  getPrograms(): Observable<any[]> {
    return this.http.get<any[]>(API_ENDPOINTS.TRAINEES.PROGRAMS);
  }

  getBlocks(): Observable<any[]> {
    return this.http.get<any[]>(API_ENDPOINTS.TRAINEES.BLOCKS);
  }
}
