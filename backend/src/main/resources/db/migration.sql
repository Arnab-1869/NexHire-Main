-- ─── Candidate Profiles ──────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS candidate_profiles (
    id BIGSERIAL PRIMARY KEY,
    user_id BIGINT NOT NULL UNIQUE REFERENCES users(id) ON DELETE CASCADE,
    dob DATE,
    gender VARCHAR(50),
    address VARCHAR(255),
    city VARCHAR(100),
    state VARCHAR(100),
    pincode VARCHAR(20),
    tenth_board VARCHAR(100),
    tenth_year INTEGER,
    tenth_percentage DOUBLE PRECISION,
    twelfth_board VARCHAR(100),
    twelfth_year INTEGER,
    twelfth_percentage DOUBLE PRECISION,
    grad_university VARCHAR(100),
    grad_year INTEGER,
    grad_cgpa DOUBLE PRECISION,
    pg_university VARCHAR(100),
    pg_year INTEGER,
    pg_cgpa DOUBLE PRECISION,
    primary_skills VARCHAR(255),
    secondary_skills VARCHAR(255),
    certifications VARCHAR(255),
    resume_file_name VARCHAR(255),
    resume_file_type VARCHAR(100),
    resume_data BYTEA,
    pref_location_1_id BIGINT REFERENCES locations(id) ON DELETE SET NULL,
    pref_location_2_id BIGINT REFERENCES locations(id) ON DELETE SET NULL,
    pref_location_3_id BIGINT REFERENCES locations(id) ON DELETE SET NULL,
    completed BOOLEAN NOT NULL DEFAULT FALSE
);

-- ─── BGC Documents ──────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS bgc_documents (
    id BIGSERIAL PRIMARY KEY,
    bgc_case_id BIGINT NOT NULL REFERENCES background_verifications(id) ON DELETE CASCADE,
    candidate_id BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    application_id BIGINT NOT NULL REFERENCES job_applications(id) ON DELETE CASCADE,
    document_type VARCHAR(100) NOT NULL,
    file_name VARCHAR(255) NOT NULL,
    file_type VARCHAR(100) NOT NULL,
    file_size BIGINT NOT NULL,
    file_data BYTEA NOT NULL,
    status VARCHAR(50) NOT NULL DEFAULT 'PENDING',
    remarks VARCHAR(255),
    uploaded_at TIMESTAMP(6) NOT NULL DEFAULT NOW(),
    reviewed_by BIGINT REFERENCES users(id) ON DELETE SET NULL,
    reviewed_at TIMESTAMP(6)
);

-- ─── BGC Vendor Requests ──────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS bgc_vendor_requests (
    id BIGSERIAL PRIMARY KEY,
    bgc_case_id BIGINT NOT NULL REFERENCES background_verifications(id) ON DELETE CASCADE,
    candidate_id BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    application_id BIGINT NOT NULL REFERENCES job_applications(id) ON DELETE CASCADE,
    vendor_name VARCHAR(255) NOT NULL,
    vendor_link VARCHAR(255),
    request_payload TEXT,
    sent_by BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    sent_at TIMESTAMP(6) NOT NULL DEFAULT NOW(),
    status VARCHAR(50) NOT NULL,
    remarks VARCHAR(255)
);

-- ─── Employees ──────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS employees (
    id BIGSERIAL PRIMARY KEY,
    employee_id VARCHAR(50) NOT NULL UNIQUE,
    user_id BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    application_id BIGINT NOT NULL REFERENCES job_applications(id) ON DELETE CASCADE,
    created_at TIMESTAMP(6) NOT NULL DEFAULT NOW()
);

-- ─── Selected Users ──────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS selected_users (
    id BIGSERIAL PRIMARY KEY,
    user_id BIGINT NOT NULL UNIQUE REFERENCES users(id) ON DELETE CASCADE,
    application_id BIGINT NOT NULL UNIQUE REFERENCES job_applications(id) ON DELETE CASCADE,
    employee_id VARCHAR(50) NOT NULL REFERENCES employees(employee_id) ON DELETE CASCADE,
    created_at TIMESTAMP(6) NOT NULL DEFAULT NOW()
);

-- ─── Trainings ───────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS trainings (
    id BIGSERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL UNIQUE,
    cost_per_candidate DOUBLE PRECISION NOT NULL DEFAULT 0.0,
    cutoff_score DOUBLE PRECISION NOT NULL DEFAULT 60.0,
    minimum_attendance_percentage DOUBLE PRECISION NOT NULL DEFAULT 75.0
);

-- ─── Training Blocks ────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS training_blocks (
    id BIGSERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    location_id BIGINT NOT NULL REFERENCES locations(id) ON DELETE CASCADE,
    capacity INTEGER NOT NULL DEFAULT 60,
    occupied_seats INTEGER NOT NULL DEFAULT 0,
    UNIQUE (name, location_id)
);

-- ─── Joining Batches ────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS joining_batches (
    id BIGSERIAL PRIMARY KEY,
    batch_code VARCHAR(100) NOT NULL UNIQUE,
    batch_name VARCHAR(255) NOT NULL,
    role VARCHAR(100) NOT NULL DEFAULT 'System Engineer',
    joining_date DATE NOT NULL,
    joining_location_id BIGINT NOT NULL REFERENCES locations(id) ON DELETE CASCADE,
    training_location_id BIGINT NOT NULL REFERENCES locations(id) ON DELETE CASCADE,
    training_id BIGINT NOT NULL REFERENCES trainings(id) ON DELETE CASCADE,
    block_id BIGINT NOT NULL REFERENCES training_blocks(id) ON DELETE CASCADE,
    batch_size INTEGER NOT NULL DEFAULT 60,
    max_headcount INTEGER NOT NULL DEFAULT 60,
    current_headcount INTEGER NOT NULL DEFAULT 0,
    status VARCHAR(50) NOT NULL DEFAULT 'CREATED',
    created_by BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    created_at TIMESTAMP(6) NOT NULL DEFAULT NOW()
);

