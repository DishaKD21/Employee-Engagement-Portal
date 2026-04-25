-- DROP SECTION (IMPORTANT for re-run)
DROP TYPE IF EXISTS event_type_enum CASCADE;
DROP TYPE IF EXISTS delivery_status_enum CASCADE;
DROP TYPE IF EXISTS approval_status_enum CASCADE;
DROP TYPE IF EXISTS event_status_enum CASCADE;
DROP TYPE IF EXISTS participation_status_enum CASCADE;
DROP TYPE IF EXISTS query_status_enum CASCADE;
DROP TYPE IF EXISTS content_type_enum CASCADE;
DROP TYPE IF EXISTS notification_status_enum CASCADE;
DROP TYPE IF EXISTS notification_channel_enum CASCADE;
DROP TYPE IF EXISTS notification_type_enum CASCADE;

DROP TABLE IF EXISTS notifications CASCADE;
DROP TABLE IF EXISTS audit_logs CASCADE;
DROP TABLE IF EXISTS approvals CASCADE;
DROP TABLE IF EXISTS query_escalations CASCADE;
DROP TABLE IF EXISTS query_logs CASCADE;
DROP TABLE IF EXISTS knowledge_base_articles CASCADE;
DROP TABLE IF EXISTS survey_answers CASCADE;
DROP TABLE IF EXISTS survey_responses CASCADE;
DROP TABLE IF EXISTS survey_questions CASCADE;
DROP TABLE IF EXISTS surveys CASCADE;
DROP TABLE IF EXISTS event_participants CASCADE;
DROP TABLE IF EXISTS engagement_events CASCADE;
DROP TABLE IF EXISTS recognition_delivery_logs CASCADE;
DROP TABLE IF EXISTS recognition_events CASCADE;
DROP TABLE IF EXISTS recognition_templates CASCADE;
DROP TABLE IF EXISTS employees CASCADE;

-- ENUM TYPES
CREATE TYPE event_type_enum AS ENUM ('birthday', 'anniversary', 'other');
CREATE TYPE delivery_status_enum AS ENUM ('pending', 'success', 'failed');
CREATE TYPE approval_status_enum AS ENUM ('pending', 'approved', 'rejected');
CREATE TYPE event_status_enum AS ENUM ('draft', 'published', 'completed');
CREATE TYPE participation_status_enum AS ENUM ('registered', 'participated', 'absent');
CREATE TYPE query_status_enum AS ENUM ('open', 'resolved');
CREATE TYPE content_type_enum AS ENUM ('event', 'survey', 'article', 'template');

CREATE TYPE notification_status_enum AS ENUM ('pending', 'sent', 'failed');
CREATE TYPE notification_channel_enum AS ENUM ('email', 'chat', 'intranet');
CREATE TYPE notification_type_enum AS ENUM (
    'recognition',
    'event',
    'survey',
    'query_response',
    'system'
);

