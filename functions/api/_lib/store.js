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
      targetStock: 8,
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
      targetStock: 6,
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
      targetStock: 5,
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
};

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
  "CREATE INDEX IF NOT EXISTS idx_product_requirements_product_id ON product_requirements(product_id, sort_order)",
  "CREATE INDEX IF NOT EXISTS idx_completed_prints_completed_at ON completed_prints(completed_at DESC)",
  "CREATE INDEX IF NOT EXISTS idx_part_inventory_movements_part_created_at ON part_inventory_movements(part_id, created_at DESC)",
  "CREATE INDEX IF NOT EXISTS idx_finished_inventory_movements_product_created_at ON finished_inventory_movements(product_id, created_at DESC)",
  "CREATE INDEX IF NOT EXISTS idx_print_events_part_created_at ON print_events(part_id, created_at DESC)",
];

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
  for (const statement of SCHEMA_STATEMENTS) {
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
  ] = await db.batch([
    db.prepare(
      `SELECT id, name, sku, color, material, inventory_qty, min_stock, print_time_minutes, image_ref, file_ref, notes
       FROM parts
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
      `SELECT part_id, planned_qty, in_progress_qty, failed_qty, updated_at
       FROM print_state
       ORDER BY part_id ASC`,
    ),
    db.prepare(
      `SELECT id, part_id, quantity, completed_at
       FROM completed_prints
       ORDER BY completed_at DESC`,
    ),
    db.prepare(
      `SELECT id, part_id, delta_qty, reason, reference_type, reference_id, note, actor, created_at
       FROM part_inventory_movements
       ORDER BY created_at DESC
       LIMIT 400`,
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
       ORDER BY created_at DESC
       LIMIT 400`,
    ),
  ]);

  const requirementsByProductId = new Map();
  for (const row of requirementsResult.results || []) {
    const list = requirementsByProductId.get(row.product_id) || [];
    list.push({
      partId: row.part_id,
      quantity: toNonNegativeInteger(row.quantity),
    });
    requirementsByProductId.set(row.product_id, list);
  }

  return normalizeState({
    parts: (partsResult.results || []).map((row) => ({
      id: row.id,
      name: row.name,
      sku: row.sku,
      color: row.color,
      material: row.material,
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
      active: Boolean(row.active),
      notes: row.notes,
    })),
    printState: (printStateResult.results || []).map((row) => ({
      partId: row.part_id,
      plannedQty: row.planned_qty,
      inProgressQty: row.in_progress_qty,
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
  });
}

export async function replaceState(db, inputState) {
  const state = normalizeState(inputState);
  const statements = [
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
  assert(part.color, "Part color is required.");
  assert(part.material, "Part material is required.");

  const id = part.id || createId("part");
  const existing = await fetchPartRow(db, id);
  const previousInventoryQty = existing ? toNonNegativeInteger(existing.inventory_qty) : 0;
  const nextInventoryQty = part.inventoryQty;
  const timestamp = new Date().toISOString();
  const statements = [
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
          inventory_qty = excluded.inventory_qty,
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

  const inventoryDelta = nextInventoryQty - previousInventoryQty;
  if (existing && inventoryDelta !== 0) {
    statements.push(
      createPartMovementStatement(db, {
        id: createId("part-move"),
        partId: id,
        deltaQty: inventoryDelta,
        reason: "manual_edit_balance",
        referenceType: "part",
        referenceId: id,
        note: "Inventory changed from the part form.",
        actor,
        createdAt: timestamp,
      }),
    );
  }

  await runInTransaction(db, statements);
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

export async function adjustPartInventory(db, { partId, delta, reason, note, actor }) {
  assert(partId, "Part id is required.");
  const numericDelta = toSignedInteger(delta);
  assert(numericDelta !== 0, "Inventory adjustment must be non-zero.");
  const part = await fetchPartRow(db, partId);
  assert(part, "Part not found.", 404);
  const nextInventoryQty = toNonNegativeInteger(part.inventory_qty) + numericDelta;
  assert(nextInventoryQty >= 0, "Inventory cannot go below zero.");

  const timestamp = new Date().toISOString();
  await runInTransaction(db, [
    db.prepare("UPDATE parts SET inventory_qty = ? WHERE id = ?").bind(nextInventoryQty, partId),
    createPartMovementStatement(db, {
      id: createId("part-move"),
      partId,
      deltaQty: numericDelta,
      reason: reason || "manual_adjustment",
      referenceType: "part",
      referenceId: partId,
      note: String(note || ""),
      actor: normalizeActor(actor),
      createdAt: timestamp,
    }),
  ]);
}

export async function saveProduct(db, input, actor = "") {
  const product = normalizeProduct(input);
  assert(product.name, "Product name is required.");

  if (product.requiresAssembly) {
    assert(product.partRequirements.length > 0, "Add at least one printed part requirement for assembled products.");
  } else {
    assert(product.partRequirements.length > 0, "Products without assembly still need one printed part.");
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
  const finishedMovement = await db
    .prepare("SELECT id FROM finished_inventory_movements WHERE product_id = ? LIMIT 1")
    .bind(id)
    .first();
  assert(!finishedMovement, "Cannot delete product because finished inventory history still references it.");
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

export async function savePrinter(db, input) {
  const printer = normalizePrinter(input);
  assert(printer.name, "Printer name is required.");
  assert(printer.color, "Printer color is required.");
  assert(printer.material, "Printer material is required.");

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

export async function applyQueueAction(db, { partId, action, quantity, actor }) {
  assert(partId, "Part id is required.");
  assert(action, "Queue action is required.");
  const qty = toNonNegativeInteger(quantity);
  assert(qty > 0, "Queue quantity must be greater than zero.");

  const state = await readState(db);
  const queueByPartId = buildQueueByPartId(state);
  const row = queueByPartId.get(partId);
  assert(row, "Queue row not found.", 404);

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
    remainder -= fromInProgress;
    const fromPlanned = Math.min(entry.plannedQty, remainder);
    entry.plannedQty -= fromPlanned;
  } else if (action === "fail") {
    assert(row.inProgressQty > 0, "Only in-progress quantity can be marked as failed.");
    assert(qty <= row.inProgressQty, `The quantity cannot be greater than ${row.inProgressQty}.`);
    entry.inProgressQty -= qty;
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
  const statements = [];

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
      id: createId("print-event"),
      partId,
      action,
      quantity: qty,
      note: queueActionNote(action),
      actor: normalizedActor,
      createdAt: timestamp,
    }),
  );

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

  await runInTransaction(db, statements);
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
    },
  };
}

export function resolveRequestActor(context, requestedActor = "") {
  const auth = getAuthenticatedUser(context.request);
  return normalizeActor(requestedActor || auth.email || "");
}

export function normalizeState(input) {
  return {
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
  };
}

export function normalizePart(part) {
  return {
    id: String(part?.id || ""),
    name: String(part?.name || ""),
    sku: String(part?.sku || ""),
    color: String(part?.color || ""),
    material: String(part?.material || ""),
    inventoryQty: toNonNegativeInteger(part?.inventoryQty),
    minStock: toNonNegativeInteger(part?.minStock),
    printTimeMinutes: toNonNegativeInteger(part?.printTimeMinutes),
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
    targetStock: toNonNegativeInteger(product?.targetStock),
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

export function hasData(state) {
  return (
    state.parts.length > 0 ||
    state.products.length > 0 ||
    state.printers.length > 0 ||
    state.printState.length > 0 ||
    state.completedPrints.length > 0 ||
    state.partInventoryMovements.length > 0 ||
    state.finishedInventoryMovements.length > 0 ||
    state.printEvents.length > 0
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
      `SELECT id, name, sku, color, material, inventory_qty, min_stock, print_time_minutes, image_ref, file_ref, notes
       FROM parts
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
    targetGap: Math.max(product.targetStock - product.finishedStock, 0),
  };
}

function buildQueueByPartId(state) {
  const partsById = new Map(state.parts.map((part) => [part.id, part]));
  const printStateByPartId = new Map(
    state.printState.map((entry) => [entry.partId, normalizePrintStateEntry(entry)]),
  );
  const productSummaries = state.products.map((product) => summarizeProduct(product, partsById));
  const demandByPartId = new Map();

  productSummaries
    .filter((product) => product.active && product.targetGap > 0)
    .forEach((product) => {
      product.requirements.forEach((requirement) => {
        demandByPartId.set(
          requirement.partId,
          (demandByPartId.get(requirement.partId) || 0) + requirement.quantity * product.targetGap,
        );
      });
    });

  const queueByPartId = new Map();
  state.parts.forEach((part) => {
    const requiredQty = Math.max(demandByPartId.get(part.id) || 0, 0);
    const shortageQty = Math.max(requiredQty - part.inventoryQty, 0);
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
