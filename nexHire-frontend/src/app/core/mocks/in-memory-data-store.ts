// ─── In-Memory Data Store for Mock Data Management ──────────────────────────

import { Job, JobStatus } from '../../models/job.model';
import { Application, ApplicationStatus } from '../../models/application.model';
import { Assessment, AssessmentStatus } from '../../models/assessment.model';
import { OfferLetter, OfferStatus } from '../../models/offer-letter.model';
import { Employee, EmployeeStatus } from '../../models/employee.model';
import { Trainee, TraineeStatus } from '../../models/training.model';
import { Asset, AssetStatus, AssetAssignment } from '../../models/asset.model';
import { Project, ProjectStatus, ReleasedCandidate, ProjectAllocation } from '../../models/project.model';
import { City, Branch, Block, Budget } from '../../models/location.model';
import { SelectedCandidate, SelectedStatus } from '../../models/selected.model';

export interface Role {
  roleName: string;
  permissions: string[];
}

export interface Permission {
  permissionName: string;
  module: string;
  description: string;
}

/**
 * Entity type enum for type-safe entity references
 */
export enum EntityType {
  JOBS = 'jobs',
  APPLICATIONS = 'applications',
  ASSESSMENTS = 'assessments',
  OFFERS = 'offers',
  EMPLOYEES = 'employees',
  TRAINEES = 'trainees',
  ASSETS = 'assets',
  ASSET_ASSIGNMENTS = 'assetAssignments',
  PROJECTS = 'projects',
  PROJECT_ALLOCATIONS = 'projectAllocations',
  RELEASED_CANDIDATES = 'releasedCandidates',
  ROLES = 'roles',
  PERMISSIONS = 'permissions',
  CITIES = 'cities',
  BRANCHES = 'branches',
  BLOCKS = 'blocks',
  BUDGETS = 'budgets',
  SELECTED_CANDIDATES = 'selectedCandidates',
  LOCATIONS = 'locations'
}

/**
 * Generic filter function type
 */
export type FilterFn<T> = (item: T) => boolean;

/**
 * Paginated response structure
 */
export interface PagedResponse<T> {
  data: T[];
  total: number;
  page: number;
  pageSize: number;
}

/**
 * In-Memory Data Store
 * Provides CRUD operations, pagination, and filtering for all entity types
 */
export class InMemoryDataStore {
  // Storage maps for each entity type
  private jobs: Map<number, Job> = new Map();
  private applications: Map<number, Application> = new Map();
  private assessments: Map<number, Assessment> = new Map();
  private offers: Map<number, OfferLetter> = new Map();
  private employees: Map<number, Employee> = new Map();
  private trainees: Map<number, Trainee> = new Map();
  private assets: Map<number, Asset> = new Map();
  private assetAssignments: Map<number, AssetAssignment> = new Map();
  private projects: Map<number, Project> = new Map();
  private projectAllocations: Map<number, ProjectAllocation> = new Map();
  private releasedCandidates: Map<number, ReleasedCandidate> = new Map();
  private roles: Map<number, Role> = new Map();
  private permissions: Map<number, Permission> = new Map();
  private cities: Map<number, City> = new Map();
  private branches: Map<number, Branch> = new Map();
  private blocks: Map<number, Block> = new Map();
  private budgets: Map<number, Budget> = new Map();
  private selectedCandidates: Map<number, SelectedCandidate> = new Map();

  // ID counters for each entity type
  private idCounters: Record<string, number> = {
    jobs: 1,
    applications: 1,
    assessments: 1,
    offers: 1,
    employees: 1,
    trainees: 1,
    assets: 1,
    assetAssignments: 1,
    projects: 1,
    projectAllocations: 1,
    releasedCandidates: 1,
    roles: 1,
    permissions: 1,
    cities: 1,
    branches: 1,
    blocks: 1,
    budgets: 1,
    selectedCandidates: 1
  };

  constructor() {
    this.initializeSeedData();
  }

  /**
   * Generate unique ID for entity type
   */
  private generateId(entityType: string): number {
    return this.idCounters[entityType]++;
  }

