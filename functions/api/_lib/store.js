import { buildDemandModel } from "../../../demand-model.js";
import { gramsToMilligrams, consumptionQuantity, addSampleFilaments } from "../../../filament-model.js";

export class ApiError extends Error {
  constructor(status, message) {
    super(message);
    this.name = "ApiError";
    this.status = status;
  }
}

export const SEED_STATE = {
  parts: [
    {
      id: "part-whimsy-leg-smooth-blue",
      name: "Whimsy smooth leg",
      sku: "WHIM-LEG-S",
      color: "Blue",
      material: "PLA",
      inventoryQty: 14,
      minStock: 10,
      printTimeMinutes: 105,
      imageRef: "",
      fileRef: "models/whimsy_leg_smooth.3mf",
      notes: "Print in packs of 4 with fine top surface.",
    },
    {
      id: "part-whimsy-leg-rough-blue",
      name: "Whimsy rough leg",
      sku: "WHIM-LEG-R",
      color: "Blue",
      material: "PLA",
      inventoryQty: 4,
      minStock: 8,
      printTimeMinutes: 112,
      imageRef: "",
      fileRef: "models/whimsy_leg_rough.3mf",
      notes: "Current jig expects rough set on printer B.",
    },
    {
      id: "part-giggle-body-ivory",
      name: "Giggle body",
      sku: "GIG-BODY",
      color: "Ivory",
      material: "PETG",
      inventoryQty: 2,
      minStock: 4,
      printTimeMinutes: 180,
      imageRef: "",
      fileRef: "models/giggle_body.stl",
      notes: "PETG profile with support blockers.",
    },
    {
      id: "part-giggle-lid-ivory",
      name: "Giggle lid",
      sku: "GIG-LID",
      color: "Ivory",
      material: "PETG",
      inventoryQty: 6,
      minStock: 4,
      printTimeMinutes: 92,
      imageRef: "",
      fileRef: "models/giggle_lid.stl",
      notes: "Fits on same plate as body but often runs separately.",
    },
    {
      id: "part-doodle-spacer-black",
      name: "Doodle spacer",
      sku: "DOOD-SPACER",
      color: "Black",
      material: "PLA",
      inventoryQty: 18,
      minStock: 12,
      printTimeMinutes: 24,
      imageRef: "",
      fileRef: "models/doodle_spacer.stl",
      notes: "Fast print, ideal queue filler.",
    },
    {
      id: "part-rail-clip-orange",
      name: "Rail clip",
      sku: "RAIL-CLIP",
      color: "Orange",
      material: "PETG",
      inventoryQty: 1,
      minStock: 6,
      printTimeMinutes: 48,
      imageRef: "",
      fileRef: "models/rail_clip.stl",
      notes: "Needs PETG cooling override on the first layer.",
    },
  ],
  products: [
    {
      id: "product-smooth-whimsy",
      name: "Smooth Whimsy",
      sku: "WHIM-SMOOTH",
      active: true,
      requiresAssembly: true,
      imageRef: "",
      finishedStock: 3,
      targetStock: 0,
      notes: "Core always-on SKU.",
      partRequirements: [
        {
          partId: "part-whimsy-leg-smooth-blue",
          quantity: 4,
        },
        {
          partId: "part-doodle-spacer-black",
          quantity: 1,
        },
      ],
    },
    {
      id: "product-rough-giggle",
      name: "Rough Giggle",
      sku: "GIG-ROUGH",
      active: true,
      requiresAssembly: true,
      imageRef: "",
      finishedStock: 1,
      targetStock: 0,
      notes: "Usually grouped with the ivory PETG parts run.",
      partRequirements: [
        {
          partId: "part-whimsy-leg-rough-blue",
          quantity: 3,
        },
        {
          partId: "part-giggle-body-ivory",
          quantity: 1,
        },
        {
          partId: "part-giggle-lid-ivory",
          quantity: 1,
        },
      ],
    },
    {
      id: "product-rail-service-kit",
      name: "Rail Service Kit",
      sku: "RAIL-SVC",
      active: true,
      requiresAssembly: true,
      imageRef: "",
      finishedStock: 0,
      targetStock: 0,
      notes: "Blocked mostly by PETG clip inventory.",
      partRequirements: [
        {
          partId: "part-rail-clip-orange",
          quantity: 2,
        },
        {
          partId: "part-doodle-spacer-black",
          quantity: 2,
        },
      ],
    },
    {
      id: "product-legacy-ornament",
      name: "Legacy Ornament",
      sku: "LEG-ORN",
      active: false,
      requiresAssembly: false,
      imageRef: "",
      finishedStock: 0,
      targetStock: 0,
      notes: "Direct single-part SKU tracked with printed stock and packing.",
      partRequirements: [
        {
          partId: "part-giggle-lid-ivory",
          quantity: 1,
        },
      ],
    },
  ],
  printers: [
    {
      id: "printer-prusa-a1",
      name: "Prusa A1",
      model: "MK4",
      color: "Blue",
      material: "PLA",
      active: true,
      notes: "Primary blue PLA lane for core SKUs.",
    },
    {
      id: "printer-prusa-a2",
      name: "Prusa A2",
      model: "MK4",
      color: "Blue",
      material: "PLA",
      active: true,
      notes: "Second blue PLA lane for parallel runs.",
    },
    {
      id: "printer-x1-ivory",
      name: "X1 Ivory",
      model: "X1C",
      color: "Ivory",
      material: "PETG",
      active: true,
      notes: "Ivory PETG setup for bodies and lids.",
    },
    {
      id: "printer-mini-orange",
      name: "Mini Orange",
      model: "A1 Mini",
      color: "Orange",
      material: "PETG",
      active: true,
      notes: "Orange PETG clip queue.",
    },
  ],
  printState: [
    {
      partId: "part-whimsy-leg-smooth-blue",
      plannedQty: 4,
      inProgressQty: 0,
      failedQty: 0,
      updatedAt: "2026-05-03T08:00:00.000Z",
    },
    {
      partId: "part-rail-clip-orange",
      plannedQty: 0,
      inProgressQty: 6,
      failedQty: 0,
      updatedAt: "2026-05-04T08:45:00.000Z",
    },
  ],
  completedPrints: [
    {
      id: "completion-giggle-bodies",
      partId: "part-giggle-body-ivory",
      quantity: 2,
      completedAt: "2026-05-02T05:40:00.000Z",
    },
  ],
  salesOrders: [],
  salesOrderEvents: [],
};

addSampleFilaments(SEED_STATE);

const SCHEMA_STATEMENTS = [
  "CREATE TABLE IF NOT EXISTS parts (id TEXT PRIMARY KEY, name TEXT NOT NULL, sku TEXT NOT NULL DEFAULT '', color TEXT NOT NULL, material TEXT NOT NULL, inventory_qty INTEGER NOT NULL DEFAULT 0, min_stock INTEGER NOT NULL DEFAULT 0, print_time_minutes INTEGER NOT NULL DEFAULT 0, image_ref TEXT NOT NULL DEFAULT '', file_ref TEXT NOT NULL DEFAULT '', notes TEXT NOT NULL DEFAULT '')",
  "CREATE TABLE IF NOT EXISTS products (id TEXT PRIMARY KEY, name TEXT NOT NULL, sku TEXT NOT NULL DEFAULT '', active INTEGER NOT NULL DEFAULT 1, requires_assembly INTEGER NOT NULL DEFAULT 1, finished_stock INTEGER NOT NULL DEFAULT 0, target_stock INTEGER NOT NULL DEFAULT 0, image_ref TEXT NOT NULL DEFAULT '', notes TEXT NOT NULL DEFAULT '')",
  "CREATE TABLE IF NOT EXISTS product_requirements (product_id TEXT NOT NULL, part_id TEXT NOT NULL, quantity INTEGER NOT NULL DEFAULT 1, sort_order INTEGER NOT NULL DEFAULT 0, PRIMARY KEY (product_id, part_id), FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE, FOREIGN KEY (part_id) REFERENCES parts(id) ON DELETE RESTRICT)",
  "CREATE TABLE IF NOT EXISTS printers (id TEXT PRIMARY KEY, name TEXT NOT NULL, model TEXT NOT NULL DEFAULT '', color TEXT NOT NULL, material TEXT NOT NULL, active INTEGER NOT NULL DEFAULT 1, notes TEXT NOT NULL DEFAULT '')",
  "CREATE TABLE IF NOT EXISTS print_state (part_id TEXT PRIMARY KEY, planned_qty INTEGER NOT NULL DEFAULT 0, in_progress_qty INTEGER NOT NULL DEFAULT 0, failed_qty INTEGER NOT NULL DEFAULT 0, updated_at TEXT NOT NULL DEFAULT '', FOREIGN KEY (part_id) REFERENCES parts(id) ON DELETE CASCADE)",
  "CREATE TABLE IF NOT EXISTS completed_prints (id TEXT PRIMARY KEY, part_id TEXT NOT NULL, quantity INTEGER NOT NULL DEFAULT 0, completed_at TEXT NOT NULL, FOREIGN KEY (part_id) REFERENCES parts(id) ON DELETE RESTRICT)",
  "CREATE TABLE IF NOT EXISTS part_inventory_movements (id TEXT PRIMARY KEY, part_id TEXT NOT NULL, delta_qty INTEGER NOT NULL, reason TEXT NOT NULL, reference_type TEXT NOT NULL DEFAULT '', reference_id TEXT NOT NULL DEFAULT '', note TEXT NOT NULL DEFAULT '', actor TEXT NOT NULL DEFAULT '', created_at TEXT NOT NULL, FOREIGN KEY (part_id) REFERENCES parts(id) ON DELETE RESTRICT)",
  "CREATE TABLE IF NOT EXISTS finished_inventory_movements (id TEXT PRIMARY KEY, product_id TEXT NOT NULL, delta_qty INTEGER NOT NULL, reason TEXT NOT NULL, reference_type TEXT NOT NULL DEFAULT '', reference_id TEXT NOT NULL DEFAULT '', note TEXT NOT NULL DEFAULT '', actor TEXT NOT NULL DEFAULT '', created_at TEXT NOT NULL, FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE RESTRICT)",
  "CREATE TABLE IF NOT EXISTS print_events (id TEXT PRIMARY KEY, part_id TEXT NOT NULL, action TEXT NOT NULL, quantity INTEGER NOT NULL, note TEXT NOT NULL DEFAULT '', actor TEXT NOT NULL DEFAULT '', created_at TEXT NOT NULL, FOREIGN KEY (part_id) REFERENCES parts(id) ON DELETE RESTRICT)",
  "CREATE TABLE IF NOT EXISTS sales_orders (id TEXT PRIMARY KEY, order_number TEXT NOT NULL, order_date TEXT NOT NULL, source TEXT NOT NULL DEFAULT 'manual', external_id TEXT NOT NULL DEFAULT '', status TEXT NOT NULL DEFAULT 'open', created_at TEXT NOT NULL, updated_at TEXT NOT NULL, created_by TEXT NOT NULL DEFAULT '', updated_by TEXT NOT NULL DEFAULT '', packed_at TEXT NOT NULL DEFAULT '', packed_by TEXT NOT NULL DEFAULT '', cancelled_at TEXT NOT NULL DEFAULT '', cancelled_by TEXT NOT NULL DEFAULT '', CHECK (status IN ('open', 'packed', 'cancelled')), UNIQUE (source, order_number))",
  "CREATE TABLE IF NOT EXISTS sales_order_items (order_id TEXT NOT NULL, product_id TEXT NOT NULL, product_name TEXT NOT NULL DEFAULT '', product_sku TEXT NOT NULL DEFAULT '', quantity INTEGER NOT NULL, fulfilled_quantity INTEGER NOT NULL DEFAULT 0, sort_order INTEGER NOT NULL DEFAULT 0, PRIMARY KEY (order_id, product_id), FOREIGN KEY (order_id) REFERENCES sales_orders(id) ON DELETE CASCADE, FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE RESTRICT, CHECK (quantity > 0), CHECK (fulfilled_quantity >= 0 AND fulfilled_quantity <= quantity))",
  "CREATE TABLE IF NOT EXISTS sales_order_events (id TEXT PRIMARY KEY, order_id TEXT NOT NULL, action TEXT NOT NULL, note TEXT NOT NULL DEFAULT '', actor TEXT NOT NULL DEFAULT '', created_at TEXT NOT NULL, FOREIGN KEY (order_id) REFERENCES sales_orders(id) ON DELETE CASCADE)",
  "CREATE INDEX IF NOT EXISTS idx_product_requirements_product_id ON product_requirements(product_id, sort_order)",
  "CREATE INDEX IF NOT EXISTS idx_completed_prints_completed_at ON completed_prints(completed_at DESC)",
  "CREATE INDEX IF NOT EXISTS idx_part_inventory_movements_part_created_at ON part_inventory_movements(part_id, created_at DESC)",
  "CREATE INDEX IF NOT EXISTS idx_finished_inventory_movements_product_created_at ON finished_inventory_movements(product_id, created_at DESC)",
  "CREATE INDEX IF NOT EXISTS idx_print_events_part_created_at ON print_events(part_id, created_at DESC)",
  "CREATE INDEX IF NOT EXISTS idx_sales_orders_status_date ON sales_orders(status, order_date, created_at)",
  "CREATE INDEX IF NOT EXISTS idx_sales_order_items_product ON sales_order_items(product_id, order_id)",
  "CREATE INDEX IF NOT EXISTS idx_sales_order_events_order_created ON sales_order_events(order_id, created_at DESC)",
  "CREATE UNIQUE INDEX IF NOT EXISTS idx_sales_order_single_pack ON sales_order_events(order_id, action) WHERE action = 'packed'",
  "CREATE UNIQUE INDEX IF NOT EXISTS idx_sales_order_single_close ON sales_order_events(order_id) WHERE action IN ('packed', 'cancelled')",
];

