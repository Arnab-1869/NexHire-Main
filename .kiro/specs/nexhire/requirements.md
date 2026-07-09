# Requirements Document

## Introduction

nexHIRE is a full-stack Human Resource Management System (HRMS) focused on employee onboarding workflow. The system manages the complete lifecycle from candidate registration through job application, assessment, offer management, joining, training, and project allocation. The platform serves four roles (Admin, HR, RMG, Employee) with a unified login experience and role-based dashboards. Candidates and trainees are EMPLOYEE-role users distinguished by their lifecycle status. The tech stack consists of Angular 19 frontend, Spring Boot (Java 17) backend with Maven, PostgreSQL database, and JWT-based authentication.

## Glossary

- **nexHIRE**: The HRMS application being designed
- **UserRole**: Authorization role (ADMIN, HR, RMG, EMPLOYEE). Controls what APIs and pages a user can access.
- **LifecycleStatus**: The current stage of an EMPLOYEE-role user (CANDIDATE, TRAINEE, PROJECT_ASSIGNED). Does not apply to ADMIN, HR, or RMG users.
- **ApplicationStatus**: The hiring/onboarding workflow status of a specific job application (APPLIED, ASSESSMENT_PENDING, ASSESSMENT_COMPLETED, QUALIFIED, REJECTED, OFFER_SENT, OFFER_ACCEPTED, OFFER_REJECTED, JOINING_ON_HOLD, JOINING_LETTER_SENT, TRAINING_IN_PROGRESS, TRAINING_COMPLETED, PROJECT_ASSIGNED). Created only when a candidate applies for a job.
- **Candidate**: An EMPLOYEE-role user whose lifecycleStatus is CANDIDATE
- **Trainee**: An EMPLOYEE-role user whose lifecycleStatus is TRAINEE
- **HR**: Human Resources role responsible for managing hiring workflow, assessments, offers, joining, and training
- **RMG**: Resource Management Group role responsible for assigning trainees to projects after training completion
- **Admin**: Administrative role responsible for user management, role management, project management (CRUD), asset management, and activity logs
- **Assessment**: An evaluation conducted by third-party vendors; HR manually enters scores into nexHIRE
- **Offer Letter**: A formal document sent to qualified candidates offering employment
- **Joining Letter**: A formal document sent to candidates who accepted an offer, confirming their joining date. Sending requires budget and seat availability.
- **Hiring Budget**: Location-wise budget allocation checked before sending joining letters
- **Training Seat**: Location-wise training capacity checked before sending joining letters
- **Project Assignment**: The allocation of a training-completed trainee to a specific project by RMG
- **Asset**: Physical or digital resources (laptop, ID card, etc.) assigned to employees by Admin
- **Activity Log**: A record of significant actions performed within the system
- **JWT**: JSON Web Token used for stateless authentication
- **JOINING_ON_HOLD**: A transitional ApplicationStatus indicating that HR attempted to send a joining letter but location resources (hiring budget or training seats) were unavailable. HR can retry when resources become available.
- **BGV (Background Verification)**: A verification performed by a third-party vendor. nexHIRE records and surfaces the BGV status (PENDING, IN_PROGRESS, CLEARED, FAILED, ON_HOLD) against the candidate's application. HR initiates it; the third-party result is recorded via a status update.

## Requirements

### Requirement 1

**User Story:** As a candidate, I want to register an account and log in to nexHIRE, so that I can access the system and apply for jobs.

#### Acceptance Criteria

1. WHEN a candidate submits a registration form with valid details (name, email, password, phone) THEN nexHIRE SHALL create a new user account with role=EMPLOYEE, lifecycleStatus=CANDIDATE, and active=true
2. WHEN a user submits valid credentials on the login page THEN nexHIRE SHALL authenticate the user, return a JWT token containing userId and role, and redirect the user to the dashboard corresponding to the user role
3. WHEN a user submits invalid credentials THEN nexHIRE SHALL return an HTTP 401 response with an error message and not issue a JWT token
4. WHEN a candidate attempts to register with an email that already exists THEN nexHIRE SHALL reject the registration and return an HTTP 409 response
5. WHEN nexHIRE stores a user password THEN nexHIRE SHALL hash the password using BCrypt before persisting it to the database

