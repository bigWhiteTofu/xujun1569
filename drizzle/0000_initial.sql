CREATE TABLE IF NOT EXISTS visits (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  event_id TEXT,
  ip TEXT NOT NULL,
  ip_hash TEXT NOT NULL,
  country TEXT,
  region TEXT,
  city TEXT,
  timezone TEXT,
  asn INTEGER,
  organization TEXT,
  user_agent TEXT,
  referrer TEXT,
  path TEXT,
  visited_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE INDEX IF NOT EXISTS idx_visits_ip_hash ON visits(ip_hash);
CREATE INDEX IF NOT EXISTS idx_visits_visited_at ON visits(visited_at);
CREATE UNIQUE INDEX IF NOT EXISTS idx_visits_event_id ON visits(event_id) WHERE event_id IS NOT NULL;

CREATE TABLE IF NOT EXISTS messages (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  ip TEXT NOT NULL,
  ip_hash TEXT NOT NULL,
  country TEXT,
  region TEXT,
  city TEXT,
  display_name TEXT,
  message TEXT NOT NULL,
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE INDEX IF NOT EXISTS idx_messages_ip_hash ON messages(ip_hash);
CREATE INDEX IF NOT EXISTS idx_messages_created_at ON messages(created_at);
