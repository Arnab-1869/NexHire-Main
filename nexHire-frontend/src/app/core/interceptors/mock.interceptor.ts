// ─── Mock HTTP Interceptor for API Simulation ────────────────────────────────

import { Injectable } from '@angular/core';
import {
  HttpEvent,
  HttpHandler,
  HttpInterceptor,
  HttpRequest,
  HttpResponse,
  HttpErrorResponse,
} from '@angular/common/http';
import { Observable, of, throwError } from 'rxjs';
import { delay } from 'rxjs/operators';
import {
  InMemoryDataStore,
  EntityType,
  PagedResponse,
} from '../mocks/in-memory-data-store';
import { environment } from '../../../environments/environment';

/**
 * Mock HTTP Interceptor
 * Intercepts HTTP requests and returns simulated responses when mock mode is enabled
 * Provides realistic API simulation with latency, pagination, and state management
 */
@Injectable()
export class MockInterceptor implements HttpInterceptor {
  private dataStore: InMemoryDataStore;

  /**
   * URL path prefixes that are served by the REAL nexHIRE backend.
   * Requests matching these always pass through, even while mock mode is on
   * for the remaining (not-yet-implemented) modules.
   */
  private static readonly REAL_BACKEND_PREFIXES: string[] = [];

  constructor() {
    this.dataStore = new InMemoryDataStore();
  }

  /**
   * Intercept HTTP requests
   */
  intercept(
    req: HttpRequest<any>,
    next: HttpHandler,
  ): Observable<HttpEvent<any>> {
    // Pass through to real backend if mock mode is disabled
    if (!environment.useMockData) {
      return next.handle(req);
    }

    if (req.url.includes('/api/auth/login')) {
      const email = req.body?.email || '';
      let role = 'EMPLOYEE';
      let name = 'Candidate User';
      if (email.startsWith('admin')) {
        role = 'ADMIN';
        name = 'Admin User';
      } else if (email.startsWith('hr')) {
        role = 'HR';
        name = 'HR Manager';
      } else if (email.startsWith('rmg')) {
        role = 'RMG';
        name = 'RMG Manager';
      }
      return of(new HttpResponse({
        status: 200,
        body: {
          token: 'mock-jwt-token-xyz',
          userId: 101,
          name: name,
          email: email,
          role: role,
          lifecycleStatus: role === 'EMPLOYEE' ? 'CANDIDATE' : null
        }
      })).pipe(delay(200));
    }

    if (req.url.includes('/api/auth/register')) {
      return of(new HttpResponse({
        status: 200,
        body: {
          token: 'mock-jwt-token-xyz',
          userId: 102,
          name: req.body?.name || 'New Candidate',
          email: req.body?.email || 'new@nexhire.com',
          role: 'EMPLOYEE',
          lifecycleStatus: 'CANDIDATE'
        }
      })).pipe(delay(200));
    }

    // Pass through requests handled by the real backend
    if (this.isRealBackendRequest(req.url)) {
      return next.handle(req);
    }

    // Handle mock request for everything else
    return this.handleMockRequest(req).pipe(delay(this.randomDelay(100, 500)));
  }

  /**
   * Determine if a request targets a real backend endpoint.
   */
  private isRealBackendRequest(url: string): boolean {
    const path = url.replace(environment.apiBaseUrl, '');
    return MockInterceptor.REAL_BACKEND_PREFIXES.some((prefix) =>
      path.startsWith(prefix),
    );
  }