  /**
   * Get storage map for entity type
   */
  private getStore<T>(entityType: EntityType): Map<number, T> {
    switch (entityType) {
      case EntityType.JOBS: return this.jobs as Map<number, T>;
      case EntityType.APPLICATIONS: return this.applications as Map<number, T>;
      case EntityType.ASSESSMENTS: return this.assessments as Map<number, T>;
      case EntityType.OFFERS: return this.offers as Map<number, T>;
      case EntityType.EMPLOYEES: return this.employees as Map<number, T>;
      case EntityType.TRAINEES: return this.trainees as Map<number, T>;
      case EntityType.ASSETS: return this.assets as Map<number, T>;
      case EntityType.ASSET_ASSIGNMENTS: return this.assetAssignments as Map<number, T>;
      case EntityType.PROJECTS: return this.projects as Map<number, T>;
      case EntityType.PROJECT_ALLOCATIONS: return this.projectAllocations as Map<number, T>;
      case EntityType.RELEASED_CANDIDATES: return this.releasedCandidates as Map<number, T>;
      case EntityType.ROLES: return this.roles as Map<number, T>;
      case EntityType.PERMISSIONS: return this.permissions as Map<number, T>;
      case EntityType.CITIES: return this.cities as Map<number, T>;
      case EntityType.BRANCHES: return this.branches as Map<number, T>;
      case EntityType.BLOCKS: return this.blocks as Map<number, T>;
      case EntityType.BUDGETS: return this.budgets as Map<number, T>;
      case EntityType.SELECTED_CANDIDATES: return this.selectedCandidates as Map<number, T>;
      default: throw new Error(`Unknown entity type: ${entityType}`);
    }
  }

  /**
   * Get ID field name for entity type
   */
  private getIdField(entityType: EntityType): string {
    const idFieldMap: Record<EntityType, string> = {
      [EntityType.JOBS]: 'jobId',
      [EntityType.APPLICATIONS]: 'applicationId',
      [EntityType.ASSESSMENTS]: 'assessmentId',
      [EntityType.OFFERS]: 'offerId',
      [EntityType.EMPLOYEES]: 'employeeId',
      [EntityType.TRAINEES]: 'traineeId',
      [EntityType.ASSETS]: 'assetId',
      [EntityType.ASSET_ASSIGNMENTS]: 'assignmentId',
      [EntityType.PROJECTS]: 'projectId',
      [EntityType.PROJECT_ALLOCATIONS]: 'allocationId',
      [EntityType.RELEASED_CANDIDATES]: 'releasedId',
      [EntityType.ROLES]: 'roleId',
      [EntityType.PERMISSIONS]: 'permissionId',
      [EntityType.CITIES]: 'cityId',
      [EntityType.BRANCHES]: 'branchId',
      [EntityType.BLOCKS]: 'blockId',
      [EntityType.BUDGETS]: 'budgetId',
      [EntityType.SELECTED_CANDIDATES]: 'selectedId',
      [EntityType.LOCATIONS]: 'id'
    };
    return idFieldMap[entityType];
  }

  // ─── CRUD Operations ─────────────────────────────────────────────────────────

  /**
   * Get single entity by ID
   */
  get<T>(entityType: EntityType, id: number): T | undefined {
    const store = this.getStore<T>(entityType);
    return store.get(id);
  }

  /**
   * Get all entities of a type
   */
  getAll<T>(entityType: EntityType): T[] {
    const store = this.getStore<T>(entityType);
    return Array.from(store.values());
  }

  /**
   * Create new entity
   */
  create<T>(entityType: EntityType, entity: Partial<T>): T {
    const store = this.getStore<T>(entityType);
    const id = this.generateId(entityType);
    const idField = this.getIdField(entityType);
    const now = new Date().toISOString();

    const newEntity = {
      ...entity,
      [idField]: id,
      createdAt: now,
      updatedAt: now
    } as T;

    store.set(id, newEntity);
    return newEntity;
  }

  /**
   * Update existing entity
   */
  update<T>(entityType: EntityType, id: number, updates: Partial<T>): T | undefined {
    const store = this.getStore<T>(entityType);
    const existing = store.get(id);

    if (!existing) {
      return undefined;
    }

    const updated = {
      ...existing,
      ...updates,
      updatedAt: new Date().toISOString()
    } as T;

    store.set(id, updated);
    return updated;
  }

  /**
   * Delete entity by ID
   */
  delete(entityType: EntityType, id: number): boolean {
    const store = this.getStore(entityType);
    return store.delete(id);
  }

  // ─── Pagination & Filtering ──────────────────────────────────────────────────

