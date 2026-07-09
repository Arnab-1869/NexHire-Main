-- ============================================================================
-- nexHire Database Initialization Script
-- ============================================================================
-- Usage (on a fresh PostgreSQL install):
--   1. psql -U postgres -c "CREATE DATABASE nexhire;"
--   2. psql -U postgres -d nexhire -f init.sql
--
-- After running this script, start the Spring Boot backend. On first boot,
-- the DataSeeder (com.nexhire.seed.DataSeeder) will automatically populate
-- the tables with sample data (users, jobs, applications across all statuses,
-- assessments, offers, joining letters, BGV records, trainees, projects,
-- assets, and activity logs).
--
-- Alternatively, if you prefer Hibernate to create the schema automatically
-- (ddl-auto: update in application.yml), you can skip this script entirely
-- and just start the backend — it will create the tables itself. This script
-- exists so you have an explicit, versioned schema definition for CI/CD,
-- migrations, and fresh machine setups.
-- ============================================================================

-- ─── Users ──────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS users (
    id              BIGSERIAL PRIMARY KEY,
    name            VARCHAR(255) NOT NULL,
    email           VARCHAR(255) NOT NULL UNIQUE,
    password        VARCHAR(255) NOT NULL,
    phone           VARCHAR(255) NOT NULL,
    role            VARCHAR(255) NOT NULL,
    lifecycle_status VARCHAR(255),
    active          BOOLEAN NOT NULL DEFAULT TRUE,
    created_at      TIMESTAMP(6) NOT NULL DEFAULT NOW(),
    updated_at      TIMESTAMP(6) NOT NULL DEFAULT NOW()
);

-- ─── Locations ──────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS locations (
    id   BIGSERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL UNIQUE,
    city VARCHAR(255) NOT NULL
);

-- ─── Hiring Budgets (per location) ─────────────────────────────────────────
CREATE TABLE IF NOT EXISTS hiring_budgets (
    id          BIGSERIAL PRIMARY KEY,
    location_id BIGINT NOT NULL UNIQUE REFERENCES locations(id),
    total_slots INTEGER NOT NULL,
    used_slots  INTEGER NOT NULL DEFAULT 0,
    budget_amount BIGINT NOT NULL DEFAULT 0,
    used_amount   BIGINT NOT NULL DEFAULT 0
);

-- ─── Training Seats (per location) ─────────────────────────────────────────
CREATE TABLE IF NOT EXISTS training_seats (
    id             BIGSERIAL PRIMARY KEY,
    location_id    BIGINT NOT NULL UNIQUE REFERENCES locations(id),
    total_seats    INTEGER NOT NULL,
    occupied_seats INTEGER NOT NULL DEFAULT 0
);

-- ─── Jobs ───────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS jobs (
    id           BIGSERIAL PRIMARY KEY,
    title        VARCHAR(255) NOT NULL,
    description  TEXT NOT NULL,
    requirements TEXT,
    location_id  BIGINT NOT NULL REFERENCES locations(id),
    active       BOOLEAN NOT NULL DEFAULT TRUE,
    created_at   TIMESTAMP(6) NOT NULL DEFAULT NOW()
);

-- ─── Job Applications ───────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS job_applications (
    id               BIGSERIAL PRIMARY KEY,
    user_id          BIGINT NOT NULL REFERENCES users(id),
    job_id           BIGINT NOT NULL REFERENCES jobs(id),
    status           VARCHAR(255) NOT NULL,
    hold_reason      VARCHAR(255),
    hold_created_at  TIMESTAMP(6),
    hold_resolved_at TIMESTAMP(6),
    applied_at       TIMESTAMP(6) NOT NULL DEFAULT NOW(),
    updated_at       TIMESTAMP(6) NOT NULL DEFAULT NOW(),
    UNIQUE (user_id, job_id)
);

-- ─── Assessment Results ─────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS assessment_results (
    id             BIGSERIAL PRIMARY KEY,
    application_id BIGINT NOT NULL UNIQUE REFERENCES job_applications(id),
    score          DOUBLE PRECISION NOT NULL,
    remarks        VARCHAR(255),
    evaluated_by   BIGINT NOT NULL REFERENCES users(id),
    evaluated_at   TIMESTAMP(6) NOT NULL
);

-- ─── Offer Letters ──────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS offer_letters (
    id             BIGSERIAL PRIMARY KEY,
    application_id BIGINT NOT NULL UNIQUE REFERENCES job_applications(id),
    content        TEXT NOT NULL,
    sent_by        BIGINT NOT NULL REFERENCES users(id),
    sent_at        TIMESTAMP(6) NOT NULL,
    responded_at   TIMESTAMP(6)
);