  /**
   * Handle mock request based on method and URL
   */
  private handleMockRequest(req: HttpRequest<any>): Observable<HttpEvent<any>> {
    try {
      const { method, url, body } = req;
      const path = url.replace(environment.apiBaseUrl, '').split('?')[0];

      // ── Special-case: /api/candidate/profile/* ──────────────────────────
      if (path.startsWith('/api/candidate/profile')) {
        return this.handleCandidateProfile(method, path, body);
      }

      // ── Special-case: /api/dashboard/* ──────────────────────────────────
      if (path.startsWith('/api/dashboard')) {
        return this.handleDashboard(path);
      }

      // ── Special-case: /api/notifications ────────────────────────────────
      if (path.startsWith('/api/notifications')) {
        return this.createSuccessResponse([], 200);
      }

      // ── Special-case: /api/auth/me ──────────────────────────────────────
      if (path === '/api/auth/me') {
        if (method === 'PUT') {
          return this.createSuccessResponse({ ...body, userId: 101 }, 200);
        }
        return this.createSuccessResponse({
          userId: 101,
          name: 'Mock User',
          email: 'mock@nexhire.com',
          phone: '9876543210',
          role: 'HR',
        }, 200);
      }

      // ── Special-case: /api/joining-batches ──────────────────────────────
      if (path.startsWith('/api/joining-batches')) {
        return this.handleJoiningBatches(method, path, body);
      }

      // ── Special-case: /api/import/* ─────────────────────────────────────
      if (path.startsWith('/api/import')) {
        return this.handleImport(method, path, body);
      }

      // ── Special-case: /api/bgv ──────────────────────────────────────────
      if (path.startsWith('/api/bgv')) {
        return this.handleBgv(method, path, body);
      }

      // ── Special-case: /api/training ─────────────────────────────────────
      if (path.startsWith('/api/training')) {
        return this.handleTraining(method, path, body);
      }

      // ── Special-case: /api/users ─────────────────────────────────────────
      if (path.startsWith('/api/users')) {
        return this.handleUsers(method, path, body);
      }

      // ── Special-case: /api/projects ─────────────────────────────────────
      if (path.startsWith('/api/projects')) {
        return this.handleProjects(method, path, body);
      }

      // ── Special-case: /api/roles ────────────────────────────────────────
      if (path.startsWith('/api/roles')) {
        return this.createSuccessResponse([
          { name: 'ADMIN', description: 'System administrator with full access' },
          { name: 'HR', description: 'Manages hiring, assessments, offers, joining, training' },
          { name: 'RMG', description: 'Assigns training-completed trainees to projects' },
          { name: 'EMPLOYEE', description: 'Candidate/Trainee lifecycle user' }
        ], 200);
      }

      // ── Special-case: /api/assets ───────────────────────────────────────
      if (path.startsWith('/api/assets')) {
        return this.handleAssets(method, path, body);
      }

      // ── Special-case: /api/activity-logs ────────────────────────────────
      if (path.startsWith('/api/activity-logs')) {
        return this.createSuccessResponse([
          { id: 1, userId: 101, userName: 'HR Manager', actionType: 'OFFER_SENT', description: 'Sent Java Developer offer to Priya Singh', timestamp: new Date(Date.now() - 2*3600*1000).toISOString() },
          { id: 2, userId: 102, userName: 'RMG Manager', actionType: 'PROJECT_ALLOCATED', description: 'Allocated Amit Sharma to Banking Portal', timestamp: new Date(Date.now() - 4*3600*1000).toISOString() },
          { id: 3, userId: 100, userName: 'Admin User', actionType: 'USER_DEACTIVATE', description: 'Deactivated mock candidate user', timestamp: new Date(Date.now() - 1*24*3600*1000).toISOString() },
          { id: 4, userId: 101, userName: 'HR Manager', actionType: 'TRAINING_ASSIGN', description: 'Assigned 5 trainees to Java spring-boot course', timestamp: new Date(Date.now() - 2*24*3600*1000).toISOString() }
        ], 200);
      }

      // Parse URL to extract entity type, ID, and query params
      const urlParts = this.parseUrl(url);

      // Route to appropriate handler based on HTTP method
      switch (method) {
        case 'GET':
          return this.handleGet(urlParts, req);
        case 'POST':
          return this.handlePost(urlParts, body);
        case 'PUT':
          return this.handlePut(urlParts, body);
        case 'DELETE':
          return this.handleDelete(urlParts);
        default:
          return this.createErrorResponse(405, 'Method not allowed');
      }
    } catch (error) {
      console.error('Mock interceptor error:', error);
      return this.createErrorResponse(500, 'Internal server error');
    }
  }

  /**
   * Handle GET requests
   */
  private handleGet(
    urlParts: UrlParts,
    req: HttpRequest<any>,
  ): Observable<HttpEvent<any>> {
    const { entityType, id, queryParams } = urlParts;

    if (!entityType) {
      return this.createErrorResponse(404, 'Endpoint not found');
    }

    if (entityType === EntityType.LOCATIONS) {
      const mockLocations = [
        { id: 1, name: 'Bangalore Office', city: 'Bangalore' },
        { id: 2, name: 'Hyderabad Office', city: 'Hyderabad' },
        { id: 3, name: 'Mumbai Office', city: 'Mumbai' },
        { id: 4, name: 'Pune Office', city: 'Pune' },
        { id: 5, name: 'Chennai Office', city: 'Chennai' }
      ];
      return this.createSuccessResponse(mockLocations, 200);
    }

    // Get single entity by ID
    if (id) {
      const entity = this.dataStore.get(entityType, id);
      if (!entity) {
        return this.createErrorResponse(
          404,
          `${entityType} with id ${id} not found`,
        );
      }
      return this.createSuccessResponse(entity, 200);
    }

    // Get list with pagination and filtering
    const sortBy = queryParams.get('sortBy');
    const sortOrder = queryParams.get('sortOrder') || 'asc';

    // Apply filters from query params
    let data = this.dataStore.getAll(entityType);

    // Apply dynamic filters based on query params
    data = this.applyFilters(data, queryParams);

    // Apply sorting
    if (sortBy) {
      data = this.applySorting(data, sortBy, sortOrder);
    }

    // Calculate pagination only if page/pageSize are explicitly specified
    let paginatedData = data;
    if (queryParams.has('page') || queryParams.has('pageSize')) {
      const page = parseInt(queryParams.get('page') || '1', 10);
      const pageSize = parseInt(queryParams.get('pageSize') || '10', 10);
      const startIndex = (page - 1) * pageSize;
      const endIndex = startIndex + pageSize;
      paginatedData = data.slice(startIndex, endIndex);
    }

    return this.createSuccessResponse(paginatedData, 200);
  }

  /**
   * Handle POST requests
   */
  private handlePost(
    urlParts: UrlParts,
    body: any,
  ): Observable<HttpEvent<any>> {
    const { entityType } = urlParts;

    if (!entityType) {
      return this.createErrorResponse(404, 'Endpoint not found');
    }

    // Create new entity
    const newEntity = this.dataStore.create(entityType, body);

    return this.createSuccessResponse(newEntity, 201);
  }

  /**
   * Handle PUT requests
   */
  private handlePut(urlParts: UrlParts, body: any): Observable<HttpEvent<any>> {
    const { entityType, id } = urlParts;

    if (!entityType || !id) {
      return this.createErrorResponse(
        400,
        'Invalid request: entity type and ID required',
      );
    }

    // Update existing entity
    const updatedEntity = this.dataStore.update(entityType, id, body);

    if (!updatedEntity) {
      return this.createErrorResponse(
        404,
        `${entityType} with id ${id} not found`,
      );
    }

    return this.createSuccessResponse(updatedEntity, 200);
  }

