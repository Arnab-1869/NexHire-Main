# nexHire — Git Commit Plan

A logical, incremental commit history representing how this project would have been built step by step.

---

## Phase 1: Project Setup

### Commit 1

- **Message:** `chore: initialize monorepo with README`
- **Files:** `README.md`, `.gitignore`, `.vscode/settings.json`
- **Why:** Every project starts with a root README and editor config.
- **Depends on:** None

### Commit 2

- **Message:** `chore(backend): scaffold Spring Boot project with Maven`
- **Files:** `backend/pom.xml`, `backend/.gitignore`, `backend/src/main/java/com/nexhire/NexhireApplication.java`, `backend/src/main/resources/application.yml`, `backend/src/test/java/com/nexhire/NexhireApplicationTests.java`
- **Why:** Initialize the backend with Spring Boot starter, PostgreSQL driver, and core dependencies before writing any feature code.
- **Depends on:** Commit 1

### Commit 3

- **Message:** `chore(frontend): scaffold Angular 19 project with Material`
- **Files:** `nexHire-frontend/` (package.json, angular.json, tsconfig.json, tsconfig.app.json, tsconfig.spec.json, src/main.ts, src/index.html, src/styles.scss, src/environments/_, .gitignore, .vscode/_, README.md)
- **Why:** Bootstrap the Angular workspace with Angular Material installed before building any components.
- **Depends on:** Commit 1

---

## Phase 2: Backend Foundation

### Commit 4

- **Message:** `feat(backend): add domain entities, enums, and JPA repositories`
- **Files:** `backend/src/main/java/com/nexhire/entity/` (User, Job, Location, JobApplication, HiringBudget, TrainingSeat), `backend/src/main/java/com/nexhire/enums/` (UserRole, LifecycleStatus, ApplicationStatus), `backend/src/main/java/com/nexhire/repository/` (UserRepository, JobRepository, LocationRepository, JobApplicationRepository, HiringBudgetRepository, TrainingSeatRepository)
- **Why:** Core domain model must exist before any service or controller logic. These are the foundational tables.
- **Depends on:** Commit 2

### Commit 5

- **Message:** `feat(backend): add exception handling framework`
- **Files:** `backend/src/main/java/com/nexhire/exception/` (GlobalExceptionHandler, ResourceNotFoundException, DuplicateResourceException, InvalidStateTransitionException, InsufficientResourceException), `backend/src/main/java/com/nexhire/dto/ErrorResponse.java`
- **Why:** Centralized error handling must be established before building service layer.
- **Depends on:** Commit 4

### Commit 6

- **Message:** `feat(backend): add JWT security infrastructure`
- **Files:** `backend/src/main/java/com/nexhire/security/` (JwtTokenProvider, JwtAuthenticationFilter, CustomUserDetailsService, JwtAuthenticationEntryPoint, CustomAccessDeniedHandler), `backend/src/main/java/com/nexhire/config/SecurityConfig.java`, `backend/src/main/java/com/nexhire/config/CorsConfig.java`
- **Why:** Security must be in place before any authenticated endpoint is created. Sets up JWT, CORS, and role-based path rules.
- **Depends on:** Commit 4

### Commit 7

- **Message:** `feat(backend): implement auth module (register + login)`
- **Files:** `backend/src/main/java/com/nexhire/service/AuthService.java`, `backend/src/main/java/com/nexhire/controller/AuthController.java`, `backend/src/main/java/com/nexhire/dto/` (RegisterRequest, LoginRequest, LoginResponse, ProfileUpdateRequest)
- **Why:** Registration and login are prerequisites for every other feature. Returns JWT on success.
- **Depends on:** Commit 6

---

## Phase 3: Backend Features (Hiring Pipeline)

### Commit 8