-- ─── Joining Letters ────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS joining_letters (
    id             BIGSERIAL PRIMARY KEY,
    application_id BIGINT NOT NULL UNIQUE REFERENCES job_applications(id),
    content        TEXT NOT NULL,
    joining_date   DATE NOT NULL,
    location_id    BIGINT NOT NULL REFERENCES locations(id),
    sent_by        BIGINT NOT NULL REFERENCES users(id),
    sent_at        TIMESTAMP(6) NOT NULL,
    responded_at   TIMESTAMP(6)
);

-- ─── Background Verifications ───────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS background_verifications (
    id             BIGSERIAL PRIMARY KEY,
    application_id BIGINT NOT NULL UNIQUE REFERENCES job_applications(id),
    status         VARCHAR(255) NOT NULL DEFAULT 'PENDING',
    vendor_name    VARCHAR(255),
    remarks        VARCHAR(255),
    initiated_at   TIMESTAMP(6) NOT NULL DEFAULT NOW(),
    completed_at   TIMESTAMP(6),
    updated_at     TIMESTAMP(6) NOT NULL DEFAULT NOW()
);

-- ─── Trainees ───────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS trainees (
    id             BIGSERIAL PRIMARY KEY,
    user_id        BIGINT NOT NULL UNIQUE REFERENCES users(id),
    application_id BIGINT NOT NULL UNIQUE REFERENCES job_applications(id),
    joined_at      TIMESTAMP(6) NOT NULL
);

-- ─── Training Records ───────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS training_records (
    id         BIGSERIAL PRIMARY KEY,
    trainee_id BIGINT NOT NULL UNIQUE REFERENCES trainees(id),
    progress   INTEGER NOT NULL DEFAULT 0,
    topic      VARCHAR(255),
    completed  BOOLEAN NOT NULL DEFAULT FALSE,
    updated_at TIMESTAMP(6) NOT NULL DEFAULT NOW()
);

-- ─── Projects ───────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS projects (
    id          BIGSERIAL PRIMARY KEY,
    name        VARCHAR(255) NOT NULL,
    description TEXT,
    active      BOOLEAN NOT NULL DEFAULT TRUE,
    team_size   INTEGER NOT NULL DEFAULT 0,
    created_at  TIMESTAMP(6) NOT NULL DEFAULT NOW()
);

-- ─── Project Assignments ────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS project_assignments (
    id          BIGSERIAL PRIMARY KEY,
    trainee_id  BIGINT NOT NULL UNIQUE REFERENCES trainees(id),
    project_id  BIGINT NOT NULL REFERENCES projects(id),
    assigned_by BIGINT NOT NULL REFERENCES users(id),
    assigned_at TIMESTAMP(6) NOT NULL
);

-- ─── Assets ─────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS assets (
    id            BIGSERIAL PRIMARY KEY,
    name          VARCHAR(255) NOT NULL,
    type          VARCHAR(255) NOT NULL,
    serial_number VARCHAR(255) UNIQUE
);

-- ─── Asset Assignments ──────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS asset_assignments (
    id          BIGSERIAL PRIMARY KEY,
    asset_id    BIGINT NOT NULL REFERENCES assets(id),
    user_id     BIGINT NOT NULL REFERENCES users(id),
    assigned_at TIMESTAMP(6) NOT NULL,
    revoked_at  TIMESTAMP(6),
    active      BOOLEAN NOT NULL DEFAULT TRUE
);

-- ─── Activity Logs ──────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS activity_logs (
    id          BIGSERIAL PRIMARY KEY,
    user_id     BIGINT NOT NULL REFERENCES users(id),
    action_type VARCHAR(255) NOT NULL,
    description VARCHAR(255) NOT NULL,
    "timestamp" TIMESTAMP(6) NOT NULL
);

-- ─── Notifications ──────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS notifications (
    id         BIGSERIAL PRIMARY KEY,
    user_id    BIGINT NOT NULL REFERENCES users(id),
    title      VARCHAR(255) NOT NULL,
    message    VARCHAR(255) NOT NULL,
    type       VARCHAR(255) NOT NULL,
    read       BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMP(6) NOT NULL DEFAULT NOW()
);

-- ============================================================================
-- Done. Start the Spring Boot backend to auto-seed sample data on first boot.
-- ============================================================================
