-- Missing settings preserve the existing 3D-printed behavior.
CREATE TABLE IF NOT EXISTS part_production_settings (
  part_id TEXT PRIMARY KEY REFERENCES parts(id) ON DELETE CASCADE,
  is_printed INTEGER NOT NULL DEFAULT 1 CHECK (is_printed IN (0, 1))
);
-- Link manual production consumption to the stock entry, without inventing a queue event.
CREATE TABLE IF NOT EXISTS filament_part_stock_movements (
  filament_movement_id TEXT PRIMARY KEY REFERENCES filament_inventory_movements(id) ON DELETE CASCADE,
  part_movement_id TEXT NOT NULL REFERENCES part_inventory_movements(id) ON DELETE RESTRICT
);
