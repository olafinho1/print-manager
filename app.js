(() => {
  const STORAGE_KEY = "twirl-print-manager:v1";
  const STATUS_ORDER = {
    in_progress: 0,
    planned: 1,
    failed: 2,
    completed: 3,
  };
  const PRIORITY_ORDER = {
    high: 0,
    medium: 1,
    low: 2,
  };

  const seedState = {
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
        finishedStock: 4,
        targetStock: 0,
        notes: "Direct single-part SKU tracked with finished stock and packing.",
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

  const ui = {
    activeTab: "dashboard",
    partFormDraft: blankPartDraft(),
    productFormDraft: blankProductDraft(),
    printerFormDraft: blankPrinterDraft(),
  };

  const state = loadState();
  const dom = getDom();

  init();

  function init() {
    bindEvents();
    render();
  }

  function getDom() {
    return {
      summaryCards: document.querySelector("#summary-cards"),
      readyProducts: document.querySelector("#ready-products"),
      blockedProducts: document.querySelector("#blocked-products"),
      lowStockParts: document.querySelector("#low-stock-parts"),
      suggestedJobs: document.querySelector("#suggested-jobs"),
      queueSnapshot: document.querySelector("#queue-snapshot"),
      completedPrints: document.querySelector("#completed-prints"),
      partsList: document.querySelector("#parts-list"),
      partsCount: document.querySelector("#parts-count"),
      productsList: document.querySelector("#products-list"),
      productsCount: document.querySelector("#products-count"),
      printersList: document.querySelector("#printers-list"),
      printersCount: document.querySelector("#printers-count"),
      queueList: document.querySelector("#queue-list"),
      queueCount: document.querySelector("#queue-count"),
      queueSummary: document.querySelector("#queue-summary"),
      partForm: document.querySelector("#part-form"),
      productForm: document.querySelector("#product-form"),
      printerForm: document.querySelector("#printer-form"),
      productRequirementsSection: document.querySelector("#product-requirements-section"),
      addRequirementButton: document.querySelector("#add-requirement-button"),
      requirementsEditor: document.querySelector("#requirements-editor"),
      requirementsTitle: document.querySelector("#product-requirements-section .subhead__title"),
      requirementsCopy: document.querySelector("#product-requirements-section .subhead__copy"),
      restoreSampleData: document.querySelector("#restore-sample-data"),
      views: {
        dashboard: document.querySelector("#dashboard-view"),
        parts: document.querySelector("#parts-view"),
        products: document.querySelector("#products-view"),
        printers: document.querySelector("#printers-view"),
        queue: document.querySelector("#queue-view"),
      },
      tabButtons: Array.from(document.querySelectorAll("[data-tab]")),
    };
  }

  function bindEvents() {
    document.addEventListener("click", handleClick);

    dom.partForm.addEventListener("input", () => {
      ui.partFormDraft = readPartForm();
    });
    dom.partForm.addEventListener("change", () => {
      ui.partFormDraft = readPartForm();
    });
    dom.partForm.addEventListener("submit", handlePartSubmit);

    dom.productForm.addEventListener("input", () => {
      ui.productFormDraft = readProductForm();
    });
    dom.productForm.addEventListener("change", (event) => {
      ui.productFormDraft = readProductForm();
      if (event.target && event.target.name === "requiresAssembly") {
        syncProductDraftForAssemblyMode(ui.productFormDraft);
        renderProductForm();
      }
    });
    dom.productForm.addEventListener("submit", handleProductSubmit);

    dom.printerForm.addEventListener("input", () => {
      ui.printerFormDraft = readPrinterForm();
    });
    dom.printerForm.addEventListener("change", () => {
      ui.printerFormDraft = readPrinterForm();
    });
    dom.printerForm.addEventListener("submit", handlePrinterSubmit);
  }

  function handleClick(event) {
    const target = event.target.closest("[data-action], [data-tab], #restore-sample-data");
    if (!target) {
      return;
    }

    if (target.id === "restore-sample-data") {
      if (!window.confirm("Replace current data with the built-in sample dataset?")) {
        return;
      }
      overwriteState(clone(seedState));
      resetDrafts();
      render();
      return;
    }

    if (target.dataset.tab) {
      ui.activeTab = target.dataset.tab;
      render();
      return;
    }

    const { action, id, partId, quantity, index, status } = target.dataset;

    switch (action) {
      case "cancel-part-edit":
        ui.partFormDraft = blankPartDraft();
        renderPartForm();
        break;
      case "cancel-product-edit":
        ui.productFormDraft = blankProductDraft();
        renderProductForm();
        break;
      case "cancel-printer-edit":
        ui.printerFormDraft = blankPrinterDraft();
        renderPrinterForm();
        break;
      case "edit-part":
        startPartEdit(id);
        break;
      case "delete-part":
        deletePart(id);
        break;
      case "add-part-stock":
        adjustPartStock(id, "add");
        break;
      case "adjust-part-stock":
        adjustPartStock(id, "adjust");
        break;
      case "queue-part":
        prefillQueueForPart(id);
        break;
      case "edit-product":
        startProductEdit(id);
        break;
      case "delete-product":
        deleteProduct(id);
        break;
      case "edit-printer":
        startPrinterEdit(id);
        break;
      case "delete-printer":
        deletePrinter(id);
        break;
      case "toggle-printer":
        togglePrinter(id);
        break;
      case "toggle-product":
        toggleProduct(id);
        break;
      case "assemble-product":
        assembleProduct(id);
        break;
      case "adjust-finished-stock":
        adjustFinishedStock(id);
        break;
      case "pack-product":
        packProduct(id);
        break;
      case "add-requirement":
        addRequirementRow();
        break;
      case "remove-requirement":
        removeRequirementRow(Number(index));
        break;
      case "queue-suggestion":
        openQueueView();
        break;
      case "queue-plan":
        updateQueueState(partId, "plan");
        break;
      case "queue-start":
        updateQueueState(partId, "start");
        break;
      case "queue-complete":
        updateQueueState(partId, "complete");
        break;
      case "queue-fail":
        updateQueueState(partId, "fail");
        break;
      case "queue-retry":
        updateQueueState(partId, "retry");
        break;
      default:
        break;
    }
  }

  function render() {
    const computed = computeState();

    renderTabs();
    renderSummaryCards(computed);
    renderDashboard(computed);
    renderPartForm();
    renderPartsList(computed);
    renderProductForm();
    renderProductsList(computed);
    renderPrinterForm();
    renderPrintersList(computed);
    renderQueueSummary(computed);
    renderQueueList(computed);
  }

  function renderTabs() {
    dom.tabButtons.forEach((button) => {
      const isActive = button.dataset.tab === ui.activeTab;
      button.classList.toggle("is-active", isActive);
    });

    Object.entries(dom.views).forEach(([key, view]) => {
      view.hidden = key !== ui.activeTab;
    });
  }

  function renderSummaryCards(computed) {
    dom.summaryCards.innerHTML = [
      {
        label: "Printed parts on hand",
        valueLabel: formatNumber(computed.totalPartInventory),
        detail: `${computed.parts.length} tracked part SKUs`,
      },
      {
        label: "Sellable products on hand",
        valueLabel: formatNumber(computed.totalFinishedInventory),
        detail: `${computed.readyToSell.length} products immediately sellable`,
      },
      {
        label: "Buildable right now",
        valueLabel: formatNumber(computed.totalBuildableUnits),
        detail: `${computed.buildableProductsCount} active products can be moved into finished stock now`,
      },
      {
        label: "Active printers",
        valueLabel: formatNumber(computed.activePrintersCount),
        detail: `${formatNumber(computed.queueReadyPrinterCount)} currently match open queue work`,
      },
      {
        label: "Parts in queue",
        valueLabel: formatNumber(computed.productionQueue.length),
        detail: `${formatNumber(computed.totalQueueRemainingQty)} still unplanned, ${formatDurationMinutes(computed.totalQueueRemainingPrintTimeMinutes)} left`,
      },
      {
        label: "Parallel queue time",
        valueLabel: computed.totalQueueParallelTimeLabel,
        detail: computed.unassignedQueueRowsCount
          ? `${formatNumber(computed.unassignedQueueRowsCount)} queue row${computed.unassignedQueueRowsCount === 1 ? "" : "s"} have no active printer`
          : "Estimated from current active color and material setups",
      },
    ]
      .map(
        (metric) => `
          <article class="summary-card">
            <p class="metric__label">${escapeHtml(metric.label)}</p>
            <p class="metric__value">${escapeHtml(metric.valueLabel)}</p>
            <p class="metric__detail">${escapeHtml(metric.detail)}</p>
          </article>
        `,
      )
      .join("");
  }

  function renderDashboard(computed) {
    dom.readyProducts.innerHTML = renderList(
      computed.readyToSell,
      (product) => {
        const productImage = resolveProductImage(product);
        return `
        <article class="detail-card">
          <div class="${productImage ? "card-hero card-hero--compact" : ""}">
            ${renderEntityImage(productImage, product.name)}
            <div>
              <div class="detail-card__head">
                <div>
                  <h3>${escapeHtml(product.name)}</h3>
                  <p class="sku">${escapeHtml(product.sku || "No SKU")}</p>
                </div>
                <span class="badge badge--active">${formatNumber(product.onHandNow)} on hand</span>
              </div>
              <div class="detail-grid">
                <div>
                  <p class="detail__label">${product.requiresAssembly ? "Ready from parts" : "Printed stock"}</p>
                  <div class="detail__value">${formatNumber(product.buildableNow)}</div>
                </div>
                <div>
                  <p class="detail__label">Total sellable</p>
                  <div class="detail__value">${formatNumber(product.totalSellableNow)}</div>
                </div>
                <div>
                  <p class="detail__label">Target stock</p>
                  <div class="detail__value">${formatNumber(product.targetStock)}</div>
                </div>
                <div>
                  <p class="detail__label">Print time / unit</p>
                  <div class="detail__value">${escapeHtml(formatDurationMinutes(product.printTimeMinutes))}</div>
                </div>
              </div>
              <div class="detail-row">
                <span class="chip">${product.requiresAssembly ? "Assembly product" : "Single-part product"}</span>
                <span class="chip">${escapeHtml(formatDurationMinutes(product.printTimeMinutes))} per unit</span>
                <button class="button button--small button--secondary" data-action="pack-product" data-id="${escapeHtml(product.id)}" type="button">
                  Pack
                </button>
              </div>
            </div>
          </div>
        </article>
      `;
      },
      "No sellable product stock is currently available.",
      "For direct products, printed part stock is already sellable. Assembly products still require assembly.",
    );

    dom.blockedProducts.innerHTML = renderList(
      computed.blockedProducts,
      (product) => `
        <article class="detail-card">
          <div class="detail-card__head">
            <div>
              <h3>${escapeHtml(product.name)}</h3>
              <p class="sku">${escapeHtml(product.sku || "No SKU")}</p>
            </div>
            <span class="badge badge--inactive">Blocked</span>
          </div>
          <div class="missing-list">
            ${product.missingForNextUnit
              .map(
                (item) => `
                  <div class="missing-item">
                    <strong>${escapeHtml(item.partName)}</strong>
                    Missing ${formatNumber(item.shortage)} / needs ${formatNumber(item.required)}
                    <div class="helper-text">${escapeHtml(item.color)} / ${escapeHtml(item.material)}</div>
                  </div>
                `,
              )
              .join("")}
          </div>
        </article>
      `,
      "All active products can be assembled from current part inventory.",
      "The blocked list only shows active products with a real shortage for the next unit.",
    );

    dom.lowStockParts.innerHTML = renderList(
      computed.lowStockParts,
      (part) => `
        <article class="detail-card">
          <div class="detail-card__head">
            <div>
              <h3>${escapeHtml(part.name)}</h3>
              <p class="sku">${escapeHtml(part.sku || "No SKU")}</p>
            </div>
            <span class="pill pill--warning">${formatNumber(part.inventoryQty)} / ${formatNumber(part.minStock)}</span>
          </div>
          <div class="detail-row">
            <span class="chip">${escapeHtml(part.color)}</span>
            <span class="chip">${escapeHtml(part.material)}</span>
            <span class="chip">${escapeHtml(formatDurationMinutes(part.printTimeMinutes))} each</span>
            <span class="chip">Short by ${formatNumber(part.minStockGap)}</span>
          </div>
        </article>
      `,
      "No parts are currently below their minimum stock level.",
      "Minimums are defined on the Parts tab.",
    );

    dom.suggestedJobs.innerHTML = renderList(
      computed.suggestedJobs,
      (suggestion) => `
        <article class="detail-card">
          <div class="detail-card__head">
            <div>
              <h3>${escapeHtml(suggestion.part.name)}</h3>
              <p class="sku">${escapeHtml(suggestion.part.sku || "No SKU")}</p>
            </div>
            <span class="pill ${suggestion.priorityClass}">${capitalizeWords(suggestion.priority)} priority</span>
          </div>
          <div class="detail-grid">
            <div>
              <p class="detail__label">Print next</p>
              <div class="detail__value">${formatNumber(suggestion.remainingQty)}</div>
            </div>
            <div>
              <p class="detail__label">Already planned or running</p>
              <div class="detail__value">${formatNumber(suggestion.plannedQty + suggestion.inProgressQty)}</div>
            </div>
            <div>
              <p class="detail__label">Ready printers</p>
              <div class="detail__value">${formatNumber(suggestion.readyPrinterCount)}</div>
            </div>
            <div>
              <p class="detail__label">Remaining time</p>
              <div class="detail__value">${escapeHtml(formatDurationMinutes(suggestion.remainingPrintTimeMinutes))}</div>
            </div>
            <div>
              <p class="detail__label">Parallel time</p>
              <div class="detail__value">${escapeHtml(suggestion.parallelTimeLabel)}</div>
            </div>
            <div>
              <p class="detail__label">Reason</p>
              <div class="detail__value">${escapeHtml(suggestion.reason)}</div>
            </div>
          </div>
          <div class="detail-row">
            <span class="chip">${escapeHtml(suggestion.part.color)}</span>
            <span class="chip">${escapeHtml(suggestion.part.material)}</span>
            <span class="chip">${escapeHtml(formatDurationMinutes(suggestion.part.printTimeMinutes))} each</span>
            <span class="chip">${formatNumber(suggestion.requiredQty)} total needed</span>
            <button
              class="button button--small"
              data-action="queue-suggestion"
              data-part-id="${escapeHtml(suggestion.part.id)}"
              type="button"
            >
              Open queue
            </button>
          </div>
        </article>
      `,
      "No additional product-driven print demand is currently calculated.",
      "The queue is generated automatically from target-stock gaps on active products.",
    );

    dom.queueSnapshot.innerHTML = renderList(
      computed.productionQueue,
      (row) => renderQueueCard(row, true),
      "Nothing needs printing right now.",
      "Once active products fall below target stock, the queue will appear automatically.",
    );

    dom.completedPrints.innerHTML = renderList(
      computed.completedJobs,
      (job) => `
        <article class="detail-card">
          <div class="detail-card__head">
            <div>
              <h3>${escapeHtml(job.partName)}</h3>
              <p class="sku">${escapeHtml(job.partSku)}</p>
            </div>
            <span class="badge status--completed">${formatNumber(job.quantity)} completed</span>
          </div>
          <div class="detail-grid">
            <div>
              <p class="detail__label">Material</p>
              <div class="detail__value">${escapeHtml(job.material)}</div>
            </div>
            <div>
              <p class="detail__label">Color</p>
              <div class="detail__value">${escapeHtml(job.color)}</div>
            </div>
            <div>
              <p class="detail__label">Completed</p>
              <div class="detail__value">${escapeHtml(formatTimestamp(job.completedAt || job.updatedAt))}</div>
            </div>
          </div>
        </article>
      `,
      "No completed prints have been logged yet.",
      "Completing queue quantities automatically adds them to part inventory.",
    );
  }

  function renderPartForm() {
    const draft = ui.partFormDraft;
    setInputValue(dom.partForm, "id", draft.id);
    setInputValue(dom.partForm, "name", draft.name);
    setInputValue(dom.partForm, "sku", draft.sku);
    setInputValue(dom.partForm, "color", draft.color);
    setInputValue(dom.partForm, "material", draft.material);
    setInputValue(dom.partForm, "inventoryQty", draft.inventoryQty);
    setInputValue(dom.partForm, "minStock", draft.minStock);
    setInputValue(dom.partForm, "printTimeMinutes", draft.printTimeMinutes);
    setInputValue(dom.partForm, "imageRef", draft.imageRef);
    setInputValue(dom.partForm, "fileRef", draft.fileRef);
    setTextValue(dom.partForm, "notes", draft.notes);

    dom.partForm.querySelector('button[type="submit"]').textContent = draft.id ? "Save part" : "Add part";
    dom.partForm.querySelector('[data-action="cancel-part-edit"]').hidden = !draft.id;
  }

  function renderPartsList(computed) {
    dom.partsCount.textContent = `${computed.parts.length} tracked`;

    dom.partsList.innerHTML = renderList(
      computed.parts,
      (part) => {
        const queueRow = computed.queueByPartId.get(part.id);
        const openJobs = queueRow ? queueRow.plannedQty + queueRow.inProgressQty : 0;
        const usedInProducts = computed.productsUsingPart.get(part.id) || [];
        return `
          <article class="entity-card">
            <div class="${part.imageRef ? "card-hero" : ""}">
              ${renderEntityImage(part.imageRef, part.name)}
              <div>
                <div class="entity-card__head">
                  <div class="entity-card__title">
                    <h3>${escapeHtml(part.name)}</h3>
                    <p class="sku">${escapeHtml(part.sku || "No SKU")}</p>
                  </div>
                  <span class="badge ${part.inventoryQty < part.minStock ? "badge--inactive" : "badge--active"}">
                    ${formatNumber(part.inventoryQty)} in stock
                  </span>
                </div>
              </div>
            </div>

            <div class="chips">
              <span class="chip">${escapeHtml(part.color)}</span>
              <span class="chip">${escapeHtml(part.material)}</span>
              <span class="chip">Min ${formatNumber(part.minStock)}</span>
              <span class="chip">${escapeHtml(formatDurationMinutes(part.printTimeMinutes))} each</span>
              <span class="chip">Planned/running ${formatNumber(openJobs)}</span>
            </div>

            <div class="stats-grid">
              <div class="stat">
                <span class="stat__label">Inventory</span>
                <div class="stat__value">${formatNumber(part.inventoryQty)}</div>
              </div>
              <div class="stat">
                <span class="stat__label">Queue need</span>
                <div class="stat__value">${formatNumber(computed.queueNeededByPartId.get(part.id) || 0)}</div>
              </div>
              <div class="stat">
                <span class="stat__label">Print time</span>
                <div class="stat__value">${escapeHtml(formatDurationMinutes(part.printTimeMinutes))}</div>
              </div>
            </div>

            ${
              usedInProducts.length
                ? `
                  <div class="bom-list">
                    ${usedInProducts
                      .map(
                        (product) => `
                          <div class="bom-item">
                            <strong>${escapeHtml(product.name)}</strong>
                            Used in ${formatNumber(product.quantity)} per finished unit
                          </div>
                        `,
                      )
                      .join("")}
                  </div>
                `
                : '<p class="helper-text">Not currently assigned to any product BOM.</p>'
            }

            ${
              part.fileRef
                ? `
                  <p class="helper-text">
                    File: ${renderFileReference(part.fileRef)}
                  </p>
                `
                : ""
            }

            ${part.notes ? `<p class="helper-text">${formatParagraph(part.notes)}</p>` : ""}

            <div class="card-actions">
              <button class="button button--small" data-action="edit-part" data-id="${escapeHtml(part.id)}" type="button">
                Edit
              </button>
              <button class="button button--small button--secondary" data-action="add-part-stock" data-id="${escapeHtml(part.id)}" type="button">
                Add stock
              </button>
              <button class="button button--small button--ghost" data-action="adjust-part-stock" data-id="${escapeHtml(part.id)}" type="button">
                Adjust
              </button>
              <button class="button button--small button--ghost" data-action="queue-part" data-id="${escapeHtml(part.id)}" type="button">
                View queue
              </button>
              <button class="button button--small button--danger" data-action="delete-part" data-id="${escapeHtml(part.id)}" type="button">
                Delete
              </button>
            </div>
          </article>
        `;
      },
      "No parts have been created yet.",
      "Start by defining the printed parts your farm produces.",
    );
  }

  function renderProductForm() {
    const draft = ui.productFormDraft;
    setInputValue(dom.productForm, "id", draft.id);
    setInputValue(dom.productForm, "name", draft.name);
    setInputValue(dom.productForm, "sku", draft.sku);
    setInputValue(dom.productForm, "finishedStock", draft.finishedStock);
    setInputValue(dom.productForm, "targetStock", draft.targetStock);
    setCheckboxValue(dom.productForm, "active", draft.active);
    setCheckboxValue(dom.productForm, "requiresAssembly", draft.requiresAssembly);
    setInputValue(dom.productForm, "imageRef", draft.imageRef);
    setTextValue(dom.productForm, "notes", draft.notes);
    syncProductDraftForAssemblyMode(draft);
    dom.productForm.elements.finishedStock.disabled = !draft.requiresAssembly;
    if (!draft.requiresAssembly) {
      dom.productForm.elements.finishedStock.value = "0";
    }

    const partOptions = state.parts
      .slice()
      .sort(sortByName)
      .map(
        (part) => `<option value="${escapeHtml(part.id)}">${escapeHtml(part.name)} · ${escapeHtml(part.color)} / ${escapeHtml(part.material)}</option>`,
      )
      .join("");

    dom.requirementsEditor.innerHTML =
      draft.partRequirements.length > 0
        ? draft.partRequirements
            .map(
              (requirement, index) => `
                <div class="requirement-row">
                  <label class="field">
                    <span>Part</span>
                    <select data-requirement="partId" data-index="${index}">
                      <option value="">Choose part</option>
                      ${partOptions}
                    </select>
                  </label>
                  <label class="field">
                    <span>Qty</span>
                    <input
                      data-requirement="quantity"
                      data-index="${index}"
                      type="number"
                      min="1"
                      step="1"
                      value="${escapeHtml(String(draft.requiresAssembly ? requirement.quantity || 1 : 1))}"
                      ${draft.requiresAssembly ? "" : "disabled"}
                    />
                  </label>
                  <button
                    class="button button--ghost button--small"
                    data-action="remove-requirement"
                    data-index="${index}"
                    type="button"
                    ${draft.requiresAssembly ? "" : "hidden"}
                  >
                    Remove
                  </button>
                </div>
              `,
            )
            .join("")
        : `
            <div class="empty-state">
              <h3>No required parts yet</h3>
              <p>Add at least one printed part requirement for this product.</p>
            </div>
          `;

    draft.partRequirements.forEach((requirement, index) => {
      const select = dom.requirementsEditor.querySelector(`select[data-index="${index}"]`);
      if (select) {
        select.value = requirement.partId || "";
      }
    });

    dom.requirementsTitle.textContent = draft.requiresAssembly
      ? "Required printed parts"
      : "Printed part for this product";
    dom.requirementsCopy.textContent = draft.requiresAssembly
      ? "Each row defines the quantity needed to build one finished unit."
      : "Products without assembly still reference exactly one printed part.";
    dom.addRequirementButton.hidden = !draft.requiresAssembly;

    dom.productForm.querySelector('button[type="submit"]').textContent = draft.id ? "Save product" : "Add product";
    dom.productForm.querySelector('[data-action="cancel-product-edit"]').hidden = !draft.id;
  }

  function renderPrinterForm() {
    const draft = ui.printerFormDraft;
    setInputValue(dom.printerForm, "id", draft.id);
    setInputValue(dom.printerForm, "name", draft.name);
    setInputValue(dom.printerForm, "model", draft.model);
    setInputValue(dom.printerForm, "color", draft.color);
    setInputValue(dom.printerForm, "material", draft.material);
    setCheckboxValue(dom.printerForm, "active", draft.active);
    setTextValue(dom.printerForm, "notes", draft.notes);

    dom.printerForm.querySelector('button[type="submit"]').textContent = draft.id ? "Save printer" : "Add printer";
    dom.printerForm.querySelector('[data-action="cancel-printer-edit"]').hidden = !draft.id;
  }

  function renderProductsList(computed) {
    dom.productsCount.textContent = `${computed.products.length} tracked`;

    dom.productsList.innerHTML = renderList(
      computed.productSummaries,
      (product) => {
        const productImage = resolveProductImage(product);
        return `
        <article class="entity-card">
          <div class="${productImage ? "card-hero" : ""}">
            ${renderEntityImage(productImage, product.name)}
            <div>
              <div class="entity-card__head">
                <div class="entity-card__title">
                  <h3>${escapeHtml(product.name)}</h3>
                  <p class="sku">${escapeHtml(product.sku || "No SKU")}</p>
                </div>
                <span class="badge ${product.active ? "badge--active" : "badge--inactive"}">
                  ${product.active ? "Active" : "Inactive"}
                </span>
              </div>
            </div>
          </div>

          <div class="chips">
            <span class="chip">${product.requiresAssembly ? "Assembly product" : "Single-part product"}</span>
          </div>

          <div class="stats-grid">
            <div class="stat">
              <span class="stat__label">${product.requiresAssembly ? "Finished stock" : "On hand"}</span>
              <div class="stat__value">${formatNumber(product.onHandNow)}</div>
            </div>
            <div class="stat">
              <span class="stat__label">${product.requiresAssembly ? "Ready from parts" : "Printed stock"}</span>
              <div class="stat__value">${formatNumber(product.buildableNow)}</div>
            </div>
            <div class="stat">
              <span class="stat__label">Target stock</span>
              <div class="stat__value">${formatNumber(product.targetStock)}</div>
            </div>
            <div class="stat">
              <span class="stat__label">Gap to target</span>
              <div class="stat__value">${formatNumber(product.targetGap)}</div>
            </div>
            <div class="stat">
              <span class="stat__label">Print time / unit</span>
              <div class="stat__value">${escapeHtml(formatDurationMinutes(product.printTimeMinutes))}</div>
            </div>
          </div>

          <div class="bom-list">
            ${product.requirements
              .map(
                (requirement) => `
                  <div class="bom-item">
                    <strong>${escapeHtml(requirement.partName)}</strong>
                    ${formatNumber(requirement.quantity)} per unit · ${escapeHtml(requirement.color)} / ${escapeHtml(requirement.material)} · ${escapeHtml(formatDurationMinutes(requirement.printTimeMinutes))} each
                  </div>
                `,
              )
              .join("")}
          </div>

          ${
            product.missingForNextUnit.length
              ? `
                <div class="missing-list">
                  ${product.missingForNextUnit
                    .map(
                      (item) => `
                        <div class="missing-item">
                          <strong>${escapeHtml(item.partName)}</strong>
                          Missing ${formatNumber(item.shortage)} to build the next unit
                        </div>
                      `,
                    )
                    .join("")}
                </div>
              `
              : product.requiresAssembly
                ? '<p class="helper-text">All required parts are available for the next unit.</p>'
                : '<p class="helper-text">This product uses one printed part directly and does not need assembly.</p>'
          }

          ${product.notes ? `<p class="helper-text">${formatParagraph(product.notes)}</p>` : ""}

          <div class="card-actions">
            <button class="button button--small" data-action="edit-product" data-id="${escapeHtml(product.id)}" type="button">
              Edit
            </button>
            ${
              product.requiresAssembly
                ? `
                  <button class="button button--small button--secondary" data-action="assemble-product" data-id="${escapeHtml(product.id)}" type="button">
                    Assemble
                  </button>
                `
                : ""
            }
            <button class="button button--small button--secondary" data-action="pack-product" data-id="${escapeHtml(product.id)}" type="button">
              Pack
            </button>
            ${
              product.requiresAssembly
                ? `
                  <button class="button button--small button--ghost" data-action="adjust-finished-stock" data-id="${escapeHtml(product.id)}" type="button">
                    Adjust stock
                  </button>
                `
                : ""
            }
            <button class="button button--small button--ghost" data-action="toggle-product" data-id="${escapeHtml(product.id)}" type="button">
              ${product.active ? "Deactivate" : "Activate"}
            </button>
            <button class="button button--small button--danger" data-action="delete-product" data-id="${escapeHtml(product.id)}" type="button">
              Delete
            </button>
          </div>
        </article>
      `;
      },
      "No products have been created yet.",
      "Each product links finished goods to the printed parts needed to assemble it.",
    );
  }

  function renderPrintersList(computed) {
    dom.printersCount.textContent = `${computed.printers.length} tracked`;

    dom.printersList.innerHTML = renderList(
      computed.printerSummaries,
      (printer) => `
        <article class="entity-card">
          <div class="entity-card__head">
            <div class="entity-card__title">
              <h3>${escapeHtml(printer.name)}</h3>
              <p class="sku">${escapeHtml(printer.model || "No model")}</p>
            </div>
            <span class="badge ${printer.active ? "badge--active" : "badge--inactive"}">
              ${printer.active ? "Active" : "Inactive"}
            </span>
          </div>

          <div class="chips">
            <span class="chip">${escapeHtml(printer.color)}</span>
            <span class="chip">${escapeHtml(printer.material)}</span>
            <span class="chip">${formatNumber(printer.activeSetupPoolSize)} active on this setup</span>
          </div>

          <div class="stats-grid">
            <div class="stat">
              <span class="stat__label">Queue rows it can print</span>
              <div class="stat__value">${formatNumber(printer.compatibleQueueRowsCount)}</div>
            </div>
            <div class="stat">
              <span class="stat__label">Open queue time</span>
              <div class="stat__value">${escapeHtml(formatDurationMinutes(printer.compatibleQueuePendingPrintTimeMinutes))}</div>
            </div>
            <div class="stat">
              <span class="stat__label">Current setup finish</span>
              <div class="stat__value">${escapeHtml(formatDurationMinutes(printer.setupParallelTimeMinutes))}</div>
            </div>
          </div>

          ${
            printer.compatibleQueueRows.length
              ? `
                <div class="bom-list">
                  ${printer.compatibleQueueRows
                    .map(
                      (row) => `
                        <div class="bom-item">
                          <strong>${escapeHtml(row.partName)}</strong>
                          ${formatNumber(row.pendingQty)} open · ${escapeHtml(formatDurationMinutes(row.pendingPrintTimeMinutes))}
                        </div>
                      `,
                    )
                    .join("")}
                </div>
              `
              : '<p class="helper-text">No current queue rows match this printer setup.</p>'
          }

          ${
            printer.active
              ? '<p class="helper-text">This printer is included in queue parallelization using its current color and material.</p>'
              : '<p class="helper-text">Inactive printers are excluded from queue timing until reactivated.</p>'
          }

          ${printer.notes ? `<p class="helper-text">${formatParagraph(printer.notes)}</p>` : ""}

          <div class="card-actions">
            <button class="button button--small" data-action="edit-printer" data-id="${escapeHtml(printer.id)}" type="button">
              Edit
            </button>
            <button class="button button--small button--ghost" data-action="toggle-printer" data-id="${escapeHtml(printer.id)}" type="button">
              ${printer.active ? "Deactivate" : "Activate"}
            </button>
            <button class="button button--small button--danger" data-action="delete-printer" data-id="${escapeHtml(printer.id)}" type="button">
              Delete
            </button>
          </div>
        </article>
      `,
      "No printers have been added yet.",
      "Add active printer setups so the queue can estimate parallel print time.",
    );
  }

  function renderQueueSummary(computed) {
    dom.queueSummary.innerHTML = `
      <article class="detail-card">
        <div class="detail-card__head">
          <div>
            <h3>Automatic production queue</h3>
            <p class="helper-text">Active product target stock drives the queue automatically.</p>
          </div>
          <span class="badge badge--active">${formatNumber(computed.productionQueue.length)} rows</span>
        </div>
        <div class="detail-grid">
          <div>
            <p class="detail__label">Need from product targets</p>
            <div class="detail__value">${formatNumber(computed.totalQueueRequiredQty)}</div>
          </div>
          <div>
            <p class="detail__label">Still unplanned</p>
            <div class="detail__value">${formatNumber(computed.totalQueueRemainingQty)}</div>
          </div>
          <div>
            <p class="detail__label">Remaining print time</p>
            <div class="detail__value">${escapeHtml(formatDurationMinutes(computed.totalQueueRemainingPrintTimeMinutes))}</div>
          </div>
          <div>
            <p class="detail__label">Active printers</p>
            <div class="detail__value">${formatNumber(computed.activePrintersCount)}</div>
          </div>
          <div>
            <p class="detail__label">Estimated finish</p>
            <div class="detail__value">${escapeHtml(computed.totalQueueParallelTimeLabel)}</div>
          </div>
          <div>
            <p class="detail__label">In progress</p>
            <div class="detail__value">${formatNumber(computed.totalQueueInProgressQty)}</div>
          </div>
          <div>
            <p class="detail__label">In-progress time</p>
            <div class="detail__value">${escapeHtml(formatDurationMinutes(computed.totalQueueInProgressPrintTimeMinutes))}</div>
          </div>
          <div>
            <p class="detail__label">Failed attempts</p>
            <div class="detail__value">${formatNumber(computed.totalQueueFailedQty)}</div>
          </div>
          <div>
            <p class="detail__label">Rows without printer</p>
            <div class="detail__value">${formatNumber(computed.unassignedQueueRowsCount)}</div>
          </div>
        </div>
      </article>
      <article class="detail-card">
        <h3>How it works</h3>
        <p class="helper-text">Plan reserves quantity, Start moves it into active printing, Complete adds printed parts into inventory, and Fail tracks unsuccessful quantity without removing the underlying demand. Parallel queue time uses the currently active printer color and material setups as an estimate.</p>
      </article>
    `;
  }

  function renderQueueList(computed) {
    dom.queueCount.textContent = `${computed.productionQueue.length} rows total`;

    dom.queueList.innerHTML = renderList(
      computed.productionQueue,
      (row) => renderQueueCard(row, false),
      "Nothing needs printing right now.",
      "As soon as active products fall below target stock, this queue will populate automatically.",
    );
  }

  function renderQueueCard(row, compact) {
    const sourceList = row.sources
      .map((source) => `${source.productName}: ${formatNumber(source.quantity)}`)
      .join(" · ");

    return `
      <article class="${compact ? "detail-card" : "queue-card"}">
        <div class="${row.part.imageRef ? `card-hero ${compact ? "card-hero--compact" : ""}` : ""}">
          ${renderEntityImage(row.part.imageRef, row.part.name)}
          <div>
            <div class="detail-card__head">
              <div>
                <h3>${escapeHtml(row.part.name)}</h3>
                <p class="sku">${escapeHtml(row.part.sku || "No SKU")}</p>
              </div>
              <span class="pill ${row.priorityClass}">${capitalizeWords(row.priority)} priority</span>
            </div>
          </div>
        </div>

        <div class="detail-grid">
          <div>
            <p class="detail__label">Need from targets</p>
            <div class="detail__value">${formatNumber(row.requiredQty)}</div>
          </div>
          <div>
            <p class="detail__label">Print time / part</p>
            <div class="detail__value">${escapeHtml(formatDurationMinutes(row.part.printTimeMinutes))}</div>
          </div>
          <div>
            <p class="detail__label">Ready printers</p>
            <div class="detail__value">${formatNumber(row.readyPrinterCount)}</div>
          </div>
          <div>
            <p class="detail__label">Planned</p>
            <div class="detail__value">${formatNumber(row.plannedQty)}</div>
          </div>
          <div>
            <p class="detail__label">In progress</p>
            <div class="detail__value">${formatNumber(row.inProgressQty)}</div>
          </div>
          <div>
            <p class="detail__label">Remaining</p>
            <div class="detail__value">${formatNumber(row.remainingQty)}</div>
          </div>
          <div>
            <p class="detail__label">Remaining time</p>
            <div class="detail__value">${escapeHtml(formatDurationMinutes(row.remainingPrintTimeMinutes))}</div>
          </div>
          <div>
            <p class="detail__label">Parallel time</p>
            <div class="detail__value">${escapeHtml(row.parallelTimeLabel)}</div>
          </div>
          <div>
            <p class="detail__label">Failed</p>
            <div class="detail__value">${formatNumber(row.failedQty)}</div>
          </div>
          <div>
            <p class="detail__label">Material</p>
            <div class="detail__value">${escapeHtml(row.part.material)}</div>
          </div>
          <div>
            <p class="detail__label">Color</p>
            <div class="detail__value">${escapeHtml(row.part.color)}</div>
          </div>
        </div>

        <p class="helper-text">${escapeHtml(row.reason)}</p>
        ${sourceList ? `<p class="helper-text">${escapeHtml(sourceList)}</p>` : ""}
        ${
          row.matchingPrinters.length
            ? `<p class="helper-text">Ready on: ${escapeHtml(row.matchingPrinters.map((printer) => printer.name).join(" · "))}</p>`
            : `<p class="helper-text">No active printer currently matches ${escapeHtml(row.part.color)} / ${escapeHtml(row.part.material)}.</p>`
        }

        ${
          compact
            ? ""
            : `
              <div class="card-actions">
                <button class="button button--small" data-action="queue-plan" data-part-id="${escapeHtml(row.part.id)}" type="button">
                  Plan
                </button>
                <button class="button button--small button--ghost" data-action="queue-start" data-part-id="${escapeHtml(row.part.id)}" type="button">
                  Start
                </button>
                <button class="button button--small button--secondary" data-action="queue-complete" data-part-id="${escapeHtml(row.part.id)}" type="button">
                  Complete
                </button>
                <button class="button button--small button--ghost" data-action="queue-fail" data-part-id="${escapeHtml(row.part.id)}" type="button">
                  Fail
                </button>
                ${
                  row.failedQty > 0
                    ? `
                      <button class="button button--small button--ghost" data-action="queue-retry" data-part-id="${escapeHtml(row.part.id)}" type="button">
                        Retry failed
                      </button>
                    `
                    : ""
                }
              </div>
            `
        }
      </article>
    `;
  }

  function handlePartSubmit(event) {
    event.preventDefault();

    const payload = normalizePart(readPartForm());
    if (!payload.name || !payload.color || !payload.material) {
      window.alert("Part name, color, and material are required.");
      return;
    }

    if (payload.inventoryQty < 0 || payload.minStock < 0) {
      window.alert("Inventory and minimum stock must be zero or greater.");
      return;
    }

    const existingIndex = state.parts.findIndex((part) => part.id === payload.id);
    const record = payload.id ? payload : { ...payload, id: generateId("part") };

    if (existingIndex >= 0) {
      state.parts.splice(existingIndex, 1, record);
    } else {
      state.parts.push(record);
    }

    persistState();
    ui.partFormDraft = blankPartDraft();
    render();
  }

  function handleProductSubmit(event) {
    event.preventDefault();

    const payload = normalizeProduct(readProductForm());
    if (!payload.name) {
      window.alert("Product name is required.");
      return;
    }

    if (payload.finishedStock < 0 || payload.targetStock < 0) {
      window.alert("Finished stock and target stock must be zero or greater.");
      return;
    }

    if (payload.requiresAssembly) {
      if (!payload.partRequirements.length) {
        window.alert("Add at least one required printed part for products that require assembly.");
        return;
      }

      const dedupedRequirements = new Map();
      for (const requirement of payload.partRequirements) {
        if (!requirement.partId) {
          window.alert("Each requirement row must reference a part.");
          return;
        }
        if (requirement.quantity <= 0) {
          window.alert("Requirement quantities must be at least 1.");
          return;
        }
        dedupedRequirements.set(
          requirement.partId,
          (dedupedRequirements.get(requirement.partId) || 0) + requirement.quantity,
        );
      }

      payload.partRequirements = Array.from(dedupedRequirements.entries()).map(([partId, quantity]) => ({
        partId,
        quantity,
      }));
    } else {
      const singleRequirement = payload.partRequirements.find((requirement) => requirement.partId);
      if (!singleRequirement) {
        window.alert("Products without assembly still need one printed part.");
        return;
      }
      payload.finishedStock = 0;
      payload.partRequirements = [
        {
          partId: singleRequirement.partId,
          quantity: 1,
        },
      ];
    }

    const existingIndex = state.products.findIndex((product) => product.id === payload.id);
    const record = payload.id ? payload : { ...payload, id: generateId("product") };

    if (existingIndex >= 0) {
      state.products.splice(existingIndex, 1, record);
    } else {
      state.products.push(record);
    }

    persistState();
    ui.productFormDraft = blankProductDraft();
    render();
  }

  function handlePrinterSubmit(event) {
    event.preventDefault();

    const payload = normalizePrinter(readPrinterForm());
    if (!payload.name || !payload.color || !payload.material) {
      window.alert("Printer name, loaded color, and loaded material are required.");
      return;
    }

    const existingIndex = state.printers.findIndex((printer) => printer.id === payload.id);
    const record = payload.id ? payload : { ...payload, id: generateId("printer") };

    if (existingIndex >= 0) {
      state.printers.splice(existingIndex, 1, record);
    } else {
      state.printers.push(record);
    }

    persistState();
    ui.printerFormDraft = blankPrinterDraft();
    render();
  }

  function openQueueView() {
    ui.activeTab = "queue";
    render();
  }

  function startPartEdit(id) {
    const part = state.parts.find((entry) => entry.id === id);
    if (!part) {
      return;
    }
    ui.partFormDraft = clone(part);
    ui.activeTab = "parts";
    render();
  }

  function startProductEdit(id) {
    const product = state.products.find((entry) => entry.id === id);
    if (!product) {
      return;
    }
    ui.productFormDraft = clone(product);
    ui.activeTab = "products";
    render();
  }

  function startPrinterEdit(id) {
    const printer = state.printers.find((entry) => entry.id === id);
    if (!printer) {
      return;
    }
    ui.printerFormDraft = clone(printer);
    ui.activeTab = "printers";
    render();
  }

  function deletePart(id) {
    const linkedProduct = state.products.find((product) =>
      product.partRequirements.some((requirement) => requirement.partId === id),
    );
    if (linkedProduct) {
      window.alert(`Cannot delete part because it is used by product "${linkedProduct.name}".`);
      return;
    }

    const linkedQueueState = state.printState.find(
      (entry) => entry.partId === id && (entry.plannedQty > 0 || entry.inProgressQty > 0 || entry.failedQty > 0),
    );
    if (linkedQueueState || state.completedPrints.some((entry) => entry.partId === id)) {
      window.alert("Cannot delete part while queue tracking or completed print history still references it.");
      return;
    }

    const part = state.parts.find((entry) => entry.id === id);
    if (!part || !window.confirm(`Delete part "${part.name}"?`)) {
      return;
    }

    state.parts = state.parts.filter((entry) => entry.id !== id);
    persistState();
    if (ui.partFormDraft.id === id) {
      ui.partFormDraft = blankPartDraft();
    }
    render();
  }

  function deleteProduct(id) {
    const product = state.products.find((entry) => entry.id === id);
    if (!product || !window.confirm(`Delete product "${product.name}"?`)) {
      return;
    }

    state.products = state.products.filter((entry) => entry.id !== id);
    persistState();
    if (ui.productFormDraft.id === id) {
      ui.productFormDraft = blankProductDraft();
    }
    render();
  }

  function deletePrinter(id) {
    const printer = state.printers.find((entry) => entry.id === id);
    if (!printer || !window.confirm(`Delete printer "${printer.name}"?`)) {
      return;
    }

    state.printers = state.printers.filter((entry) => entry.id !== id);
    persistState();
    if (ui.printerFormDraft.id === id) {
      ui.printerFormDraft = blankPrinterDraft();
    }
    render();
  }

  function toggleProduct(id) {
    const product = state.products.find((entry) => entry.id === id);
    if (!product) {
      return;
    }

    product.active = !product.active;
    persistState();
    render();
  }

  function togglePrinter(id) {
    const printer = state.printers.find((entry) => entry.id === id);
    if (!printer) {
      return;
    }

    printer.active = !printer.active;
    persistState();
    render();
  }

  function adjustPartStock(id, mode) {
    const part = state.parts.find((entry) => entry.id === id);
    if (!part) {
      return;
    }

    const promptText =
      mode === "add"
        ? `How many completed "${part.name}" parts should be added to inventory?`
        : `Enter a signed quantity adjustment for "${part.name}" inventory.`;
    const defaultValue = mode === "add" ? "1" : "0";
    const response = window.prompt(promptText, defaultValue);
    if (response === null) {
      return;
    }

    const delta = parseInteger(response);
    if (delta === null) {
      window.alert("Enter a whole number.");
      return;
    }

    const appliedDelta = mode === "add" ? Math.abs(delta) : delta;
    const nextQty = part.inventoryQty + appliedDelta;
    if (nextQty < 0) {
      window.alert("Inventory cannot go below zero.");
      return;
    }

    part.inventoryQty = nextQty;
    persistState();
    render();
  }

  function prefillQueueForPart(id) {
    openQueueView();
  }

  function addRequirementRow() {
    ui.productFormDraft = readProductForm();
    if (!ui.productFormDraft.requiresAssembly) {
      return;
    }
    ui.productFormDraft.partRequirements.push({
      partId: "",
      quantity: 1,
    });
    renderProductForm();
  }

  function removeRequirementRow(index) {
    ui.productFormDraft = readProductForm();
    ui.productFormDraft.partRequirements.splice(index, 1);
    renderProductForm();
  }

  function assembleProduct(id) {
    const computed = computeState();
    const product = computed.productSummaries.find((entry) => entry.id === id);
    if (!product) {
      return;
    }

    if (!product.requiresAssembly) {
      window.alert("This product does not require assembly. Its printed part stock is already the sellable stock.");
      return;
    }

    if (product.buildableNow <= 0) {
      window.alert("This product cannot be assembled from current part inventory.");
      return;
    }

    const response = window.prompt(
      `How many "${product.name}" units should be assembled? Max ${product.buildableNow}.`,
      String(Math.min(1, product.buildableNow) || 1),
    );
    if (response === null) {
      return;
    }

    const quantity = parseInteger(response);
    if (quantity === null || quantity <= 0) {
      window.alert("Enter a whole number greater than zero.");
      return;
    }
    if (quantity > product.buildableNow) {
      window.alert("Not enough parts are available for that assembly quantity.");
      return;
    }

    const source = state.products.find((entry) => entry.id === id);
    source.partRequirements.forEach((requirement) => {
      const part = state.parts.find((entry) => entry.id === requirement.partId);
      if (part) {
        part.inventoryQty -= requirement.quantity * quantity;
      }
    });
    source.finishedStock += quantity;

    persistState();
    render();
  }

  function adjustFinishedStock(id) {
    const product = state.products.find((entry) => entry.id === id);
    if (!product) {
      return;
    }

    if (!product.requiresAssembly) {
      window.alert("This product does not keep separate finished stock. Adjust the linked part inventory instead.");
      return;
    }

    const response = window.prompt(
      `Enter a signed quantity adjustment for "${product.name}" finished goods inventory.`,
      "0",
    );
    if (response === null) {
      return;
    }

    const delta = parseInteger(response);
    if (delta === null) {
      window.alert("Enter a whole number.");
      return;
    }
    if (product.finishedStock + delta < 0) {
      window.alert("Finished stock cannot go below zero.");
      return;
    }

    product.finishedStock += delta;
    persistState();
    render();
  }

  function packProduct(id) {
    const computed = computeState();
    const product = computed.productSummaries.find((entry) => entry.id === id);
    if (!product) {
      return;
    }

    const packableQty = product.requiresAssembly ? product.onHandNow : product.buildableNow;
    if (packableQty <= 0) {
      window.alert(
        product.requiresAssembly
          ? "There is no finished stock available to pack."
          : "There is no printed product stock available to pack.",
      );
      return;
    }

    const response = window.prompt(
      `How many "${product.name}" units were packed? Max ${packableQty}.`,
      "1",
    );
    if (response === null) {
      return;
    }

    const quantity = parseInteger(response);
    if (quantity === null || quantity <= 0) {
      window.alert("Enter a whole number greater than zero.");
      return;
    }
    if (quantity > packableQty) {
      window.alert("You cannot pack more units than are currently available.");
      return;
    }

    const source = state.products.find((entry) => entry.id === id);
    if (product.requiresAssembly) {
      source.finishedStock -= quantity;
    } else {
      source.partRequirements.forEach((requirement) => {
        const part = state.parts.find((entry) => entry.id === requirement.partId);
        if (part) {
          part.inventoryQty -= requirement.quantity * quantity;
        }
      });
    }
    persistState();
    render();
  }

  function updateQueueState(partId, action) {
    const computed = computeState();
    const row = computed.queueByPartId.get(partId);
    if (!row) {
      return;
    }

    const entry = getOrCreatePrintStateEntry(partId);
    const timestamp = new Date().toISOString();

    if (action === "plan") {
      if (row.remainingQty <= 0) {
        window.alert("There is no unplanned quantity remaining for this part.");
        return;
      }
      const quantity = promptForQuantity(`How many "${row.part.name}" units should be planned? Max ${row.remainingQty}.`, row.remainingQty);
      if (quantity === null) {
        return;
      }
      entry.plannedQty += quantity;
    } else if (action === "start") {
      const maxStart = row.plannedQty + row.remainingQty;
      if (maxStart <= 0) {
        window.alert("There is no quantity available to start for this part.");
        return;
      }
      const quantity = promptForQuantity(`How many "${row.part.name}" units should start printing? Max ${maxStart}.`, maxStart);
      if (quantity === null) {
        return;
      }
      const fromPlanned = Math.min(entry.plannedQty, quantity);
      entry.plannedQty -= fromPlanned;
      entry.inProgressQty += quantity;
    } else if (action === "complete") {
      const maxComplete = row.inProgressQty + row.plannedQty + row.remainingQty;
      if (maxComplete <= 0) {
        window.alert("There is no quantity available to complete for this part.");
        return;
      }
      const quantity = promptForQuantity(`How many "${row.part.name}" units were completed? Max ${maxComplete}.`, maxComplete);
      if (quantity === null) {
        return;
      }
      let remainder = quantity;
      const fromInProgress = Math.min(entry.inProgressQty, remainder);
      entry.inProgressQty -= fromInProgress;
      remainder -= fromInProgress;
      const fromPlanned = Math.min(entry.plannedQty, remainder);
      entry.plannedQty -= fromPlanned;
      const part = state.parts.find((candidate) => candidate.id === partId);
      if (part) {
        part.inventoryQty += quantity;
      }
      state.completedPrints.unshift({
        id: generateId("completion"),
        partId,
        quantity,
        completedAt: timestamp,
      });
    } else if (action === "fail") {
      if (row.inProgressQty <= 0) {
        window.alert("Only in-progress quantity can be marked as failed.");
        return;
      }
      const quantity = promptForQuantity(`How many "${row.part.name}" units failed? Max ${row.inProgressQty}.`, row.inProgressQty);
      if (quantity === null) {
        return;
      }
      entry.inProgressQty -= quantity;
      entry.failedQty += quantity;
    } else if (action === "retry") {
      if (row.failedQty <= 0) {
        window.alert("There is no failed quantity to retry.");
        return;
      }
      const quantity = promptForQuantity(`How many failed "${row.part.name}" units should move back to planned? Max ${row.failedQty}.`, row.failedQty);
      if (quantity === null) {
        return;
      }
      entry.failedQty -= quantity;
      entry.plannedQty += quantity;
    } else {
      return;
    }

    entry.updatedAt = timestamp;
    cleanupPrintState();
    persistState();
    render();
  }

  function computeState() {
    const parts = state.parts.slice().sort(sortByName);
    const products = state.products.slice().sort(sortByName);
    const printers = state.printers.slice().sort(sortByName);
    const activePrinters = printers.filter((printer) => printer.active);
    const partsById = new Map(parts.map((part) => [part.id, part]));
    const printStateByPartId = new Map(
      state.printState.map((entry) => [entry.partId, normalizePrintStateEntry(entry)]),
    );
    const activePrintersBySetupKey = new Map();
    activePrinters.forEach((printer) => {
      const setupKey = getSetupKey(printer.color, printer.material);
      const matchingPrinters = activePrintersBySetupKey.get(setupKey) || [];
      matchingPrinters.push(printer);
      activePrintersBySetupKey.set(setupKey, matchingPrinters);
    });
    const completedJobs = state.completedPrints
      .slice()
      .map((entry) => {
        const part = partsById.get(entry.partId);
        return {
          ...entry,
          partName: part ? part.name : "Missing part",
          partSku: part ? part.sku || "No SKU" : "Unknown",
          color: part ? part.color : "Unknown",
          material: part ? part.material : "Unknown",
          printTimeMinutes: part ? part.printTimeMinutes : 0,
        };
      })
      .sort((left, right) => new Date(right.completedAt).getTime() - new Date(left.completedAt).getTime())
      .slice(0, 6);

    const productsUsingPart = new Map();
    products.forEach((product) => {
      product.partRequirements.forEach((requirement) => {
        const list = productsUsingPart.get(requirement.partId) || [];
        list.push({
          name: product.name,
          quantity: requirement.quantity,
        });
        productsUsingPart.set(requirement.partId, list);
      });
    });

    const productSummaries = products.map((product) => summarizeProduct(product, partsById));
    const readyToSell = productSummaries.filter((product) => product.onHandNow > 0);
    const blockedProducts = productSummaries.filter(
      (product) => product.active && product.missingForNextUnit.length > 0,
    );

    const lowStockParts = parts
      .map((part) => ({
        ...part,
        minStockGap: Math.max(part.minStock - part.inventoryQty, 0),
      }))
      .filter((part) => part.inventoryQty < part.minStock)
      .sort((left, right) => right.minStockGap - left.minStockGap);

    const demandByPartId = new Map();
    const sourcesByPartId = new Map();
    productSummaries
      .filter((product) => product.active && product.targetGap > 0)
      .forEach((product) => {
        product.requirements.forEach((requirement) => {
          const existing = demandByPartId.get(requirement.partId) || 0;
          demandByPartId.set(requirement.partId, existing + requirement.quantity * product.targetGap);
          const sources = sourcesByPartId.get(requirement.partId) || [];
          sources.push({
            productId: product.id,
            productName: product.name,
            quantity: requirement.quantity * product.targetGap,
          });
          sourcesByPartId.set(requirement.partId, sources);
        });
      });

    const productionQueue = parts
      .map((part) => {
        const requiredQty = Math.max(demandByPartId.get(part.id) || 0, 0);
        const shortageQty = Math.max(requiredQty - part.inventoryQty, 0);
        const printState = printStateByPartId.get(part.id) || emptyPrintStateEntry(part.id);
        const plannedQty = printState.plannedQty;
        const inProgressQty = printState.inProgressQty;
        const failedQty = printState.failedQty;
        const remainingQty = Math.max(shortageQty - plannedQty - inProgressQty, 0);
        const pendingQty = plannedQty + inProgressQty + remainingQty;
        const requiredPrintTimeMinutes = requiredQty * part.printTimeMinutes;
        const plannedPrintTimeMinutes = plannedQty * part.printTimeMinutes;
        const inProgressPrintTimeMinutes = inProgressQty * part.printTimeMinutes;
        const remainingPrintTimeMinutes = remainingQty * part.printTimeMinutes;
        const pendingPrintTimeMinutes = pendingQty * part.printTimeMinutes;
        const matchingPrinters = activePrintersBySetupKey.get(getSetupKey(part.color, part.material)) || [];
        const readyPrinterCount = matchingPrinters.length;
        const parallelTimeLabel =
          readyPrinterCount > 0 ? formatDurationMinutes(Math.ceil(pendingPrintTimeMinutes / readyPrinterCount)) : "No printer ready";
        const blockingProducts = blockedProducts.filter((product) =>
          product.missingForNextUnit.some((item) => item.partId === part.id),
        ).length;
        const hasQueueActivity = plannedQty > 0 || inProgressQty > 0 || failedQty > 0;
        const needsPrinterSetup = pendingQty > 0 && readyPrinterCount === 0;

        if (!shortageQty && !hasQueueActivity) {
          return null;
        }

        const priority = blockingProducts > 0 || needsPrinterSetup ? "high" : remainingQty > 0 ? "medium" : "low";
        return {
          part,
          partId: part.id,
          requiredQty,
          shortageQty,
          plannedQty,
          inProgressQty,
          failedQty,
          remainingQty,
          pendingQty,
          requiredPrintTimeMinutes,
          plannedPrintTimeMinutes,
          inProgressPrintTimeMinutes,
          remainingPrintTimeMinutes,
          pendingPrintTimeMinutes,
          matchingPrinters,
          readyPrinterCount,
          parallelTimeLabel,
          updatedAt: printState.updatedAt,
          sources: sourcesByPartId.get(part.id) || [],
          priority,
          priorityClass:
            priority === "high"
              ? "pill--danger"
              : priority === "medium"
                ? "pill--accent"
                : "pill--warning",
          reason:
            needsPrinterSetup
              ? `No active printer is loaded for ${part.color} / ${part.material}`
              : blockingProducts > 0
              ? `${blockingProducts} active product${blockingProducts === 1 ? "" : "s"} blocked right now`
              : "Needed to reach active product target stock",
        };
      })
      .filter(Boolean)
      .sort((left, right) => {
        const priorityDiff = PRIORITY_ORDER[left.priority] - PRIORITY_ORDER[right.priority];
        if (priorityDiff !== 0) {
          return priorityDiff;
        }
        return right.remainingQty - left.remainingQty;
      });

    const queueByPartId = new Map(productionQueue.map((row) => [row.partId, row]));
    const suggestedJobs = productionQueue.filter((row) => row.remainingQty > 0);
    const queueReadyPrinterIds = new Set();
    productionQueue.forEach((row) => {
      if (row.pendingQty <= 0) {
        return;
      }
      row.matchingPrinters.forEach((printer) => {
        queueReadyPrinterIds.add(printer.id);
      });
    });

    const setupLaneByKey = new Map();
    productionQueue
      .filter((row) => row.pendingQty > 0)
      .forEach((row) => {
        const setupKey = getSetupKey(row.part.color, row.part.material);
        const lane = setupLaneByKey.get(setupKey) || {
          setupKey,
          color: row.part.color,
          material: row.part.material,
          readyPrinterCount: row.readyPrinterCount,
          pendingPrintTimeMinutes: 0,
        };
        lane.pendingPrintTimeMinutes += row.pendingPrintTimeMinutes;
        setupLaneByKey.set(setupKey, lane);
      });

    const setupLanes = Array.from(setupLaneByKey.values()).map((lane) => ({
      ...lane,
      parallelTimeMinutes:
        lane.readyPrinterCount > 0 ? Math.ceil(lane.pendingPrintTimeMinutes / lane.readyPrinterCount) : null,
    }));
    const schedulableSetupLanes = setupLanes.filter((lane) => lane.parallelTimeMinutes !== null);
    const totalQueueParallelTimeMinutes = schedulableSetupLanes.length
      ? Math.max(...schedulableSetupLanes.map((lane) => lane.parallelTimeMinutes))
      : 0;
    const unassignedQueueRowsCount = productionQueue.filter((row) => row.pendingQty > 0 && row.readyPrinterCount === 0).length;
    const totalQueueParallelTimeLabel = unassignedQueueRowsCount
      ? totalQueueParallelTimeMinutes > 0
        ? `${formatDurationMinutes(totalQueueParallelTimeMinutes)} + setup needed`
        : "Setup needed"
      : formatDurationMinutes(totalQueueParallelTimeMinutes);
    const printerSummaries = printers.map((printer) => {
      const compatibleQueueRows = productionQueue
        .filter((row) => row.pendingQty > 0 && printerMatchesPart(printer, row.part))
        .map((row) => ({
          partId: row.partId,
          partName: row.part.name,
          pendingQty: row.pendingQty,
          pendingPrintTimeMinutes: row.pendingPrintTimeMinutes,
        }));
      const compatibleQueuePendingPrintTimeMinutes = compatibleQueueRows.reduce(
        (sum, row) => sum + row.pendingPrintTimeMinutes,
        0,
      );
      const activeSetupPoolSize = activePrintersBySetupKey.get(getSetupKey(printer.color, printer.material))?.length || 0;

      return {
        ...printer,
        compatibleQueueRows,
        compatibleQueueRowsCount: compatibleQueueRows.length,
        compatibleQueuePendingPrintTimeMinutes,
        activeSetupPoolSize,
        setupParallelTimeMinutes:
          activeSetupPoolSize > 0
            ? Math.ceil(compatibleQueuePendingPrintTimeMinutes / activeSetupPoolSize)
            : compatibleQueuePendingPrintTimeMinutes,
      };
    });

    return {
      parts,
      products,
      printers,
      activePrinters,
      partsById,
      completedJobs,
      productSummaries,
      printerSummaries,
      readyToSell,
      blockedProducts,
      lowStockParts,
      suggestedJobs,
      productionQueue,
      queueByPartId,
      queueNeededByPartId: new Map(productionQueue.map((row) => [row.partId, row.shortageQty])),
      suggestedQtyByPartId: new Map(productionQueue.map((row) => [row.partId, row.remainingQty])),
      productsUsingPart,
      activePrintersCount: activePrinters.length,
      queueReadyPrinterCount: queueReadyPrinterIds.size,
      totalPartInventory: parts.reduce((sum, part) => sum + part.inventoryQty, 0),
      totalFinishedInventory: productSummaries.reduce((sum, product) => sum + product.onHandNow, 0),
      totalBuildableUnits: productSummaries
        .filter((product) => product.active && product.requiresAssembly)
        .reduce((sum, product) => sum + product.buildableNow, 0),
      buildableProductsCount: productSummaries.filter(
        (product) => product.buildableNow > 0 && product.active && product.requiresAssembly,
      ).length,
      totalQueueRequiredQty: productionQueue.reduce((sum, row) => sum + row.requiredQty, 0),
      totalQueueRemainingQty: productionQueue.reduce((sum, row) => sum + row.remainingQty, 0),
      totalQueueRemainingPrintTimeMinutes: productionQueue.reduce(
        (sum, row) => sum + row.remainingPrintTimeMinutes,
        0,
      ),
      totalQueueInProgressQty: productionQueue.reduce((sum, row) => sum + row.inProgressQty, 0),
      totalQueueInProgressPrintTimeMinutes: productionQueue.reduce(
        (sum, row) => sum + row.inProgressPrintTimeMinutes,
        0,
      ),
      totalQueueFailedQty: productionQueue.reduce((sum, row) => sum + row.failedQty, 0),
      totalQueueParallelTimeMinutes,
      totalQueueParallelTimeLabel,
      unassignedQueueRowsCount,
    };
  }

  function summarizeProduct(product, partsById) {
    const requirements = product.partRequirements.map((requirement) => {
      const part = partsById.get(requirement.partId);
      const available = part ? part.inventoryQty : 0;
      return {
        ...requirement,
        partName: part ? part.name : "Missing part",
        color: part ? part.color : "Unknown",
        material: part ? part.material : "Unknown",
        imageRef: part ? part.imageRef || "" : "",
        printTimeMinutes: part ? part.printTimeMinutes : 0,
        available,
      };
    });

    const buildableNow = requirements.length
      ? Math.min(...requirements.map((requirement) => Math.floor(requirement.available / requirement.quantity)))
      : 0;
    const missingForNextUnit = requirements
      .map((requirement) => ({
        ...requirement,
        required: requirement.quantity,
        shortage: Math.max(requirement.quantity - requirement.available, 0),
      }))
      .filter((requirement) => requirement.shortage > 0);
    const targetGap = Math.max(product.targetStock - product.finishedStock, 0);
    const onHandNow = product.requiresAssembly ? product.finishedStock : buildableNow;
    const printTimeMinutes = requirements.reduce(
      (sum, requirement) => sum + requirement.quantity * requirement.printTimeMinutes,
      0,
    );

    return {
      ...product,
      requirements,
      buildableNow,
      missingForNextUnit,
      onHandNow,
      targetGap,
      printTimeMinutes,
      totalSellableNow: product.requiresAssembly ? product.finishedStock + buildableNow : buildableNow,
    };
  }

  function readPartForm() {
    return {
      id: dom.partForm.elements.id.value,
      name: dom.partForm.elements.name.value.trim(),
      sku: dom.partForm.elements.sku.value.trim(),
      color: dom.partForm.elements.color.value.trim(),
      material: dom.partForm.elements.material.value.trim(),
      inventoryQty: dom.partForm.elements.inventoryQty.value,
      minStock: dom.partForm.elements.minStock.value,
      printTimeMinutes: dom.partForm.elements.printTimeMinutes.value,
      imageRef: dom.partForm.elements.imageRef.value.trim(),
      fileRef: dom.partForm.elements.fileRef.value.trim(),
      notes: dom.partForm.elements.notes.value.trim(),
    };
  }

  function readProductForm() {
    const partRequirements = Array.from(dom.requirementsEditor.querySelectorAll(".requirement-row")).map((row) => ({
      partId: row.querySelector('[data-requirement="partId"]').value,
      quantity: row.querySelector('[data-requirement="quantity"]').value,
    }));

    return {
      id: dom.productForm.elements.id.value,
      name: dom.productForm.elements.name.value.trim(),
      sku: dom.productForm.elements.sku.value.trim(),
      finishedStock: dom.productForm.elements.finishedStock.value,
      targetStock: dom.productForm.elements.targetStock.value,
      active: dom.productForm.elements.active.checked,
      requiresAssembly: dom.productForm.elements.requiresAssembly.checked,
      imageRef: dom.productForm.elements.imageRef.value.trim(),
      notes: dom.productForm.elements.notes.value.trim(),
      partRequirements,
    };
  }

  function readPrinterForm() {
    return {
      id: dom.printerForm.elements.id.value,
      name: dom.printerForm.elements.name.value.trim(),
      model: dom.printerForm.elements.model.value.trim(),
      color: dom.printerForm.elements.color.value.trim(),
      material: dom.printerForm.elements.material.value.trim(),
      active: dom.printerForm.elements.active.checked,
      notes: dom.printerForm.elements.notes.value.trim(),
    };
  }

  function normalizePart(part) {
    return {
      id: part.id || "",
      name: part.name,
      sku: part.sku,
      color: part.color,
      material: part.material,
      inventoryQty: toNonNegativeInteger(part.inventoryQty),
      minStock: toNonNegativeInteger(part.minStock),
      printTimeMinutes: toNonNegativeInteger(part.printTimeMinutes),
      imageRef: part.imageRef || "",
      fileRef: part.fileRef,
      notes: part.notes,
    };
  }

  function normalizePrinter(printer) {
    return {
      id: printer.id || "",
      name: printer.name,
      model: printer.model || "",
      color: printer.color,
      material: printer.material,
      active: printer.active !== false,
      notes: printer.notes || "",
    };
  }

  function normalizeProduct(product) {
    const requiresAssembly = product.requiresAssembly !== false;
    const partRequirements = Array.isArray(product.partRequirements) ? product.partRequirements : [];
    const normalizedRequirements = partRequirements
      .filter((requirement) => requirement.partId || requirement.quantity)
      .map((requirement) => ({
        partId: requirement.partId,
        quantity: toNonNegativeInteger(requirement.quantity || 0),
      }))
      .filter((requirement) => requirement.partId && requirement.quantity > 0);

    return {
      id: product.id || "",
      name: product.name,
      sku: product.sku,
      active: Boolean(product.active),
      requiresAssembly,
      finishedStock: requiresAssembly ? toNonNegativeInteger(product.finishedStock) : 0,
      targetStock: toNonNegativeInteger(product.targetStock),
      imageRef: product.imageRef || "",
      notes: product.notes,
      partRequirements: requiresAssembly
        ? normalizedRequirements
        : normalizedRequirements.length
          ? [{ partId: normalizedRequirements[0].partId, quantity: 1 }]
          : [],
    };
  }

  function blankPartDraft() {
    return {
      id: "",
      name: "",
      sku: "",
      color: "",
      material: "",
      inventoryQty: 0,
      minStock: 0,
      printTimeMinutes: 0,
      imageRef: "",
      fileRef: "",
      notes: "",
    };
  }

  function blankProductDraft() {
    return {
      id: "",
      name: "",
      sku: "",
      active: true,
      requiresAssembly: true,
      finishedStock: 0,
      targetStock: 0,
      imageRef: "",
      notes: "",
      partRequirements: [
        {
          partId: "",
          quantity: 1,
        },
      ],
    };
  }

  function blankPrinterDraft() {
    return {
      id: "",
      name: "",
      model: "",
      color: "",
      material: "",
      active: true,
      notes: "",
    };
  }

  function syncProductDraftForAssemblyMode(draft) {
    if (draft.requiresAssembly) {
      if (!draft.partRequirements.length) {
        draft.partRequirements = [
          {
            partId: "",
            quantity: 1,
          },
        ];
      }
      return;
    }

    const firstRequirement = draft.partRequirements.find((requirement) => requirement.partId) || draft.partRequirements[0];
    draft.partRequirements = [
      {
        partId: firstRequirement ? firstRequirement.partId || "" : "",
        quantity: 1,
      },
    ];
  }

  function resetDrafts() {
    ui.partFormDraft = blankPartDraft();
    ui.productFormDraft = blankProductDraft();
    ui.printerFormDraft = blankPrinterDraft();
  }

  function loadState() {
    try {
      const raw = window.localStorage.getItem(STORAGE_KEY);
      if (!raw) {
        return clone(seedState);
      }
      const parsed = JSON.parse(raw);
      const legacyMigration = migrateLegacyPrintJobs(Array.isArray(parsed.printJobs) ? parsed.printJobs : []);
      return {
        parts: Array.isArray(parsed.parts) ? parsed.parts.map((part) => normalizePart(part)) : clone(seedState.parts),
        products: Array.isArray(parsed.products)
          ? parsed.products.map((product) => normalizeProduct(product))
          : clone(seedState.products),
        printers: Array.isArray(parsed.printers)
          ? parsed.printers.map((printer) => normalizePrinter(printer))
          : [],
        printState: Array.isArray(parsed.printState)
          ? parsed.printState.map((entry) => normalizePrintStateEntry(entry))
          : legacyMigration.printState,
        completedPrints: Array.isArray(parsed.completedPrints)
          ? parsed.completedPrints.map((entry) => normalizeCompletedPrintEntry(entry))
          : legacyMigration.completedPrints,
      };
    } catch (error) {
      return clone(seedState);
    }
  }

  function persistState() {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  }

  function overwriteState(nextState) {
    state.parts = nextState.parts;
    state.products = nextState.products;
    state.printers = nextState.printers;
    state.printState = nextState.printState;
    state.completedPrints = nextState.completedPrints;
    persistState();
  }

  function clone(value) {
    return JSON.parse(JSON.stringify(value));
  }

  function sortByName(left, right) {
    return left.name.localeCompare(right.name);
  }

  function emptyPrintStateEntry(partId = "") {
    return {
      partId,
      plannedQty: 0,
      inProgressQty: 0,
      failedQty: 0,
      updatedAt: "",
    };
  }

  function normalizePrintStateEntry(entry) {
    return {
      partId: entry.partId || "",
      plannedQty: toNonNegativeInteger(entry.plannedQty),
      inProgressQty: toNonNegativeInteger(entry.inProgressQty),
      failedQty: toNonNegativeInteger(entry.failedQty),
      updatedAt: entry.updatedAt || "",
    };
  }

  function normalizeCompletedPrintEntry(entry) {
    return {
      id: entry.id || generateId("completion"),
      partId: entry.partId || "",
      quantity: toNonNegativeInteger(entry.quantity),
      completedAt: entry.completedAt || new Date().toISOString(),
    };
  }

  function migrateLegacyPrintJobs(printJobs) {
    const stateByPartId = new Map();
    const completedPrints = [];

    printJobs.forEach((job) => {
      if (!job.partId) {
        return;
      }

      if (job.status === "completed") {
        completedPrints.push(
          normalizeCompletedPrintEntry({
            id: job.id,
            partId: job.partId,
            quantity: job.quantity,
            completedAt: job.completedAt || job.updatedAt,
          }),
        );
        return;
      }

      const entry = stateByPartId.get(job.partId) || emptyPrintStateEntry(job.partId);
      if (job.status === "planned") {
        entry.plannedQty += toNonNegativeInteger(job.quantity);
      } else if (job.status === "in_progress") {
        entry.inProgressQty += toNonNegativeInteger(job.quantity);
      } else if (job.status === "failed") {
        entry.failedQty += toNonNegativeInteger(job.quantity);
      }
      entry.updatedAt = job.updatedAt || entry.updatedAt;
      stateByPartId.set(job.partId, entry);
    });

    return {
      printState: Array.from(stateByPartId.values()),
      completedPrints,
    };
  }

  function getOrCreatePrintStateEntry(partId) {
    let entry = state.printState.find((candidate) => candidate.partId === partId);
    if (entry) {
      return entry;
    }

    entry = emptyPrintStateEntry(partId);
    state.printState.push(entry);
    return entry;
  }

  function cleanupPrintState() {
    state.printState = state.printState
      .map((entry) => normalizePrintStateEntry(entry))
      .filter((entry) => entry.plannedQty > 0 || entry.inProgressQty > 0 || entry.failedQty > 0);
  }

  function promptForQuantity(message, max) {
    const response = window.prompt(message, "1");
    if (response === null) {
      return null;
    }

    const quantity = parseInteger(response);
    if (quantity === null || quantity <= 0) {
      window.alert("Enter a whole number greater than zero.");
      return null;
    }
    if (quantity > max) {
      window.alert(`The quantity cannot be greater than ${max}.`);
      return null;
    }
    return quantity;
  }

  function renderList(items, renderItem, emptyTitle, emptyCopy) {
    if (!items.length) {
      return `
        <div class="empty-state">
          <h3>${escapeHtml(emptyTitle)}</h3>
          <p>${escapeHtml(emptyCopy)}</p>
        </div>
      `;
    }
    return items.map(renderItem).join("");
  }

  function renderFileReference(fileRef) {
    if (/^https?:\/\//i.test(fileRef)) {
      return `<a href="${escapeHtml(fileRef)}" target="_blank" rel="noreferrer">${escapeHtml(fileRef)}</a>`;
    }
    return `<span class="mono">${escapeHtml(fileRef)}</span>`;
  }

  function renderEntityImage(imageRef, alt) {
    if (!imageRef) {
      return "";
    }

    return `
      <div class="card-thumb">
        <img
          src="${escapeHtml(resolveAssetReference(imageRef))}"
          alt="${escapeHtml(alt)}"
          loading="lazy"
          onerror="this.parentElement.style.display='none'"
        />
      </div>
    `;
  }

  function resolveProductImage(product) {
    if (product.imageRef) {
      return product.imageRef;
    }

    const primaryRequirement = product.requirements.find((requirement) => requirement.imageRef);
    return primaryRequirement ? primaryRequirement.imageRef : "";
  }

  function resolveAssetReference(assetRef) {
    return assetRef;
  }

  function getSetupKey(color, material) {
    return `${String(color || "").trim().toLowerCase()}::${String(material || "").trim().toLowerCase()}`;
  }

  function printerMatchesPart(printer, part) {
    return getSetupKey(printer.color, printer.material) === getSetupKey(part.color, part.material);
  }

  function setInputValue(form, name, value) {
    const element = form.elements[name];
    if (element) {
      element.value = value ?? "";
    }
  }

  function setTextValue(form, name, value) {
    const element = form.elements[name];
    if (element) {
      element.value = value ?? "";
    }
  }

  function setCheckboxValue(form, name, value) {
    const element = form.elements[name];
    if (element) {
      element.checked = Boolean(value);
    }
  }

  function setSelectValue(form, name, value) {
    const element = form.elements[name];
    if (element) {
      element.value = value || "";
    }
  }

  function escapeHtml(value) {
    return String(value)
      .replaceAll("&", "&amp;")
      .replaceAll("<", "&lt;")
      .replaceAll(">", "&gt;")
      .replaceAll('"', "&quot;")
      .replaceAll("'", "&#39;");
  }

  function formatParagraph(value) {
    return escapeHtml(value).replaceAll("\n", "<br>");
  }

  function formatNumber(value) {
    return new Intl.NumberFormat("en-US").format(value);
  }

  function formatDurationMinutes(value) {
    const totalMinutes = toNonNegativeInteger(value);
    if (totalMinutes <= 0) {
      return "0m";
    }

    const days = Math.floor(totalMinutes / 1440);
    const hours = Math.floor((totalMinutes % 1440) / 60);
    const minutes = totalMinutes % 60;
    const parts = [];

    if (days > 0) {
      parts.push(`${days}d`);
    }
    if (hours > 0) {
      parts.push(`${hours}h`);
    }
    if (minutes > 0) {
      parts.push(`${minutes}m`);
    }

    return parts.join(" ");
  }

  function capitalizeWords(value) {
    return value
      .split(/[_\s]+/)
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(" ");
  }

  function formatTimestamp(timestamp) {
    return new Intl.DateTimeFormat("en-US", {
      dateStyle: "medium",
      timeStyle: "short",
    }).format(new Date(timestamp));
  }

  function toNonNegativeInteger(value) {
    const parsed = Number.parseInt(String(value), 10);
    if (!Number.isFinite(parsed) || parsed < 0) {
      return 0;
    }
    return parsed;
  }

  function parseInteger(value) {
    const parsed = Number.parseInt(String(value), 10);
    if (!Number.isFinite(parsed)) {
      return null;
    }
    return parsed;
  }

  function generateId(prefix) {
    if (window.crypto && typeof window.crypto.randomUUID === "function") {
      return `${prefix}-${window.crypto.randomUUID()}`;
    }
    return `${prefix}-${Math.random().toString(36).slice(2, 10)}`;
  }
})();