  /**
   * Get paginated results
   */
  getPage<T>(entityType: EntityType, page: number = 1, pageSize: number = 10): PagedResponse<T> {
    const allItems = this.getAll<T>(entityType);
    const total = allItems.length;
    const startIndex = (page - 1) * pageSize;
    const endIndex = startIndex + pageSize;
    const data = allItems.slice(startIndex, endIndex);

    return {
      data,
      total,
      page,
      pageSize
    };
  }

  /**
   * Filter entities by predicate function
   */
  filter<T>(entityType: EntityType, filterFn: FilterFn<T>): T[] {
    const allItems = this.getAll<T>(entityType);
    return allItems.filter(filterFn);
  }

  /**
   * Filter and paginate
   */
  filterAndPaginate<T>(
    entityType: EntityType,
    filterFn: FilterFn<T>,
    page: number = 1,
    pageSize: number = 10
  ): PagedResponse<T> {
    const filtered = this.filter(entityType, filterFn);
    const total = filtered.length;
    const startIndex = (page - 1) * pageSize;
    const endIndex = startIndex + pageSize;
    const data = filtered.slice(startIndex, endIndex);

    return {
      data,
      total,
      page,
      pageSize
    };
  }

  /**
   * Count entities matching filter
   */
  count<T>(entityType: EntityType, filterFn?: FilterFn<T>): number {
    if (filterFn) {
      return this.filter(entityType, filterFn).length;
    }
    return this.getAll(entityType).length;
  }

  // ─── Seed Data Initialization ────────────────────────────────────────────────

  /**
   * Initialize all seed data
   */
  private initializeSeedData(): void {
    this.seedPermissions();
    this.seedRoles();
    this.seedLocations();
    this.seedBudgets();
    this.seedJobs();
    this.seedApplications();
    this.seedAssessments();
    this.seedOffers();
    this.seedEmployees();
    this.seedSelectedCandidates();
    this.seedTrainees();
    this.seedAssets();
    this.seedAssetAssignments();
    this.seedProjects();
    this.seedReleasedCandidates();
    this.seedProjectAllocations();
  }

  /**
   * Seed permissions data
   */
  private seedPermissions(): void {
    const permissionsList = [
      { permissionName: 'VIEW_APPLICATIONS', module: 'APPLICATIONS', description: 'View application list' },
      { permissionName: 'VIEW_APPLICATION_DETAILS', module: 'APPLICATIONS', description: 'View application details' },
      { permissionName: 'UPDATE_APPLICATION_STATUS', module: 'APPLICATIONS', description: 'Update application status' },
      { permissionName: 'VIEW_ASSESSMENTS', module: 'ASSESSMENTS', description: 'View assessments' },
      { permissionName: 'ASSIGN_ASSESSMENT_SELECTED', module: 'ASSESSMENTS', description: 'Assign assessment to selected' },
      { permissionName: 'ASSIGN_ASSESSMENT_ALL', module: 'ASSESSMENTS', description: 'Assign assessment to all eligible' },
      { permissionName: 'UPDATE_ASSESSMENT_STATUS', module: 'ASSESSMENTS', description: 'Update assessment status' },
      { permissionName: 'VIEW_OFFERS', module: 'OFFERS', description: 'View offer letters' },
      { permissionName: 'SEND_OFFER', module: 'OFFERS', description: 'Send offer letters' },
      { permissionName: 'UPDATE_OFFER_STATUS', module: 'OFFERS', description: 'Update offer status' },
      { permissionName: 'VIEW_BGV', module: 'BGV', description: 'View background verifications' },
      { permissionName: 'UPDATE_BGV_STATUS', module: 'BGV', description: 'Update BGV status' },
      { permissionName: 'VIEW_EMPLOYEES', module: 'EMPLOYEES', description: 'View employees' },
      { permissionName: 'UPDATE_EMPLOYEE_ROLE', module: 'EMPLOYEES', description: 'Update employee role' },
      { permissionName: 'UPDATE_EMPLOYEE_STATUS', module: 'EMPLOYEES', description: 'Update employee status' },
      { permissionName: 'VIEW_SELECTED_CANDIDATES', module: 'TRAINING', description: 'View selected candidates' },
      { permissionName: 'ASSIGN_TRAINING', module: 'TRAINING', description: 'Assign training to candidates' },
      { permissionName: 'VIEW_TRAINEES', module: 'TRAINING', description: 'View trainees' },
      { permissionName: 'UPDATE_TRAINEE_STATUS', module: 'TRAINING', description: 'Update trainee status' },
      { permissionName: 'VIEW_ASSETS', module: 'ASSETS', description: 'View assets' },
      { permissionName: 'CREATE_ASSET', module: 'ASSETS', description: 'Create new asset' },
      { permissionName: 'ASSIGN_ASSET', module: 'ASSETS', description: 'Assign asset to trainee' },
      { permissionName: 'UPDATE_ASSET_STATUS', module: 'ASSETS', description: 'Update asset status' },
      { permissionName: 'VIEW_PROJECTS', module: 'PROJECTS', description: 'View projects' },
      { permissionName: 'CREATE_PROJECT', module: 'PROJECTS', description: 'Create new project' },
      { permissionName: 'UPDATE_PROJECT', module: 'PROJECTS', description: 'Update project' },
      { permissionName: 'ALLOCATE_PROJECT', module: 'PROJECTS', description: 'Allocate candidates to project' },
      { permissionName: 'VIEW_REPORTS', module: 'REPORTS', description: 'View reports' },
      { permissionName: 'EXPORT_REPORTS', module: 'REPORTS', description: 'Export reports' },
      { permissionName: 'MANAGE_ROLES', module: 'ADMIN', description: 'Manage roles' },
      { permissionName: 'MANAGE_PERMISSIONS', module: 'ADMIN', description: 'Manage permissions' },
      { permissionName: 'VIEW_JOBS', module: 'JOBS', description: 'View job listings' },
      { permissionName: 'CREATE_JOB', module: 'JOBS', description: 'Create new job' },
      { permissionName: 'UPDATE_JOB', module: 'JOBS', description: 'Update job' }
    ];

    permissionsList.forEach(perm => {
      this.create<Permission>(EntityType.PERMISSIONS, perm);
    });
  }

