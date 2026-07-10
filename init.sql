CREATE TABLE IF NOT EXISTS users (
    id TEXT PRIMARY KEY,
    email TEXT NOT NULL,
    email_hash TEXT UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,
    username TEXT,
    avatar_url TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE UNIQUE INDEX IF NOT EXISTS users_email_hash_uidx ON users (email_hash) WHERE email_hash IS NOT NULL;

CREATE TABLE IF NOT EXISTS redirects (
    id TEXT PRIMARY KEY,
    url TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    clicks INTEGER DEFAULT 0,
    user_id TEXT REFERENCES users(id),
    version TEXT DEFAULT 'dash',
    expires_at TIMESTAMP,
    countdown_seconds INTEGER DEFAULT 5
);

CREATE INDEX IF NOT EXISTS redirects_user_id_idx ON redirects (user_id);

CREATE TABLE IF NOT EXISTS redirect_click_events (
    id BIGSERIAL PRIMARY KEY,
    redirect_id TEXT NOT NULL REFERENCES redirects(id) ON DELETE CASCADE,
    clicked_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    referrer_host TEXT,
    source_type TEXT,
    country_code TEXT,
    user_agent TEXT,
    ip_address TEXT,
    language TEXT,
    device_type TEXT,
    os_name TEXT,
    browser_name TEXT,
    city TEXT,
    region TEXT,
    timezone TEXT,
    screen_resolution TEXT,
    viewport_size TEXT,
    interpage_time_ms INTEGER,
    connection_type TEXT,
    color_scheme TEXT,
    device_memory REAL,
    hardware_concurrency INTEGER,
    is_bot BOOLEAN DEFAULT FALSE,
    referrer_url TEXT,
    asn TEXT
);

CREATE INDEX IF NOT EXISTS redirect_click_events_redirect_id_idx ON redirect_click_events (redirect_id);
CREATE INDEX IF NOT EXISTS redirect_click_events_clicked_at_idx ON redirect_click_events (clicked_at);
CREATE INDEX IF NOT EXISTS redirect_click_events_source_type_idx ON redirect_click_events (source_type);
CREATE INDEX IF NOT EXISTS redirect_click_events_referrer_host_idx ON redirect_click_events (referrer_host);
CREATE INDEX IF NOT EXISTS redirect_click_events_device_type_idx ON redirect_click_events (device_type);
CREATE INDEX IF NOT EXISTS redirect_click_events_browser_name_idx ON redirect_click_events (browser_name);

CREATE TABLE IF NOT EXISTS redirect_wait_events (
    id BIGSERIAL PRIMARY KEY,
    redirect_id TEXT NOT NULL REFERENCES redirects(id) ON DELETE CASCADE,
    event_token TEXT NOT NULL UNIQUE,
    status TEXT NOT NULL DEFAULT 'pending',
    started_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE UNIQUE INDEX IF NOT EXISTS redirect_wait_events_event_token_uidx ON redirect_wait_events (event_token);
CREATE INDEX IF NOT EXISTS redirect_wait_events_redirect_id_idx ON redirect_wait_events (redirect_id);
CREATE INDEX IF NOT EXISTS redirect_wait_events_status_idx ON redirect_wait_events (status);
