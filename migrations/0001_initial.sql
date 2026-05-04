CREATE TABLE IF NOT EXISTS parts (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  sku TEXT NOT NULL DEFAULT '',
  color TEXT NOT NULL,
  material TEXT NOT NULL,
  inventory_qty INTEGER NOT NULL DEFAULT 0,
  min_stock INTEGER NOT NULL DEFAULT 0,
  print_time_minutes INTEGER NOT NULL DEFAULT 0,
  image_ref TEXT NOT NULL DEFAULT '',
  file_ref TEXT NOT NULL DEFAULT '',
  notes TEXT NOT NULL DEFAULT ''
);

CREATE TABLE IF NOT EXISTS products (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  sku TEXT NOT NULL DEFAULT '',
  active INTEGER NOT NULL DEFAULT 1,
  requires_assembly INTEGER NOT NULL DEFAULT 1,
  finished_stock INTEGER NOT NULL DEFAULT 0,
  target_stock INTEGER NOT NULL DEFAULT 0,
  image_ref TEXT NOT NULL DEFAULT '',
  notes TEXT NOT NULL DEFAULT ''
);

CREATE TABLE IF NOT EXISTS product_requirements (
  product_id TEXT NOT NULL,
  part_id TEXT NOT NULL,
  quantity INTEGER NOT NULL DEFAULT 1,
  sort_order INTEGER NOT NULL DEFAULT 0,
  PRIMARY KEY (product_id, part_id),
  FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE,
  FOREIGN KEY (part_id) REFERENCES parts(id) ON DELETE RESTRICT
);

CREATE TABLE IF NOT EXISTS printers (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  model TEXT NOT NULL DEFAULT '',
  color TEXT NOT NULL,
  material TEXT NOT NULL,
  active INTEGER NOT NULL DEFAULT 1,
  notes TEXT NOT NULL DEFAULT ''
);

CREATE TABLE IF NOT EXISTS print_state (
  part_id TEXT PRIMARY KEY,
  planned_qty INTEGER NOT NULL DEFAULT 0,
  in_progress_qty INTEGER NOT NULL DEFAULT 0,
  failed_qty INTEGER NOT NULL DEFAULT 0,
  updated_at TEXT NOT NULL DEFAULT '',
  FOREIGN KEY (part_id) REFERENCES parts(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS completed_prints (
  id TEXT PRIMARY KEY,
  part_id TEXT NOT NULL,
  quantity INTEGER NOT NULL DEFAULT 0,
  completed_at TEXT NOT NULL,
  FOREIGN KEY (part_id) REFERENCES parts(id) ON DELETE RESTRICT
);

CREATE INDEX IF NOT EXISTS idx_product_requirements_product_id
  ON product_requirements(product_id, sort_order);

CREATE INDEX IF NOT EXISTS idx_completed_prints_completed_at
  ON completed_prints(completed_at DESC);