  /**
   * Handle DELETE requests
   */
  private handleDelete(urlParts: UrlParts): Observable<HttpEvent<any>> {
    const { entityType, id } = urlParts;

    if (!entityType || !id) {
      return this.createErrorResponse(
        400,
        'Invalid request: entity type and ID required',
      );
    }

    // Delete entity
    const deleted = this.dataStore.delete(entityType, id);

    if (!deleted) {
      return this.createErrorResponse(
        404,
        `${entityType} with id ${id} not found`,
      );
    }

    return this.createSuccessResponse(null, 204);
  }

  // ── In-memory candidate profile store ─────────────────────────────────────
  private mockProfile: any = null;
  private mockResumeUploaded = false;

  /**
   * Handle all /api/candidate/profile/* requests
   */
  private handleCandidateProfile(
    method: string,
    path: string,
    body: any,
  ): Observable<HttpEvent<any>> {
    // GET /api/candidate/profile/check-completion
    if (path === '/api/candidate/profile/check-completion' && method === 'GET') {
      return this.createSuccessResponse(
        { completed: this.mockProfile !== null },
        200,
      );
    }

    // POST /api/candidate/profile/resume  (resume upload)
    if (path === '/api/candidate/profile/resume' && method === 'POST') {
      this.mockResumeUploaded = true;
      return this.createSuccessResponse(
        { message: 'Resume uploaded successfully.' },
        200,
      );
    }

    // GET /api/candidate/profile  (load profile)
    if (path === '/api/candidate/profile' && method === 'GET') {
      if (this.mockProfile) {
        return this.createSuccessResponse(this.mockProfile, 200);
      }
      // Return empty profile with defaults
      return this.createSuccessResponse(
        {
          name: '',
          phone: '',
          highestDegree: '',
          gradYear: null,
          tenthMarks: null,
          twelfthMarks: null,
          gradCgpa: null,
          expType: 'FRESHER',
          yearsOfExp: 0,
          skills: '',
          prefLocation1Id: null,
          prefLocation2Id: null,
          prefLocation3Id: null,
          resumeUploaded: false,
          completed: false,
        },
        200,
      );
    }

    // POST /api/candidate/profile  (save profile)
    if (path === '/api/candidate/profile' && method === 'POST') {
      this.mockProfile = {
        ...body,
        id: 1,
        resumeUploaded: this.mockResumeUploaded,
        completed: true,
      };
      return this.createSuccessResponse(this.mockProfile, 200);
    }

    return this.createErrorResponse(404, 'Candidate profile endpoint not found');
  }

  /**
   * Handle /api/dashboard/* requests
   */
  private handleDashboard(path: string): Observable<HttpEvent<any>> {
    if (path.includes('/stats')) {
      return this.createSuccessResponse({
        totalUsers: 156,
        totalJobs: 12,
        totalApplications: 342,
        pendingApplications: 45,
        shortlistedApplications: 120,
        assessmentsAssigned: 95,
        assessmentsPassed: 72,
        assessmentsFailed: 23,
        offersSent: 60,
        offersAccepted: 48,
        offersRejected: 12,
        bgvPending: 15,
        bgvCleared: 33,
        employeesCreated: 33,
        selectedCandidates: 48,
        traineesActive: 28,
        trainingCompleted: 14,
        assetsAssigned: 22,
        releasedCandidates: 10,
        projectsActive: 5,
        candidatesAllocated: 8,
        totalBudgetUsed: 2100000,
        totalBudgetAvailable: 2900000,
        totalVacancyUsed: 280,
        totalVacancyAvailable: 120,
        totalEmployees: 142,
        totalAdmins: 3,
      }, 200);
    }

    if (path.includes('/charts/applications')) {
      return this.createSuccessResponse({
        labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
        datasets: [{
          label: 'Applications',
          data: [45, 62, 78, 55, 68, 34],
          backgroundColor: '#3b82f6',
        }],
      }, 200);
    }

    if (path.includes('/charts/assessments')) {
      return this.createSuccessResponse({
        labels: ['Passed', 'Failed', 'Pending'],
        datasets: [{
          label: 'Assessments',
          data: [72, 23, 15],
          backgroundColor: ['#10b981', '#ef4444', '#f59e0b'],
        }],
      }, 200);
    }

    if (path.includes('/charts/bgv')) {
      return this.createSuccessResponse({
        labels: ['Cleared', 'Pending', 'Failed'],
        datasets: [{
          label: 'BGV',
          data: [33, 15, 4],
          backgroundColor: ['#10b981', '#f59e0b', '#ef4444'],
        }],
      }, 200);
    }

    if (path.includes('/charts/training')) {
      return this.createSuccessResponse({
        labels: ['Completed', 'In Progress', 'Not Started'],
        datasets: [{
          label: 'Training',
          data: [14, 28, 6],
          backgroundColor: ['#10b981', '#3b82f6', '#94a3b8'],
        }],
      }, 200);
    }

    if (path.includes('/charts')) {
      return this.createSuccessResponse({
        labels: ['Q1', 'Q2', 'Q3', 'Q4'],
        datasets: [{
          label: 'Data',
          data: [30, 50, 40, 60],
          backgroundColor: '#6366f1',
        }],
      }, 200);
    }

    return this.createSuccessResponse({}, 200);
  }

