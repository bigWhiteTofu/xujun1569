ALTER TABLE visits ADD COLUMN event_id TEXT;
CREATE UNIQUE INDEX IF NOT EXISTS idx_visits_event_id ON visits(event_id) WHERE event_id IS NOT NULL;
ALTER TABLE messages ADD COLUMN display_name TEXT;
