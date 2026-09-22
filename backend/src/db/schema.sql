CREATE TABLE IF NOT EXISTS projects (
    id VARCHAR(64) PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    base_url TEXT NOT NULL,
    description TEXT,
    env_vars JSONB DEFAULT '{}',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS test_suites (
    id VARCHAR(64) PRIMARY KEY,
    project_id VARCHAR(64) REFERENCES projects(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    type VARCHAR(64) NOT NULL,
    description TEXT,
    test_file VARCHAR(255) NOT NULL,
    project VARCHAR(64) NOT NULL,
    target_url TEXT,
    code TEXT,
    tags TEXT[] DEFAULT '{}',
    is_system BOOLEAN DEFAULT false,
    schedule_cron VARCHAR(100),
    is_scheduled_enabled BOOLEAN DEFAULT false,
    last_scheduled_run TIMESTAMPTZ,
    environment_profile VARCHAR(50) DEFAULT 'default',
    workers_count INTEGER DEFAULT 1,
    retry_count INTEGER DEFAULT 1,
    test_dataset JSONB,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS test_runs (
    id VARCHAR(64) PRIMARY KEY,
    project_id VARCHAR(64) REFERENCES projects(id) ON DELETE CASCADE,
    suite_id VARCHAR(128) NOT NULL,
    suite_name VARCHAR(255) NOT NULL,
    type VARCHAR(64) NOT NULL,
    status VARCHAR(32) NOT NULL DEFAULT 'running',
    start_time TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    end_time TIMESTAMPTZ,
    duration_ms INTEGER DEFAULT 0,
    total_tests INTEGER DEFAULT 0,
    passed_tests INTEGER DEFAULT 0,
    failed_tests INTEGER DEFAULT 0,
    skipped_tests INTEGER DEFAULT 0,
    triggered_by VARCHAR(64) DEFAULT 'manual',
    environment VARCHAR(50) DEFAULT 'default',
    workers INTEGER DEFAULT 1,
    retries INTEGER DEFAULT 1,
    is_flaky BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS test_results (
    id VARCHAR(64) PRIMARY KEY,
    run_id VARCHAR(64) NOT NULL REFERENCES test_runs(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    project VARCHAR(128) NOT NULL,
    file VARCHAR(255) NOT NULL,
    status VARCHAR(32) NOT NULL,
    duration_ms INTEGER DEFAULT 0,
    error_message TEXT,
    error_stack TEXT,
    screenshot_url TEXT,
    before_screenshot_url TEXT,
    video_url TEXT,
    response_status INTEGER,
    response_body TEXT,
    response_headers JSONB,
    request_payload TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS test_logs (
    id SERIAL PRIMARY KEY,
    run_id VARCHAR(64) NOT NULL REFERENCES test_runs(id) ON DELETE CASCADE,
    stream VARCHAR(16) NOT NULL DEFAULT 'stdout',
    message TEXT NOT NULL,
    timestamp TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_test_runs_status ON test_runs(status);
CREATE INDEX IF NOT EXISTS idx_test_runs_start_time ON test_runs(start_time DESC);
CREATE INDEX IF NOT EXISTS idx_test_results_run_id ON test_results(run_id);
CREATE INDEX IF NOT EXISTS idx_test_logs_run_id ON test_logs(run_id);