  /**
   * Handle /api/joining-batches/* requests
   */
  private handleJoiningBatches(
    method: string,
    path: string,
    body: any,
  ): Observable<HttpEvent<any>> {
    if (path.includes('/eligible-candidates')) {
      return this.createSuccessResponse([
        { id: 1, name: 'Amit Sharma', email: 'amit@example.com', jobTitle: 'Java Developer' },
        { id: 2, name: 'Priya Singh', email: 'priya@example.com', jobTitle: 'Angular Developer' },
        { id: 3, name: 'Ravi Kumar', email: 'ravi@example.com', jobTitle: 'Full Stack Engineer' },
      ], 200);
    }

    if (method === 'GET') {
      return this.createSuccessResponse([
        {
          id: 1,
          batchCode: 'B-2026-Q2',
          batchName: 'July 2026 Batch',
          joiningDate: '2026-07-15',
          joiningLocationName: 'Bangalore Office',
          trainingLocationName: 'Bangalore Office',
          trainingName: 'Java Spring Boot Fundamentals',
          blockName: 'Block A',
          status: 'TRAINING_IN_PROGRESS',
          currentHeadcount: 4,
          batchSize: 20,
          createdAt: '2026-06-01T10:00:00',
        },
        {
          id: 2,
          batchCode: 'B-2026-Q3',
          batchName: 'October 2026 Batch',
          joiningDate: '2026-10-01',
          joiningLocationName: 'Hyderabad Office',
          trainingLocationName: 'Hyderabad Office',
          trainingName: 'Angular Enterprise Development',
          blockName: 'Block B',
          status: 'CREATED',
          currentHeadcount: 0,
          batchSize: 30,
          createdAt: '2026-08-15T10:00:00',
        },
      ], 200);
    }

    if (method === 'POST') {
      return this.createSuccessResponse({
        ...body,
        id: 3,
        batchCode: 'B-' + new Date().getFullYear() + '-' + Math.floor(Math.random() * 1000),
        currentHeadcount: 0,
        createdAt: new Date().toISOString()
      }, 201);
    }

    return this.createSuccessResponse({}, 200);
  }

  /**
   * Handle /api/import/* requests
   */
  private handleImport(
    method: string,
    path: string,
    body: any,
  ): Observable<HttpEvent<any>> {
    if (path.includes('/logs') && method === 'GET') {
      if (path.match(/\/logs\/\d+\/errors/)) {
        return this.createSuccessResponse([
          { rowNumber: 5, field: 'email', message: 'Invalid email format', rawValue: 'bad-email' },
          { rowNumber: 12, field: 'score', message: 'Score must be numeric', rawValue: 'N/A' },
        ], 200);
      }
      return this.createSuccessResponse([
        { id: 1, fileName: 'assessment_scores_q2.xlsx', uploadType: 'ASSESSMENT', totalRows: 50, successRows: 48, failedRows: 2, status: 'COMPLETED', uploadedAt: '2025-06-10T14:30:00', uploadedBy: 'HR Manager' },
        { id: 2, fileName: 'bgc_results_june.xlsx', uploadType: 'BGC', totalRows: 30, successRows: 30, failedRows: 0, status: 'COMPLETED', uploadedAt: '2025-06-12T09:15:00', uploadedBy: 'HR Manager' },
      ], 200);
    }

    if (path.includes('/template')) {
      return this.createSuccessResponse({ message: 'Template download initiated' }, 200);
    }

    if (method === 'POST') {
      return this.createSuccessResponse({
        message: 'Import completed successfully',
        totalRows: 25,
        successRows: 23,
        failedRows: 2,
      }, 200);
    }

    return this.createSuccessResponse([], 200);
  }

  /**
   * Handle /api/bgv/* requests
   */
  private handleBgv(
    method: string,
    path: string,
    body: any,
  ): Observable<HttpEvent<any>> {
    if (method === 'GET') {
      return this.createSuccessResponse([
        { id: 1, applicationId: 1, candidateName: 'Amit Sharma', email: 'amit@example.com', status: 'CLEARED', verifiedAt: '2025-06-20T10:00:00', remarks: 'All documents verified' },
        { id: 2, applicationId: 2, candidateName: 'Priya Singh', email: 'priya@example.com', status: 'PENDING', verifiedAt: null, remarks: null },
        { id: 3, applicationId: 3, candidateName: 'Ravi Kumar', email: 'ravi@example.com', status: 'CLEARED', verifiedAt: '2025-06-22T14:30:00', remarks: 'Background check passed' },
        { id: 4, applicationId: 4, candidateName: 'Sneha Patel', email: 'sneha@example.com', status: 'FLAGGED', verifiedAt: '2025-06-25T11:00:00', remarks: 'Address verification discrepancy' },
        { id: 5, applicationId: 5, candidateName: 'Vikram Reddy', email: 'vikram@example.com', status: 'PENDING', verifiedAt: null, remarks: null },
      ], 200);
    }

    if (method === 'POST' || method === 'PUT') {
      return this.createSuccessResponse({ ...body, id: body?.id || 6, status: body?.status || 'PENDING' }, 200);
    }

    return this.createSuccessResponse({}, 200);
  }

