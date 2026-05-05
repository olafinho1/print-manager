(() => {
  const STATE_API_URL = "/api/state";
  const API_ENDPOINTS = {
    parts: "/api/parts",
    partsDelete: "/api/parts-delete",
    partsInventory: "/api/parts-inventory",
    products: "/api/products",
    productsDelete: "/api/products-delete",
    productActions: "/api/product-actions",
    printers: "/api/printers",
    printersDelete: "/api/printers-delete",
    printerActions: "/api/printer-actions",
    queueActions: "/api/queue-actions",
  };
  const SESSION_OPERATOR_KEY = "print-manager.operator-name";
  const DEFAULT_ACTIVITY_FILTERS = {
    actor: "all",
    scope: "all",
    action: "all",
    window: "30",
  };
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
    partInventoryMovements: [],
    finishedInventoryMovements: [],
    printEvents: [],
  };

  const ui = {
    activeTab: "dashboard",
    partFormDraft: blankPartDraft(),
    productFormDraft: blankProductDraft(),
    printerFormDraft: blankPrinterDraft(),
    operatorName: readSessionOperatorName(),
    activityFilters: { ...DEFAULT_ACTIVITY_FILTERS },
    currentUser: createEmptyAuthMeta(),
    appMeta: createEmptyAppMeta(),
    backendUnavailable: false,
    lastSyncedState: createEmptyState(),
  };

  const state = createEmptyState();
  const dom = getDom();

  init();

  async function init() {
    bindEvents();
    try {
      const nextState = await fetchSharedState();
      replaceStateInMemory(nextState);
      ui.lastSyncedState = clone(nextState);
    } catch (error) {
      ui.backendUnavailable = true;
      ui.currentUser = createEmptyAuthMeta();
      ui.appMeta = {
        environment: "local",
        canRestoreSampleData: true,
        hostname: window.location.hostname,
      };
      replaceStateInMemory(clone(seedState));
      ui.lastSyncedState = clone(seedState);
      const message = error instanceof Error ? error.message : "Unknown API error.";
      window.alert(`Shared D1 state is unavailable. ${message} The UI loaded sample data only; saves will fail until the API is configured.`);
    }
    render();
  }

  function getDom() {
    return {
      summaryCards: document.querySelector("#summary-cards"),
      operatorName: document.querySelector("#operator-name"),
      operatorLabel: document.querySelector("#operator-label"),
      signedInUser: document.querySelector("#signed-in-user"),
      readyProducts: document.querySelector("#ready-products"),
      blockedProducts: document.querySelector("#blocked-products"),
      lowStockParts: document.querySelector("#low-stock-parts"),
      suggestedJobs: document.querySelector("#suggested-jobs"),
      queueSnapshot: document.querySelector("#queue-snapshot"),
      completedPrints: document.querySelector("#completed-prints"),
      recentActivity: document.querySelector("#recent-activity"),
      dashboardActivityToolbar: document.querySelector("#dashboard-activity-toolbar"),
      partsList: document.querySelector("#parts-list"),
      partsCount: document.querySelector("#parts-count"),
      partsActivityToolbar: document.querySelector("#parts-activity-toolbar"),
      productsList: document.querySelector("#products-list"),
      productsCount: document.querySelector("#products-count"),
      productsActivityToolbar: document.querySelector("#products-activity-toolbar"),
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
    document.addEventListener("change", handleGlobalChange);

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

    if (dom.operatorName) {
      dom.operatorName.value = ui.operatorName;
      dom.operatorName.addEventListener("input", handleOperatorInput);
    }
  }

  function handleGlobalChange(event) {
    const filterKey = event.target?.dataset?.activityFilter;
    if (!filterKey) {
      return;
    }

    ui.activityFilters[filterKey] = event.target.value || DEFAULT_ACTIVITY_FILTERS[filterKey] || "all";
    render();
  }

  function handleOperatorInput(event) {
    ui.operatorName = normalizeActorName(event.target.value || "");
    writeSessionOperatorName(ui.operatorName);
    renderActivityToolbars(ui.lastComputed || computeState());
  }

  async function handleClick(event) {
    const target = event.target.closest("[data-action], [data-tab], #restore-sample-data");
    if (!target) {
      return;
    }

    if (target.id === "restore-sample-data") {
      if (!window.confirm("Replace current data with the built-in sample dataset?")) {
        return;
      }
      try {
        await replaceSharedState(clone(seedState));
        resetDrafts();
        render();
      } catch (error) {
        handlePersistenceError(error);
      }
      return;
    }

    if (target.dataset.tab) {
      ui.activeTab = target.dataset.tab;
      render();
      return;
    }

    const { action, id, partId, quantity, index, status } = target.dataset;

    try {
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
          await deletePart(id);
          break;
        case "add-part-stock":
          await adjustPartStock(id, "add");
          break;
        case "adjust-part-stock":
          await adjustPartStock(id, "adjust");
          break;
        case "queue-part":
          prefillQueueForPart(id);
          break;
        case "edit-product":
          startProductEdit(id);
          break;
        case "delete-product":
          await deleteProduct(id);
          break;
        case "edit-printer":
          startPrinterEdit(id);
          break;
        case "delete-printer":
          await deletePrinter(id);
          break;
        case "toggle-printer":
          await togglePrinter(id);
          break;
        case "toggle-product":
          await toggleProduct(id);
          break;
        case "assemble-product":
          await assembleProduct(id);
          break;
        case "adjust-finished-stock":
          await adjustFinishedStock(id);
          break;
        case "pack-product":
          await packProduct(id);
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
          await updateQueueState(partId, "plan");
          break;
        case "queue-start":
          await updateQueueState(partId, "start");
          break;
        case "queue-complete":
          await updateQueueState(partId, "complete");
          break;
        case "queue-fail":
          await updateQueueState(partId, "fail");
          break;
        case "queue-retry":
          await updateQueueState(partId, "retry");
          break;
        default:
          break;
      }
    } catch (error) {
      handlePersistenceError(error);
    }
  }

  function render() {
    const computed = computeState();
    ui.lastComputed = computed;

    renderTabs();
    renderHeader();
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
    renderActivityToolbars(computed);
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

  function renderHeader() {
    if (dom.signedInUser) {
      dom.signedInUser.textContent = ui.currentUser.authenticated
        ? `Signed in as ${ui.currentUser.email}`
        : ui.appMeta.environment === "local"
          ? "Local development session"
          : "Authentication not detected";
    }

    if (dom.operatorLabel) {
      dom.operatorLabel.textContent = ui.currentUser.authenticated ? "Operator override" : "Operator";
    }

    if (dom.operatorName) {
      dom.operatorName.placeholder = ui.currentUser.authenticated
        ? `Blank uses ${ui.currentUser.email}`
        : "Who is working now?";
    }

    if (dom.restoreSampleData) {
      dom.restoreSampleData.hidden = !ui.appMeta.canRestoreSampleData;
    }
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

    dom.recentActivity.innerHTML = renderList(
      computed.recentActivity,
      (entry) => renderActivityCard(entry),
      computed.isActivityFilterActive ? "No activity matches the current filters." : "No recent activity has been recorded yet.",
      computed.isActivityFilterActive
        ? "Change actor, scope, action, or time filters to widen the feed."
        : "Assembly, packing, queue changes, and stock movements will appear here.",
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
        const partHistory = computed.partHistoryById.get(part.id) || [];
        const hasAnyPartHistory = (computed.partHistoryTotalById.get(part.id) || 0) > 0;
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

            ${
              partHistory.length
                ? `
                  <div class="activity-stack">
                    ${partHistory.map((entry) => renderMiniActivity(entry)).join("")}
                  </div>
                `
                : `<p class="helper-text">${
                    computed.isActivityFilterActive && hasAnyPartHistory
                      ? "No part activity matches the current filters."
                      : "No part activity has been recorded yet."
                  }</p>`
            }

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
        const productHistory = computed.productHistoryById.get(product.id) || [];
        const hasAnyProductHistory = (computed.productHistoryTotalById.get(product.id) || 0) > 0;
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

          ${
            productHistory.length
              ? `
                <div class="activity-stack">
                  ${productHistory.map((entry) => renderMiniActivity(entry)).join("")}
                </div>
              `
              : `<p class="helper-text">${
                  computed.isActivityFilterActive && hasAnyProductHistory
                    ? "No product activity matches the current filters."
                    : "No product activity has been recorded yet."
                }</p>`
          }

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

  async function handlePartSubmit(event) {
    event.preventDefault();

    try {
      const payload = normalizePart(readPartForm());
      if (!payload.name || !payload.color || !payload.material) {
        window.alert("Part name, color, and material are required.");
        return;
      }

      if (payload.inventoryQty < 0 || payload.minStock < 0) {
        window.alert("Inventory and minimum stock must be zero or greater.");
        return;
      }

      await mutateState(API_ENDPOINTS.parts, {
        part: payload.id ? payload : { ...payload, id: generateId("part") },
      });
      ui.partFormDraft = blankPartDraft();
      render();
    } catch (error) {
      handlePersistenceError(error);
    }
  }

  async function handleProductSubmit(event) {
    event.preventDefault();

    try {
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

      await mutateState(API_ENDPOINTS.products, {
        product: payload.id ? payload : { ...payload, id: generateId("product") },
      });
      ui.productFormDraft = blankProductDraft();
      render();
    } catch (error) {
      handlePersistenceError(error);
    }
  }

  async function handlePrinterSubmit(event) {
    event.preventDefault();

    try {
      const payload = normalizePrinter(readPrinterForm());
      if (!payload.name || !payload.color || !payload.material) {
        window.alert("Printer name, loaded color, and loaded material are required.");
        return;
      }

      await mutateState(API_ENDPOINTS.printers, {
        printer: payload.id ? payload : { ...payload, id: generateId("printer") },
      });
      ui.printerFormDraft = blankPrinterDraft();
      render();
    } catch (error) {
      handlePersistenceError(error);
    }
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

  async function deletePart(id) {
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

    await mutateState(API_ENDPOINTS.partsDelete, { id });
    if (ui.partFormDraft.id === id) {
      ui.partFormDraft = blankPartDraft();
    }
    render();
  }

  async function deleteProduct(id) {
    const product = state.products.find((entry) => entry.id === id);
    if (!product || !window.confirm(`Delete product "${product.name}"?`)) {
      return;
    }

    await mutateState(API_ENDPOINTS.productsDelete, { id });
    if (ui.productFormDraft.id === id) {
      ui.productFormDraft = blankProductDraft();
    }
    render();
  }

  async function deletePrinter(id) {
    const printer = state.printers.find((entry) => entry.id === id);
    if (!printer || !window.confirm(`Delete printer "${printer.name}"?`)) {
      return;
    }

    await mutateState(API_ENDPOINTS.printersDelete, { id });
    if (ui.printerFormDraft.id === id) {
      ui.printerFormDraft = blankPrinterDraft();
    }
    render();
  }

  async function toggleProduct(id) {
    const product = state.products.find((entry) => entry.id === id);
    if (!product) {
      return;
    }

    await mutateState(API_ENDPOINTS.productActions, {
      action: "toggle",
      productId: id,
      active: !product.active,
    });
    render();
  }

  async function togglePrinter(id) {
    const printer = state.printers.find((entry) => entry.id === id);
    if (!printer) {
      return;
    }

    await mutateState(API_ENDPOINTS.printerActions, {
      action: "toggle",
      printerId: id,
      active: !printer.active,
    });
    render();
  }

  async function adjustPartStock(id, mode) {
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

    await mutateState(API_ENDPOINTS.partsInventory, {
      partId: id,
      delta: appliedDelta,
      reason: mode === "add" ? "manual_add" : "manual_adjustment",
      note:
        mode === "add"
          ? "Completed parts added through the Add stock action."
          : "Inventory adjusted through the Adjust action.",
    });
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

  async function assembleProduct(id) {
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

    await mutateState(API_ENDPOINTS.productActions, {
      action: "assemble",
      productId: id,
      quantity,
    });
    render();
  }

  async function adjustFinishedStock(id) {
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

    await mutateState(API_ENDPOINTS.productActions, {
      action: "adjust_finished_stock",
      productId: id,
      delta,
    });
    render();
  }

  async function packProduct(id) {
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

    await mutateState(API_ENDPOINTS.productActions, {
      action: "pack",
      productId: id,
      quantity,
    });
    render();
  }

  async function updateQueueState(partId, action) {
    const computed = computeState();
    const row = computed.queueByPartId.get(partId);
    if (!row) {
      return;
    }

    if (action === "plan") {
      if (row.remainingQty <= 0) {
        window.alert("There is no unplanned quantity remaining for this part.");
        return;
      }
      const quantity = promptForQuantity(`How many "${row.part.name}" units should be planned? Max ${row.remainingQty}.`, row.remainingQty);
      if (quantity === null) {
        return;
      }
      await mutateState(API_ENDPOINTS.queueActions, {
        action,
        partId,
        quantity,
      });
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
      await mutateState(API_ENDPOINTS.queueActions, {
        action,
        partId,
        quantity,
      });
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
      await mutateState(API_ENDPOINTS.queueActions, {
        action,
        partId,
        quantity,
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
      await mutateState(API_ENDPOINTS.queueActions, {
        action,
        partId,
        quantity,
      });
    } else if (action === "retry") {
      if (row.failedQty <= 0) {
        window.alert("There is no failed quantity to retry.");
        return;
      }
      const quantity = promptForQuantity(`How many failed "${row.part.name}" units should move back to planned? Max ${row.failedQty}.`, row.failedQty);
      if (quantity === null) {
        return;
      }
      await mutateState(API_ENDPOINTS.queueActions, {
        action,
        partId,
        quantity,
      });
    } else {
      return;
    }
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
    const partActivityEntries = buildPartActivityEntries(state, partsById);
    const productActivityEntries = buildProductActivityEntries(state, new Map(products.map((product) => [product.id, product])));
    const allActivityEntries = [...partActivityEntries, ...productActivityEntries].sort(
      (left, right) => new Date(right.timestamp).getTime() - new Date(left.timestamp).getTime(),
    );
    const filteredActivityEntries = filterActivityEntries(allActivityEntries, ui.activityFilters);
    const activityActors = buildActivityActorOptions(allActivityEntries);
    const activityActions = buildActivityActionOptions(allActivityEntries);
    const partHistoryById = new Map();
    const productHistoryById = new Map();
    const partHistoryTotalById = new Map();
    const productHistoryTotalById = new Map();

    partActivityEntries.forEach((entry) => {
      partHistoryTotalById.set(entry.entityId, (partHistoryTotalById.get(entry.entityId) || 0) + 1);
    });

    productActivityEntries.forEach((entry) => {
      productHistoryTotalById.set(entry.entityId, (productHistoryTotalById.get(entry.entityId) || 0) + 1);
    });

    filteredActivityEntries
      .filter((entry) => entry.scope === "part" || entry.scope === "queue")
      .forEach((entry) => {
      const list = partHistoryById.get(entry.entityId) || [];
      if (list.length < 4) {
        list.push(entry);
      }
      partHistoryById.set(entry.entityId, list);
    });

    filteredActivityEntries
      .filter((entry) => entry.scope === "product")
      .forEach((entry) => {
      const list = productHistoryById.get(entry.entityId) || [];
      if (list.length < 4) {
        list.push(entry);
      }
      productHistoryById.set(entry.entityId, list);
    });

    const recentActivity = filteredActivityEntries.slice(0, 12);
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
      recentActivity,
      activityActors,
      activityActions,
      isActivityFilterActive: isActivityFilterActive(),
      partHistoryById,
      partHistoryTotalById,
      productHistoryById,
      productHistoryTotalById,
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

  function createEmptyState() {
    return {
      parts: [],
      products: [],
      printers: [],
      printState: [],
      completedPrints: [],
      partInventoryMovements: [],
      finishedInventoryMovements: [],
      printEvents: [],
    };
  }

  function createEmptyAuthMeta() {
    return {
      authenticated: false,
      email: "",
      source: "anonymous",
    };
  }

  function createEmptyAppMeta() {
    return {
      environment: "local",
      canRestoreSampleData: true,
      hostname: window.location.hostname,
    };
  }

  function normalizeRemoteState(parsed) {
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
      partInventoryMovements: Array.isArray(parsed.partInventoryMovements)
        ? parsed.partInventoryMovements.map((entry) => normalizePartInventoryMovement(entry))
        : [],
      finishedInventoryMovements: Array.isArray(parsed.finishedInventoryMovements)
        ? parsed.finishedInventoryMovements.map((entry) => normalizeFinishedInventoryMovement(entry))
        : [],
      printEvents: Array.isArray(parsed.printEvents) ? parsed.printEvents.map((entry) => normalizePrintEvent(entry)) : [],
      meta: normalizeRemoteMeta(parsed.meta),
    };
  }

  function normalizeRemoteMeta(meta) {
    return {
      auth: {
        authenticated: Boolean(meta?.auth?.authenticated),
        email: normalizeActorName(meta?.auth?.email),
        source: String(meta?.auth?.source || "anonymous"),
      },
      app: {
        environment: String(meta?.app?.environment || "local"),
        canRestoreSampleData: meta?.app?.canRestoreSampleData !== false,
        hostname: String(meta?.app?.hostname || window.location.hostname),
      },
    };
  }

  async function fetchSharedState() {
    const response = await window.fetch(STATE_API_URL, {
      headers: {
        accept: "application/json",
      },
    });
    if (!response.ok) {
      throw new Error(await readApiError(response, `Failed to load shared state (${response.status}).`));
    }

    const payload = await response.json();
    applyRemoteMeta(payload.meta);
    return normalizeRemoteState(payload);
  }

  async function mutateState(url, body) {
    const actor = getEffectiveActor();
    const response = await window.fetch(url, {
      method: "POST",
      headers: {
        "content-type": "application/json",
        accept: "application/json",
      },
      body: JSON.stringify({
        ...body,
        actor,
      }),
    });

    if (!response.ok) {
      throw new Error(await readApiError(response, `Failed to save shared state (${response.status}).`));
    }

    const payload = await response.json();
    applyRemoteMeta(payload.state?.meta || payload.meta);
    const nextState = normalizeRemoteState(payload.state || payload);
    replaceStateInMemory(nextState);
    ui.backendUnavailable = false;
    ui.lastSyncedState = clone(nextState);
    return payload;
  }

  async function replaceSharedState(nextState) {
    const response = await window.fetch(STATE_API_URL, {
      method: "PUT",
      headers: {
        "content-type": "application/json",
        accept: "application/json",
      },
      body: JSON.stringify(nextState),
    });

    if (!response.ok) {
      throw new Error(await readApiError(response, `Failed to save shared state (${response.status}).`));
    }

    const payload = await response.json();
    applyRemoteMeta(payload.meta);
    const normalizedState = normalizeRemoteState(payload);
    replaceStateInMemory(normalizedState);
    ui.backendUnavailable = false;
    ui.lastSyncedState = clone(normalizedState);
    return normalizedState;
  }

  function applyRemoteMeta(meta) {
    const normalizedMeta = normalizeRemoteMeta(meta);
    ui.currentUser = normalizedMeta.auth;
    ui.appMeta = normalizedMeta.app;
  }

  function getEffectiveActor() {
    return normalizeActorName(ui.operatorName || ui.currentUser.email || "");
  }

  function replaceStateInMemory(nextState) {
    state.parts = nextState.parts;
    state.products = nextState.products;
    state.printers = nextState.printers;
    state.printState = nextState.printState;
    state.completedPrints = nextState.completedPrints;
    state.partInventoryMovements = nextState.partInventoryMovements;
    state.finishedInventoryMovements = nextState.finishedInventoryMovements;
    state.printEvents = nextState.printEvents;
  }

  function handlePersistenceError(error) {
    const message = error instanceof Error ? error.message : "Unexpected persistence error.";
    replaceStateInMemory(clone(ui.lastSyncedState));
    render();
    window.alert(message);
    console.error(error);
  }

  async function readApiError(response, fallbackMessage) {
    try {
      const payload = await response.json();
      if (payload && typeof payload.error === "string" && payload.error) {
        return payload.error;
      }
    } catch (error) {
      // Ignore JSON parse errors and fall back to status-based message.
    }
    return fallbackMessage;
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

  function normalizePartInventoryMovement(entry) {
    return {
      id: entry.id || generateId("part-move"),
      partId: entry.partId || "",
      deltaQty: parseInteger(entry.deltaQty) || 0,
      reason: entry.reason || "",
      referenceType: entry.referenceType || "",
      referenceId: entry.referenceId || "",
      note: entry.note || "",
      actor: normalizeActorName(entry.actor),
      createdAt: entry.createdAt || new Date().toISOString(),
    };
  }

  function normalizeFinishedInventoryMovement(entry) {
    return {
      id: entry.id || generateId("finished-move"),
      productId: entry.productId || "",
      deltaQty: parseInteger(entry.deltaQty) || 0,
      reason: entry.reason || "",
      referenceType: entry.referenceType || "",
      referenceId: entry.referenceId || "",
      note: entry.note || "",
      actor: normalizeActorName(entry.actor),
      createdAt: entry.createdAt || new Date().toISOString(),
    };
  }

  function normalizePrintEvent(entry) {
    return {
      id: entry.id || generateId("print-event"),
      partId: entry.partId || "",
      action: entry.action || "",
      quantity: toNonNegativeInteger(entry.quantity),
      note: entry.note || "",
      actor: normalizeActorName(entry.actor),
      createdAt: entry.createdAt || new Date().toISOString(),
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

  function renderActivityCard(entry) {
    return `
      <article class="detail-card">
        <div class="detail-card__head">
          <div>
            <h3>${escapeHtml(entry.title)}</h3>
            <p class="sku">${escapeHtml(entry.subtitle)}</p>
          </div>
          <span class="badge ${entry.badgeClass}">${escapeHtml(entry.badgeLabel)}</span>
        </div>
        <p class="helper-text">${escapeHtml(entry.description)}</p>
        ${entry.note ? `<p class="helper-text">${formatParagraph(entry.note)}</p>` : ""}
        <p class="helper-text">${escapeHtml(formatActorLabel(entry.actor))} · ${escapeHtml(formatTimestamp(entry.timestamp))}</p>
      </article>
    `;
  }

  function renderMiniActivity(entry) {
    return `
      <div class="activity-item">
        <div class="meta-row">
          <span class="badge ${entry.badgeClass}">${escapeHtml(entry.badgeLabel)}</span>
          <span class="activity-time">${escapeHtml(formatTimestamp(entry.timestamp))}</span>
        </div>
        <p class="activity-copy">${escapeHtml(entry.description)}</p>
        <p class="helper-text">${escapeHtml(formatActorLabel(entry.actor))}</p>
        ${entry.note ? `<p class="helper-text">${formatParagraph(entry.note)}</p>` : ""}
      </div>
    `;
  }

  function renderActivityToolbars(computed) {
    const markup = buildActivityToolbarMarkup(computed);
    if (dom.dashboardActivityToolbar) {
      dom.dashboardActivityToolbar.innerHTML = markup;
    }
    if (dom.partsActivityToolbar) {
      dom.partsActivityToolbar.innerHTML = markup;
    }
    if (dom.productsActivityToolbar) {
      dom.productsActivityToolbar.innerHTML = markup;
    }
    if (dom.operatorName && dom.operatorName.value !== ui.operatorName) {
      dom.operatorName.value = ui.operatorName;
    }
  }

  function buildActivityToolbarMarkup(computed) {
    const actorOptions = [
      '<option value="all">All operators</option>',
      ...computed.activityActors.map(
        (option) =>
          `<option value="${escapeHtml(option.value)}" ${ui.activityFilters.actor === option.value ? "selected" : ""}>${escapeHtml(option.label)}</option>`,
      ),
    ].join("");
    const actionOptions = [
      '<option value="all">All actions</option>',
      ...computed.activityActions.map(
        (option) =>
          `<option value="${escapeHtml(option.value)}" ${ui.activityFilters.action === option.value ? "selected" : ""}>${escapeHtml(option.label)}</option>`,
      ),
    ].join("");

    return `
      <div class="activity-toolbar__controls">
        <label class="field activity-filter-field">
          <span>Scope</span>
          <select data-activity-filter="scope">
            <option value="all" ${ui.activityFilters.scope === "all" ? "selected" : ""}>All activity</option>
            <option value="part" ${ui.activityFilters.scope === "part" ? "selected" : ""}>Part inventory</option>
            <option value="product" ${ui.activityFilters.scope === "product" ? "selected" : ""}>Finished goods</option>
            <option value="queue" ${ui.activityFilters.scope === "queue" ? "selected" : ""}>Queue events</option>
          </select>
        </label>
        <label class="field activity-filter-field">
          <span>Action</span>
          <select data-activity-filter="action">
            ${actionOptions}
          </select>
        </label>
        <label class="field activity-filter-field">
          <span>Operator</span>
          <select data-activity-filter="actor">
            ${actorOptions}
          </select>
        </label>
        <label class="field activity-filter-field">
          <span>Window</span>
          <select data-activity-filter="window">
            <option value="7" ${ui.activityFilters.window === "7" ? "selected" : ""}>Last 7 days</option>
            <option value="30" ${ui.activityFilters.window === "30" ? "selected" : ""}>Last 30 days</option>
            <option value="90" ${ui.activityFilters.window === "90" ? "selected" : ""}>Last 90 days</option>
            <option value="all" ${ui.activityFilters.window === "all" ? "selected" : ""}>All time</option>
          </select>
        </label>
      </div>
    `;
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

  function buildPartActivityEntries(state, partsById) {
    const completionMovementKeys = new Set(
      state.partInventoryMovements
        .filter((entry) => entry.reason === "print_completed")
        .map((entry) => `${entry.partId}::${entry.deltaQty}::${entry.createdAt}`),
    );

    const movementEntries = state.partInventoryMovements.map((entry) => {
      const part = partsById.get(entry.partId);
      return {
        id: entry.id,
        entityId: entry.partId,
        title: part ? part.name : "Missing part",
        subtitle: "Part inventory",
        scope: "part",
        actionKey: entry.reason,
        badgeLabel: formatSignedQuantity(entry.deltaQty),
        badgeClass: entry.deltaQty >= 0 ? "badge--active" : "badge--inactive",
        description: describePartMovement(entry.reason, part ? part.name : "Part"),
        note: entry.note,
        actor: entry.actor,
        timestamp: entry.createdAt,
      };
    });

    const queueEntries = state.printEvents
      .filter((entry) => entry.action !== "complete")
      .map((entry) => {
        const part = partsById.get(entry.partId);
        return {
          id: entry.id,
          entityId: entry.partId,
          title: part ? part.name : "Missing part",
          subtitle: "Queue event",
          scope: "queue",
          actionKey: entry.action,
          badgeLabel: `${formatNumber(entry.quantity)} ${formatQueueActionLabel(entry.action)}`,
          badgeClass: getQueueActivityBadgeClass(entry.action),
          description: describePrintEvent(entry.action, part ? part.name : "Part"),
          note: entry.note,
          actor: entry.actor,
          timestamp: entry.createdAt,
        };
      });

    const legacyCompletionEntries = state.completedPrints
      .filter((entry) => !completionMovementKeys.has(`${entry.partId}::${entry.quantity}::${entry.completedAt}`))
      .map((entry) => {
        const part = partsById.get(entry.partId);
        return {
          id: `legacy-${entry.id}`,
          entityId: entry.partId,
          title: part ? part.name : "Missing part",
          subtitle: "Completed print",
          scope: "part",
          actionKey: "print_completed",
          badgeLabel: formatSignedQuantity(entry.quantity),
          badgeClass: "badge--active",
          description: describePartMovement("print_completed", part ? part.name : "Part"),
          note: "",
          actor: "",
          timestamp: entry.completedAt,
        };
      });

    return [...movementEntries, ...queueEntries, ...legacyCompletionEntries].sort(
      (left, right) => new Date(right.timestamp).getTime() - new Date(left.timestamp).getTime(),
    );
  }

  function buildProductActivityEntries(state, productsById) {
    return state.finishedInventoryMovements
      .map((entry) => {
        const product = productsById.get(entry.productId);
        return {
          id: entry.id,
          entityId: entry.productId,
          title: product ? product.name : "Missing product",
          subtitle: "Finished goods",
          scope: "product",
          actionKey: entry.reason,
          badgeLabel: formatSignedQuantity(entry.deltaQty),
          badgeClass: entry.deltaQty >= 0 ? "badge--active" : "badge--inactive",
          description: describeFinishedMovement(entry.reason, product ? product.name : "Product"),
          note: entry.note,
          actor: entry.actor,
          timestamp: entry.createdAt,
        };
      })
      .sort((left, right) => new Date(right.timestamp).getTime() - new Date(left.timestamp).getTime());
  }

  function filterActivityEntries(entries, filters) {
    return entries.filter((entry) => {
      if (filters.scope !== "all" && entry.scope !== filters.scope) {
        return false;
      }
      if (filters.action !== "all" && entry.actionKey !== filters.action) {
        return false;
      }
      if (filters.actor !== "all") {
        const actorKey = entry.actor ? entry.actor : "__unknown__";
        if (actorKey !== filters.actor) {
          return false;
        }
      }
      if (filters.window !== "all") {
        const days = Number.parseInt(filters.window, 10);
        if (Number.isFinite(days) && days > 0) {
          const cutoff = Date.now() - days * 24 * 60 * 60 * 1000;
          if (new Date(entry.timestamp).getTime() < cutoff) {
            return false;
          }
        }
      }
      return true;
    });
  }

  function buildActivityActorOptions(entries) {
    const seen = new Set();
    const options = [];

    entries.forEach((entry) => {
      const value = entry.actor ? entry.actor : "__unknown__";
      if (seen.has(value)) {
        return;
      }
      seen.add(value);
      options.push({
        value,
        label: formatActorLabel(entry.actor),
      });
    });

    return options.sort((left, right) => left.label.localeCompare(right.label));
  }

  function buildActivityActionOptions(entries) {
    const seen = new Set();
    const options = [];

    entries.forEach((entry) => {
      if (!entry.actionKey || seen.has(entry.actionKey)) {
        return;
      }
      seen.add(entry.actionKey);
      options.push({
        value: entry.actionKey,
        label: formatActionOptionLabel(entry.actionKey),
      });
    });

    return options.sort((left, right) => left.label.localeCompare(right.label));
  }

  function formatSignedQuantity(value) {
    const numericValue = Number(value) || 0;
    return `${numericValue > 0 ? "+" : ""}${formatNumber(numericValue)}`;
  }

  function formatQueueActionLabel(action) {
    if (action === "start") {
      return "started";
    }
    if (action === "fail") {
      return "failed";
    }
    if (action === "retry") {
      return "retried";
    }
    if (action === "plan") {
      return "planned";
    }
    return capitalizeWords(action);
  }

  function getQueueActivityBadgeClass(action) {
    if (action === "start") {
      return "status--in_progress";
    }
    if (action === "fail") {
      return "status--failed";
    }
    return "status--planned";
  }

  function describePartMovement(reason, partName) {
    if (reason === "manual_add") {
      return `Added completed ${partName} stock.`;
    }
    if (reason === "manual_adjustment") {
      return `Adjusted ${partName} inventory manually.`;
    }
    if (reason === "manual_edit_balance") {
      return `Changed ${partName} inventory from the part editor.`;
    }
    if (reason === "assembly_consumed") {
      return `${partName} inventory was consumed by assembly.`;
    }
    if (reason === "print_completed") {
      return `${partName} print finished and moved into inventory.`;
    }
    if (reason === "packed_direct_product") {
      return `${partName} stock was packed directly as sellable product.`;
    }
    return `${partName} inventory changed.`;
  }

  function describeFinishedMovement(reason, productName) {
    if (reason === "assembled") {
      return `${productName} was assembled into finished stock.`;
    }
    if (reason === "packed") {
      return `${productName} was packed from finished stock.`;
    }
    if (reason === "manual_adjustment") {
      return `${productName} finished stock was adjusted manually.`;
    }
    if (reason === "manual_edit_balance") {
      return `${productName} finished stock changed from the product editor.`;
    }
    return `${productName} finished stock changed.`;
  }

  function describePrintEvent(action, partName) {
    if (action === "plan") {
      return `${partName} quantity was added to the queue plan.`;
    }
    if (action === "start") {
      return `${partName} quantity moved into active printing.`;
    }
    if (action === "fail") {
      return `${partName} quantity was marked as failed.`;
    }
    if (action === "retry") {
      return `${partName} failed quantity moved back to planned.`;
    }
    return `${partName} queue changed.`;
  }

  function formatActorLabel(actor) {
    return actor ? `By ${actor}` : "Operator unknown";
  }

  function formatActionOptionLabel(actionKey) {
    if (actionKey === "manual_add") {
      return "Manual add";
    }
    if (actionKey === "manual_adjustment") {
      return "Manual adjustment";
    }
    if (actionKey === "manual_edit_balance") {
      return "Editor balance change";
    }
    if (actionKey === "assembly_consumed") {
      return "Assembly consumed parts";
    }
    if (actionKey === "print_completed") {
      return "Print completed";
    }
    if (actionKey === "packed_direct_product") {
      return "Packed direct product";
    }
    if (actionKey === "assembled") {
      return "Assembled finished goods";
    }
    if (actionKey === "packed") {
      return "Packed finished goods";
    }
    if (actionKey === "plan") {
      return "Queue planned";
    }
    if (actionKey === "start") {
      return "Queue started";
    }
    if (actionKey === "fail") {
      return "Queue failed";
    }
    if (actionKey === "retry") {
      return "Queue retried";
    }
    return capitalizeWords(actionKey);
  }

  function isActivityFilterActive() {
    return Object.entries(DEFAULT_ACTIVITY_FILTERS).some(([key, value]) => ui.activityFilters[key] !== value);
  }

  function readSessionOperatorName() {
    try {
      return normalizeActorName(window.sessionStorage.getItem(SESSION_OPERATOR_KEY) || "");
    } catch (error) {
      return "";
    }
  }

  function writeSessionOperatorName(value) {
    try {
      if (value) {
        window.sessionStorage.setItem(SESSION_OPERATOR_KEY, value);
      } else {
        window.sessionStorage.removeItem(SESSION_OPERATOR_KEY);
      }
    } catch (error) {
      // Ignore session storage errors.
    }
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

  function normalizeActorName(value) {
    return String(value || "").trim().slice(0, 80);
  }
})();
