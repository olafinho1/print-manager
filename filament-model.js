// UI/API quantities are grams; accounting always uses integer milligrams.
export function gramsToMilligrams(value) {
  if (value === null || value === undefined || String(value).trim() === "") return null;
  const text = String(value).trim();
  if (!/^-?(?:\d+(?:\.\d{0,2})?|\.\d{1,2})$/.test(text)) return null;
  const [whole, fraction = ""] = text.replace(/^-/, "").split(".");
  const magnitude = BigInt(whole || "0") * 1000n + BigInt(fraction.padEnd(2, "0")) * 10n;
  if (magnitude > BigInt(Number.MAX_SAFE_INTEGER)) return null;
  return Number(text.startsWith("-") ? -magnitude : magnitude);
}

export function filamentLabel(filament) {
  return `${filament.manufacturer} · ${filament.material} · ${filament.color} · ${filament.spoolWeightGrams} g`;
}

export function printerMatchesFilament(printer, part) {
  return Boolean(part.isPrinted !== false && printer.filamentId && part.filamentId && printer.filamentId === part.filamentId);
}

export function consumptionQuantity(action, quantity, prepaidFilamentQty = 0) {
  return action === "complete" ? Math.max(quantity - prepaidFilamentQty, 0) : 0;
}

export function futureFilamentDemand(queueRows) {
  const demand = new Map();
  for (const row of queueRows) {
    if (row.part.isPrinted === false) continue;
    const mg = gramsToMilligrams(row.part.filamentGramsPerUnit);
    if (!row.part.filamentId || !mg) continue;
    const required = (row.plannedQty + row.remainingQty + (row.inProgressQty || 0) - (row.prepaidFilamentQty || 0)) * mg;
    demand.set(row.part.filamentId, (demand.get(row.part.filamentId) || 0) + required);
  }
  return new Map([...demand].map(([id, mg]) => [id, mg / 1000]));
}

export function filamentOrderingNeeds(filaments, queueRows) {
  const demand = futureFilamentDemand(queueRows);
  return filaments.map((filament) => {
    const neededGrams = demand.get(filament.id) || 0;
    const shortageMg = Math.max(gramsToMilligrams(neededGrams) - gramsToMilligrams(filament.stockGrams), 0);
    return {
      filament,
      neededGrams,
      shortageGrams: shortageMg / 1000,
      rollsToOrder: Math.ceil(shortageMg / gramsToMilligrams(filament.spoolWeightGrams)),
    };
  }).filter((entry) => entry.shortageGrams > 0)
    .sort((a, b) => b.shortageGrams - a.shortageGrams || filamentLabel(a.filament).localeCompare(filamentLabel(b.filament)));
}

// Only the explicitly requested sample dataset receives invented filament values.
export function addSampleFilaments(sample) {
  if (!sample.parts.some((part) => part.id === "sample-component-screw")) sample.parts.push({
    id: "sample-component-screw", name: "M3 screw", sku: "SCREW-M3", isPrinted: false,
    color: "", material: "Steel", inventoryQty: 24, minStock: 10, printTimeMinutes: 0,
    filamentId: null, filamentGramsPerUnit: null, imageRef: "", fileRef: "", notes: "Purchased component; no filament usage.",
  });
  const setups = new Map();
  for (const part of sample.parts) {
    if (part.isPrinted === false) continue;
    const key = `${part.material}-${part.color}`;
    if (!setups.has(key)) setups.set(key, {
      id: `sample-filament-${key.toLowerCase()}`, manufacturer: "Sample manufacturer",
      material: part.material, color: part.color, spoolWeightGrams: 1000, stockGrams: 3000,
    });
    part.filamentId = setups.get(key).id;
    part.filamentGramsPerUnit = 25;
  }
  sample.filaments = [...setups.values()];
  sample.filamentInventoryMovements = sample.filaments.map((filament) => ({
    id: `opening-${filament.id}`, filamentId: filament.id, deltaGrams: filament.stockGrams,
    reason: "opening_balance", note: "Sample opening balance.", actor: "Sample data",
    createdAt: "2026-05-02T00:00:00.000Z", partId: null, printEventId: null,
    quantity: 0, gramsPerUnit: 0,
  }));
  for (const printer of sample.printers) {
    printer.filamentId = setups.get(`${printer.material}-${printer.color}`)?.id || null;
  }
  return sample;
}