### Requirement 2

**User Story:** As a candidate, I want to view available jobs and submit applications, so that I can be considered for employment.

#### Acceptance Criteria

1. WHEN a candidate requests the job listing THEN nexHIRE SHALL return all active job postings with title, description, location, and requirements
2. WHEN a candidate submits a job application for an active job THEN nexHIRE SHALL create a job application record linked to the authenticated user and set applicationStatus to APPLIED
3. WHEN a candidate attempts to apply for a job they have already applied to THEN nexHIRE SHALL reject the application and return an HTTP 409 response
4. WHEN a candidate requests their application status THEN nexHIRE SHALL return the current status of all applications belonging to that authenticated user

### Requirement 3

**User Story:** As an HR user, I want to initiate assessments and manage assessment results for candidates, so that I can record evaluation outcomes from third-party vendors.

#### Acceptance Criteria

1. WHEN HR initiates an assessment for an application with status APPLIED THEN nexHIRE SHALL update the applicationStatus to ASSESSMENT_PENDING
2. WHEN HR submits an assessment score for an application with status ASSESSMENT_PENDING THEN nexHIRE SHALL store the score, update the applicationStatus to ASSESSMENT_COMPLETED, and record the HR user (from JWT context) who entered the result
3. WHEN HR uploads a CSV file containing assessment results THEN nexHIRE SHALL parse the CSV, validate each row, store valid scores, and return a summary indicating success and failure counts
4. WHEN HR marks a candidate as QUALIFIED THEN nexHIRE SHALL update the applicationStatus to QUALIFIED only if the current status is ASSESSMENT_COMPLETED
5. WHEN HR marks a candidate as REJECTED THEN nexHIRE SHALL update the applicationStatus to REJECTED only if the current status is ASSESSMENT_COMPLETED
6. WHEN HR attempts to update assessment results for an application not in ASSESSMENT_PENDING status THEN nexHIRE SHALL reject the update and return an HTTP 400 response

### Requirement 4

**User Story:** As an HR user, I want to send offer letters to qualified candidates, so that I can formally extend employment offers.

#### Acceptance Criteria

1. WHEN HR sends an offer letter to a candidate whose applicationStatus is QUALIFIED THEN nexHIRE SHALL create an offer letter record and update the applicationStatus to OFFER_SENT
2. WHEN HR attempts to send an offer to a candidate whose applicationStatus is not QUALIFIED THEN nexHIRE SHALL reject the request and return an HTTP 400 response
3. WHEN a candidate accepts an offer letter THEN nexHIRE SHALL update the applicationStatus to OFFER_ACCEPTED
4. WHEN a candidate rejects an offer letter THEN nexHIRE SHALL update the applicationStatus to OFFER_REJECTED

### Requirement 5

**User Story:** As an HR user, I want to send joining letters to candidates who accepted offers, so that I can confirm their onboarding after verifying resource availability.

#### Acceptance Criteria

1. WHEN HR sends a joining letter to a candidate with applicationStatus OFFER_ACCEPTED THEN nexHIRE SHALL verify both available hiring budget and available training seats for the selected location
2. WHEN both hiring budget and training seats are available THEN nexHIRE SHALL create a joining letter record, update applicationStatus to JOINING_LETTER_SENT, decrement one hiring budget slot, and decrement one training seat
3. WHEN either hiring budget or training seats are unavailable THEN nexHIRE SHALL reject the joining letter creation and return an HTTP 400 response indicating which resource is insufficient
4. WHEN a candidate accepts a joining letter THEN nexHIRE SHALL validate applicationStatus is JOINING_LETTER_SENT, update applicationStatus to TRAINING_IN_PROGRESS, set lifecycleStatus to TRAINEE, create a Trainee record, create a TrainingRecord with progress=0 and completed=false, and log the action in ActivityLog
5. WHEN HR attempts to send a joining letter to a candidate whose applicationStatus is not OFFER_ACCEPTED THEN nexHIRE SHALL reject the request and return an HTTP 400 response

### Requirement 6

**User Story:** As an HR user, I want to view location-wise hiring budgets and training seat availability, so that I can plan resource allocation before sending joining letters.

