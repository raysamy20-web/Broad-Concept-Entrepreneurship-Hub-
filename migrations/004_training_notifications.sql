CREATE TABLE IF NOT EXISTS training_notifications (
  id INTEGER PRIMARY KEY,
  staff_id INTEGER NOT NULL,
  schedule_change_request_id INTEGER NOT NULL,
  message TEXT NOT NULL,
  read_at TEXT,
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY(staff_id) REFERENCES staff(id),
  FOREIGN KEY(schedule_change_request_id) REFERENCES schedule_change_requests(id)
);

CREATE INDEX IF NOT EXISTS training_notifications_staff_unread
ON training_notifications(staff_id, read_at, created_at);