- **Message:** `feat(backend): implement jobs module (CRUD + listing)`
- **Files:** `backend/src/main/java/com/nexhire/service/JobService.java`, `backend/src/main/java/com/nexhire/controller/JobController.java`, `backend/src/main/java/com/nexhire/dto/` (JobRequest, JobResponse)
- **Why:** Job postings are the entry point of the hiring workflow. Candidates browse and apply to jobs.
- **Depends on:** Commit 7

### Commit 9

- **Message:** `feat(backend): implement applications module (apply + list + start assessment)`
- **Files:** `backend/src/main/java/com/nexhire/service/ApplicationService.java`, `backend/src/main/java/com/nexhire/controller/ApplicationController.java`, `backend/src/main/java/com/nexhire/dto/ApplicationResponse.java`
- **Why:** Application management is the next step after job creation. Handles apply, list own, list all (HR), and status transition to ASSESSMENT_PENDING.
- **Depends on:** Commit 8

### Commit 10

- **Message:** `feat(backend): implement assessments module (score + qualify/reject)`
- **Files:** `backend/src/main/java/com/nexhire/entity/AssessmentResult.java`, `backend/src/main/java/com/nexhire/repository/AssessmentResultRepository.java`, `backend/src/main/java/com/nexhire/service/AssessmentService.java`, `backend/src/main/java/com/nexhire/controller/AssessmentController.java`, `backend/src/main/java/com/nexhire/dto/AssessmentRequest.java`
- **Why:** After applications exist, HR records assessment scores and qualifies/rejects candidates.
- **Depends on:** Commit 9

### Commit 11

- **Message:** `feat(backend): implement offer letters module (send + accept/reject)`
- **Files:** `backend/src/main/java/com/nexhire/entity/OfferLetter.java`, `backend/src/main/java/com/nexhire/repository/OfferLetterRepository.java`, `backend/src/main/java/com/nexhire/service/OfferService.java`, `backend/src/main/java/com/nexhire/controller/OfferController.java`, `backend/src/main/java/com/nexhire/dto/` (OfferRequest, OfferResponse)
- **Why:** Qualified candidates receive offer letters. Next step in the hiring funnel after assessment.
- **Depends on:** Commit 10

### Commit 12

- **Message:** `feat(backend): implement locations and budget/seat management`
- **Files:** `backend/src/main/java/com/nexhire/service/LocationService.java`, `backend/src/main/java/com/nexhire/controller/LocationController.java`, `backend/src/main/java/com/nexhire/dto/` (LocationResponse, LocationUpdateRequest)
- **Why:** Location-based budget and training seat capacity must exist before joining letters (which consume these resources).
- **Depends on:** Commit 4

### Commit 13

- **Message:** `feat(backend): implement joining letters module with budget/seat deduction`
- **Files:** `backend/src/main/java/com/nexhire/entity/JoiningLetter.java`, `backend/src/main/java/com/nexhire/repository/JoiningLetterRepository.java`, `backend/src/main/java/com/nexhire/service/JoiningLetterService.java`, `backend/src/main/java/com/nexhire/controller/JoiningLetterController.java`, `backend/src/main/java/com/nexhire/dto/` (JoiningLetterRequest, JoiningLetterResponse)
- **Why:** After offer acceptance, HR sends joining letters. Checks budget/seats and puts candidates ON_HOLD if insufficient. Deducts monetary budget.
- **Depends on:** Commits 11, 12

---

## Phase 4: Backend Features (Post-Hiring Pipeline)

### Commit 14

- **Message:** `feat(backend): implement BGV module (initiate + update status)`
- **Files:** `backend/src/main/java/com/nexhire/entity/BackgroundVerification.java`, `backend/src/main/java/com/nexhire/enums/BgvStatus.java`, `backend/src/main/java/com/nexhire/repository/BackgroundVerificationRepository.java`, `backend/src/main/java/com/nexhire/service/BgvService.java`, `backend/src/main/java/com/nexhire/controller/BgvController.java`, `backend/src/main/java/com/nexhire/dto/` (BgvResponse, BgvUpdateRequest)
- **Why:** BGV runs in parallel with the joining process. HR initiates, third-party results are recorded.
- **Depends on:** Commit 9