  /**
   * Handle /api/training/* requests
   */
  private handleTraining(
    method: string,
    path: string,
    body: any,
  ): Observable<HttpEvent<any>> {
    // 1. Classroom Blocks: GET /api/training/blocks
    if (path === '/api/training/blocks') {
      return this.createSuccessResponse([
        { id: 1, name: 'Block A (BTM Branch)', capacity: 20, occupiedSeats: 5 },
        { id: 2, name: 'Block B (Whitefield Branch)', capacity: 30, occupiedSeats: 12 },
        { id: 3, name: 'Block C (Andheri Branch)', capacity: 15, occupiedSeats: 3 }
      ], 200);
    }

    // 2. Training Programs Catalog: GET /api/training/programs
    if (path === '/api/training/programs') {
      return this.createSuccessResponse([
        { id: 1, name: 'Java Spring Boot Fundamentals', domain: 'JAVA' },
        { id: 2, name: 'Angular Enterprise Development', domain: 'ANGULAR' },
        { id: 3, name: 'Cloud & DevOps Essentials', domain: 'DEVOPS' }
      ], 200);
    }

    // 3. Exception Queue: GET /api/training/exceptions
    if (path === '/api/training/exceptions') {
      return this.createSuccessResponse([
        {
          traineeId: 4,
          userId: 207,
          applicationId: 8,
          employeeId: 'EMP204',
          candidateName: 'Kunal Sen',
          candidateEmail: 'kunal@example.com',
          jobTitle: 'Python Data Analyst',
          progress: 45,
          score: 35,
          attendancePercentage: 75,
          status: 'IN_PROGRESS',
          flagged: true,
          flagReason: 'Poor assessment scores',
          released: false
        }
      ], 200);
    }

    // 4. Resolve Exception: POST /api/training/exceptions/{traineeId}/resolve
    const resolveExMatch = path.match(/^\/api\/training\/exceptions\/(\d+)\/resolve$/);
    if (resolveExMatch && method === 'POST') {
      return this.createSuccessResponse({ success: true, message: 'Exception resolved' }, 200);
    }

    // 5. Complete Batch: POST /api/training/batch/{batchId}/complete
    const completeBatchMatch = path.match(/^\/api\/training\/batch\/(\d+)\/complete$/);
    if (completeBatchMatch && method === 'POST') {
      return this.createSuccessResponse({ success: true, status: 'COMPLETED_SUCCESS' }, 200);
    }

    // 6. Trainees by Batch: GET /api/training/batch/{batchId}
    const traineesBatchMatch = path.match(/^\/api\/training\/batch\/(\d+)$/);
    if (traineesBatchMatch && method === 'GET') {
      const batchId = parseInt(traineesBatchMatch[1], 10);
      if (batchId === 1) {
        return this.createSuccessResponse([
          {
            traineeId: 1,
            userId: 205,
            applicationId: 5,
            employeeId: 'EMP201',
            candidateName: 'Amit Sharma',
            candidateEmail: 'amit@example.com',
            jobTitle: 'Java Developer',
            progress: 75,
            score: 85,
            attendancePercentage: 92,
            status: 'IN_PROGRESS',
            lapEnabled: false,
            flagged: false,
            released: false
          },
          {
            traineeId: 2,
            userId: 206,
            applicationId: 6,
            employeeId: 'EMP202',
            candidateName: 'Priya Singh',
            candidateEmail: 'priya@example.com',
            jobTitle: 'Angular Developer',
            progress: 50,
            score: 45,
            attendancePercentage: 65,
            status: 'IN_PROGRESS',
            lapEnabled: true,
            flagged: false,
            released: false
          },
          {
            traineeId: 3,
            userId: 207,
            applicationId: 7,
            employeeId: 'EMP203',
            candidateName: 'Rahul Singh',
            candidateEmail: 'rahul@nexhire.com',
            jobTitle: 'Full Stack Engineer',
            progress: 100,
            score: 92,
            attendancePercentage: 98,
            status: 'COMPLETED',
            lapEnabled: false,
            flagged: false,
            released: true
          },
          {
            traineeId: 4,
            userId: 208,
            applicationId: 8,
            employeeId: 'EMP204',
            candidateName: 'Kunal Sen',
            candidateEmail: 'kunal@example.com',
            jobTitle: 'Python Data Analyst',
            progress: 45,
            score: 35,
            attendancePercentage: 75,
            status: 'IN_PROGRESS',
            lapEnabled: false,
            flagged: true,
            flagReason: 'Poor assessment scores',
            released: false
          }
        ], 200);
      }
      return this.createSuccessResponse([], 200);
    }

    // 7. Bump Progress: PUT /api/training/{traineeId}/progress
    const progressMatch = path.match(/^\/api\/training\/(\d+)\/progress$/);
    if (progressMatch && method === 'PUT') {
      return this.createSuccessResponse({ success: true }, 200);
    }

    // 8. Move to LAP: POST /api/training/{traineeId}/lap
    const lapMatch = path.match(/^\/api\/training\/(\d+)\/lap$/);
    if (lapMatch && method === 'POST') {
      return this.createSuccessResponse({ success: true, lapEnabled: true }, 200);
    }

    // 9. Remove LAP: POST /api/training/{traineeId}/remove-lap
    const removeLapMatch = path.match(/^\/api\/training\/(\d+)\/remove-lap$/);
    if (removeLapMatch && method === 'POST') {
      return this.createSuccessResponse({ success: true, lapEnabled: false }, 200);
    }

    // 10. Flag: POST /api/training/{traineeId}/flag
    const flagMatch = path.match(/^\/api\/training\/(\d+)\/flag$/);
    if (flagMatch && method === 'POST') {
      return this.createSuccessResponse({ success: true, flagged: true }, 200);
    }

    // Default active trainings catalog
    if (path.includes('/active') || (path === '/api/trainings' && method === 'GET') || path === '/api/training') {
      return this.createSuccessResponse([
        { id: 1, trainingName: 'Java Spring Boot Fundamentals', domain: 'JAVA', durationWeeks: 4, startDate: '2025-07-01', endDate: '2025-07-28', status: 'ACTIVE', traineeCount: 12 },
        { id: 2, trainingName: 'Angular Enterprise Development', domain: 'ANGULAR', durationWeeks: 3, startDate: '2025-07-15', endDate: '2025-08-04', status: 'ACTIVE', traineeCount: 8 },
        { id: 3, trainingName: 'Cloud & DevOps Essentials', domain: 'DEVOPS', durationWeeks: 2, startDate: '2025-08-01', endDate: '2025-08-14', status: 'PLANNED', traineeCount: 0 },
      ], 200);
    }

    if (method === 'POST') {
      return this.createSuccessResponse({ ...body, id: 4, status: 'PLANNED' }, 201);
    }

    if (method === 'PUT') {
      return this.createSuccessResponse({ ...body, id: body?.id || 1 }, 200);
    }

    return this.createSuccessResponse([], 200);
  }

