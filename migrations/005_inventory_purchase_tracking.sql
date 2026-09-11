CREATE TABLE IF NOT EXISTS inventory_items (
  id INTEGER PRIMARY KEY,
  name TEXT NOT NULL,
  item_category TEXT NOT NULL CHECK(item_category IN ('Consumable Supply','Equipment')),
  department_id INTEGER,
  stock_quantity INTEGER NOT NULL DEFAULT 0 CHECK(stock_quantity >= 0),
  minimum_stock_level INTEGER,
  equipment_condition TEXT CHECK(equipment_condition IN ('Available','Issued','Under Repair','Unavailable')),
  active INTEGER NOT NULL DEFAULT 1,
  created_by INTEGER NOT NULL,
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY(department_id) REFERENCES departments(id),
  FOREIGN KEY(created_by) REFERENCES staff(id)
);

CREATE TABLE IF NOT EXISTS stock_movements (
  id INTEGER PRIMARY KEY,
  inventory_item_id INTEGER NOT NULL,
  action TEXT NOT NULL CHECK(action IN ('Received','Issued','Adjusted','Unavailable')),
  quantity_change INTEGER NOT NULL,
  note TEXT,
  actor_id INTEGER NOT NULL,
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY(inventory_item_id) REFERENCES inventory_items(id),
  FOREIGN KEY(actor_id) REFERENCES staff(id)
);

CREATE TABLE IF NOT EXISTS new_item_requests (
  id INTEGER PRIMARY KEY,
  department_id INTEGER NOT NULL,
  item_name TEXT NOT NULL,
  item_category TEXT NOT NULL CHECK(item_category IN ('Consumable Supply','Equipment')),
  requested_quantity INTEGER NOT NULL CHECK(requested_quantity > 0),
  purpose TEXT NOT NULL,
  requester_id INTEGER NOT NULL,
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY(department_id) REFERENCES departments(id),
  FOREIGN KEY(requester_id) REFERENCES staff(id)
);

CREATE TABLE IF NOT EXISTS receipt_confirmations (
  id INTEGER PRIMARY KEY,
  inventory_item_id INTEGER NOT NULL,
  department_id INTEGER NOT NULL,
  quantity INTEGER NOT NULL CHECK(quantity > 0),
  confirmed_by INTEGER NOT NULL,
  confirmed_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY(inventory_item_id) REFERENCES inventory_items(id),
  FOREIGN KEY(department_id) REFERENCES departments(id),
  FOREIGN KEY(confirmed_by) REFERENCES staff(id)
);

CREATE TABLE IF NOT EXISTS purchase_follow_ups (
  id INTEGER PRIMARY KEY,
  inventory_item_id INTEGER,
  new_item_request_id INTEGER,
  stage TEXT NOT NULL DEFAULT 'Requested' CHECK(stage IN ('Requested','Ordered','Received','Cancelled')),
  updated_by INTEGER NOT NULL,
  updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY(inventory_item_id) REFERENCES inventory_items(id),
  FOREIGN KEY(new_item_request_id) REFERENCES new_item_requests(id),
  FOREIGN KEY(updated_by) REFERENCES staff(id)
);

CREATE TABLE IF NOT EXISTS inventory_notifications (
  id INTEGER PRIMARY KEY,
  staff_id INTEGER NOT NULL,
  new_item_request_id INTEGER NOT NULL,
  message TEXT NOT NULL,
  read_at TEXT,
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY(staff_id) REFERENCES staff(id),
  FOREIGN KEY(new_item_request_id) REFERENCES new_item_requests(id)
);

CREATE INDEX IF NOT EXISTS inventory_items_department ON inventory_items(department_id, active);
CREATE INDEX IF NOT EXISTS stock_movements_item ON stock_movements(inventory_item_id, created_at);
CREATE INDEX IF NOT EXISTS new_item_requests_department ON new_item_requests(department_id, created_at);
CREATE INDEX IF NOT EXISTS purchase_follow_ups_stage ON purchase_follow_ups(stage, updated_at);
CREATE INDEX IF NOT EXISTS inventory_notifications_staff_unread ON inventory_notifications(staff_id, read_at, created_at);