  /**
   * Seed roles data
   */
  private seedRoles(): void {
    const rolesList = [
      { roleName: 'ADMIN', description: 'System administrator with full access' },
      { roleName: 'HR', description: 'HR personnel managing recruitment lifecycle' },
      { roleName: 'TRAINING_MANAGER', description: 'Manages training and trainees' },
      { roleName: 'ASSET_MANAGER', description: 'Manages company assets' },
      { roleName: 'PROJECT_MANAGER', description: 'Manages projects and allocations' },
      { roleName: 'EMPLOYEE', description: 'Regular employee' },
      { roleName: 'CANDIDATE', description: 'Job applicant' },
      { roleName: 'RECRUITER', description: 'Handles initial screening' },
      { roleName: 'INTERVIEWER', description: 'Conducts interviews' },
      { roleName: 'FINANCE', description: 'Budget and financial management' }
    ];

    rolesList.forEach(role => {
      this.create<Role>(EntityType.ROLES, role);
    });
  }

  /**
   * Seed location data (cities, branches, blocks)
   */
  private seedLocations(): void {
    // Cities
    const cities = [
      { cityName: 'Bangalore', state: 'Karnataka', country: 'India', totalBudget: 5000000, usedBudget: 2100000, availableBudget: 2900000, active: true },
      { cityName: 'Hyderabad', state: 'Telangana', country: 'India', totalBudget: 4000000, usedBudget: 1800000, availableBudget: 2200000, active: true },
      { cityName: 'Mumbai', state: 'Maharashtra', country: 'India', totalBudget: 6000000, usedBudget: 3500000, availableBudget: 2500000, active: true },
      { cityName: 'Pune', state: 'Maharashtra', country: 'India', totalBudget: 3500000, usedBudget: 1200000, availableBudget: 2300000, active: true },
      { cityName: 'Chennai', state: 'Tamil Nadu', country: 'India', totalBudget: 3000000, usedBudget: 1500000, availableBudget: 1500000, active: true }
    ];

    cities.forEach(city => {
      this.create<City>(EntityType.CITIES, city);
    });

    // Branches
    const branches = [
      { branchName: 'Whitefield', cityId: 1, address: 'ITPL Main Road, Whitefield, Bangalore', active: true },
      { branchName: 'Koramangala', cityId: 1, address: 'Koramangala 5th Block, Bangalore', active: true },
      { branchName: 'Electronic City', cityId: 1, address: 'Electronic City Phase 1, Bangalore', active: true },
      { branchName: 'Gachibowli', cityId: 2, address: 'Gachibowli, Hyderabad', active: true },
      { branchName: 'HITEC City', cityId: 2, address: 'HITEC City, Hyderabad', active: true },
      { branchName: 'Andheri', cityId: 3, address: 'Andheri East, Mumbai', active: true },
      { branchName: 'BKC', cityId: 3, address: 'Bandra Kurla Complex, Mumbai', active: true },
      { branchName: 'Hinjewadi', cityId: 4, address: 'Rajiv Gandhi Infotech Park, Hinjewadi, Pune', active: true },
      { branchName: 'OMR', cityId: 5, address: 'Old Mahabalipuram Road, Chennai', active: true }
    ];

    branches.forEach(branch => {
      this.create<Branch>(EntityType.BRANCHES, branch);
    });

    // Blocks
    const blocks = [
      { blockName: 'Block A', branchId: 1, totalCapacity: 100, usedCapacity: 45, availableVacancy: 55, active: true },
      { blockName: 'Block B', branchId: 1, totalCapacity: 80, usedCapacity: 60, availableVacancy: 20, active: true },
      { blockName: 'Block C', branchId: 2, totalCapacity: 60, usedCapacity: 40, availableVacancy: 20, active: true },
      { blockName: 'Block A', branchId: 3, totalCapacity: 120, usedCapacity: 80, availableVacancy: 40, active: true },
      { blockName: 'Block D', branchId: 4, totalCapacity: 90, usedCapacity: 55, availableVacancy: 35, active: true },
      { blockName: 'Block E', branchId: 4, totalCapacity: 70, usedCapacity: 45, availableVacancy: 25, active: true },
      { blockName: 'Block F', branchId: 5, totalCapacity: 100, usedCapacity: 70, availableVacancy: 30, active: true },
      { blockName: 'Block A', branchId: 6, totalCapacity: 110, usedCapacity: 85, availableVacancy: 25, active: true },
      { blockName: 'Block B', branchId: 7, totalCapacity: 90, usedCapacity: 60, availableVacancy: 30, active: true },
      { blockName: 'Block C', branchId: 8, totalCapacity: 75, usedCapacity: 50, availableVacancy: 25, active: true },
      { blockName: 'Block A', branchId: 9, totalCapacity: 85, usedCapacity: 55, availableVacancy: 30, active: true }
    ];

    blocks.forEach(block => {
      this.create<Block>(EntityType.BLOCKS, block);
    });
  }