const FILAMENT_SCHEMA_STATEMENTS = `
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
`.split(";").map((statement) => statement.replace(/\s+/g, " ").trim()).filter(Boolean);

// Track only credits from the former Start policy; new starts never create credits.
const COMPLETION_FILAMENT_SCHEMA_STATEMENTS = `
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
`.split(";").map((statement) => statement.replace(/\s+/g, " ").trim()).filter(Boolean);

const PART_PRODUCTION_SCHEMA_STATEMENTS = `
CREATE TABLE IF NOT EXISTS part_production_settings (
  part_id TEXT PRIMARY KEY REFERENCES parts(id) ON DELETE CASCADE,
  is_printed INTEGER NOT NULL DEFAULT 1 CHECK (is_printed IN (0, 1))
);
CREATE TABLE IF NOT EXISTS filament_part_stock_movements (
  filament_movement_id TEXT PRIMARY KEY REFERENCES filament_inventory_movements(id) ON DELETE CASCADE,
  part_movement_id TEXT NOT NULL REFERENCES part_inventory_movements(id) ON DELETE RESTRICT
);
`.split(";").map((statement) => statement.replace(/\s+/g, " ").trim()).filter(Boolean);

export async function getDb(context) {
  const db = context.env.DB;
  if (!db) {
    throw new ApiError(500, "D1 binding DB is not configured.");
  }
  await ensureSchema(db);
  return db;
}

export async function ensureSchema(db) {
  await db.exec("PRAGMA foreign_keys = ON");
  for (const statement of [...SCHEMA_STATEMENTS, ...FILAMENT_SCHEMA_STATEMENTS, ...COMPLETION_FILAMENT_SCHEMA_STATEMENTS, ...PART_PRODUCTION_SCHEMA_STATEMENTS]) {
    await db.exec(statement);
  }
  await ensureColumn(db, "part_inventory_movements", "actor", "ALTER TABLE part_inventory_movements ADD COLUMN actor TEXT NOT NULL DEFAULT ''");
  await ensureColumn(
    db,
    "finished_inventory_movements",
    "actor",
    "ALTER TABLE finished_inventory_movements ADD COLUMN actor TEXT NOT NULL DEFAULT ''",
  );
  await ensureColumn(db, "print_events", "actor", "ALTER TABLE print_events ADD COLUMN actor TEXT NOT NULL DEFAULT ''");
}

export async function readState(db) {
  const [
    partsResult,
    productsResult,
    requirementsResult,
    printersResult,
    printStateResult,
    completedPrintsResult,
    partInventoryMovementsResult,
    finishedInventoryMovementsResult,
    printEventsResult,
    salesOrdersResult,
    salesOrderItemsResult,
    salesOrderEventsResult,
    filamentsResult, partFilamentsResult, printerFilamentsResult, filamentMovementsResult, queueVersionsResult,
  ] = await db.batch([
    db.prepare(
      `SELECT parts.*, COALESCE(settings.is_printed, 1) AS is_printed
       FROM parts LEFT JOIN part_production_settings settings ON settings.part_id = parts.id
       ORDER BY name ASC`,
    ),
    db.prepare(
      `SELECT id, name, sku, active, requires_assembly, finished_stock, target_stock, image_ref, notes
       FROM products
       ORDER BY name ASC`,
    ),
    db.prepare(
      `SELECT product_id, part_id, quantity, sort_order
       FROM product_requirements
       ORDER BY product_id ASC, sort_order ASC`,
    ),
    db.prepare(
      `SELECT id, name, model, color, material, active, notes
       FROM printers
       ORDER BY name ASC`,
    ),
    db.prepare(
      `SELECT s.*, COALESCE(p.quantity, 0) AS prepaid_filament_qty
       FROM print_state s LEFT JOIN filament_prepaid_prints p ON p.part_id = s.part_id
       ORDER BY s.part_id ASC`,
    ),
    db.prepare(
      `SELECT id, part_id, quantity, completed_at
       FROM completed_prints
       ORDER BY completed_at DESC`,
    ),
    db.prepare(
      `SELECT id, part_id, delta_qty, reason, reference_type, reference_id, note, actor, created_at
       FROM part_inventory_movements
       WHERE id IN (SELECT id FROM part_inventory_movements ORDER BY created_at DESC, id DESC LIMIT 400)
          OR id IN (SELECT part_movement_id FROM filament_part_stock_movements
                    WHERE filament_movement_id IN (SELECT id FROM filament_inventory_movements ORDER BY created_at DESC, id DESC LIMIT 400))
       ORDER BY created_at DESC, id DESC`,
    ),
    db.prepare(
      `SELECT id, product_id, delta_qty, reason, reference_type, reference_id, note, actor, created_at
       FROM finished_inventory_movements
       ORDER BY created_at DESC
       LIMIT 400`,
    ),
    db.prepare(
      `SELECT id, part_id, action, quantity, note, actor, created_at
       FROM print_events
       WHERE id IN (SELECT id FROM print_events ORDER BY created_at DESC, id DESC LIMIT 400)
          OR id IN (SELECT print_event_id FROM filament_inventory_movements ORDER BY created_at DESC, id DESC LIMIT 400)
       ORDER BY created_at DESC, id DESC`,
    ),
    db.prepare(
      `SELECT id, order_number, order_date, source, external_id, status, created_at, updated_at,
              created_by, updated_by, packed_at, packed_by, cancelled_at, cancelled_by
       FROM sales_orders
       ORDER BY CASE status WHEN 'open' THEN 0 WHEN 'packed' THEN 1 ELSE 2 END, order_date ASC, created_at ASC`,
    ),
    db.prepare(
      `SELECT order_id, product_id, product_name, product_sku, quantity, fulfilled_quantity, sort_order
       FROM sales_order_items
       ORDER BY order_id ASC, sort_order ASC`,
    ),
    db.prepare(
      `SELECT id, order_id, action, note, actor, created_at
       FROM sales_order_events
       ORDER BY created_at DESC
       LIMIT 400`,
    ),
    db.prepare(`SELECT f.*, COALESCE((SELECT MAX(rowid) FROM filament_inventory_movements WHERE filament_id = f.id), 0) AS stock_version FROM filaments f ORDER BY manufacturer, material, color`),
    db.prepare("SELECT * FROM part_filaments"),
    db.prepare("SELECT * FROM printer_filaments"),
    db.prepare("SELECT m.*, link.part_movement_id FROM filament_inventory_movements m LEFT JOIN filament_part_stock_movements link ON link.filament_movement_id = m.id ORDER BY m.created_at DESC, m.id DESC LIMIT 400"),
    db.prepare("SELECT entity_key, MAX(rowid) AS version FROM mutation_receipts WHERE entity_key LIKE 'queue:%' GROUP BY entity_key"),
  ]);

  const filaments = (filamentsResult.results || []).map((row) => ({
    id: row.id, manufacturer: row.manufacturer, material: row.material, color: row.color,
    spoolWeightGrams: row.spool_weight_mg / 1000, stockGrams: row.stock_mg / 1000, stockVersion: row.stock_version,
  }));
  const filamentsById = new Map(filaments.map((filament) => [filament.id, filament]));
  const partFilaments = new Map((partFilamentsResult.results || []).map((row) => [row.part_id, row]));
  const printerFilaments = new Map((printerFilamentsResult.results || []).map((row) => [row.printer_id, row]));
  const queueVersions = new Map((queueVersionsResult.results || []).map((row) => [row.entity_key.slice(6), row.version]));
  const filamentProperties = (assignment) => {
    const filament = filamentsById.get(assignment?.filament_id);
    return filament ? { filamentId: filament.id, color: filament.color, material: filament.material } : { filamentId: null };
  };

  const requirementsByProductId = new Map();
  for (const row of requirementsResult.results || []) {
    const list = requirementsByProductId.get(row.product_id) || [];
    list.push({
      partId: row.part_id,
      quantity: toNonNegativeInteger(row.quantity),
    });
    requirementsByProductId.set(row.product_id, list);
  }

  const itemsByOrderId = new Map();
  for (const row of salesOrderItemsResult.results || []) {
    const list = itemsByOrderId.get(row.order_id) || [];
    list.push({
      productId: row.product_id,
      productName: row.product_name,
      productSku: row.product_sku,
      quantity: row.quantity,
      fulfilledQuantity: row.fulfilled_quantity,
    });
    itemsByOrderId.set(row.order_id, list);
  }

  return normalizeState({
    filaments,
    filamentInventoryMovements: (filamentMovementsResult.results || []).map((row) => ({
      id: row.id, filamentId: row.filament_id, deltaGrams: row.delta_mg / 1000, reason: row.reason,
      note: row.note, actor: row.actor, createdAt: row.created_at, partId: row.part_id,
      printEventId: row.print_event_id, partMovementId: row.part_movement_id || null, quantity: row.quantity, gramsPerUnit: row.grams_per_unit_mg / 1000,
    })),
    parts: (partsResult.results || []).map((row) => ({
      id: row.id,
      name: row.name,
      sku: row.sku,
      color: row.color,
      material: row.material,
      isPrinted: Boolean(row.is_printed),
      ...filamentProperties(partFilaments.get(row.id)),
      filamentGramsPerUnit: partFilaments.has(row.id) ? partFilaments.get(row.id).grams_per_unit_mg / 1000 : null,
      queueVersion: queueVersions.get(row.id) || 0,
      inventoryQty: row.inventory_qty,
      minStock: row.min_stock,
      printTimeMinutes: row.print_time_minutes,
      imageRef: row.image_ref,
      fileRef: row.file_ref,
      notes: row.notes,
    })),
    products: (productsResult.results || []).map((row) => ({
      id: row.id,
      name: row.name,
      sku: row.sku,
      active: Boolean(row.active),
      requiresAssembly: Boolean(row.requires_assembly),
      finishedStock: row.finished_stock,
      targetStock: row.target_stock,
      imageRef: row.image_ref,
      notes: row.notes,
      partRequirements: requirementsByProductId.get(row.id) || [],
    })),
    printers: (printersResult.results || []).map((row) => ({
      id: row.id,
      name: row.name,
      model: row.model,
      color: row.color,
      material: row.material,
      ...filamentProperties(printerFilaments.get(row.id)),
      active: Boolean(row.active),
      notes: row.notes,
    })),
    printState: (printStateResult.results || []).map((row) => ({
      partId: row.part_id,
      plannedQty: row.planned_qty,
      inProgressQty: row.in_progress_qty,
      prepaidFilamentQty: row.prepaid_filament_qty,
      failedQty: row.failed_qty,
      updatedAt: row.updated_at,
    })),
    completedPrints: (completedPrintsResult.results || []).map((row) => ({
      id: row.id,
      partId: row.part_id,
      quantity: row.quantity,
      completedAt: row.completed_at,
    })),
    partInventoryMovements: (partInventoryMovementsResult.results || []).map((row) => ({
      id: row.id,
      partId: row.part_id,
      deltaQty: row.delta_qty,
      reason: row.reason,
      referenceType: row.reference_type,
      referenceId: row.reference_id,
      note: row.note,
      actor: row.actor,
      createdAt: row.created_at,
    })),
    finishedInventoryMovements: (finishedInventoryMovementsResult.results || []).map((row) => ({
      id: row.id,
      productId: row.product_id,
      deltaQty: row.delta_qty,
      reason: row.reason,
      referenceType: row.reference_type,
      referenceId: row.reference_id,
      note: row.note,
      actor: row.actor,
      createdAt: row.created_at,
    })),
    printEvents: (printEventsResult.results || []).map((row) => ({
      id: row.id,
      partId: row.part_id,
      action: row.action,
      quantity: row.quantity,
      note: row.note,
      actor: row.actor,
      createdAt: row.created_at,
    })),
    salesOrders: (salesOrdersResult.results || []).map((row) => ({
      id: row.id,
      orderNumber: row.order_number,
      orderDate: row.order_date,
      source: row.source,
      externalId: row.external_id,
      status: row.status,
      createdAt: row.created_at,
      updatedAt: row.updated_at,
      createdBy: row.created_by,
      updatedBy: row.updated_by,
      packedAt: row.packed_at,
      packedBy: row.packed_by,
      cancelledAt: row.cancelled_at,
      cancelledBy: row.cancelled_by,
      items: itemsByOrderId.get(row.id) || [],
    })),
    salesOrderEvents: (salesOrderEventsResult.results || []).map((row) => ({
      id: row.id,
      orderId: row.order_id,
      action: row.action,
      note: row.note,
      actor: row.actor,
      createdAt: row.created_at,
    })),
  });
}