### Commit 15

- **Message:** `feat(backend): implement training module (trainee lifecycle + progress)`
- **Files:** `backend/src/main/java/com/nexhire/entity/` (Trainee, TrainingRecord), `backend/src/main/java/com/nexhire/repository/` (TraineeRepository, TrainingRecordRepository), `backend/src/main/java/com/nexhire/service/TrainingService.java`, `backend/src/main/java/com/nexhire/controller/TrainingController.java`, `backend/src/main/java/com/nexhire/dto/` (TraineeResponse, TrainingProgressRequest)
- **Why:** After joining letter acceptance, users become trainees. HR tracks progress and marks completion.
- **Depends on:** Commit 13

### Commit 16

- **Message:** `feat(backend): implement projects module (Admin CRUD + RMG allocation)`
- **Files:** `backend/src/main/java/com/nexhire/entity/` (Project, ProjectAssignment), `backend/src/main/java/com/nexhire/repository/` (ProjectRepository, ProjectAssignmentRepository), `backend/src/main/java/com/nexhire/service/ProjectService.java`, `backend/src/main/java/com/nexhire/controller/ProjectController.java`, `backend/src/main/java/com/nexhire/dto/` (ProjectRequest, ProjectResponse, ProjectAssignmentResponse)
- **Why:** Training-completed trainees are allocated to projects by RMG. Admin manages project CRUD.
- **Depends on:** Commit 15

### Commit 17

- **Message:** `feat(backend): implement assets module (CRUD + assign/revoke)`
- **Files:** `backend/src/main/java/com/nexhire/entity/` (Asset, AssetAssignment), `backend/src/main/java/com/nexhire/repository/` (AssetRepository, AssetAssignmentRepository), `backend/src/main/java/com/nexhire/service/AssetService.java`, `backend/src/main/java/com/nexhire/controller/AssetController.java`, `backend/src/main/java/com/nexhire/dto/` (AssetRequest, AssetResponse, AssetAssignmentResponse)
- **Why:** Admin assigns physical assets (laptops, ID cards) to employees. Independent of the hiring flow.
- **Depends on:** Commit 7

### Commit 18

- **Message:** `feat(backend): implement admin modules (user management, roles, activity logs)`
- **Files:** `backend/src/main/java/com/nexhire/entity/ActivityLog.java`, `backend/src/main/java/com/nexhire/repository/ActivityLogRepository.java`, `backend/src/main/java/com/nexhire/service/` (UserManagementService, ActivityLogService), `backend/src/main/java/com/nexhire/controller/` (UserManagementController, RoleController, ActivityLogController), `backend/src/main/java/com/nexhire/dto/` (UserResponse, RoleUpdateRequest, ActivityLogResponse)
- **Why:** Admin-facing features: list/deactivate users, assign roles, and view system activity logs.
- **Depends on:** Commit 7

### Commit 19

- **Message:** `feat(backend): implement dashboard and notifications`
- **Files:** `backend/src/main/java/com/nexhire/entity/Notification.java`, `backend/src/main/java/com/nexhire/repository/NotificationRepository.java`, `backend/src/main/java/com/nexhire/service/` (DashboardService, NotificationService), `backend/src/main/java/com/nexhire/controller/` (DashboardController, NotificationController), `backend/src/main/java/com/nexhire/dto/` (DashboardStatsResponse, ChartDataResponse)
- **Why:** Dashboard computes live metrics. Notifications are triggered by existing services (offers, joining letters, training, project assignment).
- **Depends on:** Commits 11, 13, 15, 16

### Commit 20

- **Message:** `feat(backend): add database init script and data seeder`
- **Files:** `backend/src/main/resources/db/init.sql`, `backend/src/main/java/com/nexhire/seed/DataSeeder.java`
- **Why:** Provides reproducible schema setup for fresh installs and comprehensive sample data across all application statuses.
- **Depends on:** Commit 19

