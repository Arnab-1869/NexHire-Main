# nexHIRE

Full-stack Human Resource Management System focused on employee onboarding workflow — from candidate registration through job application, assessment, offer management, joining, training, and project allocation.

## Tech Stack

- **Backend:** Spring Boot 3.2 (Java 17), Maven, PostgreSQL, JWT authentication
- **Frontend:** Angular 19 (CLI 19.2.27), TypeScript 5.7, SCSS
- **Database:** PostgreSQL 15+

## Required Versions

| Tool        | Version |
| ----------- | ------- |
| Angular CLI | 19.2.27 |
| Angular     | 19.x    |
| Node.js     | 22.9.0  |
| npm         | 10.8.3  |
| Java        | 17+     |
| Maven       | 3.8+    |
| PostgreSQL  | 15+     |

## Project Structure

```
├── backend/          # Spring Boot REST API
│   ├── src/main/java/com/nexhire/
│   │   ├── config/       # Security, CORS configuration
│   │   ├── controller/   # REST controllers
│   │   ├── dto/          # Request/Response DTOs
│   │   ├── entity/       # JPA entities
│   │   ├── enums/        # UserRole, LifecycleStatus, ApplicationStatus
│   │   ├── exception/    # Custom exceptions + global handler
│   │   ├── repository/   # Spring Data JPA repositories
│   │   ├── security/     # JWT token provider + filter
│   │   ├── seed/         # Database seeder
│   │   └── service/      # Business logic services
│   └── src/main/resources/
│       └── application.yml
├── frontend/         # Angular SPA
│   └── src/app/
│       ├── core/         # Guards, interceptors, services, models
│       ├── features/     # Feature modules (auth, employee, hr, rmg, admin)
│       └── shared/       # Shared components and layouts
└── README.md
```

## Prerequisites

- Java 17+
- Maven 3.8+
- Node.js 22.9.0
- npm 10.8.3
- Angular CLI 19.2.27 (`npm install -g @angular/cli@19.2.27`)
- PostgreSQL 15+

## Database Setup

```bash
# Create the database
psql -U postgres -c "CREATE DATABASE nexhire;"
```

Default connection (see `backend/src/main/resources/application.yml`):

- Host: localhost:5432
- Database: nexhire
- Username: postgres
- Password: postgres

## Running the Backend

```bash
cd backend
mvn spring-boot:run
```

The API starts at `http://localhost:8080`. On first run, the DataSeeder populates sample data.

## Running the Frontend

```bash
cd frontend
npm install
ng serve
```

The app runs at `http://localhost:4200`.

## Sample Users (seeded on first run)

| Role      | Email                  | Password     |
| --------- | ---------------------- | ------------ |
| Admin     | admin@nexhire.com      | admin123     |
| HR        | hr@nexhire.com         | hr123        |
| RMG       | rmg@nexhire.com        | rmg123       |
| Candidate | candidate1@nexhire.com | candidate123 |
| Candidate | candidate2@nexhire.com | candidate123 |

## Roles & Dashboards

- **EMPLOYEE** (Candidate/Trainee): Apply for jobs, view status, accept offers/joining letters, track training
- **HR**: Manage applications, assessments, offers, joining letters, training progress
- **RMG**: View eligible trainees, assign to projects
- **ADMIN**: Manage users/roles, assets, view activity logs

## Demo Flow

1. Candidate registers → applies for job
2. HR initiates assessment → enters scores → qualifies/rejects
3. HR sends offer letter → candidate accepts
4. HR sends joining letter (checks budget/seats) → candidate accepts → becomes Trainee
5. HR tracks training progress → marks complete
6. RMG assigns trainee to project → lifecycle complete
