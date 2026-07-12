CREATE TABLE IF NOT EXISTS sales_orders (
  id TEXT PRIMARY KEY,
  order_number TEXT NOT NULL,
  order_date TEXT NOT NULL,
  source TEXT NOT NULL DEFAULT 'manual',
  external_id TEXT NOT NULL DEFAULT '',
  status TEXT NOT NULL DEFAULT 'open',
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL,
  created_by TEXT NOT NULL DEFAULT '',
  updated_by TEXT NOT NULL DEFAULT '',
  packed_at TEXT NOT NULL DEFAULT '',
  packed_by TEXT NOT NULL DEFAULT '',
  cancelled_at TEXT NOT NULL DEFAULT '',
  cancelled_by TEXT NOT NULL DEFAULT '',
  CHECK (status IN ('open', 'packed', 'cancelled')),
  UNIQUE (source, order_number)
);

CREATE TABLE IF NOT EXISTS sales_order_items (
  order_id TEXT NOT NULL,
  product_id TEXT NOT NULL,
  product_name TEXT NOT NULL DEFAULT '',
  product_sku TEXT NOT NULL DEFAULT '',
  quantity INTEGER NOT NULL,
  fulfilled_quantity INTEGER NOT NULL DEFAULT 0,
  sort_order INTEGER NOT NULL DEFAULT 0,
  PRIMARY KEY (order_id, product_id),
  FOREIGN KEY (order_id) REFERENCES sales_orders(id) ON DELETE CASCADE,
  FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE RESTRICT,
  CHECK (quantity > 0),
  CHECK (fulfilled_quantity >= 0 AND fulfilled_quantity <= quantity)
);

CREATE TABLE IF NOT EXISTS sales_order_events (
  id TEXT PRIMARY KEY,
  order_id TEXT NOT NULL,
  action TEXT NOT NULL,
  note TEXT NOT NULL DEFAULT '',
  actor TEXT NOT NULL DEFAULT '',
  created_at TEXT NOT NULL,
  FOREIGN KEY (order_id) REFERENCES sales_orders(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_sales_orders_status_date
  ON sales_orders(status, order_date, created_at);

CREATE INDEX IF NOT EXISTS idx_sales_order_items_product
  ON sales_order_items(product_id, order_id);

CREATE INDEX IF NOT EXISTS idx_sales_order_events_order_created
  ON sales_order_events(order_id, created_at DESC);

CREATE UNIQUE INDEX IF NOT EXISTS idx_sales_order_single_pack
  ON sales_order_events(order_id, action)
  WHERE action = 'packed';

CREATE UNIQUE INDEX IF NOT EXISTS idx_sales_order_single_close
  ON sales_order_events(order_id)
  WHERE action IN ('packed', 'cancelled');
