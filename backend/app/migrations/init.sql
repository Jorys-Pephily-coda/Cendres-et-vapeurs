-- ══════════════════════════════════════
-- CENDRES ET VAPEUR — Schéma SQL
-- ══════════════════════════════════════

PRAGMA foreign_keys = ON;

-- ── Auth & Utilisateurs ──────────────
CREATE TABLE IF NOT EXISTS users (
    id           INTEGER PRIMARY KEY AUTOINCREMENT,
    email        TEXT    NOT NULL UNIQUE,
    password_hash TEXT   NOT NULL,
    role         TEXT    NOT NULL DEFAULT 'user'
                         CHECK (role IN ('guest', 'user', 'editor', 'admin')),
    is_verified  INTEGER NOT NULL DEFAULT 0,
    created_at   TEXT    NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS otp_codes (
    id         INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id    INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    code       TEXT    NOT NULL,
    created_at TEXT    NOT NULL DEFAULT (datetime('now')),
    used       INTEGER NOT NULL DEFAULT 0
);

CREATE TABLE IF NOT EXISTS sessions (
    id         INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id    INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    token      TEXT    NOT NULL UNIQUE,
    expires_at TEXT    NOT NULL,
    created_at TEXT    NOT NULL DEFAULT (datetime('now'))
);

-- ── Catalogue ────────────────────────
CREATE TABLE IF NOT EXISTS products (
    id             INTEGER PRIMARY KEY AUTOINCREMENT,
    name           TEXT    NOT NULL,
    description    TEXT,
    price          REAL    NOT NULL CHECK (price >= 0),
    stock          INTEGER NOT NULL DEFAULT 0 CHECK (stock >= 0),
    image_url      TEXT,
    likes          INTEGER NOT NULL DEFAULT 0,
    views          INTEGER NOT NULL DEFAULT 0,
    sales          INTEGER NOT NULL DEFAULT 0,
    price_modifier REAL    NOT NULL DEFAULT 0,
    created_at     TEXT    NOT NULL DEFAULT (datetime('now'))
);

-- ── Votes ─────────────────────────────
CREATE TABLE IF NOT EXISTS votes (
    id         INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id    INTEGER NOT NULL REFERENCES users(id)    ON DELETE CASCADE,
    product_id INTEGER NOT NULL REFERENCES products(id) ON DELETE CASCADE,
    created_at TEXT    NOT NULL DEFAULT (datetime('now')),
    UNIQUE (user_id, product_id)
);

-- ── Codes de réduction ───────────────
CREATE TABLE IF NOT EXISTS discount_codes (
    id       INTEGER PRIMARY KEY AUTOINCREMENT,
    code     TEXT    NOT NULL UNIQUE,
    percent  REAL    NOT NULL CHECK (percent > 0 AND percent <= 100),
    max_uses INTEGER NOT NULL DEFAULT 1,
    uses     INTEGER NOT NULL DEFAULT 0
);

-- ── Commandes ────────────────────────
CREATE TABLE IF NOT EXISTS orders (
    id              INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id         INTEGER NOT NULL REFERENCES users(id) ON DELETE SET NULL,
    total           REAL    NOT NULL,
    discount_amount REAL    NOT NULL DEFAULT 0,
    discount_code   TEXT,
    status          TEXT    NOT NULL DEFAULT 'pending'
                            CHECK (status IN ('pending', 'confirmed', 'shipped', 'cancelled')),
    created_at      TEXT    NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS order_items (
    id         INTEGER PRIMARY KEY AUTOINCREMENT,
    order_id   INTEGER NOT NULL REFERENCES orders(id)   ON DELETE CASCADE,
    product_id INTEGER NOT NULL REFERENCES products(id) ON DELETE SET NULL,
    qty        INTEGER NOT NULL CHECK (qty > 0),
    unit_price REAL    NOT NULL
);

-- ── Calendrier ───────────────────────
CREATE TABLE IF NOT EXISTS events (
    id          INTEGER PRIMARY KEY AUTOINCREMENT,
    title       TEXT NOT NULL,
    description TEXT,
    type        TEXT NOT NULL DEFAULT 'general'
                     CHECK (type IN ('general', 'maintenance', 'supply', 'curfew')),
    date        TEXT NOT NULL,
    created_at  TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS shift_notes (
    id         INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id    INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    date       TEXT    NOT NULL,
    shift      TEXT    NOT NULL CHECK (shift IN ('AM', 'PM')),
    content    TEXT    NOT NULL,
    created_at TEXT    NOT NULL DEFAULT (datetime('now'))
);

-- ── Logs ─────────────────────────────
CREATE TABLE IF NOT EXISTS action_logs (
    id         INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id    INTEGER REFERENCES users(id) ON DELETE SET NULL,
    action     TEXT NOT NULL,
    entity     TEXT,
    created_at TEXT NOT NULL DEFAULT (datetime('now'))
);

-- ── Chat ─────────────────────────────
CREATE TABLE IF NOT EXISTS chat_messages (
    id         INTEGER PRIMARY KEY AUTOINCREMENT,
    sender_id  INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    content    TEXT    NOT NULL,
    created_at TEXT    NOT NULL DEFAULT (datetime('now'))
);

-- Ajouter la table conversation_messages

CREATE TABLE IF NOT EXISTS conversation_messages (
    id           INTEGER PRIMARY KEY AUTOINCREMENT,
    thread_id    TEXT    NOT NULL,
    sender_type  TEXT    NOT NULL CHECK (sender_type IN ('user', 'editor')),
    sender_email TEXT    NOT NULL,
    subject      TEXT,
    content      TEXT    NOT NULL,
    created_at   TEXT    NOT NULL DEFAULT (datetime('now'))
);

CREATE INDEX IF NOT EXISTS idx_thread_id ON conversation_messages(thread_id);
CREATE INDEX IF NOT EXISTS idx_created_at ON conversation_messages(created_at);