  /**
   * Parse URL to extract entity type, ID, and query params
   */
  private parseUrl(url: string): UrlParts {
    // Remove base URL if present
    const cleanUrl = url.replace(environment.apiBaseUrl, '');

    // Split URL and query string
    const [path, queryString] = cleanUrl.split('?');

    // Parse path segments
    const segments = path.split('/').filter((s) => s.length > 0);

    // Map URL segments to entity types
    const entityTypeMap: Record<string, EntityType> = {
      jobs: EntityType.JOBS,
      applications: EntityType.APPLICATIONS,
      assessments: EntityType.ASSESSMENTS,
      offers: EntityType.OFFERS,
      employees: EntityType.EMPLOYEES,
      trainees: EntityType.TRAINEES,
      assets: EntityType.ASSETS,
      'asset-assignments': EntityType.ASSET_ASSIGNMENTS,
      projects: EntityType.PROJECTS,
      'project-allocations': EntityType.PROJECT_ALLOCATIONS,
      'released-candidates': EntityType.RELEASED_CANDIDATES,
      roles: EntityType.ROLES,
      permissions: EntityType.PERMISSIONS,
      cities: EntityType.CITIES,
      branches: EntityType.BRANCHES,
      blocks: EntityType.BLOCKS,
      budgets: EntityType.BUDGETS,
      'selected-candidates': EntityType.SELECTED_CANDIDATES,
      locations: EntityType.LOCATIONS,
    };

    let entityType: EntityType | null = null;
    let id: number | null = null;

    // Extract entity type and ID from segments
    if (segments.length >= 2 && entityTypeMap[segments[1]]) {
      entityType = entityTypeMap[segments[1]];

      // Check if next segment is a numeric ID
      if (segments.length >= 3 && !isNaN(Number(segments[2]))) {
        id = Number(segments[2]);
      }
    }

    // Parse query parameters
    const queryParams = new URLSearchParams(queryString || '');

    return { entityType, id, queryParams };
  }

  /**
   * Apply filters to data based on query parameters
   */
  private applyFilters(data: any[], queryParams: URLSearchParams): any[] {
    let filtered = [...data];

    // Iterate through all query params and apply filters
    queryParams.forEach((value, key) => {
      // Skip pagination and sorting params
      if (['page', 'pageSize', 'sortBy', 'sortOrder'].includes(key)) {
        return;
      }

      // Apply filter based on param
      filtered = filtered.filter((item) => {
        const itemValue = this.getNestedProperty(item, key);

        if (itemValue === undefined || itemValue === null) {
          return false;
        }

        // Case-insensitive string matching
        if (typeof itemValue === 'string') {
          return itemValue.toLowerCase().includes(value.toLowerCase());
        }

        // Exact match for other types
        return itemValue.toString() === value;
      });
    });

    return filtered;
  }

  /**
   * Apply sorting to data
   */
  private applySorting(data: any[], sortBy: string, sortOrder: string): any[] {
    const sorted = [...data];

    sorted.sort((a, b) => {
      const aValue = this.getNestedProperty(a, sortBy);
      const bValue = this.getNestedProperty(b, sortBy);

      // Handle null/undefined values
      if (aValue === null || aValue === undefined) return 1;
      if (bValue === null || bValue === undefined) return -1;

      // Compare values
      let comparison = 0;
      if (aValue < bValue) {
        comparison = -1;
      } else if (aValue > bValue) {
        comparison = 1;
      }

      // Apply sort order
      return sortOrder === 'desc' ? -comparison : comparison;
    });

    return sorted;
  }

  /**
   * Get nested property value from object using dot notation
   */
  private getNestedProperty(obj: any, path: string): any {
    return path.split('.').reduce((current, prop) => current?.[prop], obj);
  }

  /**
   * Generate random delay between min and max milliseconds
   */
  private randomDelay(min: number, max: number): number {
    return Math.floor(Math.random() * (max - min + 1)) + min;
  }

  /**
   * Create success response
   */
  private createSuccessResponse(
    body: any,
    status: number,
  ): Observable<HttpEvent<any>> {
    return of(
      new HttpResponse({
        status,
        body,
      }),
    );
  }

  /**
   * Create error response
   */
  private createErrorResponse(
    status: number,
    message: string,
  ): Observable<HttpEvent<any>> {
    return throwError(
      () =>
        new HttpErrorResponse({
          error: { message },
          status,
          statusText: this.getStatusText(status),
        }),
    );
  }