-- 1. EMPLOYEES
CREATE TABLE employees (
    employee_id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(150) UNIQUE NOT NULL,
    date_of_birth DATE NOT NULL,
    joining_date DATE NOT NULL,
    department VARCHAR(100),
    role VARCHAR(100),
    location VARCHAR(100),
    language VARCHAR(50),
    time_zone VARCHAR(50),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 2. RECOGNITION TEMPLATE
CREATE TABLE recognition_templates (
    template_id SERIAL PRIMARY KEY,
    template_name VARCHAR(100),
    event_type event_type_enum,
    content TEXT,
    version INT,
    is_active BOOLEAN DEFAULT TRUE,
    created_by INT,
    approved_status approval_status_enum DEFAULT 'pending',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);


-- 3. RECOGNITION EVENTS
CREATE TABLE recognition_events (
    event_id SERIAL PRIMARY KEY,
    employee_id INT REFERENCES employees(employee_id),
    event_type event_type_enum,
    trigger_date DATE,
    template_id INT REFERENCES recognition_templates(template_id),
    delivery_status delivery_status_enum DEFAULT 'pending',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 4. RECOGNITION DELIVERY LOGS
CREATE TABLE recognition_delivery_logs (
    id SERIAL PRIMARY KEY,
    event_id INT REFERENCES recognition_events(event_id) ON DELETE CASCADE,
    channel notification_channel_enum, -- email/chat/intranet
    delivery_status delivery_status_enum,
    retry_count INT DEFAULT 0,
    delivered_at TIMESTAMP
);

-- 5. ENGAGEMENT EVENTS
CREATE TABLE engagement_events (
    event_id SERIAL PRIMARY KEY,
    event_name VARCHAR(150),
    event_type VARCHAR(50),
    description TEXT,
    target_audience VARCHAR(100),
    registration_start DATE,
    registration_end DATE,
    event_date DATE,
    published_date DATE,
    status event_status_enum DEFAULT 'draft',
    created_by INT,
    approved_status approval_status_enum DEFAULT 'pending'
);

-- 6. EVENT PARTICIPANTS
CREATE TABLE event_participants (
    id SERIAL PRIMARY KEY,
    event_id INT REFERENCES engagement_events(event_id) ON DELETE CASCADE,
    employee_id INT REFERENCES employees(employee_id),
    registration_status BOOLEAN DEFAULT FALSE,
    participation_status participation_status_enum,
    feedback_rating FLOAT,
    feedback_text TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    -- prevent duplicate registration
    UNIQUE (event_id, employee_id)
);

-- 7. SURVEYS
CREATE TABLE surveys (
    survey_id SERIAL PRIMARY KEY,
    title VARCHAR(200),
    target_audience VARCHAR(100),
    open_date DATE,
    close_date DATE,
    is_anonymous BOOLEAN DEFAULT TRUE,
    created_by INT,
    approved_status approval_status_enum DEFAULT 'pending',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    -- validation
    CHECK (open_date <= close_date)
);

-- 8. SURVEY QUESTIONS
CREATE TABLE survey_questions (
    question_id SERIAL PRIMARY KEY,
    survey_id INT REFERENCES surveys(survey_id) ON DELETE CASCADE,
    question_text TEXT,
    question_type VARCHAR(50), -- mcq/rating/text
    options JSONB,

    CHECK (question_type IN ('mcq', 'rating', 'text'))
);

-- 9. SURVEY RESPONSES
CREATE TABLE survey_responses (
    response_id SERIAL PRIMARY KEY,
    survey_id INT REFERENCES surveys(survey_id) ON DELETE CASCADE,
    employee_id INT REFERENCES employees(employee_id),
    submitted_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 10. SURVEY ANSWERS
CREATE TABLE survey_answers (
    id SERIAL PRIMARY KEY,
    response_id INT REFERENCES survey_responses(response_id) ON DELETE CASCADE,
    question_id INT REFERENCES survey_questions(question_id),
    answer_text TEXT
);

-- 11. KNOWLEDGE BASE ARTICLES
CREATE TABLE knowledge_base_articles (
    article_id SERIAL PRIMARY KEY,
    title VARCHAR(200),
    content TEXT,
    category VARCHAR(100),
    role_tag VARCHAR(100),
    author INT,
    version INT,
    status VARCHAR(50), -- draft/approved/published
    last_reviewed_date DATE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 12. QUERY LOGS
CREATE TABLE query_logs (
    query_id SERIAL PRIMARY KEY,
    employee_id INT REFERENCES employees(employee_id),
    query_text TEXT,
    matched_article_id INT REFERENCES knowledge_base_articles(article_id),
    confidence_score FLOAT,
    response_delivered TEXT,
    escalation_flag BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 13. QUERY ESCALATIONS
CREATE TABLE query_escalations (
    id SERIAL PRIMARY KEY,
    query_id INT REFERENCES query_logs(query_id) ON DELETE CASCADE,
    assigned_to INT,
    status query_status_enum DEFAULT 'open',
    resolution_text TEXT,
    resolved_at TIMESTAMP
);

-- 14. APPROVALS
CREATE TABLE approvals (
    approval_id SERIAL PRIMARY KEY,
    content_type content_type_enum,
    content_id INT,
    status approval_status_enum DEFAULT 'pending',
    reviewer_id INT,
    comments TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 15. AUDIT LOGS
CREATE TABLE audit_logs (
    log_id SERIAL PRIMARY KEY,
    event_type VARCHAR(100),
    employee_id INT,
    content_id INT,
    channel VARCHAR(50),
    outcome VARCHAR(100),
    reviewer_decision VARCHAR(50),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 16. Notifications
CREATE TABLE notifications (
    notification_id SERIAL PRIMARY KEY,

    employee_id INT REFERENCES employees(employee_id),

    title VARCHAR(200),
    message TEXT,

    notification_type notification_type_enum,

    related_id INT,
    related_type VARCHAR(50), 

    channel notification_channel_enum,

    status notification_status_enum DEFAULT 'pending',

    retry_count INT DEFAULT 0,

    sent_at TIMESTAMP,
    read_at TIMESTAMP,

    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- INDEX (performance)
CREATE INDEX idx_notifications_employee 
ON notifications(employee_id);

CREATE INDEX idx_event_participants_event 
ON event_participants(event_id);

CREATE INDEX idx_query_logs_employee 
ON query_logs(employee_id);