-- ─── Joining Batch Candidates ───────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS joining_batch_candidates (
    id BIGSERIAL PRIMARY KEY,
    batch_id BIGINT NOT NULL REFERENCES joining_batches(id) ON DELETE CASCADE,
    user_id BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    application_id BIGINT NOT NULL REFERENCES job_applications(id) ON DELETE CASCADE,
    employee_id VARCHAR(50) NOT NULL,
    selected_user_id BIGINT REFERENCES selected_users(id) ON DELETE SET NULL,
    status VARCHAR(50) NOT NULL DEFAULT 'ASSIGNED',
    UNIQUE (batch_id, user_id)
);

-- ─── Release Records ────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS release_records (
    id BIGSERIAL PRIMARY KEY,
    trainee_id BIGINT NOT NULL REFERENCES trainees(id) ON DELETE CASCADE,
    released_by BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    released_at TIMESTAMP(6) NOT NULL DEFAULT NOW(),
    remarks VARCHAR(255),
    allocated BOOLEAN NOT NULL DEFAULT FALSE
);

-- ─── Bulk Upload Logs ───────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS bulk_upload_logs (
    id BIGSERIAL PRIMARY KEY,
    upload_type VARCHAR(100) NOT NULL,
    file_name VARCHAR(255) NOT NULL,
    uploaded_by BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    uploaded_at TIMESTAMP(6) NOT NULL DEFAULT NOW(),
    total_rows INTEGER NOT NULL DEFAULT 0,
    success_rows INTEGER NOT NULL DEFAULT 0,
    failed_rows INTEGER NOT NULL DEFAULT 0,
    status VARCHAR(50) NOT NULL DEFAULT 'COMPLETED',
    remarks VARCHAR(255)
);

-- ─── Bulk Upload Error Rows ─────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS bulk_upload_error_rows (
    id BIGSERIAL PRIMARY KEY,
    upload_log_id BIGINT NOT NULL REFERENCES bulk_upload_logs(id) ON DELETE CASCADE,
    row_number INTEGER NOT NULL,
    identifier VARCHAR(255),
    error_message VARCHAR(255) NOT NULL,
    raw_data TEXT
);

-- ─── Action Audit Logs ──────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS action_audit_logs (
    id BIGSERIAL PRIMARY KEY,
    action_type VARCHAR(255) NOT NULL,
    description TEXT NOT NULL,
    performed_by BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    performed_at TIMESTAMP(6) NOT NULL DEFAULT NOW()
);

-- ─── Alter Existing Tables ──────────────────────────────────────────────────
-- Add batch_id to joining_letters
ALTER TABLE joining_letters ADD COLUMN IF NOT EXISTS batch_id BIGINT REFERENCES joining_batches(id) ON DELETE SET NULL;

-- Alter trainees table to support the enhanced fields
ALTER TABLE trainees ADD COLUMN IF NOT EXISTS batch_id BIGINT REFERENCES joining_batches(id) ON DELETE SET NULL;
ALTER TABLE trainees ADD COLUMN IF NOT EXISTS training_id BIGINT REFERENCES trainings(id) ON DELETE SET NULL;
ALTER TABLE trainees ADD COLUMN IF NOT EXISTS block_id BIGINT REFERENCES training_blocks(id) ON DELETE SET NULL;
ALTER TABLE trainees ADD COLUMN IF NOT EXISTS employee_id VARCHAR(50);
ALTER TABLE trainees ADD COLUMN IF NOT EXISTS selected_user_id BIGINT REFERENCES selected_users(id) ON DELETE SET NULL;
ALTER TABLE trainees ADD COLUMN IF NOT EXISTS score DOUBLE PRECISION;
ALTER TABLE trainees ADD COLUMN IF NOT EXISTS attendance_percentage DOUBLE PRECISION;
ALTER TABLE trainees ADD COLUMN IF NOT EXISTS final_result VARCHAR(50);
ALTER TABLE trainees ADD COLUMN IF NOT EXISTS status VARCHAR(50) DEFAULT 'IN_PROGRESS';
ALTER TABLE trainees ADD COLUMN IF NOT EXISTS lap_enabled BOOLEAN NOT NULL DEFAULT FALSE;
ALTER TABLE trainees ADD COLUMN IF NOT EXISTS remarks VARCHAR(255);
ALTER TABLE trainees ADD COLUMN IF NOT EXISTS released BOOLEAN NOT NULL DEFAULT FALSE;
ALTER TABLE trainees ADD COLUMN IF NOT EXISTS flagged BOOLEAN NOT NULL DEFAULT FALSE;
ALTER TABLE trainees ADD COLUMN IF NOT EXISTS flag_reason VARCHAR(255);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_candidate_profile_user ON candidate_profiles(user_id);
CREATE INDEX IF NOT EXISTS idx_bgc_docs_case ON bgc_documents(bgc_case_id);
CREATE INDEX IF NOT EXISTS idx_employees_id ON employees(employee_id);
CREATE INDEX IF NOT EXISTS idx_selected_users_emp ON selected_users(employee_id);
CREATE INDEX IF NOT EXISTS idx_joining_batch_cand_batch ON joining_batch_candidates(batch_id);
CREATE INDEX IF NOT EXISTS idx_release_records_trainee ON release_records(trainee_id);