  /**
   * Get status text for HTTP status code
   */
  private getStatusText(status: number): string {
    const statusTexts: Record<number, string> = {
      200: 'OK',
      201: 'Created',
      204: 'No Content',
      400: 'Bad Request',
      404: 'Not Found',
      405: 'Method Not Allowed',
      500: 'Internal Server Error',
    };
    return statusTexts[status] || 'Unknown';
  }

  private mockUsers: any[] = [
    { id: 100, name: 'Admin User', email: 'admin@nexhire.com', phone: '9988776655', role: 'ADMIN', active: true },
    { id: 101, name: 'HR Manager', email: 'hr@nexhire.com', phone: '9876543210', role: 'HR', active: true },
    { id: 102, name: 'RMG Manager', email: 'rmg@nexhire.com', phone: '9765432109', role: 'RMG', active: true },
    { id: 103, name: 'Amit Sharma', email: 'amit@example.com', phone: '9654321098', role: 'EMPLOYEE', lifecycleStatus: 'CANDIDATE', active: true },
    { id: 104, name: 'Priya Singh', email: 'priya@example.com', phone: '9543210987', role: 'EMPLOYEE', lifecycleStatus: 'TRAINEE', active: true },
    { id: 105, name: 'Rahul Singh', email: 'rahul@nexhire.com', phone: '9432109876', role: 'EMPLOYEE', lifecycleStatus: 'TRAINEE', active: true },
    { id: 106, name: 'Vikram Reddy', email: 'vikram@example.com', phone: '9321098765', role: 'EMPLOYEE', lifecycleStatus: 'RELEASED', active: true },
    { id: 107, name: 'Sneha Patel', email: 'sneha@example.com', phone: '9210987654', role: 'EMPLOYEE', lifecycleStatus: 'CANDIDATE', active: true },
  ];

  private handleUsers(method: string, path: string, body: any): Observable<HttpEvent<any>> {
    // GET /api/users
    if (path === '/api/users' && method === 'GET') {
      return this.createSuccessResponse(this.mockUsers, 200);
    }

    // PUT /api/users/{id}/role
    const roleMatch = path.match(/^\/api\/users\/(\d+)\/role$/);
    if (roleMatch && method === 'PUT') {
      const id = parseInt(roleMatch[1], 10);
      const user = this.mockUsers.find(u => u.id === id);
      if (user) {
        user.role = body?.role || user.role;
        return this.createSuccessResponse(user, 200);
      }
      return this.createErrorResponse(404, 'User not found');
    }

    // PUT /api/users/{id}/deactivate
    const deactivateMatch = path.match(/^\/api\/users\/(\d+)\/deactivate$/);
    if (deactivateMatch && method === 'PUT') {
      const id = parseInt(deactivateMatch[1], 10);
      const user = this.mockUsers.find(u => u.id === id);
      if (user) {
        user.active = false;
        return this.createSuccessResponse(user, 200);
      }
      return this.createErrorResponse(404, 'User not found');
    }

    // PUT /api/users/{id}/activate
    const activateMatch = path.match(/^\/api\/users\/(\d+)\/activate$/);
    if (activateMatch && method === 'PUT') {
      const id = parseInt(activateMatch[1], 10);
      const user = this.mockUsers.find(u => u.id === id);
      if (user) {
        user.active = true;
        return this.createSuccessResponse(user, 200);
      }
      return this.createErrorResponse(404, 'User not found');
    }

    // POST /api/users
    if (path === '/api/users' && method === 'POST') {
      const newUser = {
        id: 100 + Math.floor(Math.random() * 1000),
        name: body?.name,
        email: body?.email,
        phone: body?.phone || '9999999999',
        role: body?.role || 'HR',
        active: true,
        createdAt: new Date().toISOString()
      };
      this.mockUsers.push(newUser);
      return this.createSuccessResponse(newUser, 200);
    }

    return this.createErrorResponse(404, 'User endpoint not found');
  }

  private mockAssets: any[] = [
    { id: 1, name: 'Dell Latitude 5540', type: 'LAPTOP', serialNumber: 'DL-5540-0001', assigned: true, assignedToName: 'HR Manager' },
    { id: 2, name: 'Lenovo ThinkPad T14', type: 'LAPTOP', serialNumber: 'LT-T14-0042', assigned: false },
    { id: 3, name: 'LG 27" 4K Monitor', type: 'MONITOR', serialNumber: 'LG-274K-8812', assigned: false },
    { id: 4, name: 'Jabra Evolve 65 Headset', type: 'HEADSET', serialNumber: 'JB-EV65-9981', assigned: true, assignedToName: 'RMG Manager' },
    { id: 5, name: 'Company RFID ID Card', type: 'ID_CARD', serialNumber: 'ID-RFID-10024', assigned: false }
  ];