  /**
   * Seed budget data
   */
  private seedBudgets(): void {
    const budgets = [
      { cityId: 1, cityName: 'Bangalore', totalBudget: 5000000, usedBudget: 2100000, availableBudget: 2900000, fiscalYear: '2024' },
      { cityId: 2, cityName: 'Hyderabad', totalBudget: 4000000, usedBudget: 1800000, availableBudget: 2200000, fiscalYear: '2024' },
      { cityId: 3, cityName: 'Mumbai', totalBudget: 6000000, usedBudget: 3500000, availableBudget: 2500000, fiscalYear: '2024' },
      { cityId: 4, cityName: 'Pune', totalBudget: 3500000, usedBudget: 1200000, availableBudget: 2300000, fiscalYear: '2024' },
      { cityId: 5, cityName: 'Chennai', totalBudget: 3000000, usedBudget: 1500000, availableBudget: 1500000, fiscalYear: '2024' }
    ];

    budgets.forEach(budget => {
      this.create<Budget>(EntityType.BUDGETS, budget);
    });
  }

  /**
   * Seed jobs data (50+ entries)
   */
  private seedJobs(): void {
    const departments = ['Engineering', 'QA', 'DevOps', 'Data Science', 'Product', 'Design'];
    const domains = ['Java', 'Python', 'React', 'Angular', 'Node.js', '.NET', 'Testing', 'AWS', 'Data Analytics'];
    const locations = ['Bangalore', 'Hyderabad', 'Mumbai', 'Pune', 'Chennai'];
    const jobTypes: ('FULL_TIME' | 'CONTRACT' | 'INTERNSHIP')[] = ['FULL_TIME', 'CONTRACT', 'INTERNSHIP'];
    const experienceLevels: ('FRESHER' | 'JUNIOR' | 'MID' | 'SENIOR')[] = ['FRESHER', 'JUNIOR', 'MID', 'SENIOR'];
    const statuses: JobStatus[] = ['ACTIVE', 'ACTIVE', 'ACTIVE', 'CLOSED'];

    const jobTitles = [
      'Software Engineer', 'Senior Software Engineer', 'Full Stack Developer', 'Backend Developer',
      'Frontend Developer', 'QA Engineer', 'DevOps Engineer', 'Data Scientist', 'UI/UX Designer',
      'Product Manager', 'Technical Lead', 'System Administrator', 'Database Administrator',
      'Mobile Developer', 'Cloud Architect', 'Security Engineer', 'Business Analyst',
      'Scrum Master', 'Project Manager', 'Test Automation Engineer'
    ];

    for (let i = 0; i < 55; i++) {
      const title = jobTitles[i % jobTitles.length];
      const domain = domains[i % domains.length];
      const location = locations[i % locations.length];
      const expLevel = experienceLevels[i % experienceLevels.length];
      const jobType = jobTypes[i % jobTypes.length];
      const status = statuses[i % statuses.length];

      const postedDate = new Date();
      postedDate.setDate(postedDate.getDate() - Math.floor(Math.random() * 60));

      const deadline = new Date();
      deadline.setDate(deadline.getDate() + Math.floor(Math.random() * 30) + 10);

      this.create<Job>(EntityType.JOBS, {
        jobTitle: `${title} - ${domain} (${i + 1})`,
        jobDescription: `We are looking for a talented ${title} with expertise in ${domain}. The ideal candidate will have strong problem-solving skills and experience with modern development practices.`,
        companyName: 'NexHire Tech Solutions',
        clientName: `Client ${((i % 10) + 1)}`,
        location: location,
        requiredSkills: `${domain}, ${i % 2 === 0 ? 'Git, Agile' : 'Docker, CI/CD'}`,
        experienceLevel: expLevel,
        minExperience: expLevel === 'FRESHER' ? 0 : (expLevel === 'JUNIOR' ? 1 : (expLevel === 'MID' ? 3 : 5)),
        maxExperience: expLevel === 'FRESHER' ? 0 : (expLevel === 'JUNIOR' ? 2 : (expLevel === 'MID' ? 5 : 10)),
        jobType: jobType,
        salaryMin: 300000 + (i * 50000),
        salaryMax: 500000 + (i * 80000),
        currency: 'INR',
        postedDate: postedDate.toISOString().split('T')[0],
        deadline: deadline.toISOString().split('T')[0],
        status: status,
        domain: domain,
        openings: Math.floor(Math.random() * 5) + 1
      });
    }
  }