#### Acceptance Criteria

1. WHEN HR requests budget and training seat data THEN nexHIRE SHALL return location-wise hiring budget totals, used amounts, and remaining capacity along with training seat totals, occupied counts, and available counts
2. WHEN a joining letter is successfully sent THEN nexHIRE SHALL decrement both the available hiring budget and available training seats for the corresponding location by one unit each

### Requirement 7

**User Story:** As an HR user, I want to track trainee training progress, so that I can monitor onboarding completion.

#### Acceptance Criteria

1. WHEN HR updates training progress for a trainee THEN nexHIRE SHALL store the progress details and update the training record for that trainee
2. WHEN HR marks training as complete for a trainee THEN nexHIRE SHALL update the applicationStatus to TRAINING_COMPLETED
3. WHEN HR attempts to update training for a user whose lifecycleStatus is not TRAINEE THEN nexHIRE SHALL reject the request and return an HTTP 400 response

### Requirement 8

**User Story:** As an RMG user, I want to assign training-completed trainees to projects, so that I can allocate resources to active projects.

#### Acceptance Criteria

1. WHEN RMG requests the list of trainees with applicationStatus TRAINING_COMPLETED THEN nexHIRE SHALL return all trainees eligible for project assignment
2. WHEN RMG assigns a trainee to a project THEN nexHIRE SHALL create a project assignment record, update applicationStatus to PROJECT_ASSIGNED, and update lifecycleStatus to PROJECT_ASSIGNED
3. WHEN RMG attempts to assign a trainee whose applicationStatus is not TRAINING_COMPLETED THEN nexHIRE SHALL reject the assignment and return an HTTP 400 response
4. WHEN RMG requests available projects THEN nexHIRE SHALL return all active projects with name, description, and current team size

### Requirement 9

**User Story:** As an admin, I want to manage users and roles, so that I can control system access and permissions.

#### Acceptance Criteria

1. WHEN an admin requests the user list THEN nexHIRE SHALL return all users with their current roles, lifecycle statuses, and registration dates
2. WHEN an admin updates a user role THEN nexHIRE SHALL change the user role and record the change in the activity log
3. WHEN an admin deactivates a user account THEN nexHIRE SHALL mark the user as inactive and prevent further login
4. WHEN an admin requests the role list THEN nexHIRE SHALL return all available roles with their descriptions

### Requirement 10

**User Story:** As an admin, I want to manage asset assignments, so that I can track company resources allocated to employees.

#### Acceptance Criteria

1. WHEN an admin assigns an asset to a user THEN nexHIRE SHALL create an asset assignment record with assigned date and active status
2. WHEN an admin revokes an asset from a user THEN nexHIRE SHALL mark the assignment as inactive and record the revocation date
3. WHEN an admin requests asset assignments for a user THEN nexHIRE SHALL return only active assignments as current and provide historical assignments separately

### Requirement 11

**User Story:** As an admin, I want to view activity logs, so that I can audit user actions and system events.

#### Acceptance Criteria

1. WHEN an admin requests activity logs THEN nexHIRE SHALL return log entries with timestamp, user, action type, and description in reverse chronological order
2. WHEN any user performs a significant action (login, status change, role change, assignment, assessment initiation) THEN nexHIRE SHALL create an activity log entry with the authenticated user identity, action type, timestamp, and relevant details

### Requirement 12

**User Story:** As a system architect, I want the backend to enforce security rules independently of the frontend, so that the system remains secure regardless of client behavior.

#### Acceptance Criteria

1. WHEN a request arrives at a protected API endpoint without a valid JWT token THEN nexHIRE SHALL reject the request with an HTTP 401 response
2. WHEN a request arrives at an API endpoint requiring a specific role THEN nexHIRE SHALL verify the role from the JWT token and reject unauthorized requests with an HTTP 403 response
3. WHEN a request body contains userId, role, lifecycleStatus, applicationStatus, score evaluator, assignedBy, or sentBy fields THEN nexHIRE SHALL ignore those fields and derive sensitive values from the authenticated JWT context
4. WHEN the backend processes any state transition THEN nexHIRE SHALL validate that the current applicationStatus allows the requested transition before applying changes

