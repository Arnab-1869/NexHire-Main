# Implementation Plan

## Phase 1: Project Foundation

- [x] 1. Set up Spring Boot backend project
  - [x] 1.1 Create Maven project with pom.xml
    - Spring Boot 3.x parent with Java 17
    - Dependencies: spring-boot-starter-web, spring-boot-starter-security, spring-boot-starter-data-jpa, spring-boot-starter-validation, postgresql driver, jjwt-api/jjwt-impl/jjwt-jackson, lombok, spring-boot-starter-test, mockito
    - _Requirements: 1.1, 1.2, 12.1_

  - [x] 1.2 Create backend package structure and configuration
    - Create base packages: config, security, controller, service, repository, entity, dto, enums, exception, seed
    - Create `application.yml` with PostgreSQL connection, JPA ddl-auto=update, server port 8080
    - Create main application class `NexhireApplication.java`
    - _Requirements: 14.1, 14.2_

  - [x] 1.3 Implement enums
    - Create `UserRole` enum: ADMIN, HR, RMG, EMPLOYEE
    - Create `LifecycleStatus` enum: CANDIDATE, TRAINEE, PROJECT_ASSIGNED
    - Create `ApplicationStatus` enum: APPLIED, ASSESSMENT_PENDING, ASSESSMENT_COMPLETED, QUALIFIED, REJECTED, OFFER_SENT, OFFER_ACCEPTED, OFFER_REJECTED, JOINING_LETTER_SENT, TRAINING_IN_PROGRESS, TRAINING_COMPLETED, PROJECT_ASSIGNED
    - _Requirements: 1.1, 2.2, 3.1_

  - [x] 1.4 Implement entity classes
    - Create all JPA entities: User, Job, JobApplication, AssessmentResult, OfferLetter, JoiningLetter, Location, HiringBudget, TrainingSeat, Trainee, TrainingRecord, Project, ProjectAssignment, Asset, AssetAssignment, ActivityLog
    - Define relationships (@ManyToOne, @OneToOne, @OneToMany) as per ER diagram
    - Add constraints (unique, not null) and timestamps
    - User entity uses UserRole enum (not a separate Role table for MVP simplicity)
    - _Requirements: 2.2, 3.2, 4.1, 5.1, 8.2, 10.1, 11.2_

  - [x] 1.5 Create repository interfaces
    - Create JpaRepository interfaces for all entities
    - Add custom query methods: findByEmail, findByUserAndJob, findByStatus, findByActive, findByUserIdAndActive, findByLocationId
    - _Requirements: 2.1, 2.4, 8.1, 9.1_

  - [x] 1.6 Create exception classes and global handler skeleton
    - Create: ResourceNotFoundException, DuplicateResourceException, InvalidStateTransitionException, InsufficientResourceException
    - Create GlobalExceptionHandler with @ControllerAdvice (basic structure, detailed handlers later)
    - Create ErrorResponse DTO
    - _Requirements: 3.6, 4.2, 5.3, 14.3_

  - [x] 1.7 Set up security skeleton
    - Add JWT dependency configuration
    - Create SecurityConfig with basic permit-all for now (will restrict in Phase 2)
    - Create CorsConfig allowing Angular origin (http://localhost:4200)
    - Create placeholder JwtTokenProvider class
    - Create placeholder JwtAuthenticationFilter class
    - _Requirements: 12.1, 12.2_

  - [x] 1.8 Create data seeder skeleton
    - Create DataSeeder implementing CommandLineRunner
    - Seed 4 roles worth of users: admin@nexhire.com, hr@nexhire.com, rmg@nexhire.com, candidate1@nexhire.com
    - Seed sample locations (e.g., Bangalore, Hyderabad)
    - Seed sample jobs
    - Use BCrypt for passwords
    - _Requirements: 1.1, 1.5_

  - [x] 1.9 Create backend .gitignore
    - Ignore target/, .idea/, \*.iml, .mvn wrapper jars, application-local.yml
    - _Requirements: N/A_

- [x] 2. Set up Angular 19 frontend project
  - [x] 2.1 Initialize Angular project
    - Create Angular 19 project in /frontend with routing, SCSS styles
    - _Requirements: 13.1_

  - [x] 2.2 Create frontend folder structure
    - Create: core/guards/, core/interceptors/, core/services/, core/models/
    - Create: shared/components/, shared/layouts/
    - Create: features/auth/login/, features/auth/register/
    - Create: features/employee/, features/hr/, features/rmg/, features/admin/
    - _Requirements: 13.1, 13.2_

  - [x] 2.3 Set up environment and routing skeleton
    - Create environment.ts with apiBaseUrl: 'http://localhost:8080/api'
    - Create app.routes.ts with placeholder routes for /login, /register, /employee, /hr, /rmg, /admin
    - _Requirements: 13.1, 13.2_

  - [x] 2.4 Create frontend .gitignore
    - Ignore node_modules/, dist/, .angular/, .env
    - _Requirements: N/A_

- [x] 3. Create project README
  - [x] 3.1 Write README.md at project root
    - Tech stack summary
    - Project structure (/backend, /frontend)
    - How to set up PostgreSQL (create database nexhire)
    - How to run backend (mvn spring-boot:run)
    - How to run frontend (ng serve)
    - Planned sample users with credentials
    - Planned demo flow summary
    - _Requirements: N/A_

## Phase 2: Authentication & Security

- [x] 4. Implement JWT authentication
  - [x] 4.1 Implement JwtTokenProvider
    - Token generation with userId, email, role claims
    - Token validation and parsing
    - Configurable secret and expiration in application.yml
    - _Requirements: 1.2, 12.1_

  - [x] 4.2 Implement JwtAuthenticationFilter
    - Extract token from Authorization header
    - Validate and set SecurityContext
    - _Requirements: 12.1, 12.2_

  - [x] 4.3 Implement CustomUserDetailsService
    - Load user by email from repository
    - Check active status
    - _Requirements: 1.2, 9.3_

  - [x] 4.4 Configure SecurityConfig with endpoint authorization
    - Permit /api/auth/\*\* publicly
    - Restrict endpoints by role as per permissions matrix
    - Configure stateless session, BCrypt encoder, CORS
    - _Requirements: 12.1, 12.2_

  - [x] 4.5 Implement AuthController and AuthService
    - POST /api/auth/register: create user with role=EMPLOYEE, lifecycleStatus=CANDIDATE
    - POST /api/auth/login: validate credentials, return JWT + role + lifecycleStatus
    - Create RegisterRequest, LoginRequest, LoginResponse DTOs
    - _Requirements: 1.1, 1.2, 1.3, 1.4, 1.5_

  - [x]\* 4.6 Write AuthServiceTest with Mockito
    - Test registration creates correct defaults
    - Test duplicate email rejection
    - Test login with valid credentials returns token
    - Test login with invalid credentials throws exception
    - Test BCrypt password hashing
    - _Requirements: 1.1, 1.3, 1.4, 1.5_

- [ ] 5. Checkpoint
  - Ensure all tests pass, ask the user if questions arise.

## Phase 3: Core Onboarding Workflow

- [x] 6. Implement job listing and applications
  - [x] 6.1 Implement JobService and JobController
    - GET /api/jobs: list active jobs
    - POST /api/jobs (HR): create job
    - _Requirements: 2.1_

  - [x] 6.2 Implement ApplicationService and ApplicationController
    - POST /api/applications: apply (derive userId from JWT, check duplicate, set APPLIED)
    - GET /api/applications/my: own applications (from JWT)
    - GET /api/applications (HR): all applications
    - PUT /api/applications/{id}/start-assessment (HR): APPLIED → ASSESSMENT_PENDING
    - _Requirements: 2.2, 2.3, 2.4, 3.1, 12.3_

  - [x]\* 6.3 Write ApplicationServiceTest with Mockito
    - Test apply creates application with APPLIED status
    - Test duplicate application returns 409
    - Test start-assessment valid transition
    - Test start-assessment invalid transition returns 400
    - _Requirements: 2.2, 2.3, 3.1_

- [x] 7. Implement assessment management
  - [x] 7.1 Implement AssessmentService and AssessmentController
    - POST /api/assessments/{applicationId}: enter score (validate ASSESSMENT_PENDING, derive evaluatedBy from JWT)
    - POST /api/assessments/upload-csv: parse CSV, validate, return summary
    - PUT /api/assessments/{applicationId}/qualify: ASSESSMENT_COMPLETED → QUALIFIED
    - PUT /api/assessments/{applicationId}/reject: ASSESSMENT_COMPLETED → REJECTED
    - _Requirements: 3.2, 3.3, 3.4, 3.5, 3.6, 12.3_

  - [x]\* 7.2 Write AssessmentServiceTest with Mockito
    - Test score entry from ASSESSMENT_PENDING succeeds
    - Test score entry from wrong status returns 400
    - Test qualify from ASSESSMENT_COMPLETED succeeds
    - Test reject from ASSESSMENT_COMPLETED succeeds
    - Test CSV parsing with mixed valid/invalid rows
    - _Requirements: 3.2, 3.3, 3.4, 3.5, 3.6_

- [x] 8. Implement offer letter management
  - [x] 8.1 Implement OfferService and OfferController
    - POST /api/offers/{applicationId} (HR): send offer (validate QUALIFIED, no budget check, derive sentBy from JWT)
    - GET /api/offers/my (EMPLOYEE): own offers
    - PUT /api/offers/{id}/accept (EMPLOYEE): OFFER_SENT → OFFER_ACCEPTED
    - PUT /api/offers/{id}/reject (EMPLOYEE): OFFER_SENT → OFFER_REJECTED
    - _Requirements: 4.1, 4.2, 4.3, 4.4, 12.3_

  - [x]\* 8.2 Write OfferServiceTest with Mockito
    - Test send offer from QUALIFIED succeeds
    - Test send offer from wrong status returns 400
    - Test accept offer transitions correctly
    - Test reject offer transitions correctly
    - _Requirements: 4.1, 4.2, 4.3, 4.4_

- [x] 9. Implement joining letter management with resource checks
  - [x] 9.1 Implement JoiningLetterService and JoiningLetterController
    - POST /api/joining-letters/{applicationId} (HR): validate OFFER_ACCEPTED, check budget + seats, decrement both, create letter, set JOINING_LETTER_SENT
    - GET /api/joining-letters/my (EMPLOYEE): own joining letters
    - PUT /api/joining-letters/{id}/accept (EMPLOYEE): JOINING_LETTER_SENT → TRAINING_IN_PROGRESS, create Trainee record, create TrainingRecord (progress=0, completed=false), set lifecycleStatus=TRAINEE, log action
    - _Requirements: 5.1, 5.2, 5.3, 5.4, 5.5, 6.2_

  - [x]\* 9.2 Write JoiningLetterServiceTest with Mockito
    - Test joining letter with available budget+seats succeeds and decrements
    - Test joining letter with no budget returns 400
    - Test joining letter with no seats returns 400
    - Test accept joining creates trainee, training record (progress=0), and updates lifecycle to TRAINEE
    - _Requirements: 5.1, 5.2, 5.3, 5.4_

- [x] 10. Implement location budget and training seats
  - [x] 10.1 Implement LocationService and LocationController
    - GET /api/locations (HR): list locations with budget/seat data
    - PUT /api/locations/{id} (HR): update configuration
    - _Requirements: 6.1_

- [ ] 11. Checkpoint
  - Ensure all tests pass, ask the user if questions arise.

## Phase 4: Training & Project Assignment

- [x] 12. Implement training progress tracking
  - [x] 12.1 Implement TrainingService and TrainingController
    - GET /api/training/trainees (HR): list all trainees
    - GET /api/training/my (EMPLOYEE): own training record
    - PUT /api/training/{traineeId}/progress (HR): update progress (0-100)
    - PUT /api/training/{traineeId}/complete (HR): set TRAINING_COMPLETED
    - Validate user lifecycleStatus=TRAINEE before updates
    - _Requirements: 7.1, 7.2, 7.3_

  - [ ]\* 12.2 Write TrainingServiceTest with Mockito
    - Test progress update persists correctly
    - Test completion updates applicationStatus
    - Test non-trainee update returns 400
    - _Requirements: 7.1, 7.2, 7.3_

- [x] 13. Implement RMG project assignment
  - [x] 13.1 Implement ProjectService and ProjectController
    - GET /api/projects (RMG): list active projects
    - POST /api/projects (RMG): create project
    - GET /api/projects/eligible-trainees (RMG): trainees with TRAINING_COMPLETED
    - POST /api/projects/{projectId}/assign/{traineeId} (RMG): assign, set PROJECT_ASSIGNED on both applicationStatus and lifecycleStatus, derive assignedBy from JWT
    - _Requirements: 8.1, 8.2, 8.3, 8.4, 12.3_

  - [ ]\* 13.2 Write ProjectAssignmentServiceTest with Mockito
    - Test assignment of eligible trainee succeeds
    - Test assignment of ineligible trainee returns 400
    - Test eligible trainee list returns only TRAINING_COMPLETED
    - _Requirements: 8.1, 8.2, 8.3_

- [ ] 14. Checkpoint
  - Ensure all tests pass, ask the user if questions arise.

## Phase 5: Admin Features

- [x] 15. Implement admin user and role management
  - [x] 15.1 Implement UserManagementService and Controller
    - GET /api/users (ADMIN): list all users with role, lifecycleStatus, createdAt
    - PUT /api/users/{id}/role (ADMIN): update role, log activity
    - PUT /api/users/{id}/deactivate (ADMIN): set active=false
    - _Requirements: 9.1, 9.2, 9.3_

  - [x] 15.2 Implement RoleController
    - GET /api/roles (ADMIN): return available roles
    - _Requirements: 9.4_

- [x] 16. Implement asset management
  - [x] 16.1 Implement AssetService and AssetController
    - GET /api/assets (ADMIN): list all assets
    - POST /api/assets (ADMIN): create asset
    - POST /api/assets/{assetId}/assign/{userId} (ADMIN): assign
    - PUT /api/assets/assignments/{id}/revoke (ADMIN): revoke
    - GET /api/assets/user/{userId} (ADMIN): active + historical
    - _Requirements: 10.1, 10.2, 10.3_

- [x] 17. Implement activity logs
  - [x] 17.1 Implement ActivityLogService and Controller
    - GET /api/activity-logs (ADMIN): return logs in reverse chronological order
    - Logging method called from other services on significant actions
    - _Requirements: 11.1, 11.2_

- [ ] 18. Implement data seeder with full sample data
  - [ ] 18.1 Complete DataSeeder
    - Seed users in various lifecycle stages for demo
    - Seed locations with budget/seats
    - Seed jobs, sample applications in various statuses
    - Seed projects
    - Seed assets
    - _Requirements: 1.1_

- [ ] 19. Checkpoint
  - Ensure all tests pass, ask the user if questions arise.

## Phase 6: Frontend Implementation

- [ ] 20. Implement Angular auth module
  - [ ] 20.1 Implement AuthService and auth pages
    - AuthService: login, register, token storage, role/lifecycle extraction from JWT
    - Login component with form validation, role-based redirect post-login
    - Register component with form validation
    - _Requirements: 1.1, 1.2, 13.1_

  - [ ] 20.2 Implement guards and interceptor
    - AuthGuard: redirect to /login if no token
    - RoleGuard: redirect to own dashboard if unauthorized route
    - JwtInterceptor: attach Authorization header
    - _Requirements: 12.1, 13.2_

  - [ ] 20.3 Wire up routing with guards
    - Configure lazy-loaded routes: /login, /register, /employee/**, /hr/**, /rmg/**, /admin/**
    - Apply guards
    - _Requirements: 13.1, 13.2_

- [ ] 21. Implement shared layout and components
  - [ ] 21.1 Create dashboard layout with sidebar
    - DashboardLayoutComponent with sidebar, header, content area
    - SidebarComponent rendering menu based on role
    - Role-based menu configuration
    - _Requirements: 13.1_

  - [ ] 21.2 Create shared UI components
    - StatusBadgeComponent with distinct styling per ApplicationStatus
    - Responsive CSS
    - _Requirements: 13.3, 13.4_

- [ ] 22. Implement employee/candidate feature pages
  - [ ] 22.1 Employee dashboard, job list, applications
    - Dashboard with summary cards
    - Job listing with Apply button
    - Application list with status badges
    - _Requirements: 2.1, 2.2, 2.4_

  - [ ] 22.2 Offer and joining views, training progress
    - Offer view with Accept/Reject
    - Joining letter view with Accept
    - Training progress display
    - _Requirements: 4.3, 4.4, 5.4, 7.1_

- [ ] 23. Implement HR feature pages
  - [ ] 23.1 Application management and assessments
    - HR dashboard with summary cards
    - Application table with status filters and actions
    - Assessment score form and CSV upload
    - _Requirements: 3.1, 3.2, 3.3, 3.4, 3.5_

  - [ ] 23.2 Offer, joining, training management
    - Send offer UI
    - Send joining letter UI (showing budget/seat availability)
    - Training progress update UI
    - Budget/seat overview
    - _Requirements: 4.1, 5.1, 6.1, 7.1, 7.2_

- [ ] 24. Implement RMG feature pages
  - [ ] 24.1 RMG dashboard and project assignment
    - Dashboard with eligible trainee count, active projects
    - Project list
    - Eligible trainee list
    - Assign trainee to project UI
    - _Requirements: 8.1, 8.2, 8.4_

- [ ] 25. Implement admin feature pages
  - [ ] 25.1 User/role management, assets, logs
    - Admin dashboard with summary cards
    - User management table with role update and deactivate
    - Asset management with assign/revoke
    - Activity log table
    - _Requirements: 9.1, 9.2, 9.3, 10.1, 10.2, 11.1_

- [ ] 26. Final Checkpoint
  - Ensure all tests pass, ask the user if questions arise.
