CREATE TABLE IF NOT EXISTS part_inventory_movements (
  id TEXT PRIMARY KEY,
  part_id TEXT NOT NULL,
  delta_qty INTEGER NOT NULL,
  reason TEXT NOT NULL,
  reference_type TEXT NOT NULL DEFAULT '',
  reference_id TEXT NOT NULL DEFAULT '',
  note TEXT NOT NULL DEFAULT '',
  actor TEXT NOT NULL DEFAULT '',
  created_at TEXT NOT NULL,
  FOREIGN KEY (part_id) REFERENCES parts(id) ON DELETE RESTRICT
);

CREATE TABLE IF NOT EXISTS finished_inventory_movements (
  id TEXT PRIMARY KEY,
  product_id TEXT NOT NULL,
  delta_qty INTEGER NOT NULL,
  reason TEXT NOT NULL,
  reference_type TEXT NOT NULL DEFAULT '',
  reference_id TEXT NOT NULL DEFAULT '',
  note TEXT NOT NULL DEFAULT '',
  actor TEXT NOT NULL DEFAULT '',
  created_at TEXT NOT NULL,
  FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE RESTRICT
);

CREATE TABLE IF NOT EXISTS print_events (
  id TEXT PRIMARY KEY,
  part_id TEXT NOT NULL,
  action TEXT NOT NULL,
  quantity INTEGER NOT NULL,
  note TEXT NOT NULL DEFAULT '',
  actor TEXT NOT NULL DEFAULT '',
  created_at TEXT NOT NULL,
  FOREIGN KEY (part_id) REFERENCES parts(id) ON DELETE RESTRICT
);

CREATE INDEX IF NOT EXISTS idx_part_inventory_movements_part_created_at
  ON part_inventory_movements(part_id, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_finished_inventory_movements_product_created_at
  ON finished_inventory_movements(product_id, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_print_events_part_created_at
  ON print_events(part_id, created_at DESC);