---

## Phase 5: Backend Testing

### Commit 21

- **Message:** `test(backend): add unit tests for auth service`
- **Files:** `backend/src/test/java/com/nexhire/service/AuthServiceTest.java`
- **Why:** Auth is the most critical path. Validates registration, login, and duplicate-email rejection.
- **Depends on:** Commit 7

### Commit 22

- **Message:** `test(backend): add unit tests for application and assessment services`
- **Files:** `backend/src/test/java/com/nexhire/service/ApplicationServiceTest.java`, `backend/src/test/java/com/nexhire/service/AssessmentServiceTest.java`
- **Why:** Tests the core hiring pipeline: applying, starting assessments, scoring, qualifying/rejecting.
- **Depends on:** Commits 9, 10

### Commit 23

- **Message:** `test(backend): add unit tests for offer and joining letter services`
- **Files:** `backend/src/test/java/com/nexhire/service/OfferServiceTest.java`, `backend/src/test/java/com/nexhire/service/JoiningLetterServiceTest.java`
- **Why:** Tests offer send/accept/reject and joining letter budget-checking logic.
- **Depends on:** Commits 11, 13

---

## Phase 6: Frontend Foundation

### Commit 24

- **Message:** `feat(frontend): add core module (auth service, token service, guards, interceptors)`
- **Files:** `nexHire-frontend/src/app/core/` (core.module.ts, auth/auth.service.ts, auth/token.service.ts, auth/current-user.service.ts, guards/auth.guard.ts, guards/role.guard.ts, guards/permission.guard.ts, interceptors/auth.interceptor.ts, interceptors/error.interceptor.ts, interceptors/loader.interceptor.ts, interceptors/mock.interceptor.ts, mocks/in-memory-data-store.ts, services/permission.service.ts)
- **Why:** Auth handling, JWT interception, route protection, and permission checks are needed before any feature module.
- **Depends on:** Commit 3

### Commit 25

- **Message:** `feat(frontend): add shared module (components, pipes, directives, services)`
- **Files:** `nexHire-frontend/src/app/shared/` (shared.module.ts, components/page-header, components/empty-state, components/loader, components/toast, components/status-badge, components/data-table, components/file-upload, components/timeline, components/confirmation-dialog, components/bulk-action-bar, pipes/relative-date.pipe.ts, directives/has-permission.directive.ts, validators/custom-validators.ts, services/toast.service.ts, services/loader.service.ts, services/form-helper.service.ts)
- **Why:** Reusable UI components, pipes, and utility services used across all feature modules.
- **Depends on:** Commit 24

### Commit 26

- **Message:** `feat(frontend): add models, config, and environment files`
- **Files:** `nexHire-frontend/src/app/models/` (user.model.ts, job.model.ts, application.model.ts, assessment.model.ts, offer-letter.model.ts, joining-letter.model.ts, location-budget.model.ts, location.model.ts, background-verification.model.ts, training.model.ts, project.model.ts, asset.model.ts, selected.model.ts, admin.model.ts, api-response.model.ts, role-permission.model.ts), `nexHire-frontend/src/app/config/api-endpoints.ts`, `nexHire-frontend/src/environments/` (environment.ts, environment.prod.ts)
- **Why:** Type definitions and API endpoint constants must exist before services can be written.
- **Depends on:** Commit 24

### Commit 27

- **Message:** `feat(frontend): add layout components (public, candidate, HR, admin)`
- **Files:** `nexHire-frontend/src/app/layouts/` (public-layout.component.ts, candidate-layout.component.ts, hr-layout.component.ts, admin-layout.component.ts)
- **Why:** Layout shells (sidebars, topbars, notification dropdowns, user menus) wrap all routed pages.
- **Depends on:** Commits 25, 26

### Commit 28