  private handleAssets(method: string, path: string, body: any): Observable<HttpEvent<any>> {
    // 1. GET /api/assets
    if (method === 'GET' && path === '/api/assets') {
      return this.createSuccessResponse(this.mockAssets, 200);
    }

    // 2. POST /api/assets (create asset)
    if (method === 'POST' && path === '/api/assets') {
      const newAsset = {
        id: this.mockAssets.length + 1,
        name: body?.name,
        type: body?.type || 'LAPTOP',
        serialNumber: body?.serialNumber || ('SN-' + Math.floor(Math.random() * 10000)),
        assigned: false
      };
      this.mockAssets.push(newAsset);
      return this.createSuccessResponse(newAsset, 201);
    }

    // 3. POST /api/assets/{assetId}/assign/{userId}
    const assignMatch = path.match(/^\/api\/assets\/(\d+)\/assign\/(\d+)$/);
    if (method === 'POST' && assignMatch) {
      const assetId = parseInt(assignMatch[1], 10);
      const userId = parseInt(assignMatch[2], 10);
      
      const asset = this.mockAssets.find(a => a.id === assetId);
      const user = this.mockUsers.find(u => u.id === userId);
      
      if (!asset) return this.createErrorResponse(404, 'Asset not found');
      if (!user) return this.createErrorResponse(404, 'User not found');
      
      asset.assigned = true;
      asset.assignedToName = user.name;
      
      return this.createSuccessResponse({
        id: Math.floor(Math.random() * 1000) + 1,
        assetId: asset.id,
        assetName: asset.name,
        assetType: asset.type,
        serialNumber: asset.serialNumber,
        userId: user.id,
        userName: user.name,
        active: true,
        assignedAt: new Date().toISOString()
      }, 200);
    }

    // 4. PUT /api/assets/assignments/{assignmentId}/revoke
    const revokeMatch = path.match(/^\/api\/assets\/assignments\/(\d+)\/revoke$/);
    if (method === 'PUT' && revokeMatch) {
      const assignedAsset = this.mockAssets.find(a => a.assigned);
      if (assignedAsset) {
        assignedAsset.assigned = false;
        assignedAsset.assignedToName = undefined;
      }
      return this.createSuccessResponse({ success: true }, 200);
    }

    // 5. GET /api/assets/user/{userId}
    const userMatch = path.match(/^\/api\/assets\/user\/(\d+)$/);
    if (method === 'GET' && userMatch) {
      const userId = parseInt(userMatch[1], 10);
      const user = this.mockUsers.find(u => u.id === userId);
      const assigned = this.mockAssets.filter(a => a.assigned && a.assignedToName === user?.name);
      const list = assigned.map(a => ({
        id: Math.floor(Math.random() * 1000) + 1,
        assetId: a.id,
        assetName: a.name,
        assetType: a.type,
        serialNumber: a.serialNumber,
        userId: userId,
        userName: user?.name || '',
        active: true,
        assignedAt: new Date().toISOString()
      }));
      return this.createSuccessResponse(list, 200);
    }

    return this.createSuccessResponse([], 200);
  }

  private handleProjects(
    method: string,
    path: string,
    body: any,
  ): Observable<HttpEvent<any>> {
    if (path === '/api/projects/eligible-trainees') {
      return this.createSuccessResponse([
        {
          traineeId: 3,
          userId: 207,
          applicationId: 7,
          employeeId: 'EMP203',
          candidateName: 'Rahul Singh',
          candidateEmail: 'rahul@nexhire.com',
          jobTitle: 'Full Stack Engineer',
          progress: 100,
          score: 92,
          attendancePercentage: 98,
          status: 'COMPLETED',
          released: true
        },
        {
          traineeId: 5,
          userId: 209,
          applicationId: 9,
          employeeId: 'EMP205',
          candidateName: 'Vikram Reddy',
          candidateEmail: 'vikram@example.com',
          jobTitle: 'Java Developer',
          progress: 100,
          score: 88,
          attendancePercentage: 95,
          status: 'COMPLETED',
          released: true
        }
      ], 200);
    }

    const assignMatch = path.match(/^\/api\/projects\/(\d+)\/assign\/(\d+)$/);
    if (assignMatch && method === 'POST') {
      return this.createSuccessResponse({
        id: 100 + Math.floor(Math.random() * 100),
        traineeId: parseInt(assignMatch[2], 10),
        projectId: parseInt(assignMatch[1], 10),
        projectName: 'Banking Portal',
        candidateName: 'Rahul Singh',
        candidateEmail: 'rahul@nexhire.com',
        assignedByName: 'RMG Manager',
        assignedAt: new Date().toISOString()
      }, 200);
    }

    const updateMatch = path.match(/^\/api\/projects\/(\d+)$/);
    if (updateMatch && method === 'PUT') {
      return this.createSuccessResponse({
        ...body,
        id: parseInt(updateMatch[1], 10),
        teamSize: 3
      }, 200);
    }

    if (updateMatch && method === 'DELETE') {
      return this.createSuccessResponse({ success: true }, 200);
    }

    if (method === 'GET') {
      return this.createSuccessResponse([
        { id: 1, name: 'Banking Portal', description: 'HDFC Corporate Banking Redesign', active: true, teamSize: 5 },
        { id: 2, name: 'E-Commerce Platform', description: 'RetailMart Mobile Apps', active: true, teamSize: 2 },
        { id: 3, name: 'Data Analytics Dashboard', description: 'FinTech Corp Analytics Hub', active: true, teamSize: 3 },
        { id: 4, name: 'DevOps Automation Pipeline', description: 'Cloud Solutions CI/CD Pipeline', active: false, teamSize: 0 }
      ], 200);
    }

    if (method === 'POST') {
      return this.createSuccessResponse({
        ...body,
        id: Math.floor(Math.random() * 100) + 10,
        active: true,
        teamSize: 0
      }, 201);
    }

    return this.createSuccessResponse([], 200);
  }
}

/**
 * URL parsing result
 */
interface UrlParts {
  entityType: EntityType | null;
  id: number | null;
  queryParams: URLSearchParams;
}
