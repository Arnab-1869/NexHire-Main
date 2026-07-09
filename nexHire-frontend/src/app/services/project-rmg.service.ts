import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { API_ENDPOINTS } from '../config/api-endpoints';
import { BaseService } from './base.service';
import { TraineeRecord } from './trainee-progress.service';

export interface RmgProject {
  id: number;
  name: string;
  description?: string;
  active: boolean;
  teamSize: number;
  createdAt?: string;
}

export interface ProjectAssignmentResult {
  id: number;
  traineeId: number;
  projectId: number;
  projectName: string;
  candidateName: string;
  candidateEmail: string;
  assignedByName: string;
  assignedAt: string;
}

/**
 * Backend-aligned RMG project + allocation service (real nexHIRE API).
 * Distinct from the legacy mock ProjectService.
 */
@Injectable({ providedIn: 'root' })
export class ProjectRmgService extends BaseService {
  constructor(http: HttpClient) {
    super(http);
  }

  /** ADMIN + RMG: list all projects. */
  getProjects(): Observable<RmgProject[]> {
    return this.http.get<RmgProject[]>(API_ENDPOINTS.PROJECTS.BASE);
  }

  /** Back-compat alias used by the RMG allocation screen. */
  getActiveProjects(): Observable<RmgProject[]> {
    return this.getProjects();
  }

  /** ADMIN: create a project. */
  createProject(name: string, description?: string): Observable<RmgProject> {
    return this.http.post<RmgProject>(API_ENDPOINTS.PROJECTS.CREATE, {
      name,
      description,
    });
  }

  /** ADMIN: update a project's details / active flag. */
  updateProject(
    id: number,
    payload: { name: string; description?: string; active?: boolean },
  ): Observable<RmgProject> {
    return this.http.put<RmgProject>(
      API_ENDPOINTS.PROJECTS.UPDATE(id),
      payload,
    );
  }

  /** ADMIN: delete a project. */
  deleteProject(id: number): Observable<void> {
    return this.http.delete<void>(API_ENDPOINTS.PROJECTS.BY_ID(id));
  }

  getEligibleTrainees(): Observable<TraineeRecord[]> {
    return this.http.get<TraineeRecord[]>(
      API_ENDPOINTS.PROJECTS.ELIGIBLE_TRAINEES,
    );
  }

  assign(
    projectId: number,
    traineeId: number,
  ): Observable<ProjectAssignmentResult> {
    return this.http.post<ProjectAssignmentResult>(
      API_ENDPOINTS.PROJECTS.ASSIGN(projectId, traineeId),
      {},
    );
  }
}