  private seedApplications(): void {
    const candidates = [
      { name: 'Rohan Sharma', email: 'rohan@example.com', phone: '9876540001', status: 'APPLIED' as ApplicationStatus },
      { name: 'Sneha Patel', email: 'sneha@example.com', phone: '9876540002', status: 'SHORTLISTED' as ApplicationStatus },
      { name: 'Aarav Mehta', email: 'aarav@example.com', phone: '9876540003', status: 'SHORTLISTED' as ApplicationStatus },
      { name: 'Aditi Rao', email: 'aditi@example.com', phone: '9876540004', status: 'SHORTLISTED' as ApplicationStatus },
      { name: 'Priya Singh', email: 'priya@example.com', phone: '9876540005', status: 'ASSESSMENT_PENDING' as ApplicationStatus },
      { name: 'Amit Sharma', email: 'amit@example.com', phone: '9876540006', status: 'ASSESSMENT_COMPLETED' as ApplicationStatus },
      { name: 'Rahul Singh', email: 'rahul@example.com', phone: '9876540007', status: 'QUALIFIED' as ApplicationStatus },
      { name: 'Kunal Sen', email: 'kunal@example.com', phone: '9876540008', status: 'QUALIFIED' as ApplicationStatus },
      { name: 'Pooja Hegde', email: 'pooja@example.com', phone: '9876540009', status: 'OFFER_SENT' as ApplicationStatus },
      { name: 'Vikram Reddy', email: 'vikram@example.com', phone: '9876540010', status: 'OFFER_ACCEPTED' as ApplicationStatus },
      { name: 'Neha Kakkar', email: 'neha@example.com', phone: '9876540011', status: 'JOINING_ON_HOLD' as ApplicationStatus },
      { name: 'Ravi Teja', email: 'ravi.teja@example.com', phone: '9876540012', status: 'REJECTED' as ApplicationStatus },
      { name: 'Siddharth Roy', email: 'sid@example.com', phone: '9876540013', status: 'TRAINING_IN_PROGRESS' as ApplicationStatus }
    ];

    candidates.forEach((c, index) => {
      const jobId = (index % 5) + 1;
      const job = this.jobs.get(jobId);
      this.create<Application>(EntityType.APPLICATIONS, {
        userId: 200 + index,
        jobId: jobId,
        userFullName: c.name,
        userEmail: c.email,
        userPhone: c.phone,
        jobTitle: job?.jobTitle || `Software Engineer - Java (${jobId})`,
        jobLocation: job?.location || 'Bangalore',
        status: c.status,
        appliedDate: new Date(Date.now() - (index + 2) * 24 * 3600 * 1000).toISOString().split('T')[0],
        remarks: 'Resume screened. Good background.'
      });
    });
  }

