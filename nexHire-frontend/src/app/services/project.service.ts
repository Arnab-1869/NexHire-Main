import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of, delay } from 'rxjs';
import { map } from 'rxjs/operators';
import { Project, CreateProjectRequest, UpdateProjectRequest, ProjectAllocation, AllocateProjectRequest, ReleasedCandidate } from '../models/project.model';
import { ApiResponse } from '../models/api-response.model';
import { API_ENDPOINTS } from '../config/api-endpoints';
import { environment } from '../../environments/environment';
import { BaseService } from './base.service';

const MOCK_PROJECTS: Project[] = [
  { projectId: 1, projectName: 'Banking Portal', clientName: 'HDFC Bank', requiredDomain: 'JAVA', requiredSkills: 'Java, Spring Boot, MySQL', requiredCount: 5, allocatedCount: 2, remainingCount: 3, status: 'ACTIVE', startDate: '2026-09-01' },
  { projectId: 2, projectName: 'E-Commerce Platform', clientName: 'RetailMart', requiredDomain: 'REACT', requiredSkills: 'React, TypeScript, REST APIs', requiredCount: 4, allocatedCount: 1, remainingCount: 3, status: 'ACTIVE', startDate: '2026-09-15' },
  { projectId: 3, projectName: 'Data Analytics Dashboard', clientName: 'FinTech Corp', requiredDomain: 'PYTHON', requiredSkills: 'Python, Pandas, Matplotlib', requiredCount: 3, allocatedCount: 3, remainingCount: 0, status: 'ACTIVE', startDate: '2026-08-01' },
];

const MOCK_RELEASED: ReleasedCandidate[] = [
  { releasedId: 1, traineeId: 1, employeeId: 101, candidateName: 'Rahul Singh', candidateEmail: 'rahul@nexhire.com', trainingDomain: 'JAVA', trainingName: 'Java Training', releaseDate: '2026-09-01', projectAllocationStatus: 'NOT_ALLOCATED' },
];

@Injectable({ providedIn: 'root' })
export class ProjectService extends BaseService {
  constructor(http: HttpClient) { super(http); }

  getAllProjects(): Observable<Project[]> {
    if (environment.useMockData) return of(MOCK_PROJECTS).pipe(delay(400));
    return this.http.get<ApiResponse<Project[]> | Project[]>(API_ENDPOINTS.PROJECTS.BASE).pipe(map(r => this.unwrap(r) as Project[]));
  }

  getProjectById(id: number): Observable<Project> {
    if (environment.useMockData) return of(MOCK_PROJECTS.find(p => p.projectId === id)!).pipe(delay(300));
    return this.http.get<ApiResponse<Project> | Project>(API_ENDPOINTS.PROJECTS.BY_ID(id)).pipe(map(r => this.unwrap(r) as Project));
  }

  createProject(request: CreateProjectRequest): Observable<Project> {
    if (environment.useMockData) {
      const newProj: Project = { ...request, projectId: Date.now(), allocatedCount: 0, remainingCount: request.requiredCount, status: 'ACTIVE' };
      MOCK_PROJECTS.push(newProj);
      return of(newProj).pipe(delay(600));
    }
    return this.http.post<ApiResponse<Project> | Project>(API_ENDPOINTS.PROJECTS.CREATE, request).pipe(map(r => this.unwrap(r) as Project));
  }

  updateProject(id: number, request: UpdateProjectRequest): Observable<Project> {
    if (environment.useMockData) return of({ ...MOCK_PROJECTS[0], ...request, projectId: id }).pipe(delay(400));
    return this.http.patch<ApiResponse<Project> | Project>(API_ENDPOINTS.PROJECTS.UPDATE(id), request).pipe(map(r => this.unwrap(r) as Project));
  }

  getAllReleased(): Observable<ReleasedCandidate[]> {
    if (environment.useMockData) return of(MOCK_RELEASED).pipe(delay(400));
    return this.http.get<ApiResponse<ReleasedCandidate[]> | ReleasedCandidate[]>(API_ENDPOINTS.RELEASED.BASE).pipe(map(r => this.unwrap(r) as ReleasedCandidate[]));
  }

  allocate(request: AllocateProjectRequest): Observable<ProjectAllocation> {
    if (environment.useMockData) {
      const proj = MOCK_PROJECTS.find(p => p.projectId === request.projectId);
      const rel = MOCK_RELEASED.find(r => r.releasedId === request.releasedId);
      if (proj && rel) {
        proj.allocatedCount++;
        proj.remainingCount--;
        rel.projectAllocationStatus = 'ALLOCATED';
        rel.projectId = proj.projectId;
        rel.projectName = proj.projectName;
      }
      const alloc: ProjectAllocation = { allocationId: Date.now(), projectId: request.projectId, releasedId: request.releasedId, allocationDate: new Date().toISOString(), status: 'ALLOCATED' };
      return of(alloc).pipe(delay(600));
    }
    return this.http.post<ApiResponse<ProjectAllocation> | ProjectAllocation>(API_ENDPOINTS.PROJECT_ALLOCATIONS.ALLOCATE, request).pipe(map(r => this.unwrap(r) as ProjectAllocation));
  }

  getAllAllocations(): Observable<ProjectAllocation[]> {
    if (environment.useMockData) return of([]).pipe(delay(400));
    return this.http.get<ApiResponse<ProjectAllocation[]> | ProjectAllocation[]>(API_ENDPOINTS.PROJECT_ALLOCATIONS.BASE).pipe(map(r => this.unwrap(r) as ProjectAllocation[]));
  }
}