- **Message:** `feat(frontend): add app module, routing, and root component`
- **Files:** `nexHire-frontend/src/app/app.module.ts`, `nexHire-frontend/src/app/app-routing.module.ts`, `nexHire-frontend/src/app/app.component.ts`, `nexHire-frontend/src/app/app.component.html`, `nexHire-frontend/src/app/app.component.scss`
- **Why:** Wires everything together: module declarations, route definitions, and the bootstrap component.
- **Depends on:** Commit 27

---

## Phase 7: Frontend Features (Auth & Candidate Portal)

### Commit 29

- **Message:** `feat(frontend): implement auth module (login, register, landing page)`
- **Files:** `nexHire-frontend/src/app/modules/auth/` (auth.module.ts, auth-routing.module.ts, login/login.component.ts, register/register.component.ts, landing/landing.component.ts)
- **Why:** Users must be able to login/register before accessing any portal.
- **Depends on:** Commit 28

### Commit 30

- **Message:** `feat(frontend): implement candidate portal - jobs and applications`
- **Files:** `nexHire-frontend/src/app/modules/candidate/` (candidate.module.ts, candidate-routing.module.ts, dashboard/candidate-dashboard.component.ts, jobs-list/jobs-list.component.ts, job-details/_, application-form/_, applications/candidate-applications.component.ts), `nexHire-frontend/src/app/services/` (job.service.ts, application.service.ts)
- **Why:** Core candidate experience: browse jobs, view details, apply, and track applications.
- **Depends on:** Commit 29

### Commit 31

- **Message:** `feat(frontend): implement candidate portal - offers, joining, training, profile`
- **Files:** `nexHire-frontend/src/app/modules/candidate/` (offers/candidate-offers.component.ts, joining/candidate-joining.component.ts, training/candidate-training.component.ts, profile/candidate-profile.component.ts, change-password/change-password.component.ts), `nexHire-frontend/src/app/services/` (offer-letter.service.ts, joining-letter.service.ts, trainee-progress.service.ts)
- **Why:** Remaining candidate-facing features: view/accept offers, view/accept joining letters, track training progress, edit profile.
- **Depends on:** Commit 30

---

## Phase 8: Frontend Features (HR Portal)

### Commit 32

- **Message:** `feat(frontend): implement HR dashboard with live metrics`
- **Files:** `nexHire-frontend/src/app/modules/dashboard/hr-dashboard/hr-dashboard.component.ts`, `nexHire-frontend/src/app/services/dashboard.service.ts`
- **Why:** HR landing page showing computed stats and charts from the real backend.
- **Depends on:** Commit 28

### Commit 33

- **Message:** `feat(frontend): implement HR applications and assessments management`
- **Files:** `nexHire-frontend/src/app/modules/applications/applications.component.ts`, `nexHire-frontend/src/app/modules/assessments/assessments.component.ts`, `nexHire-frontend/src/app/services/assessment.service.ts`
- **Why:** HR manages the recruitment pipeline: view applications, start assessments, record scores, qualify/reject.
- **Depends on:** Commit 32

### Commit 34

- **Message:** `feat(frontend): implement HR offer letters and selected candidates`
- **Files:** `nexHire-frontend/src/app/modules/offer-letters/offer-letters.component.ts`, `nexHire-frontend/src/app/modules/selected/selected.component.ts`, `nexHire-frontend/src/app/services/training.service.ts`
- **Why:** HR sends offers to qualified candidates and manages training allocation for selected ones.
- **Depends on:** Commit 33

### Commit 35

- **Message:** `feat(frontend): implement HR BGV management`
- **Files:** `nexHire-frontend/src/app/modules/bgv/bgv.component.ts`, `nexHire-frontend/src/app/services/` (bgv.service.ts, background-verification.service.ts)
- **Why:** HR initiates and tracks background verification status.
- **Depends on:** Commit 33

### Commit 36

