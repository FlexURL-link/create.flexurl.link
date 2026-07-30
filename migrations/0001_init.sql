CREATE TABLE IF NOT EXISTS redirects (
    id TEXT PRIMARY KEY,
    url TEXT NOT NULL,
    created_at TEXT DEFAULT (datetime('now')),
    expires_at TEXT
);