export async function replaceState(db, inputState) {
  const state = normalizeState(inputState);
  const statements = [
    db.prepare("DELETE FROM filament_part_stock_movements"),
    db.prepare("DELETE FROM part_production_settings"),
    db.prepare("DELETE FROM mutation_receipts"),
    db.prepare("DELETE FROM filament_prepaid_prints"),
    db.prepare("DELETE FROM filament_inventory_movements"),
    db.prepare("DELETE FROM part_filaments"),
    db.prepare("DELETE FROM printer_filaments"),
    db.prepare("DELETE FROM filaments"),
    db.prepare("DELETE FROM sales_order_events"),
    db.prepare("DELETE FROM sales_order_items"),
    db.prepare("DELETE FROM sales_orders"),
    db.prepare("DELETE FROM print_events"),
    db.prepare("DELETE FROM finished_inventory_movements"),
    db.prepare("DELETE FROM part_inventory_movements"),
    db.prepare("DELETE FROM completed_prints"),
    db.prepare("DELETE FROM print_state"),
    db.prepare("DELETE FROM product_requirements"),
    db.prepare("DELETE FROM products"),
    db.prepare("DELETE FROM printers"),
    db.prepare("DELETE FROM parts"),
  ];

  for (const filament of state.filaments) {
    validateFilament(filament);
    statements.push(db.prepare("INSERT INTO filaments (id, manufacturer, material, color, spool_weight_mg, stock_mg) VALUES (?, ?, ?, ?, ?, ?)")
      .bind(filament.id, filament.manufacturer, filament.material, filament.color, requireGrams(filament.spoolWeightGrams), requireGrams(filament.stockGrams)));
  }

  for (const part of state.parts) {
    statements.push(
      db
        .prepare(
          `INSERT INTO parts
            (id, name, sku, color, material, inventory_qty, min_stock, print_time_minutes, image_ref, file_ref, notes)
           VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        )
        .bind(
          part.id,
          part.name,
          part.sku,
          part.color,
          part.material,
          part.inventoryQty,
          part.minStock,
          part.printTimeMinutes,
          part.imageRef,
          part.fileRef,
          part.notes,
        ),
    );
  }

  for (const product of state.products) {
    statements.push(
      db
        .prepare(
          `INSERT INTO products
            (id, name, sku, active, requires_assembly, finished_stock, target_stock, image_ref, notes)
           VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        )
        .bind(
          product.id,
          product.name,
          product.sku,
          product.active ? 1 : 0,
          product.requiresAssembly ? 1 : 0,
          product.finishedStock,
          product.targetStock,
          product.imageRef,
          product.notes,
        ),
    );

    product.partRequirements.forEach((requirement, index) => {
      statements.push(
        db
          .prepare(
            `INSERT INTO product_requirements (product_id, part_id, quantity, sort_order)
             VALUES (?, ?, ?, ?)`,
          )
          .bind(product.id, requirement.partId, requirement.quantity, index),
      );
    });

  }

  for (const order of state.salesOrders) {
    statements.push(
      db
        .prepare(
          `INSERT INTO sales_orders
            (id, order_number, order_date, source, external_id, status, created_at, updated_at,
             created_by, updated_by, packed_at, packed_by, cancelled_at, cancelled_by)
           VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        )
        .bind(
          order.id,
          order.orderNumber,
          order.orderDate,
          order.source,
          order.externalId,
          order.status,
          order.createdAt,
          order.updatedAt,
          order.createdBy,
          order.updatedBy,
          order.packedAt,
          order.packedBy,
          order.cancelledAt,
          order.cancelledBy,
        ),
    );
    order.items.forEach((item, index) => {
      statements.push(
        db
          .prepare(
            `INSERT INTO sales_order_items
              (order_id, product_id, product_name, product_sku, quantity, fulfilled_quantity, sort_order)
             VALUES (?, ?, ?, ?, ?, ?, ?)`,
          )
          .bind(
            order.id,
            item.productId,
            item.productName,
            item.productSku,
            item.quantity,
            item.fulfilledQuantity,
            index,
          ),
      );
    });
  }

  for (const printer of state.printers) {
    statements.push(
      db
        .prepare(
          `INSERT INTO printers
            (id, name, model, color, material, active, notes)
           VALUES (?, ?, ?, ?, ?, ?, ?)`,
        )
        .bind(
          printer.id,
          printer.name,
          printer.model,
          printer.color,
          printer.material,
          printer.active ? 1 : 0,
          printer.notes,
        ),
    );
  }

  for (const entry of state.printState) {
    statements.push(
      db
        .prepare(
          `INSERT INTO print_state
            (part_id, planned_qty, in_progress_qty, failed_qty, updated_at)
           VALUES (?, ?, ?, ?, ?)`,
        )
        .bind(entry.partId, entry.plannedQty, entry.inProgressQty, entry.failedQty, entry.updatedAt),
    );
  }

  for (const part of state.parts) {
    const prepaid = state.printState.find((entry) => entry.partId === part.id)?.prepaidFilamentQty || 0;
    statements.push(db.prepare("INSERT INTO filament_prepaid_prints (part_id, quantity) VALUES (?, ?)").bind(part.id, prepaid));
  }

  for (const entry of state.completedPrints) {
    statements.push(
      db
        .prepare(
          `INSERT INTO completed_prints
            (id, part_id, quantity, completed_at)
           VALUES (?, ?, ?, ?)`,
        )
        .bind(entry.id, entry.partId, entry.quantity, entry.completedAt),
    );
  }

  for (const entry of state.partInventoryMovements) {
    statements.push(
      createPartMovementStatement(db, {
        id: entry.id,
        partId: entry.partId,
        deltaQty: entry.deltaQty,
        reason: entry.reason,
        referenceType: entry.referenceType,
        referenceId: entry.referenceId,
        note: entry.note,
        actor: entry.actor,
        createdAt: entry.createdAt,
      }),
    );
  }

  for (const entry of state.finishedInventoryMovements) {
    statements.push(
      createFinishedMovementStatement(db, {
        id: entry.id,
        productId: entry.productId,
        deltaQty: entry.deltaQty,
        reason: entry.reason,
        referenceType: entry.referenceType,
        referenceId: entry.referenceId,
        note: entry.note,
        actor: entry.actor,
        createdAt: entry.createdAt,
      }),
    );
  }

  for (const entry of state.printEvents) {
    statements.push(
      createPrintEventStatement(db, {
        id: entry.id,
        partId: entry.partId,
        action: entry.action,
        quantity: entry.quantity,
        note: entry.note,
        actor: entry.actor,
        createdAt: entry.createdAt,
      }),
    );
  }

  for (const entry of state.salesOrderEvents) {
    statements.push(
      createSalesOrderEventStatement(db, {
        id: entry.id,
        orderId: entry.orderId,
        action: entry.action,
        note: entry.note,
        actor: entry.actor,
        createdAt: entry.createdAt,
      }),
    );
  }

  for (const part of state.parts) {
    assert(part.isPrinted || !state.printState.some((entry) => entry.partId === part.id && (entry.plannedQty || entry.inProgressQty || entry.failedQty)), "Non-printed parts cannot have active print tracking.");
    statements.push(partProductionStatement(db, part.id, part.isPrinted));
    if (part.filamentId) statements.push(partFilamentStatement(db, part.id, part.filamentId, requireGrams(part.filamentGramsPerUnit, true)));
  }
  for (const printer of state.printers) {
    if (printer.filamentId) statements.push(printerFilamentStatement(db, printer.id, printer.filamentId));
  }
  for (const entry of state.filamentInventoryMovements) {
    statements.push(createFilamentMovementStatement(db, entry));
    if (entry.partMovementId) statements.push(linkFilamentPartMovement(db, entry.id, entry.partMovementId));
  }

  await runInTransaction(db, statements);
  return state;
}

export async function seedStateIfEmpty(db) {
  const state = await readState(db);
  if (hasData(state)) {
    return state;
  }
  await replaceState(db, SEED_STATE);
  return normalizeState(SEED_STATE);
}

export async function savePart(db, input, actor = "") {
  const part = normalizePart(input);
  assert(part.name, "Part name is required.");
  let usageMg = 0;
  if (part.isPrinted) {
    const filament = await fetchFilamentRow(db, part.filamentId);
    assert(filament, "Select a filament for this part.");
    usageMg = requireGrams(part.filamentGramsPerUnit, true);
    part.color = filament.color;
    part.material = filament.material;
  }

  const id = part.id || createId("part");
  const existing = await fetchPartRow(db, id);
  // Existing stock is changed only by targeted inventory/production actions.
  const nextInventoryQty = existing ? existing.inventory_qty : part.inventoryQty;
  const timestamp = new Date().toISOString();
  const requestId = createId("part-save");
  const fingerprint = JSON.stringify(["part-save", part, actor]);
  const noTracking = "NOT EXISTS (SELECT 1 FROM print_state WHERE part_id = ? AND (planned_qty > 0 OR in_progress_qty > 0 OR failed_qty > 0))";
  if (!part.isPrinted) {
    const tracking = await db.prepare("SELECT part_id FROM print_state WHERE part_id = ? AND (planned_qty > 0 OR in_progress_qty > 0 OR failed_qty > 0)").bind(id).first();
    assert(!tracking, "Resolve planned, running, or failed prints before changing this part to non-printed.", 409);
  }
  const statements = [
    mutationReceipt(db, requestId, fingerprint, `queue:${id}`, part.isPrinted ? "1" : noTracking, part.isPrinted ? [] : [id]),
    db
      .prepare(
        `INSERT INTO parts
          (id, name, sku, color, material, inventory_qty, min_stock, print_time_minutes, image_ref, file_ref, notes)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
         ON CONFLICT(id) DO UPDATE SET
          name = excluded.name,
          sku = excluded.sku,
          color = excluded.color,
          material = excluded.material,
          min_stock = excluded.min_stock,
          print_time_minutes = excluded.print_time_minutes,
          image_ref = excluded.image_ref,
          file_ref = excluded.file_ref,
          notes = excluded.notes`,
      )
      .bind(
        id,
        part.name,
        part.sku,
        part.color,
        part.material,
        nextInventoryQty,
        part.minStock,
        part.printTimeMinutes,
        part.imageRef,
        part.fileRef,
        part.notes,
      ),
  ];

  statements.push(partProductionStatement(db, id, part.isPrinted));
  statements.push(part.isPrinted ? partFilamentStatement(db, id, part.filamentId, usageMg)
    : db.prepare("DELETE FROM part_filaments WHERE part_id = ?").bind(id));

  if (!existing && nextInventoryQty > 0) {
    statements.push(
      createPartMovementStatement(db, {
        id: createId("part-move"),
        partId: id,
        deltaQty: nextInventoryQty,
        reason: "opening_balance",
        referenceType: "part",
        referenceId: id,
        note: "Initial part stock; no retrospective filament consumption.",
        actor,
        createdAt: timestamp,
      }),
    );
  }

  await commitMutation(db, statements, requestId, fingerprint);
  return id;
}

export async function deletePart(db, id) {
  assert(id, "Part id is required.");
  const part = await fetchPartRow(db, id);
  assert(part, "Part not found.", 404);

  const [productLink, activePrintState, completedPrint, partMovement, printEvent] = await Promise.all([
    db.prepare("SELECT product_id FROM product_requirements WHERE part_id = ? LIMIT 1").bind(id).first(),
    db
      .prepare("SELECT part_id FROM print_state WHERE part_id = ? AND (planned_qty > 0 OR in_progress_qty > 0 OR failed_qty > 0) LIMIT 1")
      .bind(id)
      .first(),
    db.prepare("SELECT id FROM completed_prints WHERE part_id = ? LIMIT 1").bind(id).first(),
    db.prepare("SELECT id FROM part_inventory_movements WHERE part_id = ? LIMIT 1").bind(id).first(),
    db.prepare("SELECT id FROM print_events WHERE part_id = ? LIMIT 1").bind(id).first(),
  ]);

  assert(!productLink, "Cannot delete part because it is assigned to a product.");
  assert(!activePrintState, "Cannot delete part while queue tracking still references it.");
  assert(!completedPrint && !partMovement && !printEvent, "Cannot delete part because inventory or print history still references it.");

  await runInTransaction(db, [db.prepare("DELETE FROM parts WHERE id = ?").bind(id)]);
}

export async function adjustPartInventory(db, { partId, delta, reason, note, actor, requestId, expectedIsPrinted, expectedFilamentId, expectedFilamentGramsPerUnit }) {
  assert(partId, "Part id is required.");
  const numericDelta = Number(delta);
  assert(Number.isSafeInteger(numericDelta) && numericDelta !== 0, "Inventory adjustment must be a non-zero whole number.");
  const normalizedActor = normalizeActor(actor);
  const fingerprint = JSON.stringify(["part-stock", partId, numericDelta, reason, note, normalizedActor, expectedIsPrinted, expectedFilamentId, expectedFilamentGramsPerUnit]);
  if (await isMutationReplay(db, requestId, fingerprint)) return;
  const part = await fetchPartRow(db, partId);
  assert(part, "Part not found.", 404);
  assert(part.inventory_qty + numericDelta >= 0, "Inventory cannot go below zero.");
  assert(Number.isSafeInteger(part.inventory_qty + numericDelta), "Inventory quantity is too large.");
  let guard = "EXISTS (SELECT 1 FROM parts WHERE id = ? AND inventory_qty + ? BETWEEN 0 AND 9007199254740991)";
  const bindings = [partId, numericDelta];
  let assignment;
  let consumptionMg = 0;
  if (numericDelta > 0) {
    assert(expectedIsPrinted === Boolean(part.is_printed), "This part's production settings changed. Refresh and retry.", 409);
    guard += " AND COALESCE((SELECT is_printed FROM part_production_settings WHERE part_id = ?), 1) = ?";
    bindings.push(partId, part.is_printed);
    if (part.is_printed) {
      assignment = await db.prepare("SELECT * FROM part_filaments WHERE part_id = ?").bind(partId).first();
      assert(assignment, "Configure this printed part's filament and grams per unit before adding stock.");
      assert(expectedFilamentId === assignment.filament_id && gramsToMilligrams(expectedFilamentGramsPerUnit) === assignment.grams_per_unit_mg,
        "This part's filament settings changed. Refresh and retry.", 409);
      consumptionMg = numericDelta * assignment.grams_per_unit_mg;
      assert(Number.isSafeInteger(consumptionMg), "Filament consumption is too large.");
      guard += " AND EXISTS (SELECT 1 FROM part_filaments WHERE part_id = ? AND filament_id = ? AND grams_per_unit_mg = ?)";
      bindings.push(partId, assignment.filament_id, assignment.grams_per_unit_mg);
    }
  }
  const timestamp = new Date().toISOString();
  const partMovementId = createId("part-move");
  const statements = [
    // Invalidate stale queue actions because stock changes derived demand.
    mutationReceipt(db, requestId, fingerprint, `queue:${partId}`, guard, bindings),
    db.prepare("UPDATE parts SET inventory_qty = inventory_qty + ? WHERE id = ?").bind(numericDelta, partId),
    createPartMovementStatement(db, {
      id: partMovementId, partId, deltaQty: numericDelta,
      reason: reason || "manual_adjustment", referenceType: "part", referenceId: partId,
      note: String(note || ""), actor: normalizedActor, createdAt: timestamp,
    }),
  ];
  if (consumptionMg > 0) {
    const movementId = createId("filament-move");
    statements.push(
      db.prepare("UPDATE filaments SET stock_mg = stock_mg - ? WHERE id = ?").bind(consumptionMg, assignment.filament_id),
      createFilamentMovementStatement(db, {
        id: movementId, filamentId: assignment.filament_id, deltaGrams: -consumptionMg / 1000,
        reason: "part_stock_added", partId, quantity: numericDelta, gramsPerUnit: assignment.grams_per_unit_mg / 1000,
        note: `${numericDelta} × ${assignment.grams_per_unit_mg / 1000} g for ${part.name}. ${String(note || "")}`.trim(),
        actor: normalizedActor, createdAt: timestamp,
      }),
      linkFilamentPartMovement(db, movementId, partMovementId),
    );
  }
  await commitMutation(db, statements, requestId, fingerprint);
}

export async function saveProduct(db, input, actor = "") {
  const product = normalizeProduct(input);
  assert(product.name, "Product name is required.");

  if (product.requiresAssembly) {
    assert(product.partRequirements.length > 0, "Add at least one part requirement for assembled products.");
  } else {
    assert(product.partRequirements.length > 0, "Products without assembly still need one part.");
    product.partRequirements = [{ partId: product.partRequirements[0].partId, quantity: 1 }];
    product.finishedStock = 0;
  }

  for (const requirement of product.partRequirements) {
    assert(requirement.partId, "Each requirement row must reference a part.");
    assert(requirement.quantity > 0, "Requirement quantities must be at least 1.");
    const part = await fetchPartRow(db, requirement.partId);
    assert(part, "One or more selected parts no longer exist.");
  }

  const id = product.id || createId("product");
  const existing = await fetchProductRow(db, id);
  const previousFinishedStock = existing ? toNonNegativeInteger(existing.finished_stock) : 0;
  const nextFinishedStock = product.requiresAssembly ? product.finishedStock : 0;
  const timestamp = new Date().toISOString();
  const statements = [
    db
      .prepare(
        `INSERT INTO products
          (id, name, sku, active, requires_assembly, finished_stock, target_stock, image_ref, notes)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
         ON CONFLICT(id) DO UPDATE SET
          name = excluded.name,
          sku = excluded.sku,
          active = excluded.active,
          requires_assembly = excluded.requires_assembly,
          finished_stock = excluded.finished_stock,
          target_stock = excluded.target_stock,
          image_ref = excluded.image_ref,
          notes = excluded.notes`,
      )
      .bind(
        id,
        product.name,
        product.sku,
        product.active ? 1 : 0,
        product.requiresAssembly ? 1 : 0,
        nextFinishedStock,
        product.targetStock,
        product.imageRef,
        product.notes,
      ),
    db.prepare("DELETE FROM product_requirements WHERE product_id = ?").bind(id),
  ];

  product.partRequirements.forEach((requirement, index) => {
    statements.push(
      db
        .prepare(
          `INSERT INTO product_requirements (product_id, part_id, quantity, sort_order)
           VALUES (?, ?, ?, ?)`,
        )
        .bind(id, requirement.partId, requirement.quantity, index),
    );
  });

  const finishedDelta = nextFinishedStock - previousFinishedStock;
  if (existing && finishedDelta !== 0) {
    statements.push(
      createFinishedMovementStatement(db, {
        id: createId("finished-move"),
        productId: id,
        deltaQty: finishedDelta,
        reason: "manual_edit_balance",
        referenceType: "product",
        referenceId: id,
        note: "Finished inventory changed from the product form.",
        actor,
        createdAt: timestamp,
      }),
    );
  }

  await runInTransaction(db, statements);
  return id;
}

export async function deleteProduct(db, id) {
  assert(id, "Product id is required.");
  const product = await fetchProductRow(db, id);
  assert(product, "Product not found.", 404);
  const [finishedMovement, salesOrderItem] = await Promise.all([
    db.prepare("SELECT id FROM finished_inventory_movements WHERE product_id = ? LIMIT 1").bind(id).first(),
    db.prepare("SELECT order_id FROM sales_order_items WHERE product_id = ? LIMIT 1").bind(id).first(),
  ]);
  assert(!finishedMovement, "Cannot delete product because finished inventory history still references it.");
  assert(!salesOrderItem, "Cannot delete product because sales order history references it. Deactivate it instead.");
  await runInTransaction(db, [db.prepare("DELETE FROM products WHERE id = ?").bind(id)]);
}

export async function setProductActive(db, { productId, active }) {
  assert(productId, "Product id is required.");
  const product = await fetchProductRow(db, productId);
  assert(product, "Product not found.", 404);
  await runInTransaction(db, [
    db.prepare("UPDATE products SET active = ? WHERE id = ?").bind(active ? 1 : 0, productId),
  ]);
}

export async function assembleProduct(db, { productId, quantity, actor }) {
  assert(productId, "Product id is required.");
  const qty = toNonNegativeInteger(quantity);
  assert(qty > 0, "Assembly quantity must be greater than zero.");

  const state = await readState(db);
  const product = state.products.find((entry) => entry.id === productId);
  assert(product, "Product not found.", 404);
  assert(product.requiresAssembly, "This product does not require assembly.");

  const partsById = new Map(state.parts.map((part) => [part.id, part]));
  const summary = summarizeProduct(product, partsById);
  assert(summary.buildableNow >= qty, "Not enough parts are available for that assembly quantity.");

  const timestamp = new Date().toISOString();
  const normalizedActor = normalizeActor(actor);
  const statements = [];

  for (const requirement of summary.requirements) {
    const part = partsById.get(requirement.partId);
    const consumedQty = requirement.quantity * qty;
    statements.push(
      db
        .prepare("UPDATE parts SET inventory_qty = inventory_qty - ? WHERE id = ?")
        .bind(consumedQty, requirement.partId),
    );
    statements.push(
      createPartMovementStatement(db, {
        id: createId("part-move"),
        partId: requirement.partId,
        deltaQty: -consumedQty,
        reason: "assembly_consumed",
        referenceType: "product",
        referenceId: productId,
        note: `Consumed to assemble ${qty} ${product.name}.`,
        actor: normalizedActor,
        createdAt: timestamp,
      }),
    );
    assert(part, "One or more required parts no longer exist.");
  }

  statements.push(
    db.prepare("UPDATE products SET finished_stock = finished_stock + ? WHERE id = ?").bind(qty, productId),
  );
  statements.push(
    createFinishedMovementStatement(db, {
      id: createId("finished-move"),
      productId,
      deltaQty: qty,
      reason: "assembled",
      referenceType: "product",
      referenceId: productId,
      note: `Assembled ${qty} ${product.name}.`,
      actor: normalizedActor,
      createdAt: timestamp,
    }),
  );

  await runInTransaction(db, statements);
}

export async function adjustFinishedStock(db, { productId, delta, actor }) {
  assert(productId, "Product id is required.");
  const numericDelta = toSignedInteger(delta);
  assert(numericDelta !== 0, "Finished stock adjustment must be non-zero.");
  const product = await fetchProductRow(db, productId);
  assert(product, "Product not found.", 404);
  assert(Boolean(product.requires_assembly), "This product does not keep separate finished stock.");
  const nextQty = toNonNegativeInteger(product.finished_stock) + numericDelta;
  assert(nextQty >= 0, "Finished stock cannot go below zero.");

  const timestamp = new Date().toISOString();
  await runInTransaction(db, [
    db.prepare("UPDATE products SET finished_stock = ? WHERE id = ?").bind(nextQty, productId),
    createFinishedMovementStatement(db, {
      id: createId("finished-move"),
      productId,
      deltaQty: numericDelta,
      reason: "manual_adjustment",
      referenceType: "product",
      referenceId: productId,
      note: "Adjusted from the finished stock action.",
      actor: normalizeActor(actor),
      createdAt: timestamp,
    }),
  ]);
}

export async function packProduct(db, { productId, quantity, actor }) {
  assert(productId, "Product id is required.");
  const qty = toNonNegativeInteger(quantity);
  assert(qty > 0, "Packed quantity must be greater than zero.");

  const state = await readState(db);
  const product = state.products.find((entry) => entry.id === productId);
  assert(product, "Product not found.", 404);
  const partsById = new Map(state.parts.map((part) => [part.id, part]));
  const summary = summarizeProduct(product, partsById);
  const timestamp = new Date().toISOString();
  const normalizedActor = normalizeActor(actor);
  const statements = [];

  if (summary.requiresAssembly) {
    assert(summary.onHandNow >= qty, "There is not enough finished stock available to pack.");
    statements.push(
      db.prepare("UPDATE products SET finished_stock = finished_stock - ? WHERE id = ?").bind(qty, productId),
    );
    statements.push(
      createFinishedMovementStatement(db, {
        id: createId("finished-move"),
        productId,
        deltaQty: -qty,
        reason: "packed",
        referenceType: "product",
        referenceId: productId,
        note: `Packed ${qty} ${product.name}.`,
        actor: normalizedActor,
        createdAt: timestamp,
      }),
    );
  } else {
    assert(summary.buildableNow >= qty, "There is not enough printed product stock available to pack.");
    for (const requirement of summary.requirements) {
      const consumedQty = requirement.quantity * qty;
      statements.push(
        db
          .prepare("UPDATE parts SET inventory_qty = inventory_qty - ? WHERE id = ?")
          .bind(consumedQty, requirement.partId),
      );
      statements.push(
        createPartMovementStatement(db, {
          id: createId("part-move"),
          partId: requirement.partId,
          deltaQty: -consumedQty,
          reason: "packed_direct_product",
          referenceType: "product",
          referenceId: productId,
          note: `Packed ${qty} ${product.name}.`,
          actor: normalizedActor,
          createdAt: timestamp,
        }),
      );
    }
  }

  await runInTransaction(db, statements);
}

export async function saveSalesOrder(db, input, actor = "") {
  const normalizedActor = normalizeActor(actor);
  const draft = normalizeSalesOrder({ ...input, source: input?.source || "manual", status: "open" });
  assert(draft.orderNumber, "Order number is required.");
  assert(draft.orderDate, "Order date must use YYYY-MM-DD format.");
  assert(draft.items.length > 0, "Add at least one product to the order.");

  const timestamp = new Date().toISOString();
  const id = draft.id || createId("sales-order");
  const existing = draft.id
    ? await db.prepare("SELECT id, status, created_at, created_by, source FROM sales_orders WHERE id = ?").bind(id).first()
    : null;
  if (draft.id) {
    assert(existing, "Sales order not found.", 404);
    assert(existing.status === "open", "Only open sales orders can be edited.", 409);
  }

  const duplicate = await db
    .prepare("SELECT id FROM sales_orders WHERE source = ? AND order_number = ? AND id <> ? LIMIT 1")
    .bind(draft.source, draft.orderNumber, id)
    .first();
  assert(!duplicate, "That order number already exists for this source.", 409);

  const products = new Map();
  for (const item of draft.items) {
    const product = await fetchProductRow(db, item.productId);
    assert(product, "One or more selected products no longer exist.");
    products.set(item.productId, product);
  }

  const createdAt = existing?.created_at || timestamp;
  const createdBy = existing?.created_by || normalizedActor;
  const statements = [
    db
      .prepare(
        `INSERT INTO sales_orders
          (id, order_number, order_date, source, external_id, status, created_at, updated_at,
           created_by, updated_by, packed_at, packed_by, cancelled_at, cancelled_by)
         VALUES (?, ?, ?, ?, ?, 'open', ?, ?, ?, ?, '', '', '', '')
         ON CONFLICT(id) DO UPDATE SET
          order_number = excluded.order_number,
          order_date = excluded.order_date,
          source = excluded.source,
          external_id = excluded.external_id,
          updated_at = excluded.updated_at,
          updated_by = excluded.updated_by`,
      )
      .bind(
        id,
        draft.orderNumber,
        draft.orderDate,
        draft.source,
        draft.externalId,
        createdAt,
        timestamp,
        createdBy,
        normalizedActor,
      ),
    db.prepare("DELETE FROM sales_order_items WHERE order_id = ?").bind(id),
  ];

  draft.items.forEach((item, index) => {
    const product = products.get(item.productId);
    statements.push(
      db
        .prepare(
          `INSERT INTO sales_order_items
            (order_id, product_id, product_name, product_sku, quantity, fulfilled_quantity, sort_order)
           VALUES (?, ?, ?, ?, ?, 0, ?)`,
        )
        .bind(id, item.productId, product.name, product.sku, item.quantity, index),
    );
  });
  statements.push(
    createSalesOrderEventStatement(db, {
      id: createId("sales-event"),
      orderId: id,
      action: existing ? "updated" : "created",
      note: `${existing ? "Updated" : "Created"} order ${draft.orderNumber}.`,
      actor: normalizedActor,
      createdAt: timestamp,
    }),
  );

  await runInTransaction(db, statements);
  return id;
}

export async function packSalesOrder(db, { orderId, actor }) {
  assert(orderId, "Sales order id is required.");
  const state = await readState(db);
  const order = state.salesOrders.find((entry) => entry.id === orderId);
  assert(order, "Sales order not found.", 404);
  assert(order.status === "open", "Only open sales orders can be packed.", 409);

  const productsById = new Map(state.products.map((product) => [product.id, product]));
  const partsById = new Map(state.parts.map((part) => [part.id, part]));
  const finishedDeductions = new Map();
  const partDeductions = new Map();

  order.items.forEach((item) => {
    const remainingQty = Math.max(item.quantity - item.fulfilledQuantity, 0);
    const product = productsById.get(item.productId);
    assert(product, `Product ${item.productName || item.productId} no longer exists.`);
    if (product.requiresAssembly) {
      finishedDeductions.set(product.id, (finishedDeductions.get(product.id) || 0) + remainingQty);
      return;
    }
    product.partRequirements.forEach((requirement) => {
      partDeductions.set(
        requirement.partId,
        (partDeductions.get(requirement.partId) || 0) + requirement.quantity * remainingQty,
      );
    });
  });

  finishedDeductions.forEach((quantity, productId) => {
    const product = productsById.get(productId);
    assert(product.finishedStock >= quantity, `Not enough finished stock is available for ${product.name}.`, 409);
  });
  partDeductions.forEach((quantity, partId) => {
    const part = partsById.get(partId);
    assert(part && part.inventoryQty >= quantity, `Not enough printed stock is available for ${part?.name || "a direct product"}.`, 409);
  });

  const timestamp = new Date().toISOString();
  const normalizedActor = normalizeActor(actor);
  const statements = [];

  finishedDeductions.forEach((quantity, productId) => {
    const product = productsById.get(productId);
    statements.push(db.prepare("UPDATE products SET finished_stock = finished_stock - ? WHERE id = ?").bind(quantity, productId));
    statements.push(
      createFinishedMovementStatement(db, {
        id: createId("finished-move"),
        productId,
        deltaQty: -quantity,
        reason: "sales_order_packed",
        referenceType: "sales_order",
        referenceId: orderId,
        note: `Packed order ${order.orderNumber}: ${quantity} ${product.name}.`,
        actor: normalizedActor,
        createdAt: timestamp,
      }),
    );
  });

  partDeductions.forEach((quantity, partId) => {
    const part = partsById.get(partId);
    statements.push(db.prepare("UPDATE parts SET inventory_qty = inventory_qty - ? WHERE id = ?").bind(quantity, partId));
    statements.push(
      createPartMovementStatement(db, {
        id: createId("part-move"),
        partId,
        deltaQty: -quantity,
        reason: "sales_order_packed_direct",
        referenceType: "sales_order",
        referenceId: orderId,
        note: `Packed direct-product stock for order ${order.orderNumber}.`,
        actor: normalizedActor,
        createdAt: timestamp,
      }),
    );
  });

  statements.push(
    db.prepare("UPDATE sales_order_items SET fulfilled_quantity = quantity WHERE order_id = ?").bind(orderId),
    db
      .prepare(
        `UPDATE sales_orders
         SET status = 'packed', packed_at = ?, packed_by = ?, updated_at = ?, updated_by = ?
         WHERE id = ? AND status = 'open'`,
      )
      .bind(timestamp, normalizedActor, timestamp, normalizedActor, orderId),
    createSalesOrderEventStatement(db, {
      id: createId("sales-event"),
      orderId,
      action: "packed",
      note: `Packed order ${order.orderNumber}.`,
      actor: normalizedActor,
      createdAt: timestamp,
    }),
  );

  await runInTransaction(db, statements);
}

export async function cancelSalesOrder(db, { orderId, actor }) {
  assert(orderId, "Sales order id is required.");
  const order = await db
    .prepare("SELECT id, order_number, status FROM sales_orders WHERE id = ?")
    .bind(orderId)
    .first();
  assert(order, "Sales order not found.", 404);
  assert(order.status === "open", "Only open sales orders can be cancelled.", 409);
  const timestamp = new Date().toISOString();
  const normalizedActor = normalizeActor(actor);
  await runInTransaction(db, [
    db
      .prepare(
        `UPDATE sales_orders
         SET status = 'cancelled', cancelled_at = ?, cancelled_by = ?, updated_at = ?, updated_by = ?
         WHERE id = ? AND status = 'open'`,
      )
      .bind(timestamp, normalizedActor, timestamp, normalizedActor, orderId),
    createSalesOrderEventStatement(db, {
      id: createId("sales-event"),
      orderId,
      action: "cancelled",
      note: `Cancelled order ${order.order_number}.`,
      actor: normalizedActor,
      createdAt: timestamp,
    }),
  ]);
}

export async function savePrinter(db, input) {
  const printer = normalizePrinter(input);
  assert(printer.name, "Printer name is required.");
  const filament = printer.filamentId ? await fetchFilamentRow(db, printer.filamentId) : null;
  assert(!printer.filamentId || filament, "Selected filament no longer exists.");
  printer.color = filament?.color || "";
  printer.material = filament?.material || "";

  const id = printer.id || createId("printer");
  await runInTransaction(db, [
    db
      .prepare(
        `INSERT INTO printers
          (id, name, model, color, material, active, notes)
         VALUES (?, ?, ?, ?, ?, ?, ?)
         ON CONFLICT(id) DO UPDATE SET
          name = excluded.name,
          model = excluded.model,
          color = excluded.color,
          material = excluded.material,
          active = excluded.active,
          notes = excluded.notes`,
      )
      .bind(id, printer.name, printer.model, printer.color, printer.material, printer.active ? 1 : 0, printer.notes),
    ...(printer.filamentId ? [printerFilamentStatement(db, id, printer.filamentId)] : [db.prepare("DELETE FROM printer_filaments WHERE printer_id = ?").bind(id)]),
  ]);
  return id;
}

export async function deletePrinter(db, id) {
  assert(id, "Printer id is required.");
  const printer = await fetchPrinterRow(db, id);
  assert(printer, "Printer not found.", 404);
  await runInTransaction(db, [db.prepare("DELETE FROM printers WHERE id = ?").bind(id)]);
}

export async function setPrinterActive(db, { printerId, active }) {
  assert(printerId, "Printer id is required.");
  const printer = await fetchPrinterRow(db, printerId);
  assert(printer, "Printer not found.", 404);
  await runInTransaction(db, [
    db.prepare("UPDATE printers SET active = ? WHERE id = ?").bind(active ? 1 : 0, printerId),
  ]);
}

export async function applyQueueAction(db, { partId, action, quantity, actor, requestId, expectedQueueVersion, expectedFilamentId, expectedFilamentGramsPerUnit }) {
  assert(partId, "Part id is required.");
  assert(action, "Queue action is required.");
  const qty = Number(quantity);
  assert(Number.isSafeInteger(qty) && qty > 0, "Queue quantity must be a positive whole number.");
  const fingerprint = JSON.stringify(["queue", partId, action, qty, normalizeActor(actor), expectedQueueVersion, expectedFilamentId, expectedFilamentGramsPerUnit]);
  if (await isMutationReplay(db, requestId, fingerprint)) return;

  const state = await readState(db);
  const queueByPartId = buildQueueByPartId(state);
  const row = queueByPartId.get(partId);
  assert(row, "Queue row not found.", 404);
  assert(Number.isSafeInteger(expectedQueueVersion) && expectedQueueVersion === row.part.queueVersion, "The queue changed. Refresh and retry.", 409);
  const consumedQty = consumptionQuantity(action, qty, row.prepaidFilamentQty);
  let consumptionMg = 0;
  let usageMg = 0;
  if (consumedQty > 0 || action === "start") {
    assert(row.part.filamentId && state.filaments.some((filament) => filament.id === row.part.filamentId), "Configure this part's filament and grams per unit before starting or completing prints.");
    usageMg = requireGrams(row.part.filamentGramsPerUnit, true);
    assert(expectedFilamentId === row.part.filamentId && gramsToMilligrams(expectedFilamentGramsPerUnit) === usageMg,
      "This part's filament settings changed. Refresh and retry.", 409);
    consumptionMg = consumedQty * usageMg;
    assert(Number.isSafeInteger(consumptionMg), "Filament consumption is too large.");
  }

  const entry = normalizePrintStateEntry(
    state.printState.find((candidate) => candidate.partId === partId) || {
      partId,
      plannedQty: 0,
      inProgressQty: 0,
      failedQty: 0,
      updatedAt: "",
    },
  );
  const timestamp = new Date().toISOString();
  const normalizedActor = normalizeActor(actor);

  if (action === "plan") {
    assert(row.remainingQty > 0, "There is no unplanned quantity remaining for this part.");
    assert(qty <= row.remainingQty, `The quantity cannot be greater than ${row.remainingQty}.`);
    entry.plannedQty += qty;
  } else if (action === "start") {
    const maxStart = row.plannedQty + row.remainingQty;
    assert(maxStart > 0, "There is no quantity available to start for this part.");
    assert(qty <= maxStart, `The quantity cannot be greater than ${maxStart}.`);
    const fromPlanned = Math.min(entry.plannedQty, qty);
    entry.plannedQty -= fromPlanned;
    entry.inProgressQty += qty;
  } else if (action === "complete") {
    const maxComplete = row.inProgressQty + row.plannedQty + row.remainingQty;
    assert(maxComplete > 0, "There is no quantity available to complete for this part.");
    assert(qty <= maxComplete, `The quantity cannot be greater than ${maxComplete}.`);
    let remainder = qty;
    const fromInProgress = Math.min(entry.inProgressQty, remainder);
    entry.inProgressQty -= fromInProgress;
    entry.prepaidFilamentQty = Math.max(entry.prepaidFilamentQty - fromInProgress, 0);
    remainder -= fromInProgress;
    const fromPlanned = Math.min(entry.plannedQty, remainder);
    entry.plannedQty -= fromPlanned;
  } else if (action === "fail") {
    assert(row.inProgressQty > 0, "Only in-progress quantity can be marked as failed.");
    assert(qty <= row.inProgressQty, `The quantity cannot be greater than ${row.inProgressQty}.`);
    entry.inProgressQty -= qty;
    entry.prepaidFilamentQty = Math.max(entry.prepaidFilamentQty - qty, 0);
    entry.failedQty += qty;
  } else if (action === "retry") {
    assert(row.failedQty > 0, "There is no failed quantity to retry.");
    assert(qty <= row.failedQty, `The quantity cannot be greater than ${row.failedQty}.`);
    entry.failedQty -= qty;
    entry.plannedQty += qty;
  } else {
    throw new ApiError(400, "Unknown queue action.");
  }

  entry.updatedAt = timestamp;
  const entityKey = `queue:${partId}`;
  let guard = "COALESCE((SELECT MAX(rowid) FROM mutation_receipts WHERE entity_key = ?), 0) = ?";
  const bindings = [entityKey, expectedQueueVersion, partId];
  guard += " AND COALESCE((SELECT is_printed FROM part_production_settings WHERE part_id = ?), 1) = 1";
  if (consumedQty > 0 || action === "start") {
    guard += " AND EXISTS (SELECT 1 FROM part_filaments WHERE part_id = ? AND filament_id = ? AND grams_per_unit_mg = ?)";
    bindings.push(partId, row.part.filamentId, usageMg);
  }
  const statements = [mutationReceipt(db, requestId, fingerprint, entityKey, guard, bindings)];
  const printEventId = createId("print-event");

  if (action === "complete" || action === "fail") {
    statements.push(db.prepare("UPDATE filament_prepaid_prints SET quantity = ? WHERE part_id = ?").bind(entry.prepaidFilamentQty, partId));
  }

  if (entry.plannedQty > 0 || entry.inProgressQty > 0 || entry.failedQty > 0) {
    statements.push(
      db
        .prepare(
          `INSERT INTO print_state
            (part_id, planned_qty, in_progress_qty, failed_qty, updated_at)
           VALUES (?, ?, ?, ?, ?)
           ON CONFLICT(part_id) DO UPDATE SET
            planned_qty = excluded.planned_qty,
            in_progress_qty = excluded.in_progress_qty,
            failed_qty = excluded.failed_qty,
            updated_at = excluded.updated_at`,
        )
        .bind(partId, entry.plannedQty, entry.inProgressQty, entry.failedQty, entry.updatedAt),
    );
  } else {
    statements.push(db.prepare("DELETE FROM print_state WHERE part_id = ?").bind(partId));
  }

  statements.push(
    createPrintEventStatement(db, {
      id: printEventId,
      partId,
      action,
      quantity: qty,
      note: queueActionNote(action),
      actor: normalizedActor,
      createdAt: timestamp,
    }),
  );

  if (consumedQty > 0) {
    statements.push(
      db.prepare("UPDATE filaments SET stock_mg = stock_mg - ? WHERE id = ?").bind(consumptionMg, row.part.filamentId),
      createFilamentMovementStatement(db, {
        id: createId("filament-move"), filamentId: row.part.filamentId,
        deltaGrams: -consumptionMg / 1000, reason: "print_completed",
        partId, printEventId, quantity: consumedQty, gramsPerUnit: usageMg / 1000,
        note: `${consumedQty} × ${usageMg / 1000} g for ${row.part.name}.`, actor: normalizedActor, createdAt: timestamp,
      }),
    );
  }

  if (action === "complete") {
    statements.push(
      db.prepare("UPDATE parts SET inventory_qty = inventory_qty + ? WHERE id = ?").bind(qty, partId),
    );
    statements.push(
      createPartMovementStatement(db, {
        id: createId("part-move"),
        partId,
        deltaQty: qty,
        reason: "print_completed",
        referenceType: "part",
        referenceId: partId,
        note: "Completed print added to inventory.",
        actor: normalizedActor,
        createdAt: timestamp,
      }),
    );
    statements.push(
      db
        .prepare(
          `INSERT INTO completed_prints
            (id, part_id, quantity, completed_at)
           VALUES (?, ?, ?, ?)`,
        )
        .bind(createId("completion"), partId, qty, timestamp),
    );
  }

  await commitMutation(db, statements, requestId, fingerprint);
}

export async function withMutationState(context, callback) {
  try {
    const db = await getDb(context);
    await callback(db, context);
    return json({ ok: true, state: buildStateResponse(context, await readState(db)) });
  } catch (error) {
    return json(
      {
        error: error instanceof ApiError ? error.message : error instanceof Error ? error.message : "Unknown error",
      },
      error instanceof ApiError ? error.status : 500,
    );
  }
}

export function normalizeFilament(input) {
  return {
    id: String(input?.id || ""), manufacturer: String(input?.manufacturer || "").trim(),
    material: String(input?.material || "").trim(), color: String(input?.color || "").trim(),
    spoolWeightGrams: input?.spoolWeightGrams ?? null, stockGrams: input?.stockGrams ?? 0,
    stockVersion: toNonNegativeInteger(input?.stockVersion),
  };
}

export function normalizeFilamentMovement(input) {
  return {
    id: String(input?.id || ""), filamentId: String(input?.filamentId || ""),
    deltaGrams: input?.deltaGrams ?? 0, reason: String(input?.reason || ""),
    note: String(input?.note || ""), actor: normalizeActor(input?.actor), createdAt: String(input?.createdAt || ""),
    partId: input?.partId || null, printEventId: input?.printEventId || null, partMovementId: input?.partMovementId || null,
    quantity: toNonNegativeInteger(input?.quantity), gramsPerUnit: input?.gramsPerUnit ?? 0,
  };
}

function requireGrams(value, positive = false) {
  const mg = gramsToMilligrams(value);
  assert(mg !== null && (!positive || mg > 0), positive
    ? "Weight must be greater than zero, with at most two decimal places."
    : "Weight must be a finite number with at most two decimal places.");
  return mg;
}

function requireRolls(value, positive = false) {
  const rolls = Number(value);
  assert(value !== null && value !== undefined && String(value).trim() !== "" && Number.isSafeInteger(rolls) && rolls >= (positive ? 1 : 0), "Roll count must be a whole non-negative number.");
  return rolls;
}

function validateFilament(filament) {
  for (const field of ["manufacturer", "material", "color"]) {
    assert(filament[field] && filament[field].length <= 80, `Filament ${field} is required (maximum 80 characters).`);
  }
  requireGrams(filament.spoolWeightGrams, true);
}

function fetchFilamentRow(db, id) {
  return db.prepare(`SELECT f.*, COALESCE((SELECT MAX(rowid) FROM filament_inventory_movements WHERE filament_id = f.id), 0) AS stock_version FROM filaments f WHERE id = ?`).bind(id || "").first();
}

function partProductionStatement(db, partId, isPrinted) {
  return db.prepare(`INSERT INTO part_production_settings (part_id, is_printed) VALUES (?, ?)
    ON CONFLICT(part_id) DO UPDATE SET is_printed = excluded.is_printed`).bind(partId, isPrinted ? 1 : 0);
}

function linkFilamentPartMovement(db, filamentMovementId, partMovementId) {
  return db.prepare("INSERT INTO filament_part_stock_movements (filament_movement_id, part_movement_id) VALUES (?, ?)")
    .bind(filamentMovementId, partMovementId);
}

function partFilamentStatement(db, partId, filamentId, usageMg) {
  return db.prepare(`INSERT INTO part_filaments (part_id, filament_id, grams_per_unit_mg) VALUES (?, ?, ?)
    ON CONFLICT(part_id) DO UPDATE SET filament_id = excluded.filament_id, grams_per_unit_mg = excluded.grams_per_unit_mg`).bind(partId, filamentId, usageMg);
}

function printerFilamentStatement(db, printerId, filamentId) {
  return db.prepare(`INSERT INTO printer_filaments (printer_id, filament_id) VALUES (?, ?)
    ON CONFLICT(printer_id) DO UPDATE SET filament_id = excluded.filament_id`).bind(printerId, filamentId);
}

function createFilamentMovementStatement(db, entry) {
  return db.prepare(`INSERT INTO filament_inventory_movements
    (id, filament_id, delta_mg, reason, note, actor, created_at, part_id, print_event_id, quantity, grams_per_unit_mg)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`)
    .bind(entry.id, entry.filamentId, requireGrams(entry.deltaGrams), entry.reason, entry.note || "", normalizeActor(entry.actor),
      entry.createdAt, entry.partId || null, entry.printEventId || null, entry.quantity || 0, requireGrams(entry.gramsPerUnit ?? 0));
}

// A CHECK constraint in the receipt insert aborts the entire D1 batch if a
// concurrently committed command changed the state used to calculate this one.
function mutationReceipt(db, requestId, fingerprint, entityKey, guard = "1", bindings = []) {
  return db.prepare(`INSERT INTO mutation_receipts (request_id, fingerprint, entity_key, created_at, precondition_valid)
    VALUES (?, ?, ?, ?, CASE WHEN (${guard}) THEN 1 ELSE 0 END)`)
    .bind(requestId, fingerprint, entityKey, new Date().toISOString(), ...bindings);
}

async function isMutationReplay(db, requestId, fingerprint) {
  assert(typeof requestId === "string" && requestId.length >= 8 && requestId.length <= 100, "A requestId is required for this action.");
  const previous = await db.prepare("SELECT fingerprint FROM mutation_receipts WHERE request_id = ?").bind(requestId).first();
  assert(!previous || previous.fingerprint === fingerprint, "This requestId was already used for a different action.", 409);
  return Boolean(previous);
}

async function commitMutation(db, statements, requestId, fingerprint) {
  try {
    await runInTransaction(db, statements);
  } catch (error) {
    if (await isMutationReplay(db, requestId, fingerprint)) return;
    if (String(error.message).includes("precondition_valid")) {
      throw new ApiError(409, "The state changed while this action was being saved. Refresh and retry.");
    }
    throw error;
  }
}

export async function saveFilament(db, { filament: input, initialRolls = 0, additionalGrams = 0, requestId, actor = "" }) {
  const filament = normalizeFilament(input);
  validateFilament(filament);
  const fingerprint = JSON.stringify(["filament-save", filament.id, filament.manufacturer, filament.material, filament.color, filament.spoolWeightGrams, initialRolls, additionalGrams, normalizeActor(actor)]);
  if (await isMutationReplay(db, requestId, fingerprint)) return;
  const existing = filament.id ? await fetchFilamentRow(db, filament.id) : null;
  const id = filament.id || createId("filament");
  const spoolMg = requireGrams(filament.spoolWeightGrams, true);
  const openingMg = existing ? 0 : requireRolls(initialRolls) * spoolMg + requireGrams(additionalGrams);
  assert(Number.isSafeInteger(openingMg) && openingMg >= 0 && (existing || requireGrams(additionalGrams) >= 0), "Opening stock must be a non-negative, safe weight.");
  const statements = [mutationReceipt(db, requestId, fingerprint, `filament:${id}`)];
  if (existing) {
    statements.push(db.prepare("UPDATE filaments SET manufacturer = ?, material = ?, color = ?, spool_weight_mg = ? WHERE id = ?")
      .bind(filament.manufacturer, filament.material, filament.color, spoolMg, id));
  } else {
    statements.push(db.prepare("INSERT INTO filaments (id, manufacturer, material, color, spool_weight_mg, stock_mg) VALUES (?, ?, ?, ?, ?, ?)")
      .bind(id, filament.manufacturer, filament.material, filament.color, spoolMg, openingMg));
    if (openingMg > 0) statements.push(createFilamentMovementStatement(db, {
      id: createId("filament-move"), filamentId: id, deltaGrams: openingMg / 1000,
      reason: "opening_balance", note: "Initial filament stock.", actor, createdAt: new Date().toISOString(),
    }));
  }
  await commitMutation(db, statements, requestId, fingerprint);
  return id;
}

export async function adjustFilamentInventory(db, { filamentId, action, rolls = 0, additionalGrams = 0, deltaGrams = 0, note = "", expectedStockVersion, requestId, actor = "" }) {
  const fingerprint = JSON.stringify(["filament-stock", filamentId, action, rolls, additionalGrams, deltaGrams, note, expectedStockVersion, normalizeActor(actor)]);
  if (await isMutationReplay(db, requestId, fingerprint)) return;
  const filament = await fetchFilamentRow(db, filamentId);
  assert(filament, "Filament not found.", 404);
  let deltaMg;
  if (action === "receive") {
    deltaMg = requireRolls(rolls, true) * filament.spool_weight_mg;
  } else if (action === "set") {
    assert(Number.isSafeInteger(expectedStockVersion) && expectedStockVersion === filament.stock_version, "Filament stock changed. Refresh and retry the count.", 409);
    const additionalMg = requireGrams(additionalGrams);
    assert(additionalMg >= 0, "Additional grams must be non-negative.");
    deltaMg = requireRolls(rolls) * filament.spool_weight_mg + additionalMg - filament.stock_mg;
  } else if (action === "adjust") {
    deltaMg = requireGrams(deltaGrams);
  } else {
    throw new ApiError(400, "Unknown filament inventory action.");
  }
  assert(Number.isSafeInteger(deltaMg) && Number.isSafeInteger(filament.stock_mg + deltaMg), "Stock weight is too large.");
  assert(action === "receive" || String(note).trim(), "Enter a reason for this stock correction.");
  const guard = "EXISTS (SELECT 1 FROM filaments WHERE id = ? AND spool_weight_mg = ?)" + (action === "set"
    ? " AND COALESCE((SELECT MAX(rowid) FROM filament_inventory_movements WHERE filament_id = ?), 0) = ?" : "");
  const bindings = [filamentId, filament.spool_weight_mg, ...(action === "set" ? [filamentId, expectedStockVersion] : [])];
  await commitMutation(db, [
    mutationReceipt(db, requestId, fingerprint, `filament:${filamentId}`, guard, bindings),
    db.prepare("UPDATE filaments SET stock_mg = stock_mg + ? WHERE id = ?").bind(deltaMg, filamentId),
    createFilamentMovementStatement(db, {
      id: createId("filament-move"), filamentId, deltaGrams: deltaMg / 1000,
      reason: action === "receive" ? "rolls_received" : action === "set" ? "stock_count" : "manual_adjustment",
      note: String(note).trim(), actor, createdAt: new Date().toISOString(),
    }),
  ], requestId, fingerprint);
}

export async function deleteFilament(db, id) {
  assert(await fetchFilamentRow(db, id), "Filament not found.", 404);
  const references = await db.prepare(`SELECT 1 AS found FROM part_filaments WHERE filament_id = ?
    UNION ALL SELECT 1 FROM printer_filaments WHERE filament_id = ?
    UNION ALL SELECT 1 FROM filament_inventory_movements WHERE filament_id = ? LIMIT 1`).bind(id, id, id).first();
  assert(!references, "Cannot delete filament referenced by parts, printers, or inventory history.", 409);
  try {
    await runInTransaction(db, [db.prepare("DELETE FROM filaments WHERE id = ?").bind(id)]);
  } catch (error) {
    if (String(error.message).includes("FOREIGN KEY")) throw new ApiError(409, "This filament is now referenced. Refresh and retry.");
    throw error;
  }
}

export async function readRequestJson(request) {
  try {
    return await request.json();
  } catch (error) {
    throw new ApiError(400, "Request body must be valid JSON.");
  }
}

export function buildStateResponse(context, state) {
  return {
    ...state,
    meta: getRequestMeta(context),
  };
}

export function getRequestMeta(context) {
  const url = new URL(context.request.url);
  const auth = getAuthenticatedUser(context.request);
  const isLocal =
    url.hostname === "localhost" ||
    url.hostname === "127.0.0.1" ||
    url.hostname.endsWith(".localhost");
  const allowSampleReset = isLocal || String(context.env.ALLOW_SAMPLE_RESET || "").toLowerCase() === "true";

  return {
    auth: {
      authenticated: Boolean(auth.email),
      email: auth.email,
      source: auth.email ? "cloudflare_access" : "anonymous",
    },
    app: {
      environment: isLocal ? "local" : String(context.env.APP_ENV || "production"),
      canRestoreSampleData: allowSampleReset,
      hostname: url.hostname,
      previewDataSource: isLocal ? "" : String(context.env.PREVIEW_DATA_SOURCE || ""),
      previewSnapshotAt: isLocal ? "" : String(context.env.PREVIEW_SNAPSHOT_AT || ""),
    },
  };
}

export function resolveRequestActor(context, requestedActor = "") {
  const auth = getAuthenticatedUser(context.request);
  return normalizeActor(requestedActor || auth.email || "");
}

export function normalizeState(input) {
  return {
    filaments: Array.isArray(input?.filaments) ? input.filaments.map(normalizeFilament) : [],
    filamentInventoryMovements: Array.isArray(input?.filamentInventoryMovements) ? input.filamentInventoryMovements.map(normalizeFilamentMovement) : [],
    parts: Array.isArray(input?.parts) ? input.parts.map((part) => normalizePart(part)) : [],
    products: Array.isArray(input?.products) ? input.products.map((product) => normalizeProduct(product)) : [],
    printers: Array.isArray(input?.printers) ? input.printers.map((printer) => normalizePrinter(printer)) : [],
    printState: Array.isArray(input?.printState)
      ? input.printState.map((entry) => normalizePrintStateEntry(entry)).filter((entry) => entry.partId)
      : [],
    completedPrints: Array.isArray(input?.completedPrints)
      ? input.completedPrints.map((entry) => normalizeCompletedPrintEntry(entry)).filter((entry) => entry.partId)
      : [],
    partInventoryMovements: Array.isArray(input?.partInventoryMovements)
      ? input.partInventoryMovements
          .map((entry) => normalizePartInventoryMovement(entry))
          .filter((entry) => entry.id && entry.partId)
      : [],
    finishedInventoryMovements: Array.isArray(input?.finishedInventoryMovements)
      ? input.finishedInventoryMovements
          .map((entry) => normalizeFinishedInventoryMovement(entry))
          .filter((entry) => entry.id && entry.productId)
      : [],
    printEvents: Array.isArray(input?.printEvents)
      ? input.printEvents.map((entry) => normalizePrintEvent(entry)).filter((entry) => entry.id && entry.partId)
      : [],
    salesOrders: Array.isArray(input?.salesOrders)
      ? input.salesOrders.map((order) => normalizeSalesOrder(order)).filter((order) => order.id && order.orderNumber)
      : [],
    salesOrderEvents: Array.isArray(input?.salesOrderEvents)
      ? input.salesOrderEvents
          .map((entry) => normalizeSalesOrderEvent(entry))
          .filter((entry) => entry.id && entry.orderId)
      : [],
  };
}

export function normalizePart(part) {
  return {
    id: String(part?.id || ""),
    name: String(part?.name || ""),
    sku: String(part?.sku || ""),
    color: String(part?.color || ""),
    material: String(part?.material || ""),
    isPrinted: part?.isPrinted !== false,
    filamentId: part?.isPrinted !== false && part?.filamentId ? String(part.filamentId) : null,
    filamentGramsPerUnit: part?.isPrinted === false ? null : part?.filamentGramsPerUnit ?? null,
    queueVersion: toNonNegativeInteger(part?.queueVersion),
    inventoryQty: toNonNegativeInteger(part?.inventoryQty),
    minStock: toNonNegativeInteger(part?.minStock),
    printTimeMinutes: part?.isPrinted === false ? 0 : toNonNegativeInteger(part?.printTimeMinutes),
    imageRef: String(part?.imageRef || ""),
    fileRef: String(part?.fileRef || ""),
    notes: String(part?.notes || ""),
  };
}

export function normalizeProduct(product) {
  const requiresAssembly = product?.requiresAssembly !== false;
  const rawRequirements = Array.isArray(product?.partRequirements) ? product.partRequirements : [];
  const mergedRequirements = new Map();

  rawRequirements.forEach((requirement) => {
    const partId = String(requirement?.partId || "");
    const quantity = toNonNegativeInteger(requirement?.quantity);
    if (!partId || quantity <= 0) {
      return;
    }
    mergedRequirements.set(partId, (mergedRequirements.get(partId) || 0) + quantity);
  });

  const normalizedRequirements = Array.from(mergedRequirements.entries()).map(([partId, quantity]) => ({
    partId,
    quantity,
  }));

  return {
    id: String(product?.id || ""),
    name: String(product?.name || ""),
    sku: String(product?.sku || ""),
    active: Boolean(product?.active),
    requiresAssembly,
    finishedStock: requiresAssembly ? toNonNegativeInteger(product?.finishedStock) : 0,
    targetStock: 0,
    imageRef: String(product?.imageRef || ""),
    notes: String(product?.notes || ""),
    partRequirements: requiresAssembly
      ? normalizedRequirements
      : normalizedRequirements.length
        ? [{ partId: normalizedRequirements[0].partId, quantity: 1 }]
        : [],
  };
}

export function normalizePrinter(printer) {
  return {
    id: String(printer?.id || ""),
    name: String(printer?.name || ""),
    model: String(printer?.model || ""),
    filamentId: printer?.filamentId ? String(printer.filamentId) : null,
    color: String(printer?.color || ""),
    material: String(printer?.material || ""),
    active: printer?.active !== false,
    notes: String(printer?.notes || ""),
  };
}

export function normalizePrintStateEntry(entry) {
  return {
    partId: String(entry?.partId || ""),
    plannedQty: toNonNegativeInteger(entry?.plannedQty),
    inProgressQty: toNonNegativeInteger(entry?.inProgressQty),
    prepaidFilamentQty: Math.min(toNonNegativeInteger(entry?.prepaidFilamentQty), toNonNegativeInteger(entry?.inProgressQty)),
    failedQty: toNonNegativeInteger(entry?.failedQty),
    updatedAt: String(entry?.updatedAt || ""),
  };
}

export function normalizeCompletedPrintEntry(entry) {
  return {
    id: String(entry?.id || ""),
    partId: String(entry?.partId || ""),
    quantity: toNonNegativeInteger(entry?.quantity),
    completedAt: String(entry?.completedAt || ""),
  };
}

export function normalizePartInventoryMovement(entry) {
  return {
    id: String(entry?.id || ""),
    partId: String(entry?.partId || ""),
    deltaQty: toSignedInteger(entry?.deltaQty),
    reason: String(entry?.reason || ""),
    referenceType: String(entry?.referenceType || ""),
    referenceId: String(entry?.referenceId || ""),
    note: String(entry?.note || ""),
    actor: normalizeActor(entry?.actor),
    createdAt: String(entry?.createdAt || ""),
  };
}

export function normalizeFinishedInventoryMovement(entry) {
  return {
    id: String(entry?.id || ""),
    productId: String(entry?.productId || ""),
    deltaQty: toSignedInteger(entry?.deltaQty),
    reason: String(entry?.reason || ""),
    referenceType: String(entry?.referenceType || ""),
    referenceId: String(entry?.referenceId || ""),
    note: String(entry?.note || ""),
    actor: normalizeActor(entry?.actor),
    createdAt: String(entry?.createdAt || ""),
  };
}

export function normalizePrintEvent(entry) {
  return {
    id: String(entry?.id || ""),
    partId: String(entry?.partId || ""),
    action: String(entry?.action || ""),
    quantity: toNonNegativeInteger(entry?.quantity),
    note: String(entry?.note || ""),
    actor: normalizeActor(entry?.actor),
    createdAt: String(entry?.createdAt || ""),
  };
}

export function normalizeSalesOrder(order) {
  const status = ["open", "packed", "cancelled"].includes(order?.status) ? order.status : "open";
  const mergedItems = new Map();
  (Array.isArray(order?.items) ? order.items : []).forEach((item) => {
    const productId = String(item?.productId || "");
    const quantity = toNonNegativeInteger(item?.quantity);
    if (!productId || quantity <= 0) {
      return;
    }
    const existing = mergedItems.get(productId);
    if (existing) {
      existing.quantity += quantity;
      existing.fulfilledQuantity = Math.min(
        existing.quantity,
        existing.fulfilledQuantity + toNonNegativeInteger(item?.fulfilledQuantity),
      );
      return;
    }
    mergedItems.set(productId, {
      productId,
      productName: String(item?.productName || ""),
      productSku: String(item?.productSku || ""),
      quantity,
      fulfilledQuantity: Math.min(quantity, toNonNegativeInteger(item?.fulfilledQuantity)),
    });
  });

  return {
    id: String(order?.id || ""),
    orderNumber: String(order?.orderNumber || "").trim().slice(0, 80),
    orderDate: normalizeDate(order?.orderDate),
    source: String(order?.source || "manual").trim().slice(0, 40) || "manual",
    externalId: String(order?.externalId || "").trim().slice(0, 120),
    status,
    createdAt: String(order?.createdAt || ""),
    updatedAt: String(order?.updatedAt || ""),
    createdBy: normalizeActor(order?.createdBy),
    updatedBy: normalizeActor(order?.updatedBy),
    packedAt: String(order?.packedAt || ""),
    packedBy: normalizeActor(order?.packedBy),
    cancelledAt: String(order?.cancelledAt || ""),
    cancelledBy: normalizeActor(order?.cancelledBy),
    items: Array.from(mergedItems.values()),
  };
}

export function normalizeSalesOrderEvent(entry) {
  return {
    id: String(entry?.id || ""),
    orderId: String(entry?.orderId || ""),
    action: String(entry?.action || ""),
    note: String(entry?.note || ""),
    actor: normalizeActor(entry?.actor),
    createdAt: String(entry?.createdAt || ""),
  };
}

export function hasData(state) {
  return (
    state.filaments.length > 0 ||
    state.filamentInventoryMovements.length > 0 ||
    state.parts.length > 0 ||
    state.products.length > 0 ||
    state.printers.length > 0 ||
    state.printState.length > 0 ||
    state.completedPrints.length > 0 ||
    state.partInventoryMovements.length > 0 ||
    state.finishedInventoryMovements.length > 0 ||
    state.printEvents.length > 0 ||
    state.salesOrders.length > 0 ||
    state.salesOrderEvents.length > 0
  );
}

export function json(data, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: {
      "content-type": "application/json; charset=utf-8",
      "cache-control": "no-store",
    },
  });
}

function assert(condition, message, status = 400) {
  if (!condition) {
    throw new ApiError(status, message);
  }
}

function createId(prefix) {
  return `${prefix}-${crypto.randomUUID()}`;
}

async function fetchPartRow(db, id) {
  return db
    .prepare(
      `SELECT parts.*, COALESCE(settings.is_printed, 1) AS is_printed
       FROM parts LEFT JOIN part_production_settings settings ON settings.part_id = parts.id
       WHERE id = ?`,
    )
    .bind(id)
    .first();
}

async function fetchProductRow(db, id) {
  return db
    .prepare(
      `SELECT id, name, sku, active, requires_assembly, finished_stock, target_stock, image_ref, notes
       FROM products
       WHERE id = ?`,
    )
    .bind(id)
    .first();
}

async function fetchPrinterRow(db, id) {
  return db
    .prepare(
      `SELECT id, name, model, color, material, active, notes
       FROM printers
       WHERE id = ?`,
    )
    .bind(id)
    .first();
}

async function runInTransaction(db, statements) {
  await db.exec("PRAGMA foreign_keys = ON");
  if (statements.length === 0) {
    return;
  }
  await db.batch(statements);
}

function createPartMovementStatement(
  db,
  { id, partId, deltaQty, reason, referenceType = "", referenceId = "", note = "", actor = "", createdAt },
) {
  return db
    .prepare(
      `INSERT INTO part_inventory_movements
        (id, part_id, delta_qty, reason, reference_type, reference_id, note, actor, created_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    )
    .bind(id, partId, deltaQty, reason, referenceType, referenceId, note, normalizeActor(actor), createdAt);
}

function createFinishedMovementStatement(
  db,
  { id, productId, deltaQty, reason, referenceType = "", referenceId = "", note = "", actor = "", createdAt },
) {
  return db
    .prepare(
      `INSERT INTO finished_inventory_movements
        (id, product_id, delta_qty, reason, reference_type, reference_id, note, actor, created_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    )
    .bind(id, productId, deltaQty, reason, referenceType, referenceId, note, normalizeActor(actor), createdAt);
}

function createPrintEventStatement(db, { id, partId, action, quantity, note = "", actor = "", createdAt }) {
  return db
    .prepare(
      `INSERT INTO print_events
        (id, part_id, action, quantity, note, actor, created_at)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
    )
    .bind(id, partId, action, quantity, note, normalizeActor(actor), createdAt);
}

function createSalesOrderEventStatement(db, { id, orderId, action, note = "", actor = "", createdAt }) {
  return db
    .prepare(
      `INSERT INTO sales_order_events
        (id, order_id, action, note, actor, created_at)
       VALUES (?, ?, ?, ?, ?, ?)`,
    )
    .bind(id, orderId, action, note, normalizeActor(actor), createdAt);
}

function summarizeProduct(product, partsById) {
  const requirements = product.partRequirements.map((requirement) => {
    const part = partsById.get(requirement.partId);
    const available = part ? part.inventoryQty : 0;
    return {
      ...requirement,
      available,
    };
  });

  const buildableNow = requirements.length
    ? Math.min(...requirements.map((requirement) => Math.floor(requirement.available / requirement.quantity)))
    : 0;

  return {
    ...product,
    requirements,
    buildableNow,
    onHandNow: product.requiresAssembly ? product.finishedStock : buildableNow,
  };
}

function buildQueueByPartId(state) {
  const printStateByPartId = new Map(
    state.printState.map((entry) => [entry.partId, normalizePrintStateEntry(entry)]),
  );
  const demandModel = buildDemandModel(state);

  const queueByPartId = new Map();
  state.parts.forEach((part) => {
    if (!part.isPrinted) return;
    const demand = demandModel.partDemandById.get(part.id);
    const requiredQty = demand?.requiredQty || 0;
    const shortageQty = demand?.shortageQty || 0;
    const printState = printStateByPartId.get(part.id) || normalizePrintStateEntry({ partId: part.id });
    const plannedQty = printState.plannedQty;
    const inProgressQty = printState.inProgressQty;
    const failedQty = printState.failedQty;
    const remainingQty = Math.max(shortageQty - plannedQty - inProgressQty, 0);
    const hasActivity = plannedQty > 0 || inProgressQty > 0 || failedQty > 0;

    if (!shortageQty && !hasActivity) {
      return;
    }

    queueByPartId.set(part.id, {
      part,
      partId: part.id,
      requiredQty,
      shortageQty,
      plannedQty,
      inProgressQty,
      prepaidFilamentQty: printState.prepaidFilamentQty,
      failedQty,
      remainingQty,
    });
  });

  return queueByPartId;
}

function queueActionNote(action) {
  if (action === "plan") {
    return "Queue quantity planned.";
  }
  if (action === "start") {
    return "Queue quantity started.";
  }
  if (action === "complete") {
    return "Queue quantity completed.";
  }
  if (action === "fail") {
    return "Queue quantity failed.";
  }
  if (action === "retry") {
    return "Failed quantity moved back to planned.";
  }
  return "";
}

function toNonNegativeInteger(value) {
  const parsed = Number.parseInt(String(value), 10);
  if (!Number.isFinite(parsed) || parsed < 0) {
    return 0;
  }
  return parsed;
}

function toSignedInteger(value) {
  const parsed = Number.parseInt(String(value), 10);
  if (!Number.isFinite(parsed)) {
    return 0;
  }
  return parsed;
}

function normalizeActor(value) {
  return String(value || "").trim().slice(0, 80);
}

function normalizeDate(value) {
  const raw = String(value || "").trim();
  return /^\d{4}-\d{2}-\d{2}$/.test(raw) ? raw : "";
}

function decodeBase64Url(value) {
  const normalized = String(value || "")
    .replace(/-/g, "+")
    .replace(/_/g, "/");
  const padding = normalized.length % 4;
  const padded = padding ? normalized + "=".repeat(4 - padding) : normalized;
  return atob(padded);
}

function extractEmailFromAccessJwt(token) {
  const raw = String(token || "").trim();
  if (!raw) {
    return "";
  }

  const parts = raw.split(".");
  if (parts.length < 2) {
    return "";
  }

  try {
    const payload = JSON.parse(decodeBase64Url(parts[1]));
    return normalizeActor(payload?.email || payload?.sub || "");
  } catch {
    return "";
  }
}

function readCookie(headers, name) {
  const raw = String(headers.get("cookie") || "");
  if (!raw) {
    return "";
  }

  const prefix = `${name}=`;
  const entry = raw
    .split(";")
    .map((segment) => segment.trim())
    .find((segment) => segment.startsWith(prefix));

  return entry ? decodeURIComponent(entry.slice(prefix.length)) : "";
}

async function ensureColumn(db, tableName, columnName, alterSql) {
  const result = await db.prepare(`PRAGMA table_info(${tableName})`).all();
  const hasColumn = (result.results || []).some((row) => row.name === columnName);
  if (!hasColumn) {
    await db.exec(alterSql);
  }
}

function getAuthenticatedUser(request) {
  const email =
    extractEmailFromAccessJwt(request.headers.get("cf-access-jwt-assertion")) ||
    normalizeActor(request.headers.get("cf-access-authenticated-user-email")) ||
    extractEmailFromAccessJwt(readCookie(request.headers, "CF_Authorization"));

  return {
    email,
  };
}