- **Message:** `feat(frontend): implement HR trainees management`
- **Files:** `nexHire-frontend/src/app/modules/trainees/trainees.component.ts`, `nexHire-frontend/src/app/services/trainee.service.ts`
- **Why:** HR views all trainees, updates progress, and marks training as complete.
- **Depends on:** Commit 34

### Commit 37

- **Message:** `feat(frontend): implement HR budget overview page`
- **Files:** `nexHire-frontend/src/app/modules/budget-overview/budget-overview.component.ts`, `nexHire-frontend/src/app/services/location-budget.service.ts`
- **Why:** HR monitors budget consumption and training seat availability per location.
- **Depends on:** Commit 32

### Commit 38

- **Message:** `feat(frontend): implement RMG project allocation (released candidates)`
- **Files:** `nexHire-frontend/src/app/modules/released/released.component.ts`, `nexHire-frontend/src/app/services/project-rmg.service.ts`
- **Why:** RMG allocates training-completed trainees to active projects.
- **Depends on:** Commit 36

---

## Phase 9: Frontend Features (Admin Portal)

### Commit 39

- **Message:** `feat(frontend): implement admin dashboard`
- **Files:** `nexHire-frontend/src/app/modules/admin/admin-dashboard/admin-dashboard.component.ts`
- **Why:** Admin landing page with system overview stats.
- **Depends on:** Commit 28

### Commit 40

- **Message:** `feat(frontend): implement admin user management`
- **Files:** `nexHire-frontend/src/app/modules/admin/user-management/` (user-management.component.ts, create-user-dialog.component.ts), `nexHire-frontend/src/app/services/admin-user.service.ts`
- **Why:** Admin lists users, changes roles, and deactivates accounts.
- **Depends on:** Commit 39

### Commit 41

- **Message:** `feat(frontend): implement admin project CRUD`
- **Files:** `nexHire-frontend/src/app/modules/projects/projects.component.ts`, `nexHire-frontend/src/app/services/project.service.ts`
- **Why:** Admin creates, updates, and deletes projects (RMG only allocates).
- **Depends on:** Commit 39

### Commit 42

- **Message:** `feat(frontend): implement admin asset management`
- **Files:** `nexHire-frontend/src/app/modules/assets/assets.component.ts`, `nexHire-frontend/src/app/services/` (asset.service.ts, asset-admin.service.ts)
- **Why:** Admin manages physical assets and assigns/revokes them to employees.
- **Depends on:** Commit 39

### Commit 43

- **Message:** `feat(frontend): implement admin activity logs`
- **Files:** `nexHire-frontend/src/app/modules/admin/activity-logs/activity-logs.component.ts`
- **Why:** Admin views audit trail of system actions.
- **Depends on:** Commit 39

### Commit 44

- **Message:** `feat(frontend): implement admin locations, budgets, and system settings (mock-backed)`
- **Files:** `nexHire-frontend/src/app/modules/admin/locations/` (cities/cities.component.ts, branches/branches.component.ts, blocks/blocks.component.ts), `nexHire-frontend/src/app/modules/admin/budgets/budgets.component.ts`, `nexHire-frontend/src/app/modules/admin/system-settings/system-settings.component.ts`
- **Why:** Location hierarchy and budget management screens (currently mock-backed, not on real backend).
- **Depends on:** Commit 39

---

## Phase 10: Frontend Features (Cross-Cutting)

### Commit 45

- **Message:** `feat(frontend): implement notification system (bell dropdown + polling)`
- **Files:** `nexHire-frontend/src/app/services/notification.service.ts`
- **Why:** Real-time notification badge on bell icon with dropdown panel. Polls backend every 30s.
- **Depends on:** Commits 27, 19

### Commit 46

- **Message:** `feat(frontend): implement error pages (401, 404)`
- **Files:** `nexHire-frontend/src/app/modules/errors/` (unauthorized.component.ts, not-found.component.ts)
- **Why:** Graceful handling of unauthorized access and missing routes.
- **Depends on:** Commit 28

---

## Phase 11: Integration & Polish

### Commit 47

