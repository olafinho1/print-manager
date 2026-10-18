CREATE TABLE IF NOT EXISTS filaments (
  id TEXT PRIMARY KEY,
  manufacturer TEXT NOT NULL,
  material TEXT NOT NULL,
  color TEXT NOT NULL,
  spool_weight_mg INTEGER NOT NULL CHECK (spool_weight_mg > 0 AND spool_weight_mg <= 9007199254740991 AND spool_weight_mg % 10 = 0),
  stock_mg INTEGER NOT NULL DEFAULT 0 CHECK (typeof(stock_mg) = 'integer' AND abs(stock_mg) <= 9007199254740991 AND stock_mg % 10 = 0)
);
CREATE TABLE IF NOT EXISTS part_filaments (
  part_id TEXT PRIMARY KEY REFERENCES parts(id) ON DELETE CASCADE,
  filament_id TEXT NOT NULL REFERENCES filaments(id) ON DELETE RESTRICT,
  grams_per_unit_mg INTEGER NOT NULL CHECK (grams_per_unit_mg > 0 AND grams_per_unit_mg <= 9007199254740991 AND grams_per_unit_mg % 10 = 0)
);
CREATE TABLE IF NOT EXISTS printer_filaments (
  printer_id TEXT PRIMARY KEY REFERENCES printers(id) ON DELETE CASCADE,
  filament_id TEXT NOT NULL REFERENCES filaments(id) ON DELETE RESTRICT
);
CREATE TABLE IF NOT EXISTS filament_inventory_movements (
  id TEXT PRIMARY KEY,
  filament_id TEXT NOT NULL REFERENCES filaments(id) ON DELETE RESTRICT,
  delta_mg INTEGER NOT NULL CHECK (typeof(delta_mg) = 'integer' AND abs(delta_mg) <= 9007199254740991 AND delta_mg % 10 = 0),
  reason TEXT NOT NULL,
  note TEXT NOT NULL DEFAULT '',
  actor TEXT NOT NULL DEFAULT '',
  created_at TEXT NOT NULL,
  part_id TEXT REFERENCES parts(id) ON DELETE RESTRICT,
  print_event_id TEXT REFERENCES print_events(id) ON DELETE RESTRICT,
  quantity INTEGER NOT NULL DEFAULT 0,
  grams_per_unit_mg INTEGER NOT NULL DEFAULT 0
);
CREATE TABLE IF NOT EXISTS mutation_receipts (
  request_id TEXT PRIMARY KEY,
  fingerprint TEXT NOT NULL,
  entity_key TEXT NOT NULL,
  created_at TEXT NOT NULL,
  precondition_valid INTEGER NOT NULL CHECK (precondition_valid = 1)
);
CREATE INDEX IF NOT EXISTS idx_filament_movements_created ON filament_inventory_movements(filament_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_mutation_receipts_entity ON mutation_receipts(entity_key);
