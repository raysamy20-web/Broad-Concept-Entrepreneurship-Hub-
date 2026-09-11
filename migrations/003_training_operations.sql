-- Run each statement one at a time in the Cloudflare D1 Console.

CREATE TABLE IF NOT EXISTS programme_calendar_entries (
  id INTEGER PRIMARY KEY,
  title TEXT NOT NULL,
  entry_date TEXT NOT NULL,
  entry_type TEXT NOT NULL,
  department_id INTEGER,
  details TEXT,
  created_by INTEGER NOT NULL,
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY(department_id) REFERENCES departments(id),
  FOREIGN KEY(created_by) REFERENCES staff(id)
);

CREATE TABLE IF NOT EXISTS programme_calendar_activity (
  id INTEGER PRIMARY KEY,
  calendar_entry_id INTEGER NOT NULL,
  actor_id INTEGER NOT NULL,
  action TEXT NOT NULL,
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY(calendar_entry_id) REFERENCES programme_calendar_entries(id),
  FOREIGN KEY(actor_id) REFERENCES staff(id)
);

CREATE TABLE IF NOT EXISTS schedule_change_requests (
  id INTEGER PRIMARY KEY,
  department_id INTEGER NOT NULL,
  current_schedule TEXT NOT NULL,
  requested_change TEXT NOT NULL,
  reason TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'Submitted',
  requester_id INTEGER NOT NULL,
  decision_by INTEGER,
  decision_note TEXT,
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  decided_at TEXT,
  FOREIGN KEY(department_id) REFERENCES departments(id),
  FOREIGN KEY(requester_id) REFERENCES staff(id),
  FOREIGN KEY(decision_by) REFERENCES staff(id)
);

CREATE TABLE IF NOT EXISTS handover_notes (
  id INTEGER PRIMARY KEY,
  department_id INTEGER NOT NULL,
  subject TEXT NOT NULL,
  content TEXT NOT NULL,
  author_id INTEGER NOT NULL,
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY(department_id) REFERENCES departments(id),
  FOREIGN KEY(author_id) REFERENCES staff(id)
);

CREATE TABLE IF NOT EXISTS lesson_reports (
  id INTEGER PRIMARY KEY,
  department_id INTEGER NOT NULL,
  session_date TEXT NOT NULL,
  topic TEXT NOT NULL,
  present_total INTEGER NOT NULL CHECK(present_total >= 0),
  absent_total INTEGER NOT NULL CHECK(absent_total >= 0),
  challenges TEXT,
  next_action TEXT,
  author_id INTEGER NOT NULL,
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY(department_id) REFERENCES departments(id),
  FOREIGN KEY(author_id) REFERENCES staff(id)
);

CREATE INDEX IF NOT EXISTS programme_calendar_entries_date
ON programme_calendar_entries(entry_date);
CREATE INDEX IF NOT EXISTS schedule_change_requests_status
ON schedule_change_requests(status, created_at);
CREATE INDEX IF NOT EXISTS handover_notes_department
ON handover_notes(department_id, created_at);
CREATE INDEX IF NOT EXISTS lesson_reports_department_date
ON lesson_reports(department_id, session_date);
