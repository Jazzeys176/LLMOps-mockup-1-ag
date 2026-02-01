-- Smart Factory AI LLMOps Platform - Delta Lake Schemas

-- 1. Traces Table
CREATE TABLE IF NOT EXISTS traces (
    trace_id STRING PRIMARY KEY,
    timestamp TIMESTAMP,
    session_id STRING,
    trace_name STRING,
    user_id STRING,
    input TEXT,
    output TEXT,
    latency_ms DOUBLE,
    tokens_total INT,
    tokens_input INT,
    tokens_output INT,
    cost DOUBLE,
    model STRING,
    status STRING,
    metadata MAP<STRING, STRING>,
    created_at TIMESTAMP
) USING DELTA
PARTITIONED BY (DATE(timestamp));

-- Optimize for ID lookups
OPTIMIZE traces ZORDER BY (trace_id, user_id);

-- 2. Sessions Table
CREATE TABLE IF NOT EXISTS sessions (
    session_id STRING PRIMARY KEY,
    user_id STRING,
    trace_count INT,
    total_tokens INT,
    total_cost DOUBLE,
    created_at TIMESTAMP,
    last_activity TIMESTAMP,
    metadata MAP<STRING, STRING>
) USING DELTA;

-- 3. Evaluations Table
CREATE TABLE IF NOT EXISTS evaluations (
    evaluation_id STRING PRIMARY KEY,
    trace_id STRING,
    evaluator_name STRING,
    evaluator_version STRING,
    score_name STRING,
    score_value DOUBLE,
    score_metadata MAP<STRING, STRING>,
    duration_ms DOUBLE,
    status STRING,
    timestamp TIMESTAMP,
    FOREIGN KEY (trace_id) REFERENCES traces(trace_id)
) USING DELTA
PARTITIONED BY (DATE(timestamp));

OPTIMIZE evaluations ZORDER BY (trace_id);

-- 4. Prompts Table
CREATE TABLE IF NOT EXISTS prompts (
    prompt_id STRING PRIMARY KEY,
    prompt_name STRING,
    prompt_text TEXT,
    guidelines TEXT,
    variables ARRAY<STRING>,
    version INT,
    environment STRING,  -- prod/test
    is_active BOOLEAN,
    created_by STRING,
    created_at TIMESTAMP,
    modified_at TIMESTAMP
) USING DELTA;

-- 5. Datasets Table
CREATE TABLE IF NOT EXISTS datasets (
    dataset_id STRING PRIMARY KEY,
    dataset_name STRING,
    description TEXT,
    item_count INT,
    created_at TIMESTAMP,
    modified_at TIMESTAMP
) USING DELTA;

-- 6. Dataset Items Table
CREATE TABLE IF NOT EXISTS dataset_items (
    item_id STRING PRIMARY KEY,
    dataset_id STRING,
    input TEXT,
    expected_output TEXT,
    verification_status STRING,
    metadata MAP<STRING, STRING>,
    FOREIGN KEY (dataset_id) REFERENCES datasets(dataset_id)
) USING DELTA;

-- 7. Annotation Queues Table
CREATE TABLE IF NOT EXISTS annotation_queues (
    queue_id STRING PRIMARY KEY,
    queue_name STRING,
    description TEXT,
    completed_count INT,
    pending_count INT,
    total_count INT,
    score_config MAP<STRING, STRING>,
    is_active BOOLEAN,
    created_at TIMESTAMP
) USING DELTA;

-- 8. Annotation Items Table
CREATE TABLE IF NOT EXISTS annotation_items (
    item_id STRING PRIMARY KEY,
    queue_id STRING,
    trace_id STRING,
    status STRING,  -- pending/completed
    score DOUBLE,
    annotator_id STRING,
    annotation_data MAP<STRING, STRING>,
    created_at TIMESTAMP,
    completed_at TIMESTAMP,
    FOREIGN KEY (queue_id) REFERENCES annotation_queues(queue_id),
    FOREIGN KEY (trace_id) REFERENCES traces(trace_id)
) USING DELTA;

OPTIMIZE annotation_items ZORDER BY (status, queue_id);

-- 9. Alerts Table
CREATE TABLE IF NOT EXISTS alerts (
    alert_id STRING PRIMARY KEY,
    alert_type STRING,
    severity STRING,
    metric_name STRING,
    threshold DOUBLE,
    current_value DOUBLE,
    rule_id STRING,
    status STRING,
    triggered_at TIMESTAMP,
    acknowledged_at TIMESTAMP,
    acknowledged_by STRING
) USING DELTA;

-- 10. Audit Logs Table
CREATE TABLE IF NOT EXISTS audit_logs (
    log_id STRING PRIMARY KEY,
    timestamp TIMESTAMP,
    event_type STRING,
    action STRING,
    user_id STRING,
    details MAP<STRING, STRING>,
    ip_address STRING,
    user_agent STRING
) USING DELTA
PARTITIONED BY (DATE(timestamp));

-- 11. Drift Metrics Table
CREATE TABLE IF NOT EXISTS drift_metrics (
    metric_id STRING PRIMARY KEY,
    metric_name STRING,
    metric_value DOUBLE,
    baseline_value DOUBLE,
    drift_score DOUBLE,
    timestamp TIMESTAMP,
    window_start TIMESTAMP,
    window_end TIMESTAMP
) USING DELTA
PARTITIONED BY (DATE(timestamp));