### Requirement 13

**User Story:** As a user, I want a responsive frontend with role-based navigation, so that I can access only the features relevant to my role.

#### Acceptance Criteria

1. WHEN a user logs in THEN nexHIRE SHALL render a sidebar navigation containing only the menu items authorized for the user role
2. WHEN an authenticated user navigates to a route not authorized for their role THEN nexHIRE SHALL redirect the user to their role-appropriate dashboard
3. WHEN the frontend renders data tables THEN nexHIRE SHALL display status badges with distinct visual styling for each application status
4. WHEN the frontend renders on different screen sizes THEN nexHIRE SHALL adapt the layout to remain usable on desktop and tablet viewports

### Requirement 14

**User Story:** As a developer, I want the backend to serialize and deserialize request and response payloads as JSON, so that the frontend and backend communicate consistently.

#### Acceptance Criteria

1. WHEN the backend receives a valid JSON request body THEN nexHIRE SHALL deserialize the payload into the corresponding DTO and validate all fields
2. WHEN the backend returns a response THEN nexHIRE SHALL serialize the response DTO to JSON format with consistent field naming (camelCase)
3. WHEN the backend receives a malformed JSON request body THEN nexHIRE SHALL return an HTTP 400 response with a descriptive error message

### Requirement 15

**User Story:** As an HR user, I want the system to handle the case where location resources are unavailable when sending a joining letter, so that candidates are placed on hold rather than rejected and can be processed when resources become available.

#### Acceptance Criteria

1. WHEN HR attempts to send a joining letter and both hiring budget and training seats are available for the selected location THEN nexHIRE SHALL create the joining letter, set applicationStatus to JOINING_LETTER_SENT, and decrement both budget and seat by one
2. WHEN HR attempts to send a joining letter and either hiring budget or training seats are unavailable THEN nexHIRE SHALL set applicationStatus to JOINING_ON_HOLD, record the hold reason and timestamp, not create a joining letter, not consume any resources, and return an HTTP 400 response indicating the candidate has been put on hold
3. WHEN HR retries sending a joining letter for an application with status JOINING_ON_HOLD and resources are now available THEN nexHIRE SHALL create the joining letter, set applicationStatus to JOINING_LETTER_SENT, record the hold resolution timestamp, and decrement both budget and seat by one
4. WHEN HR retries sending a joining letter for an application with status JOINING_ON_HOLD and resources are still unavailable THEN nexHIRE SHALL keep applicationStatus as JOINING_ON_HOLD, update the hold reason, and return an HTTP 400 response
5. WHEN a candidate views their applications THEN nexHIRE SHALL display the JOINING_ON_HOLD status and the hold reason if applicable

### Requirement 16

**User Story:** As an HR user, I want to record background verification (BGV) status performed by a third-party vendor, so that the verification outcome is tracked against a candidate's application.

#### Acceptance Criteria

1. WHEN HR initiates a background verification for an application THEN nexHIRE SHALL create a BGV record with status PENDING and associate it with the application
2. IF a background verification already exists for the application THEN nexHIRE SHALL reject the initiation and return an HTTP 409 response
3. WHEN a background verification status update is recorded THEN nexHIRE SHALL update the BGV status and, for CLEARED or FAILED outcomes, record the completion timestamp
4. WHEN a candidate views their applications THEN nexHIRE SHALL surface the current BGV status if a BGV record exists

### Requirement 17

**User Story:** As an admin, I want to manage users, roles, assets, and view activity logs, so that I can administer the platform.

#### Acceptance Criteria

1. WHEN an admin requests the user list THEN nexHIRE SHALL return all users with role, lifecycle status, active flag, and registration date
2. WHEN an admin updates a user's role THEN nexHIRE SHALL change the role and record an activity log entry
3. WHEN an admin deactivates a user THEN nexHIRE SHALL set the user inactive and record an activity log entry
4. WHEN an admin assigns an asset to a user THEN nexHIRE SHALL create an active asset assignment, and IF the asset is already actively assigned THEN nexHIRE SHALL reject the request
5. WHEN an admin requests activity logs THEN nexHIRE SHALL return log entries in reverse chronological order
