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
    user_id TEXT REFERENCES users(id),
    version TEXT DEFAULT 'dash',
    expires_at TIMESTAMP
);

CREATE INDEX IF NOT EXISTS redirects_user_id_idx ON redirects (user_id);
