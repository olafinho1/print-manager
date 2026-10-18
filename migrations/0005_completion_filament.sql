-- Preserve outstanding quantities already charged by the earlier Start policy.
-- Zero rows remain as migration markers; completing or failing consumes credits first.
CREATE TABLE IF NOT EXISTS filament_prepaid_prints (
  part_id TEXT PRIMARY KEY REFERENCES parts(id) ON DELETE CASCADE,
  quantity INTEGER NOT NULL DEFAULT 0 CHECK (quantity >= 0)
);
INSERT OR IGNORE INTO filament_prepaid_prints (part_id, quantity)
WITH deltas AS (
  SELECT e.part_id, e.rowid AS event_order,
    CASE WHEN e.action = 'start' THEN COALESCE((
      SELECT SUM(m.quantity) FROM filament_inventory_movements m
      WHERE m.print_event_id = e.id AND m.reason = 'print_started'
    ), 0) WHEN e.action IN ('complete', 'fail') THEN -e.quantity ELSE 0 END AS delta
  FROM print_events e
  WHERE e.part_id IN (SELECT part_id FROM filament_inventory_movements WHERE reason = 'print_started')
    AND NOT EXISTS (SELECT 1 FROM filament_prepaid_prints p WHERE p.part_id = e.part_id)
), running AS (
  SELECT part_id, delta, SUM(delta) OVER (PARTITION BY part_id ORDER BY event_order) AS balance
  FROM deltas
)
SELECT r.part_id, MIN(COALESCE(s.in_progress_qty, 0), MAX(0, SUM(r.delta) - MIN(0, MIN(r.balance))))
FROM running r LEFT JOIN print_state s ON s.part_id = r.part_id
GROUP BY r.part_id;