  private seedAssessments(): void {
    const apps = this.getAll<Application>(EntityType.APPLICATIONS);
    apps.forEach((app) => {
      if (['ASSESSMENT_PENDING', 'ASSESSMENT_COMPLETED', 'QUALIFIED', 'OFFER_SENT', 'OFFER_ACCEPTED'].includes(app.status)) {
        let testStatus: AssessmentStatus = 'PASSED';
        let score = 85;
        if (app.status === 'ASSESSMENT_PENDING') {
          testStatus = 'ASSIGNED';
          score = 0;
        } else if (app.status === 'ASSESSMENT_COMPLETED') {
          testStatus = 'SUBMITTED';
          score = 75;
        }
        
        const test = this.create<Assessment>(EntityType.ASSESSMENTS, {
          applicationId: app.applicationId,
          userId: app.userId,
          jobId: app.jobId,
          candidateName: app.userFullName,
          candidateEmail: app.userEmail,
          jobTitle: app.jobTitle,
          assessmentType: 'JAVA',
          assessmentDate: new Date(Date.now() - 3 * 24 * 3600 * 1000).toISOString().split('T')[0],
          status: testStatus,
          score: score,
          maxScore: 100,
          remarks: score >= 70 ? 'Excellent performance.' : 'Average performance.'
        });

        this.update<Application>(EntityType.APPLICATIONS, app.applicationId, {
          assessmentId: test.assessmentId,
          assessmentStatus: test.status
        });
      }
    });
  }

  private seedOffers(): void {
    const apps = this.getAll<Application>(EntityType.APPLICATIONS);
    apps.forEach((app) => {
      if (['OFFER_SENT', 'OFFER_ACCEPTED', 'JOINING_ON_HOLD', 'TRAINING_IN_PROGRESS'].includes(app.status)) {
        let offerStatus: OfferStatus = 'SENT';
        if (app.status === 'OFFER_ACCEPTED' || app.status === 'TRAINING_IN_PROGRESS') {
          offerStatus = 'ACCEPTED';
        } else if (app.status === 'JOINING_ON_HOLD') {
          offerStatus = 'SENT';
        }
        
        const offer = this.create<OfferLetter>(EntityType.OFFERS, {
          assessmentId: app.assessmentId || 1,
          applicationId: app.applicationId,
          userId: app.userId,
          candidateName: app.userFullName,
          candidateEmail: app.userEmail,
          jobTitle: app.jobTitle,
          designation: 'Software Associate',
          ctc: 850000,
          joiningDate: new Date(Date.now() + 20 * 24 * 3600 * 1000).toISOString().split('T')[0],
          status: offerStatus,
          issuedDate: new Date(Date.now() - 5 * 24 * 3600 * 1000).toISOString().split('T')[0],
          expiryDate: new Date(Date.now() + 10 * 24 * 3600 * 1000).toISOString().split('T')[0],
          remarks: 'Standard corporate offer letter issued.'
        });

        this.update<Application>(EntityType.APPLICATIONS, app.applicationId, {
          offerId: offer.offerId,
          offerStatus: offer.status
        });
      }
    });
  }
  private seedEmployees(): void { }
  private seedSelectedCandidates(): void { }
  private seedTrainees(): void { }
  private seedAssets(): void { }
  private seedAssetAssignments(): void { }
  private seedProjects(): void { }
  private seedReleasedCandidates(): void { }
  private seedProjectAllocations(): void { }
}
