-- Run this once in the Cloudflare D1 console for the database bound as PORTAL_DB.

ALTER TABLE requests ADD COLUMN reference_number TEXT;
ALTER TABLE requests ADD COLUMN priority TEXT NOT NULL DEFAULT 'Normal';
ALTER TABLE requests ADD COLUMN is_draft INTEGER NOT NULL DEFAULT 0;
ALTER TABLE requests ADD COLUMN escalated_at TEXT;

CREATE UNIQUE INDEX IF NOT EXISTS requests_reference_number_unique
ON requests(reference_number)
WHERE reference_number IS NOT NULL;

CREATE TABLE IF NOT EXISTS portal_notifications (
  id INTEGER PRIMARY KEY,
  staff_id INTEGER NOT NULL,
  request_id INTEGER NOT NULL,
  message TEXT NOT NULL,
  read_at TEXT,
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY(staff_id) REFERENCES staff(id),
  FOREIGN KEY(request_id) REFERENCES requests(id)
);

CREATE INDEX IF NOT EXISTS portal_notifications_staff_unread
ON portal_notifications(staff_id, read_at, created_at);