- **Message:** `refactor(frontend): wire mock interceptor to pass real backend prefixes`
- **Files:** `nexHire-frontend/src/app/core/interceptors/mock.interceptor.ts` (REAL_BACKEND_PREFIXES list)
- **Why:** Ensures all real-backend endpoints bypass mock layer while legacy mock modules keep working.
- **Depends on:** Commit 24

### Commit 48

- **Message:** `feat(frontend): add candidate "already applied" state on jobs list`
- **Files:** `nexHire-frontend/src/app/modules/candidate/jobs-list/jobs-list.component.ts`
- **Why:** UX improvement: applied jobs show green "Applied" button linking to My Applications.
- **Depends on:** Commit 30

### Commit 49

- **Message:** `fix(backend): sort HR applications list by newest first`
- **Files:** `backend/src/main/java/com/nexhire/repository/JobApplicationRepository.java`, `backend/src/main/java/com/nexhire/service/ApplicationService.java`
- **Why:** New applications appear at the top of the HR pipeline instead of the bottom.
- **Depends on:** Commit 9

---

## Phase 12: Legacy Frontend Scaffold (Prototype)

### Commit 50

- **Message:** `chore(frontend-prototype): add Phase 1 standalone Angular scaffold`
- **Files:** `frontend/` (all files — package.json, angular.json, app.component.ts, app.config.ts, app.routes.ts, environments/_, features/auth/_, features/admin/_, features/hr/_, features/employee/_, features/rmg/_, core/guards/_, core/interceptors/_, core/services/\*, styles.scss)
- **Why:** Historical prototype that preceded the full nexHire-frontend. Preserved for reference. This was the initial exploration before the modular Angular app was built.
- **Depends on:** Commit 1

---

## Phase 13: Documentation & Final Cleanup

### Commit 51

- **Message:** `docs: add project spec documents (requirements, design, tasks)`
- **Files:** `.kiro/specs/nexhire/` (requirements.md, design.md, tasks.md)
- **Why:** Formal specification of the system: requirements, API design tables, role permission matrix, and implementation task breakdown.
- **Depends on:** Commit 1

### Commit 52

- **Message:** `docs: update README with setup instructions and credentials`
- **Files:** `README.md`
- **Why:** Final documentation covering project overview, tech stack, setup steps, database initialization, and test account credentials.
- **Depends on:** Commit 51

---

## Summary

| Phase                        | Commits | Description                                                              |
| ---------------------------- | ------- | ------------------------------------------------------------------------ |
| 1. Project Setup             | 1–3     | Repository init, Spring Boot scaffold, Angular scaffold                  |
| 2. Backend Foundation        | 4–7     | Entities, security, auth                                                 |
| 3. Backend Hiring Pipeline   | 8–13    | Jobs → Applications → Assessments → Offers → Locations → Joining Letters |
| 4. Backend Post-Hiring       | 14–20   | BGV, Training, Projects, Assets, Admin, Dashboard, Notifications, Seeder |
| 5. Backend Testing           | 21–23   | Unit tests for core services                                             |
| 6. Frontend Foundation       | 24–28   | Core module, shared module, models, layouts, routing                     |
| 7. Frontend Candidate Portal | 29–31   | Auth, jobs, applications, offers, joining, training, profile             |
| 8. Frontend HR Portal        | 32–38   | Dashboard, pipeline management, BGV, trainees, budget, RMG allocation    |
| 9. Frontend Admin Portal     | 39–44   | Dashboard, user mgmt, projects, assets, activity logs, locations         |
| 10. Frontend Cross-Cutting   | 45–46   | Notifications, error pages                                               |
| 11. Integration & Polish     | 47–49   | Mock interceptor, UX fixes, sort order                                   |
| 12. Legacy Scaffold          | 50      | Phase 1 prototype preservation                                           |
| 13. Documentation            | 51–52   | Specs and README                                                         |

**Total: 52 commits** representing a clean, incremental development history.
