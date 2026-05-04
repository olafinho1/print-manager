const SEED_STATE = {
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
  "CREATE INDEX IF NOT EXISTS idx_product_requirements_product_id ON product_requirements(product_id, sort_order)",
  "CREATE INDEX IF NOT EXISTS idx_completed_prints_completed_at ON completed_prints(completed_at DESC)",
];

export async function onRequest(context) {
  try {
    const db = context.env.DB;
    if (!db) {
      return json({ error: "D1 binding DB is not configured." }, 500);
    }

    await ensureSchema(db);

    if (context.request.method === "GET") {
      const state = await readState(db);
      if (!hasData(state)) {
        const seeded = normalizeState(SEED_STATE);
        await replaceState(db, seeded);
        return json(seeded);
      }
      return json(state);
    }

    if (context.request.method === "PUT") {
      const nextState = normalizeState(await context.request.json());
      await replaceState(db, nextState);
      return json(nextState);
    }

    return json({ error: "Method not allowed." }, 405);
  } catch (error) {
    return json(
      {
        error: error instanceof Error ? error.message : "Unknown error",
      },
      500,
    );
  }
}

async function ensureSchema(db) {
  for (const statement of SCHEMA_STATEMENTS) {
    await db.exec(statement);
  }
}

async function readState(db) {
  const [
    partsResult,
    productsResult,
    requirementsResult,
    printersResult,
    printStateResult,
    completedPrintsResult,
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
  });
}

async function replaceState(db, state) {
  const statements = [
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

  await db.batch(statements);
}

function normalizeState(input) {
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
  };
}

function normalizePart(part) {
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

function normalizeProduct(product) {
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

function normalizePrinter(printer) {
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

function normalizePrintStateEntry(entry) {
  return {
    partId: String(entry?.partId || ""),
    plannedQty: toNonNegativeInteger(entry?.plannedQty),
    inProgressQty: toNonNegativeInteger(entry?.inProgressQty),
    failedQty: toNonNegativeInteger(entry?.failedQty),
    updatedAt: String(entry?.updatedAt || ""),
  };
}

function normalizeCompletedPrintEntry(entry) {
  return {
    id: String(entry?.id || ""),
    partId: String(entry?.partId || ""),
    quantity: toNonNegativeInteger(entry?.quantity),
    completedAt: String(entry?.completedAt || ""),
  };
}

function toNonNegativeInteger(value) {
  const parsed = Number.parseInt(String(value), 10);
  if (!Number.isFinite(parsed) || parsed < 0) {
    return 0;
  }
  return parsed;
}

function hasData(state) {
  return (
    state.parts.length > 0 ||
    state.products.length > 0 ||
    state.printers.length > 0 ||
    state.printState.length > 0 ||
    state.completedPrints.length > 0
  );
}

function json(data, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: {
      "content-type": "application/json; charset=utf-8",
      "cache-control": "no-store",
    },
  });
}
