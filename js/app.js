// Customer Management Portal - Main Application Logic
// Pure Vanilla JavaScript, Fast & Lightweight, Professional Event-Delegated Architecture

(function() {
  'use strict';

  // DOM Elements - Navigation & Core Views
  const navNewCustomer = document.getElementById('nav-new-customer');
  const navCustomers = document.getElementById('nav-customers');
  const navSearch = document.getElementById('nav-search');
  const formContainer = document.getElementById('form-container');
  const searchSection = document.getElementById('search-section');
  const searchInput = document.getElementById('search-input');
  const btnClearSearch = document.getElementById('btn-clear-search');
  const draftBar = document.getElementById('draft-bar');
  const draftText = document.getElementById('draft-text');
  const btnContinueDraft = document.getElementById('btn-continue-draft');
  const btnDiscardDraft = document.getElementById('btn-discard-draft');

  // Floating Action Button (Center-Down on Screen)
  const floatingBottomBar = document.getElementById('floating-bottom-bar');
  const btnFloatingNewCustomer = document.getElementById('btn-floating-new-customer');

  // Form Fields
  const fieldDate = document.getElementById('field-date');
  const fieldTime = document.getElementById('field-time');
  const fieldName = document.getElementById('field-name');
  const fieldPhone = document.getElementById('field-phone');
  const fieldAddress = document.getElementById('field-address');
  const fieldProblem = document.getElementById('field-problem');
  const priceItemsList = document.getElementById('price-items-list');
  const itemPickerInput = document.getElementById('item-picker-input');
  const itemPickerList = document.getElementById('item-picker-list');
  const btnItemPicker = document.getElementById('btn-item-picker');
  const customItemName = document.getElementById('custom-item-name');
  const customItemPrice = document.getElementById('custom-item-price');
  const btnAddCustomItem = document.getElementById('btn-add-custom-item');
  const liveTotalEl = document.getElementById('live-total');
  const btnSave = document.getElementById('btn-save');
  const btnCloseForm = document.getElementById('btn-close-form');
  const btnClosePrices = document.getElementById('btn-close-prices');

  // Customer List Elements
  const customersGrid = document.getElementById('customers-grid');
  const emptyState = document.getElementById('empty-state');
  const linkPriceList = document.getElementById('link-price-list');
  const linkCloudSettings = document.getElementById('link-cloud-settings');

  // Left Slide-out Drawer Elements (Header 3-Dot Menu)
  const btnHeaderMenu = document.getElementById('btn-header-menu');
  const appDrawer = document.getElementById('app-drawer');
  const drawerOverlay = document.getElementById('drawer-overlay');
  const btnCloseDrawer = document.getElementById('btn-close-drawer');
  const drawerBtnHome = document.getElementById('drawer-btn-home');
  const drawerBtnNewCustomer = document.getElementById('drawer-btn-new-customer');
  const drawerItemsCount = document.getElementById('drawer-items-count');
  const drawerTotalCustomers = document.getElementById('drawer-total-customers');

  // Phone Reminder Modal
  const phoneReminderModal = document.getElementById('phone-reminder-modal');
  const btnReminderAddNumber = document.getElementById('btn-reminder-add-number');
  const btnReminderSaveAnyway = document.getElementById('btn-reminder-save-anyway');

  // Items Management Modal (previously Price List Modal)
  const priceListModal = document.getElementById('price-list-modal');
  const btnClosePriceModal = document.getElementById('btn-close-price-modal');
  const btnBackPriceModal = document.getElementById('btn-back-price-modal');
  const modalPriceItems = document.getElementById('modal-price-items');
  const modalItemName = document.getElementById('modal-item-name');
  const modalItemPrice = document.getElementById('modal-item-price');
  const btnModalAddItem = document.getElementById('btn-modal-add-item');

  // Edit Item Modal
  const itemEditModal = document.getElementById('item-edit-modal');
  const itemEditModalTitle = document.getElementById('item-edit-modal-title');
  const btnCloseItemEditModal = document.getElementById('btn-close-item-edit-modal');
  const btnBackItemEdit = document.getElementById('btn-back-item-edit');
  const btnCancelItemEdit = document.getElementById('btn-cancel-item-edit');
  const btnSaveItemEdit = document.getElementById('btn-save-item-edit');
  const editItemId = document.getElementById('edit-item-id');
  const editItemName = document.getElementById('edit-item-name');
  const editItemPrice = document.getElementById('edit-item-price');
  const editItemStock = document.getElementById('edit-item-stock');
  const editItemPackagingHint = document.getElementById('edit-item-packaging-hint');

  // Item History Modal
  const itemHistoryModal = document.getElementById('item-history-modal');
  const historyModalTitle = document.getElementById('history-modal-title');
  const historyList = document.getElementById('history-list');
  const btnCloseHistoryModal = document.getElementById('btn-close-history-modal');
  const btnBackHistory = document.getElementById('btn-back-history');
  const btnFooterBackHistory = document.getElementById('btn-footer-back-history');
  const btnFooterCloseHistory = document.getElementById('btn-footer-close-history');
  let modalReturnDestination = null; // 'items-modal' or null

  // Item Options Menu (Shared 3-dot dropdown)
  const itemOptionsMenu = document.getElementById('item-options-menu');
  let activeOptionsMenuTarget = null;
  let activeOptionsMenuItem = null;
  let activeOptionsMenuCallbacks = null;

  // Cloud Sync Modal (Kept for direct settings if needed)
  const cloudModal = document.getElementById('cloud-modal');
  const btnCloseCloudModal = document.getElementById('btn-close-cloud-modal');
  const cfgSupabaseUrl = document.getElementById('cfg-supabase-url');
  const cfgSupabaseKey = document.getElementById('cfg-supabase-key');
  const cloudConnectionIndicator = document.getElementById('cloud-connection-indicator');
  const btnSaveCloud = document.getElementById('btn-save-cloud');

  // Stock Management
  const linkStockManager = document.getElementById('link-stock-manager');
  const drawerStockAlertCount = document.getElementById('drawer-stock-alert-count');
  const stockModal = document.getElementById('stock-modal');
  const btnBackStockModal = document.getElementById('btn-back-stock-modal');
  const btnCloseStockModal = document.getElementById('btn-close-stock-modal');
  const stockItemSelect = document.getElementById('stock-item-select');
  const stockNewNameGroup = document.getElementById('stock-new-name-group');
  const stockNewPriceGroup = document.getElementById('stock-new-price-group');
  const stockNewName = document.getElementById('stock-new-name');
  const stockNewPrice = document.getElementById('stock-new-price');
  const stockQtyInput = document.getElementById('stock-qty-input');
  const stockNoteInput = document.getElementById('stock-note-input');
  const btnStockAddSubmit = document.getElementById('btn-stock-add-submit');
  const btnStockRefresh = document.getElementById('btn-stock-refresh');
  const stockSearchInput = document.getElementById('stock-search-input');
  const stockItemsList = document.getElementById('stock-items-list');
  const stockHistoryModal = document.getElementById('stock-history-modal');
  const btnBackStockHistory = document.getElementById('btn-back-stock-history');
  const btnCloseStockHistoryModal = document.getElementById('btn-close-stock-history-modal');
  const btnFooterBackStockHistory = document.getElementById('btn-footer-back-stock-history');
  const btnFooterCloseStockHistory = document.getElementById('btn-footer-close-stock-history');
  const stockHistoryTitle = document.getElementById('stock-history-title');
  const stockHistorySubtitle = document.getElementById('stock-history-subtitle');
  const stockHistoryList = document.getElementById('stock-history-list');
  let stockSearchTerm = '';

  // Application State
  let allPriceItems = [];
  let selectedItemsMap = new Map(); // price_item_id -> { item, quantity }
  let currentTab = 'customers'; // 'new-customer', 'customers'
  let hasPhoneReminderPrompted = false;
  let searchDebounceTimer = null;
  let isSaving = false;
  let renderSequence = 0;
  let itemPickerActiveIndex = -1;

  // Helper: Format Date & Time defaults
  function getTodayDateString() {
    const today = new Date();
    const yyyy = today.getFullYear();
    const mm = String(today.getMonth() + 1).padStart(2, '0');
    const dd = String(today.getDate()).padStart(2, '0');
    return `${yyyy}-${mm}-${dd}`;
  }

  function getCurrentTimeString() {
    const now = new Date();
    const hh = String(now.getHours()).padStart(2, '0');
    const mm = String(now.getMinutes()).padStart(2, '0');
    return `${hh}:${mm}`;
  }

  // Initialization
  async function init() {
    allPriceItems = await window.DataStore.getPriceItems();
    renderPriceItemsInForm();

    fieldDate.value = getTodayDateString();
    fieldTime.value = getCurrentTimeString();

    loadDraft();
    await loadAndRenderCustomers();

    setupNavigation();
    setupFormEvents();
    setupItemPicker();
    setupEnterKeyFlow();
    setupSearch();
    setupDrawer();
    setupModals();
    setupStockManagement();
    setupItemEditModal();
    setupItemOptionsMenu();
    setupCloudSettings();
    setupKeyboardShortcuts();
    updateDrawerCounts();
  }

  // Navigation Logic
  function setTab(tab) {
    currentTab = tab;

    if (navNewCustomer) navNewCustomer.classList.toggle('active', tab === 'new-customer');
    if (navCustomers) navCustomers.classList.toggle('active', tab === 'customers');
    if (navSearch) navSearch.classList.toggle('active', tab === 'search');

    if (tab === 'new-customer') {
      formContainer.style.display = 'block';
      if (searchSection) searchSection.style.display = 'none';
      draftBar.style.display = 'none';
      if (floatingBottomBar) floatingBottomBar.style.display = 'none';
      fieldName.focus();
    } else {
      // 'customers' view
      formContainer.style.display = 'none';
      if (searchSection) searchSection.style.display = 'none';
      if (floatingBottomBar) floatingBottomBar.style.display = 'block';
      checkAndShowDraftBar();
      loadAndRenderCustomers();
    }
  }

  function setupNavigation() {
    if (navNewCustomer) navNewCustomer.addEventListener('click', onNavNewCustomerClick);
    if (navCustomers) navCustomers.addEventListener('click', onNavCustomersClick);
    if (navSearch) navSearch.addEventListener('click', onNavSearchClick);

    if (btnFloatingNewCustomer) {
      btnFloatingNewCustomer.addEventListener('click', onFloatingNewCustomerClick);
    }

    if (btnContinueDraft) btnContinueDraft.addEventListener('click', onContinueDraftClick);
    if (btnDiscardDraft) btnDiscardDraft.addEventListener('click', discardDraft);

    if (btnCloseForm) {
      btnCloseForm.addEventListener('click', onCloseFormClick);
    }

    if (btnClosePrices) {
      btnClosePrices.addEventListener('click', onClosePricesClick);
    }
  }

  // Single-reference navigation handlers
  function onNavNewCustomerClick() { setTab('new-customer'); }
  function onNavCustomersClick() { setTab('customers'); }
  function onNavSearchClick() {
    if (searchInput) {
      searchInput.focus();
      searchInput.select();
    }
    setTab('customers');
  }
  function onFloatingNewCustomerClick() { setTab('new-customer'); }
  function onContinueDraftClick() { setTab('new-customer'); }
  function onCloseFormClick() {
    discardDraft();
    setTab('customers');
  }
  function onClosePricesClick() {
    selectedItemsMap.clear();
    renderPriceItemsInForm();
    updateLiveTotal();
    saveDraft();
  }

  // Keyboard Shortcuts (Space + N for New Customer, Escape to close modals)
  let isSpaceKeyDown = false;

  function setupKeyboardShortcuts() {
    document.addEventListener('keydown', onGlobalKeydown);
    document.addEventListener('keyup', onGlobalKeyup);
  }

  function isTypingInField(target) {
    if (!target) return false;
    const tag = (target.tagName || '').toLowerCase();
    return tag === 'input' || tag === 'textarea' || target.isContentEditable;
  }

  function onGlobalKeydown(e) {
    // Escape closes drawer, picker, or open modals
    if (e.key === 'Escape') {
      if (appDrawer && appDrawer.classList.contains('open')) {
        closeDrawer();
        return;
      }
      if (isItemPickerOpen()) {
        closeItemPicker();
        return;
      }
      if (priceListModal && priceListModal.style.display === 'flex') {
        priceListModal.style.display = 'none';
        return;
      }
      if (itemEditModal && itemEditModal.style.display === 'flex') {
        itemEditModal.style.display = 'none';
        return;
      }
      if (itemHistoryModal && itemHistoryModal.style.display === 'flex') {
        itemHistoryModal.style.display = 'none';
        return;
      }
      if (stockHistoryModal && stockHistoryModal.style.display === 'flex') {
        stockHistoryModal.style.display = 'none';
        return;
      }
      if (stockModal && stockModal.style.display === 'flex') {
        stockModal.style.display = 'none';
        return;
      }
      return;
    }

    // Do not trigger shortcut while user is typing inside an input or textarea
    if (isTypingInField(e.target)) {
      return;
    }

    // Track Space key when outside of input fields
    if (e.code === 'Space' || e.key === ' ') {
      isSpaceKeyDown = true;
    }

    // Space + N (or Alt + N / Ctrl + N) opens New Customer
    const isNKey = e.key === 'n' || e.key === 'N';
    const isSpacePlusN = isNKey && isSpaceKeyDown;
    const isAltPlusN = isNKey && (e.altKey || e.ctrlKey || e.metaKey);

    if (isSpacePlusN || isAltPlusN) {
      e.preventDefault();
      isSpaceKeyDown = false;
      if (currentTab !== 'new-customer') {
        setTab('new-customer');
      }
      return;
    }
  }

  function onGlobalKeyup(e) {
    if (e.code === 'Space' || e.key === ' ') {
      isSpaceKeyDown = false;
    }
  }

  // Render price items inside the New Customer form
  function renderPriceItemsInForm() {
    priceItemsList.innerHTML = '';

    if (!allPriceItems || allPriceItems.length === 0) {
      const emptyNote = document.createElement('div');
      emptyNote.className = 'empty-items-notice';
      emptyNote.textContent = 'No items yet. Add an item below or from the Items menu.';
      priceItemsList.appendChild(emptyNote);
      updateLiveTotal();
      return;
    }

    const fragment = document.createDocumentFragment();

    allPriceItems.forEach(item => {
      const isChecked = selectedItemsMap.has(item.id);
      const selectedData = selectedItemsMap.get(item.id);
      const qty = selectedData ? selectedData.quantity : 1;
      const currentPrice = selectedData ? selectedData.item.price : item.price;
      const maxUnits = getMaxUnits(item);
      const canIncrease = qty < maxUnits;
      const packagingText = getItemPackagingText(item);
      const stockText = getItemStockText(item);
      const unitLabel = getSalesUnitLabel(item);

      if (selectedData) {
        selectedData.item = { ...item, price: selectedData.item.price };
      }

      const row = document.createElement('div');
      row.className = `price-item-row ${isChecked ? 'selected' : ''}`;
      row.dataset.id = item.id;

      row.innerHTML = `
        <div class="price-item-left">
          <input type="checkbox" class="price-item-checkbox" ${isChecked ? 'checked' : ''} aria-label="${escapeHtml(item.name)}">
          <div class="price-item-text">
            <span class="price-item-name">${escapeHtml(item.name)}</span>
            <span class="price-item-meta">${escapeHtml(packagingText)}</span>
            ${stockText ? `<span class="price-item-stock">${escapeHtml(stockText)}</span>` : ''}
          </div>
        </div>
        <div class="price-item-right">
          ${isChecked ? `
            <div class="qty-control" title="${escapeHtml(getQuantityLabel(item, qty))}">
              <button type="button" class="qty-btn btn-qty-minus" title="Decrease">−</button>
              <span class="qty-val">${qty}</span>
              <span class="qty-unit">${escapeHtml(unitLabel)}</span>
              <button type="button" class="qty-btn btn-qty-plus" title="Increase" ${canIncrease ? '' : 'disabled'}>+</button>
            </div>
          ` : ''}
          <div class="item-price-edit-box" title="Auto-filled from catalog. Tap to customize price for this customer.">
            <span class="currency-symbol">₹</span>
            <input type="number" class="item-price-input" value="${currentPrice}" min="0" step="any" aria-label="Price per ${escapeHtml(unitLabel)} for ${escapeHtml(item.name)}">
            <span class="price-unit-suffix">/${escapeHtml(unitLabel)}</span>
          </div>
          <button type="button" class="btn-item-options" title="More options" aria-haspopup="menu" aria-label="Options for ${escapeHtml(item.name)}">
            <svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true"><circle cx="12" cy="5" r="2.2"></circle><circle cx="12" cy="12" r="2.2"></circle><circle cx="12" cy="19" r="2.2"></circle></svg>
          </button>
        </div>
      `;

      fragment.appendChild(row);
    });

    priceItemsList.appendChild(fragment);
    updateLiveTotal();
  }

  // Container-level single-reference event handlers for priceItemsList
  function onPriceItemsListClick(e) {
    const row = e.target.closest('.price-item-row');
    if (!row) return;

    const itemId = row.dataset.id;
    const item = allPriceItems.find(it => it.id === itemId);
    if (!item) return;

    // 1. Minus quantity button
    const btnMinus = e.target.closest('.btn-qty-minus');
    if (btnMinus) {
      e.stopPropagation();
      changeItemQuantity(item.id, -1);
      return;
    }

    // 2. Plus quantity button
    const btnPlus = e.target.closest('.btn-qty-plus');
    if (btnPlus) {
      e.stopPropagation();
      changeItemQuantity(item.id, 1);
      return;
    }

    // 3. Three-dot options menu button
    const btnOptions = e.target.closest('.btn-item-options');
    if (btnOptions) {
      e.stopPropagation();
      openItemOptionsMenu(btnOptions, item, {
        onCustomPrice: () => {
          const priceInput = row.querySelector('.item-price-input');
          if (priceInput) {
            priceInput.focus();
            priceInput.select();
          }
        }
      });
      return;
    }

    // 4. Clicks inside the price edit input
    if (e.target.closest('.item-price-edit-box') || e.target.closest('.item-price-input')) {
      return;
    }

    // 5. Default row click: toggle selection
    toggleItemSelection(item);
  }

  function onPriceItemsListInput(e) {
    const priceInput = e.target.closest('.item-price-input');
    if (!priceInput) return;

    const row = priceInput.closest('.price-item-row');
    if (!row) return;

    const itemId = row.dataset.id;
    const newPrice = parseFloat(priceInput.value);

    if (!isNaN(newPrice) && newPrice >= 0 && selectedItemsMap.has(itemId)) {
      selectedItemsMap.get(itemId).item.price = newPrice;
    }
    updateLiveTotal();
  }

  async function onPriceItemsListChange(e) {
    const priceInput = e.target.closest('.item-price-input');
    if (!priceInput) return;

    const row = priceInput.closest('.price-item-row');
    if (!row) return;

    const itemId = row.dataset.id;
    const item = allPriceItems.find(it => it.id === itemId);
    if (!item) return;

    const newPrice = parseFloat(priceInput.value);

    // Invalid value: restore last valid price
    if (isNaN(newPrice) || newPrice < 0) {
      priceInput.value = selectedItemsMap.has(itemId)
        ? selectedItemsMap.get(itemId).item.price
        : item.price;
      updateLiveTotal();
      return;
    }

    // Unchanged catalog price: nothing to persist
    if (Math.abs(newPrice - parseFloat(item.price)) < 0.001) {
      if (selectedItemsMap.has(itemId)) {
        selectedItemsMap.get(itemId).item.price = newPrice;
      }
      updateLiveTotal();
      return;
    }

    await window.DataStore.updatePriceItem(itemId, { price: newPrice });
    allPriceItems = await window.DataStore.getPriceItems();
    item.price = newPrice;
    if (selectedItemsMap.has(itemId)) {
      selectedItemsMap.get(itemId).item.price = newPrice;
    }
    updateLiveTotal();
    saveDraft();
  }

  function onPriceItemsListKeydown(e) {
    if (e.key === 'Enter') {
      const priceInput = e.target.closest('.item-price-input');
      if (priceInput) {
        e.preventDefault();
        priceInput.blur(); // Triggers change handler
      }
    }
  }

  // Price Override Rule: Updates price for transaction and catalog
  async function applyPriceOverride(itemId, newPrice) {
    const updated = await window.DataStore.updatePriceItem(itemId, { price: newPrice });
    if (!updated) return;

    allPriceItems = await window.DataStore.getPriceItems();

    if (selectedItemsMap.has(itemId)) {
      const entry = selectedItemsMap.get(itemId);
      entry.item.price = newPrice;
    }

    updateLiveTotal();
    saveDraft();
    renderPriceItemsInForm();

    if (priceListModal && priceListModal.style.display === 'flex') {
      renderPriceListModalItems();
    }
  }

  // Item Edit Modal Setup
  function setupItemEditModal() {
    btnCloseItemEditModal.addEventListener('click', onItemEditCloseClick);
    if (btnBackItemEdit) btnBackItemEdit.addEventListener('click', onItemEditCloseClick);
    btnCancelItemEdit.addEventListener('click', onItemEditCloseClick);
    btnSaveItemEdit.addEventListener('click', onItemEditSaveClick);

    editItemName.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') {
        e.preventDefault();
        editItemPrice.focus();
      }
    });

    editItemPrice.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') {
        e.preventDefault();
        if (editItemStock) editItemStock.focus();
        else btnSaveItemEdit.click();
      }
    });

    if (editItemStock) {
      editItemStock.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') {
          e.preventDefault();
          btnSaveItemEdit.click();
        }
      });
    }
  }

  function onItemEditCloseClick() {
    itemEditModal.style.display = 'none';
    if (modalReturnDestination === 'items-modal' && priceListModal) {
      priceListModal.style.display = 'flex';
    }
  }

  async function onItemEditSaveClick() {
    const id = editItemId.value;
    const name = editItemName.value.trim();
    const price = parseFloat(editItemPrice.value);
    const stockVal = editItemStock ? parseInt(editItemStock.value, 10) : null;

    if (!name || isNaN(price) || price < 0) {
      editItemName.focus();
      return;
    }

    btnSaveItemEdit.disabled = true;
    try {
      const patch = { name, price };
      if (!isNaN(stockVal) && stockVal >= 0) {
        patch.stock_pieces = stockVal;
      }

      const updated = await window.DataStore.updatePriceItem(id, patch);

      if (updated) {
        allPriceItems = await window.DataStore.getPriceItems();

        if (selectedItemsMap.has(id)) {
          const entry = selectedItemsMap.get(id);
          entry.item = { ...updated, price: entry.item.price };
        }

        updateLiveTotal();
        saveDraft();
        renderPriceItemsInForm();

        if (priceListModal && priceListModal.style.display === 'flex') {
          renderPriceListModalItems();
        }

        itemEditModal.style.display = 'none';
        if (modalReturnDestination === 'items-modal' && priceListModal) {
          priceListModal.style.display = 'flex';
        }
      }
    } finally {
      btnSaveItemEdit.disabled = false;
    }
  }

  function openItemEditModal(item) {
    modalReturnDestination = (priceListModal && priceListModal.style.display === 'flex')
      ? 'items-modal'
      : null;

    editItemId.value = item.id;
    editItemName.value = item.name;
    editItemPrice.value = item.price;
    itemEditModalTitle.textContent = `Edit Item: ${item.name}`;

    if (editItemStock) {
      editItemStock.value = item.stock_pieces !== undefined && item.stock_pieces !== null ? item.stock_pieces : 0;
    }

    if (editItemPackagingHint) {
      editItemPackagingHint.textContent = getItemPackagingText(item);
    }

    itemEditModal.style.display = 'flex';
    editItemPrice.focus();
    editItemPrice.select();
  }

  // Formatting & Unit Utilities
  function escapeHtml(value) {
    if (value === null || value === undefined) return '';
    return String(value)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
  }

  function formatCurrency(amount) {
    const n = Number(amount);
    if (isNaN(n)) return '₹0';
    return `₹${n.toLocaleString('en-IN', { maximumFractionDigits: 2 })}`;
  }

  function getSalesUnitLabel(item) {
    if (!item) return 'piece';
    const u = (item.sales_unit || 'piece').toLowerCase();
    if (u === 'sheet') return 'sheet';
    if (u === 'unit') return 'unit';
    return 'piece';
  }

  function getPriceUnitLabel(item) {
    const u = getSalesUnitLabel(item);
    return `/${u}`;
  }

  function getQuantityLabel(item, qty) {
    const u = getSalesUnitLabel(item);
    const count = Number(qty) || 1;
    if (u === 'sheet') {
      const perSheet = Number(item.pieces_per_unit) || 1;
      const totalPieces = count * perSheet;
      return `${count} sheet${count === 1 ? '' : 's'} (${totalPieces} piece${totalPieces === 1 ? '' : 's'})`;
    }
    return `${count} ${u}${count === 1 ? '' : 's'}`;
  }

  function getItemPackagingText(item) {
    if (!item) return '';
    if (item.unit_description && item.unit_description.trim()) {
      return item.unit_description.trim();
    }
    const u = getSalesUnitLabel(item);
    if (u === 'sheet') {
      const ppu = Number(item.pieces_per_unit) || 1;
      return `1 sheet = ${ppu} pieces`;
    }
    return 'Standard unit';
  }

  function getMaxUnits(item) {
    if (!item) return 999;
    const stock = Number(item.stock_pieces);
    if (isNaN(stock) || stock <= 0) return 999;
    const u = getSalesUnitLabel(item);
    if (u === 'sheet') {
      const ppu = Number(item.pieces_per_unit) || 1;
      return Math.max(1, Math.floor(stock / ppu));
    }
    return stock;
  }

  function getItemStockText(item) {
    if (!item) return '';
    const stock = Number(item.stock_pieces);
    if (isNaN(stock) || stock <= 0) return '';
    const u = getSalesUnitLabel(item);
    if (u === 'sheet') {
      const ppu = Number(item.pieces_per_unit) || 1;
      const sheets = Math.floor(stock / ppu);
      return `Stock: ${sheets} sheet${sheets === 1 ? '' : 's'} (${stock} pcs)`;
    }
    return `Stock: ${stock} pcs`;
  }

  function getBillQuantitySuffix(billItem) {
    if (!billItem) return '';
    const q = Number(billItem.quantity) || 1;
    if (q <= 1) return '';
    const ref = allPriceItems.find(it => it.id === billItem.price_item_id);
    const unitLabel = ref ? getSalesUnitLabel(ref) : 'unit';
    return ` (${q} ${unitLabel}${q === 1 ? '' : 's'})`;
  }

  function sortItemsByName(items) {
    return (items || []).slice().sort((a, b) => {
      return (a.name || '').localeCompare(b.name || '', undefined, {
        numeric: true,
        sensitivity: 'base'
      });
    });
  }

  // Searchable Item Picker (Within Create Customer form)
  function getPickerMatches(query) {
    const sorted = sortItemsByName(allPriceItems);
    if (!query) return sorted;
    const q = query.trim().toLowerCase();
    if (!q) return sorted;
    return sorted.filter(it => {
      const name = (it.name || '').toLowerCase();
      const price = String(it.price || '');
      const packaging = getItemPackagingText(it).toLowerCase();
      return name.includes(q) || price.includes(q) || packaging.includes(q);
    });
  }

  function isItemPickerOpen() {
    return itemPickerList && !itemPickerList.hidden;
  }

  function closeItemPicker() {
    if (!itemPickerList) return;
    itemPickerList.hidden = true;
    itemPickerActiveIndex = -1;
    if (itemPickerInput) itemPickerInput.setAttribute('aria-expanded', 'false');
    if (btnItemPicker) btnItemPicker.setAttribute('aria-expanded', 'false');
  }

  function setActivePickerIndex(index) {
    if (!itemPickerList) return;
    const options = itemPickerList.querySelectorAll('.item-picker-option');
    options.forEach(opt => opt.classList.remove('active'));
    if (index >= 0 && index < options.length) {
      itemPickerActiveIndex = index;
      const target = options[index];
      target.classList.add('active');
      target.scrollIntoView({ block: 'nearest' });
    } else {
      itemPickerActiveIndex = -1;
    }
  }

  function renderItemPickerResults() {
    if (!itemPickerList || !itemPickerInput) return;
    const matches = getPickerMatches(itemPickerInput.value);
    itemPickerList.innerHTML = '';
    itemPickerActiveIndex = -1;

    if (matches.length === 0) {
      const emptyDiv = document.createElement('div');
      emptyDiv.className = 'item-picker-empty';
      emptyDiv.textContent = 'No matching items. Type below to add a new item.';
      itemPickerList.appendChild(emptyDiv);
      itemPickerList.hidden = false;
      itemPickerInput.setAttribute('aria-expanded', 'true');
      return;
    }

    const fragment = document.createDocumentFragment();

    matches.forEach((it, idx) => {
      const isSelected = selectedItemsMap.has(it.id);
      const unitLabel = getSalesUnitLabel(it);
      const packaging = getItemPackagingText(it);
      const stock = getItemStockText(it);
      const maxUnits = getMaxUnits(it);
      const isOutOfStock = Number(it.stock_pieces) > 0 && maxUnits <= 0;

      const opt = document.createElement('button');
      opt.type = 'button';
      opt.className = `item-picker-option ${isSelected ? 'selected' : ''} ${isOutOfStock ? 'out-of-stock' : ''}`;
      opt.dataset.index = idx;
      opt.dataset.id = it.id;
      opt.setAttribute('role', 'option');
      opt.setAttribute('aria-selected', isSelected ? 'true' : 'false');

      opt.innerHTML = `
        <div class="picker-option-main">
          <span class="picker-option-name">${escapeHtml(it.name)}</span>
          <span class="picker-option-meta">${escapeHtml(packaging)}${stock ? ` • ${escapeHtml(stock)}` : ''}</span>
          ${isSelected ? `<span class="picker-added">✓ Selected</span>` : ''}
        </div>
        <div class="picker-option-price">
          ${formatCurrency(it.price)}<small>/${escapeHtml(unitLabel)}</small>
        </div>
      `;

      fragment.appendChild(opt);
    });

    itemPickerList.appendChild(fragment);
    itemPickerList.hidden = false;
    itemPickerInput.setAttribute('aria-expanded', 'true');
    if (btnItemPicker) btnItemPicker.setAttribute('aria-expanded', 'true');
  }

  function openItemPicker() {
    if (!itemPickerList) return;
    renderItemPickerResults();
  }

  function choosePickerItem(item) {
    if (!item) return;

    if (!selectedItemsMap.has(item.id)) {
      selectedItemsMap.set(item.id, {
        item: { ...item },
        quantity: 1
      });
    }

    renderPriceItemsInForm();
    saveDraft();
    closeItemPicker();
    if (itemPickerInput) {
      itemPickerInput.value = '';
    }

    const row = priceItemsList.querySelector(`.price-item-row[data-id="${item.id}"]`);
    if (row) {
      row.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
      row.classList.add('just-picked');
      setTimeout(() => row.classList.remove('just-picked'), 1200);
      const priceInput = row.querySelector('.item-price-input');
      if (priceInput) {
        priceInput.focus();
        priceInput.select();
      }
    }
  }

  function setupItemPicker() {
    if (!itemPickerInput || !itemPickerList) return;

    itemPickerInput.addEventListener('input', () => {
      renderItemPickerResults();
    });

    itemPickerInput.addEventListener('focus', () => {
      openItemPicker();
    });

    itemPickerInput.addEventListener('keydown', (e) => {
      if (!isItemPickerOpen()) {
        if (e.key === 'ArrowDown' || e.key === 'Enter') {
          openItemPicker();
          e.preventDefault();
        }
        return;
      }

      const options = itemPickerList.querySelectorAll('.item-picker-option');
      if (e.key === 'ArrowDown') {
        e.preventDefault();
        const next = itemPickerActiveIndex + 1;
        setActivePickerIndex(next >= options.length ? 0 : next);
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        const prev = itemPickerActiveIndex - 1;
        setActivePickerIndex(prev < 0 ? options.length - 1 : prev);
      } else if (e.key === 'Enter') {
        e.preventDefault();
        if (itemPickerActiveIndex >= 0 && options[itemPickerActiveIndex]) {
          options[itemPickerActiveIndex].click();
        } else if (options.length === 1) {
          options[0].click();
        }
      }
    });

    if (btnItemPicker) {
      btnItemPicker.addEventListener('click', (e) => {
        e.preventDefault();
        if (isItemPickerOpen()) {
          closeItemPicker();
        } else {
          itemPickerInput.focus();
          openItemPicker();
        }
      });
    }

    // Single delegated listener on itemPickerList
    itemPickerList.addEventListener('click', (e) => {
      const opt = e.target.closest('.item-picker-option');
      if (!opt) return;
      const itemId = opt.dataset.id;
      const item = allPriceItems.find(it => it.id === itemId);
      if (item) {
        choosePickerItem(item);
      }
    });

    document.addEventListener('click', (e) => {
      if (!isItemPickerOpen()) return;
      if (e.target.closest('#item-picker')) return;
      closeItemPicker();
    });
  }

  // Three-dot Options Menu for individual Items
  function formatHistoryDate(value, includeTime = false) {
    if (!value) return '';
    try {
      const d = new Date(value);
      if (isNaN(d.getTime())) return String(value);
      const day = String(d.getDate()).padStart(2, '0');
      const mon = d.toLocaleString('default', { month: 'short' });
      const year = d.getFullYear();
      if (!includeTime) {
        return `${day} ${mon} ${year}`;
      }
      const hh = String(d.getHours()).padStart(2, '0');
      const mm = String(d.getMinutes()).padStart(2, '0');
      return `${day} ${mon} ${year}, ${hh}:${mm}`;
    } catch {
      return String(value);
    }
  }

  function closeItemOptionsMenu() {
    if (!itemOptionsMenu) return;
    itemOptionsMenu.style.display = 'none';
    activeOptionsMenuTarget = null;
    activeOptionsMenuItem = null;
    activeOptionsMenuCallbacks = null;
  }

  function openItemOptionsMenu(anchor, item, options = {}) {
    if (!itemOptionsMenu || !anchor || !item) return;

    activeOptionsMenuTarget = anchor;
    activeOptionsMenuItem = item;
    activeOptionsMenuCallbacks = options;

    const unitLabel = getSalesUnitLabel(item);

    itemOptionsMenu.innerHTML = `
      <div class="menu-item-header">
        <span class="menu-item-title">${escapeHtml(item.name)}</span>
        <span class="menu-item-sub">Current: ${formatCurrency(item.price)}/${escapeHtml(unitLabel)}</span>
      </div>
      <button type="button" class="menu-action" data-action="custom-price">
        <span class="menu-action-icon">
          <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path></svg>
        </span>
        <span>Customize Price</span>
      </button>
      <button type="button" class="menu-action" data-action="edit">
        <span class="menu-action-icon">
          <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="3"></circle><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"></path></svg>
        </span>
        <span>Edit Item Details</span>
      </button>
      <button type="button" class="menu-action" data-action="history">
        <span class="menu-action-icon">
          <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 16 14"></polyline></svg>
        </span>
        <span>Price History</span>
      </button>
      <div class="menu-divider"></div>
      <button type="button" class="menu-action menu-action-danger" data-action="delete">
        <span class="menu-action-icon">
          <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg>
        </span>
        <span>Delete Item</span>
      </button>
    `;

    itemOptionsMenu.style.display = 'block';
    itemOptionsMenu.style.visibility = 'hidden';

    const rect = anchor.getBoundingClientRect();
    const menuRect = itemOptionsMenu.getBoundingClientRect();

    let top = rect.bottom + 6;
    let left = rect.right - menuRect.width;

    if (left < 10) left = 10;
    if (top + menuRect.height > window.innerHeight - 10) {
      top = rect.top - menuRect.height - 6;
    }

    itemOptionsMenu.style.top = `${Math.max(10, top + window.scrollY)}px`;
    itemOptionsMenu.style.left = `${Math.max(10, left + window.scrollX)}px`;
    itemOptionsMenu.style.visibility = 'visible';
  }

  function setupItemOptionsMenu() {
    if (!itemOptionsMenu) return;

    itemOptionsMenu.addEventListener('click', (e) => {
      const btn = e.target.closest('.menu-action');
      if (!btn) return;
      const action = btn.dataset.action;
      const item = activeOptionsMenuItem;
      const callbacks = activeOptionsMenuCallbacks || {};
      closeItemOptionsMenu();
      if (!item) return;

      if (action === 'custom-price') {
        if (typeof callbacks.onCustomPrice === 'function') {
          callbacks.onCustomPrice();
        }
      } else if (action === 'edit') {
        openItemEditModal(item);
      } else if (action === 'history') {
        openItemHistoryModal(item);
      } else if (action === 'delete') {
        deletePriceItem(item);
      }
    });

    document.addEventListener('click', (e) => {
      if (itemOptionsMenu && itemOptionsMenu.style.display !== 'none') {
        if (!e.target.closest('#item-options-menu') && !e.target.closest('.btn-item-options')) {
          closeItemOptionsMenu();
        }
      }
    });

    window.addEventListener('resize', closeItemOptionsMenu);
    window.addEventListener('scroll', closeItemOptionsMenu, true);
  }

  async function deletePriceItem(item) {
    if (!item) return;
    if (!confirm(`Delete "${item.name}" from catalog?`)) return;

    selectedItemsMap.delete(item.id);
    await window.DataStore.deletePriceItem(item.id);
    allPriceItems = await window.DataStore.getPriceItems();

    renderPriceItemsInForm();

    if (priceListModal && priceListModal.style.display === 'flex') {
      renderPriceListModalItems();
    }

    updateDrawerCounts();
    saveDraft();
    updateLiveTotal();
  }

  async function openItemHistoryModal(item) {
    if (!itemHistoryModal || !item) return;

    modalReturnDestination = (priceListModal && priceListModal.style.display === 'flex')
      ? 'items-modal'
      : null;

    if (historyModalTitle) {
      historyModalTitle.textContent = `Price History: ${item.name}`;
    }

    if (historyList) {
      historyList.innerHTML = '<div class="empty-items-notice">Loading history...</div>';
    }

    itemHistoryModal.style.display = 'flex';

    try {
      const history = await window.DataStore.getItemPriceHistory(item.id);
      renderItemHistoryModal(history);
    } catch {
      if (historyList) {
        historyList.innerHTML = '<div class="empty-items-notice">Could not load history.</div>';
      }
    }
  }

  function renderItemHistoryModal(history) {
    if (!historyList) return;
    historyList.innerHTML = '';

    if (!history || history.length === 0) {
      const note = document.createElement('div');
      note.className = 'empty-items-notice';
      note.textContent = 'No price changes recorded yet. Changes made during customer billing will appear here.';
      historyList.appendChild(note);
      return;
    }

    history.forEach(entry => {
      const card = document.createElement('div');
      card.className = 'history-entry-card';

      const dt = formatHistoryDate(entry.recorded_at, true);
      const isOverride = entry.change_source === 'bill_override';
      const custPart = entry.customer_name ? ` (for ${entry.customer_name})` : '';

      card.innerHTML = `
        <div class="history-entry-top">
          <span class="history-price">${formatCurrency(entry.price)}</span>
          <span class="history-badge ${isOverride ? 'badge-override' : 'badge-catalog'}">
            ${isOverride ? 'Bill Price' : 'Catalog'}
          </span>
        </div>
        <div class="history-meta">
          <span class="history-meta-item">
            <svg viewBox="0 0 24 24" width="12" height="12" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="3" y="4" width="18" height="18" rx="2"></rect><line x1="16" y1="2" x2="16" y2="6"></line><line x1="8" y1="2" x2="8" y2="6"></line><line x1="3" y1="10" x2="21" y2="10"></line></svg>
            ${escapeHtml(dt)}
          </span>
          ${custPart ? `
            <span class="history-meta-item">
              <svg viewBox="0 0 24 24" width="12" height="12" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg>
              ${escapeHtml(custPart)}
            </span>
          ` : ''}
        </div>
        ${entry.notes ? `<div class="history-notes">${escapeHtml(entry.notes)}</div>` : ''}
      `;

      historyList.appendChild(card);
    });
  }

  // Item Selection, Quantity & Pricing Calculations
  function toggleItemSelection(item) {
    if (selectedItemsMap.has(item.id)) {
      selectedItemsMap.delete(item.id);
    } else {
      selectedItemsMap.set(item.id, {
        item: { ...item },
        quantity: 1
      });
    }

    renderPriceItemsInForm();
    updateLiveTotal();
    saveDraft();
  }

  function changeItemQuantity(itemId, delta) {
    if (!selectedItemsMap.has(itemId)) return;

    const entry = selectedItemsMap.get(itemId);
    const item = allPriceItems.find(it => it.id === itemId) || entry.item;
    const maxUnits = getMaxUnits(item);

    const newQty = entry.quantity + delta;

    if (newQty <= 0) {
      selectedItemsMap.delete(itemId);
    } else if (newQty > maxUnits) {
      return;
    } else {
      entry.quantity = newQty;
    }

    renderPriceItemsInForm();
    updateLiveTotal();
    saveDraft();
  }

  function updateLiveTotal() {
    let total = 0;
    selectedItemsMap.forEach(({ item, quantity }) => {
      const price = parseFloat(item.price);
      const qty = parseInt(quantity, 10) || 1;
      if (!isNaN(price) && price >= 0) {
        total += price * qty;
      }
    });

    liveTotalEl.textContent = `₹${total.toFixed(2).replace(/\.00$/, '')}`;
  }

  async function handleAddCustomItem() {
    const name = customItemName.value.trim();
    const priceVal = customItemPrice.value.trim();

    if (!name) {
      customItemName.focus();
      return;
    }

    const price = priceVal === '' ? 0 : parseFloat(priceVal);
    if (isNaN(price) || price < 0) {
      customItemPrice.focus();
      return;
    }

    btnAddCustomItem.disabled = true;
    try {
      const newItem = await window.DataStore.addPriceItem(name, price);

      if (newItem) {
        allPriceItems = await window.DataStore.getPriceItems();

        selectedItemsMap.set(newItem.id, {
          item: { ...newItem },
          quantity: 1
        });

        customItemName.value = '';
        customItemPrice.value = '';

        renderPriceItemsInForm();
        updateDrawerCounts();
        saveDraft();

        customItemName.focus();
      }
    } finally {
      btnAddCustomItem.disabled = false;
    }
  }

  // Enter Key Navigation Flow across Form Inputs
  function setupEnterKeyFlow() {
    fieldName.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') {
        e.preventDefault();
        fieldPhone.focus();
      }
    });

    fieldPhone.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') {
        e.preventDefault();
        fieldAddress.focus();
      }
    });

    fieldAddress.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') {
        e.preventDefault();
        fieldProblem.focus();
      }
    });

    customItemName.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') {
        e.preventDefault();
        customItemPrice.focus();
      }
    });

    customItemPrice.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') {
        e.preventDefault();
        handleAddCustomItem();
      }
    });
  }

  // Draft Preservation Logic
  function getDraftData() {
    const selected = [];
    selectedItemsMap.forEach(({ item, quantity }, price_item_id) => {
      selected.push({
        price_item_id,
        name: item.name,
        price: item.price,
        quantity: quantity || 1
      });
    });

    return {
      date: fieldDate.value,
      time: fieldTime.value,
      name: fieldName.value,
      phone: fieldPhone.value,
      address: fieldAddress.value,
      problem: fieldProblem.value,
      selectedItems: selected
    };
  }

  function hasActiveDraftContent() {
    return Boolean(
      (fieldName && fieldName.value.trim()) ||
      (fieldPhone && fieldPhone.value.trim()) ||
      (fieldAddress && fieldAddress.value.trim()) ||
      (fieldProblem && fieldProblem.value.trim()) ||
      (selectedItemsMap && selectedItemsMap.size > 0)
    );
  }

  function saveDraft() {
    if (!hasActiveDraftContent()) {
      window.localStorage.removeItem('portal_form_draft');
      return;
    }
    const draft = getDraftData();
    window.localStorage.setItem('portal_form_draft', JSON.stringify(draft));
  }

  function loadDraft() {
    const raw = window.localStorage.getItem('portal_form_draft');
    if (!raw) return;

    try {
      const draft = JSON.parse(raw);
      if (draft.date) fieldDate.value = draft.date;
      if (draft.time) fieldTime.value = draft.time;
      if (draft.name) fieldName.value = draft.name;
      if (draft.phone) fieldPhone.value = draft.phone;
      if (draft.address) fieldAddress.value = draft.address;
      if (draft.problem) fieldProblem.value = draft.problem;

      if (Array.isArray(draft.selectedItems)) {
        selectedItemsMap.clear();
        draft.selectedItems.forEach(si => {
          const matched = allPriceItems.find(p => p.id === si.price_item_id);
          const itemData = matched
            ? { ...matched, price: si.price !== undefined ? si.price : matched.price }
            : { id: si.price_item_id, name: si.name, price: si.price };

          selectedItemsMap.set(si.price_item_id, {
            item: itemData,
            quantity: si.quantity || 1
          });
        });
        renderPriceItemsInForm();
      }

      checkAndShowDraftBar();
    } catch {
      window.localStorage.removeItem('portal_form_draft');
    }
  }

  function checkAndShowDraftBar() {
    const raw = window.localStorage.getItem('portal_form_draft');
    if (raw && currentTab === 'customers') {
      draftBar.style.display = 'flex';
      const name = fieldName.value.trim();
      draftText.textContent = name ? `Draft saved for ${name}` : 'Draft saved';
    } else {
      draftBar.style.display = 'none';
    }
  }

  function discardDraft() {
    window.localStorage.removeItem('portal_form_draft');
    fieldName.value = '';
    fieldPhone.value = '';
    fieldAddress.value = '';
    fieldProblem.value = '';
    fieldDate.value = getTodayDateString();
    fieldTime.value = getCurrentTimeString();
    selectedItemsMap.clear();
    hasPhoneReminderPrompted = false;
    renderPriceItemsInForm();
    draftBar.style.display = 'none';
    formContainer.style.display = 'none';
  }

  // Customer Form Submission & Data Saving
  function setupFormEvents() {
    [fieldDate, fieldTime, fieldName, fieldPhone, fieldAddress, fieldProblem].forEach(el => {
      el.addEventListener('input', () => {
        saveDraft();
        checkAndShowDraftBar();
      });
    });

    btnAddCustomItem.addEventListener('click', handleAddCustomItem);

    const customerForm = document.getElementById('customer-form');
    if (customerForm) {
      customerForm.addEventListener('submit', (e) => {
        e.preventDefault();
        e.stopPropagation();
        attemptSaveCustomer();
      });
    }

    btnSave.addEventListener('click', (e) => {
      e.preventDefault();
      e.stopPropagation();
      attemptSaveCustomer();
    });

    btnReminderAddNumber.addEventListener('click', (e) => {
      e.preventDefault();
      e.stopPropagation();
      phoneReminderModal.style.display = 'none';
      hasPhoneReminderPrompted = false;
      setTab('new-customer');
      fieldPhone.focus();
    });

    btnReminderSaveAnyway.addEventListener('click', (e) => {
      e.preventDefault();
      e.stopPropagation();
      phoneReminderModal.style.display = 'none';
      executeSaveCustomer();
    });

    // Delegate customer grid actions (Call / WhatsApp)
    customersGrid.addEventListener('click', onCustomersGridClick);

    // Delegate price items container actions
    priceItemsList.addEventListener('click', onPriceItemsListClick);
    priceItemsList.addEventListener('input', onPriceItemsListInput);
    priceItemsList.addEventListener('change', onPriceItemsListChange);
    priceItemsList.addEventListener('keydown', onPriceItemsListKeydown);
  }

  function attemptSaveCustomer() {
    if (isSaving) return;

    if (phoneReminderModal && phoneReminderModal.style.display === 'flex') {
      return;
    }

    const name = fieldName.value.trim();
    if (!name) {
      fieldName.focus();
      return;
    }

    const phone = fieldPhone.value.trim();
    if (!phone && !hasPhoneReminderPrompted) {
      hasPhoneReminderPrompted = true;
      phoneReminderModal.style.display = 'flex';
      return;
    }

    executeSaveCustomer();
  }

  async function executeSaveCustomer() {
    if (isSaving) return;
    isSaving = true;

    btnSave.disabled = true;
    btnSave.textContent = 'Saving...';

    try {
      const customerData = {
        customer_date: fieldDate.value || getTodayDateString(),
        case_time: fieldTime.value || getCurrentTimeString(),
        name: fieldName.value.trim(),
        phone: fieldPhone.value.trim(),
        address: fieldAddress.value.trim(),
        problem: fieldProblem.value.trim()
      };

      const billItems = [];
      let total = 0;

      selectedItemsMap.forEach(({ item, quantity }, price_item_id) => {
        const unitPrice = parseFloat(item.price) || 0;
        const qty = parseInt(quantity, 10) || 1;
        const lineTotal = unitPrice * qty;
        total += lineTotal;

        billItems.push({
          price_item_id,
          item_name: item.name,
          quantity: qty,
          unit_price: unitPrice,
          line_total: lineTotal
        });
      });

      customerData.total = total;

      const saved = await window.DataStore.createCustomer(customerData, billItems);

      if (saved) {
        window.localStorage.removeItem('portal_form_draft');
        fieldName.value = '';
        fieldPhone.value = '';
        fieldAddress.value = '';
        fieldProblem.value = '';
        fieldDate.value = getTodayDateString();
        fieldTime.value = getCurrentTimeString();
        selectedItemsMap.clear();
        hasPhoneReminderPrompted = false;

        renderPriceItemsInForm();
        setTab('customers');
        await loadAndRenderCustomers();
      }
    } catch (err) {
      console.error('Failed to save customer:', err);
      alert('Could not save customer. Please try again.');
    } finally {
      isSaving = false;
      btnSave.disabled = false;
      btnSave.textContent = 'Save Customer';
    }
  }

  // Load and Render Customer Cards
  async function loadAndRenderCustomers(filterQuery = null) {
    const currentSeq = ++renderSequence;

    try {
      const customers = filterQuery
        ? await window.DataStore.searchCustomers(filterQuery)
        : await window.DataStore.getCustomers();

      if (currentSeq !== renderSequence) return;

      customersGrid.innerHTML = '';

      if (!customers || customers.length === 0) {
        emptyState.style.display = 'block';
        emptyState.textContent = filterQuery ? 'No customers match your search.' : 'No customers found';
        if (drawerTotalCustomers) drawerTotalCustomers.textContent = '0';
        return;
      }

      emptyState.style.display = 'none';

      const customerIds = customers.map(c => c.id);
      const itemsMap = await window.DataStore.getCustomerItemsForCustomers(customerIds);

      if (currentSeq !== renderSequence) return;

      customersGrid.innerHTML = '';
      const fragment = document.createDocumentFragment();

      customers.forEach(cust => {
        const items = (cust.customer_items && cust.customer_items.length > 0)
          ? cust.customer_items
          : (itemsMap[cust.id] || []);

        const card = createCustomerCardElement(cust, items);
        fragment.appendChild(card);
      });

      customersGrid.appendChild(fragment);

      if (drawerTotalCustomers) {
        drawerTotalCustomers.textContent = customers.length;
      }
    } catch (err) {
      console.error('Failed to load customers:', err);
    }
  }

  function generateWhatsAppBillText(customer, items) {
    let msg = `*LEGAL CONSULTATION & BILL RECEIPT*\n`;
    msg += `---------------------------------\n`;
    msg += `*Client:* ${customer.name}\n`;
    if (customer.customer_date) msg += `*Date:* ${customer.customer_date}\n`;
    if (customer.case_time) msg += `*Time:* ${customer.case_time}\n`;
    if (customer.address) msg += `*Address:* ${customer.address}\n`;
    if (customer.problem) msg += `*Details:* ${customer.problem}\n`;
    msg += `---------------------------------\n`;

    if (items && items.length > 0) {
      msg += `*SERVICES / PARTICULARS:*\n`;
      items.forEach((it, idx) => {
        const qtyStr = getBillQuantitySuffix(it);
        const lineTot = it.line_total || (parseFloat(it.unit_price) * (it.quantity || 1));
        msg += `${idx + 1}. ${it.item_name}${qtyStr} - ₹${lineTot}\n`;
      });
      msg += `---------------------------------\n`;
    }

    msg += `*TOTAL AMOUNT: ₹${customer.total}*\n`;
    msg += `---------------------------------\n`;
    msg += `Thank you for choosing our legal services.`;
    return msg;
  }

  function cleanPhoneForWhatsApp(phone) {
    if (!phone) return '';
    let p = phone.replace(/[^0-9]/g, '');
    if (p.length === 10) {
      p = '91' + p; // Default India prefix
    }
    return p;
  }

  // Create Customer Card DOM element (no per-card closures)
  function createCustomerCardElement(customer, items) {
    const card = document.createElement('article');
    card.className = 'customer-card';
    card.dataset.id = customer.id;

    const hasPhone = Boolean(customer.phone && customer.phone.trim());
    const phoneDisplay = hasPhone ? customer.phone.trim() : 'No number added';
    const cleanPhone = hasPhone ? cleanPhoneForWhatsApp(customer.phone) : '';

    let itemsHtml = '';
    if (items && items.length > 0) {
      itemsHtml = items.map(it => {
        const qtyStr = getBillQuantitySuffix(it);
        const lineTotal = it.line_total || (parseFloat(it.unit_price) * (it.quantity || 1));
        return `
          <div class="card-bill-item">
            <span class="card-bill-item-name">${escapeHtml(it.item_name)}${qtyStr}</span>
            <span class="card-bill-item-price">₹${lineTotal}</span>
          </div>
        `;
      }).join('');
    } else if (parseFloat(customer.total) > 0) {
      itemsHtml = `
        <div class="card-bill-item">
          <span class="card-bill-item-name">Legal Services</span>
          <span class="card-bill-item-price">₹${customer.total}</span>
        </div>
      `;
    }

    const dateFormatted = customer.customer_date || '';
    const timeFormatted = customer.case_time ? ` ${customer.case_time}` : '';
    const billText = generateWhatsAppBillText(customer, items);

    card.innerHTML = `
      <div class="card-top">
        <div class="card-datetime">
          <span class="card-datetime-item">${escapeHtml(dateFormatted)}</span>
          ${timeFormatted ? `<span class="card-datetime-item">${escapeHtml(timeFormatted.trim())}</span>` : ''}
        </div>
        <h3 class="card-name">${escapeHtml(customer.name)}</h3>
        <p class="card-phone ${hasPhone ? 'present' : 'empty'}">${escapeHtml(phoneDisplay)}</p>
        ${customer.address ? `<p class="card-address">${escapeHtml(customer.address)}</p>` : ''}
        ${customer.problem ? `<div class="card-problem">${escapeHtml(customer.problem)}</div>` : ''}
        
        <div class="card-bill-box">
          ${itemsHtml}
          <div class="card-bill-total-row">
            <span>Total</span>
            <span>₹${customer.total}</span>
          </div>
        </div>
      </div>

      ${hasPhone ? `
        <div class="card-actions">
          <a href="tel:${escapeHtml(customer.phone)}" class="btn-card-action btn-call" aria-label="Call ${escapeHtml(customer.name)}">
            Call Client
          </a>
          <button type="button" class="btn-card-action btn-whatsapp" aria-label="Share bill on WhatsApp">
            Share Bill
          </button>
        </div>
      ` : ''}
    `;

    card._cleanPhone = cleanPhone;
    card._billText = billText;

    return card;
  }

  // Delegated handler for customer card buttons
  function onCustomersGridClick(e) {
    const waBtn = e.target.closest('.btn-whatsapp');
    if (!waBtn) return;

    const card = waBtn.closest('.customer-card');
    if (!card || !card._cleanPhone || !card._billText) return;

    const waUrl = `https://wa.me/${card._cleanPhone}?text=${encodeURIComponent(card._billText)}`;
    window.open(waUrl, '_blank');
  }

  // Dynamic Top Search Handling
  function setupSearch() {
    if (!searchInput) return;

    searchInput.addEventListener('input', onSearchInput);

    if (btnClearSearch) {
      btnClearSearch.addEventListener('click', onClearSearchClick);
    }
  }

  function onSearchInput() {
    const q = searchInput.value;
    if (btnClearSearch) {
      btnClearSearch.style.display = q.trim().length > 0 ? 'inline-block' : 'none';
    }

    if (currentTab === 'new-customer') {
      setTab('customers');
    }

    if (searchDebounceTimer) clearTimeout(searchDebounceTimer);
    searchDebounceTimer = setTimeout(triggerSearch, 200);
  }

  function onClearSearchClick() {
    searchInput.value = '';
    if (btnClearSearch) btnClearSearch.style.display = 'none';
    searchInput.focus();
    triggerSearch();
  }

  function triggerSearch() {
    const q = searchInput.value.trim();
    loadAndRenderCustomers(q.length > 0 ? q : null);
  }

  // Left Slide-in Drawer Options Handling
  function openDrawer() {
    if (!appDrawer) return;
    appDrawer.classList.add('open');
    appDrawer.setAttribute('aria-hidden', 'false');
    if (drawerOverlay) {
      drawerOverlay.classList.add('open');
      drawerOverlay.setAttribute('aria-hidden', 'false');
    }
    if (btnHeaderMenu) btnHeaderMenu.setAttribute('aria-expanded', 'true');
    document.body.classList.add('drawer-open');
    updateDrawerCounts();
    appDrawer.focus();
  }

  function closeDrawer() {
    if (!appDrawer || !appDrawer.classList.contains('open')) return;
    appDrawer.classList.remove('open');
    appDrawer.setAttribute('aria-hidden', 'true');
    if (drawerOverlay) {
      drawerOverlay.classList.remove('open');
      drawerOverlay.setAttribute('aria-hidden', 'true');
    }
    if (btnHeaderMenu) btnHeaderMenu.setAttribute('aria-expanded', 'false');
    document.body.classList.remove('drawer-open');
    if (btnHeaderMenu) btnHeaderMenu.focus();
  }

  function toggleDrawer() {
    if (!appDrawer) return;
    if (appDrawer.classList.contains('open')) {
      closeDrawer();
    } else {
      openDrawer();
    }
  }

  function updateDrawerCounts() {
    if (drawerItemsCount) {
      drawerItemsCount.textContent = allPriceItems.length;
    }
    if (drawerStockAlertCount) {
      const lowOrOut = (allPriceItems || []).filter(it => (Number(it.stockPieces) || 0) <= 0).length;
      drawerStockAlertCount.textContent = String(lowOrOut);
      drawerStockAlertCount.title = `${lowOrOut} item(s) out of stock`;
    }
  }

  function setupDrawer() {
    if (!btnHeaderMenu || !appDrawer) return;

    btnHeaderMenu.addEventListener('click', toggleDrawer);
    if (btnCloseDrawer) btnCloseDrawer.addEventListener('click', closeDrawer);
    if (drawerOverlay) drawerOverlay.addEventListener('click', closeDrawer);

    if (drawerBtnHome) {
      drawerBtnHome.addEventListener('click', onDrawerHomeClick);
    }

    if (linkPriceList) {
      linkPriceList.addEventListener('click', onDrawerItemsClick);
    }

    if (drawerBtnNewCustomer) {
      drawerBtnNewCustomer.addEventListener('click', onDrawerNewCustomerClick);
    }

    if (linkStockManager) {
      linkStockManager.addEventListener('click', onDrawerStockClick);
    }
  }

  function onDrawerHomeClick() {
    closeDrawer();

    // Close any open modals
    if (priceListModal) priceListModal.style.display = 'none';
    if (itemHistoryModal) itemHistoryModal.style.display = 'none';
    if (itemEditModal) itemEditModal.style.display = 'none';
    if (stockModal) stockModal.style.display = 'none';
    if (stockHistoryModal) stockHistoryModal.style.display = 'none';
    if (cloudModal) cloudModal.style.display = 'none';

    // Reset search if active
    if (searchInput && searchInput.value) {
      searchInput.value = '';
      if (btnClearSearch) btnClearSearch.style.display = 'none';
    }

    setTab('customers');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  function onDrawerItemsClick() {
    closeDrawer();
    openItemsModal();
  }

  function onDrawerNewCustomerClick() {
    closeDrawer();
    setTab('new-customer');
  }

  async function onDrawerStockClick() {
    closeDrawer();
    await openStockModal();
  }

  async function openItemsModal() {
    allPriceItems = await window.DataStore.getPriceItems();
    renderPriceListModalItems();
    priceListModal.style.display = 'flex';
    if (modalItemName) modalItemName.focus();
  }

  // Items Management Modal (previously Price List Modal)
  function setupModals() {
    if (btnBackPriceModal) {
      btnBackPriceModal.addEventListener('click', () => {
        priceListModal.style.display = 'none';
      });
    }

    if (btnClosePriceModal) {
      btnClosePriceModal.addEventListener('click', () => {
        priceListModal.style.display = 'none';
      });
    }

    const closeHistoryHandler = () => {
      itemHistoryModal.style.display = 'none';
      if (modalReturnDestination === 'items-modal' && priceListModal) {
        priceListModal.style.display = 'flex';
      }
    };

    if (btnBackHistory) btnBackHistory.addEventListener('click', closeHistoryHandler);
    if (btnFooterBackHistory) btnFooterBackHistory.addEventListener('click', closeHistoryHandler);
    if (btnCloseHistoryModal) btnCloseHistoryModal.addEventListener('click', closeHistoryHandler);
    if (btnFooterCloseHistory) btnFooterCloseHistory.addEventListener('click', closeHistoryHandler);

    if (btnModalAddItem) {
      btnModalAddItem.addEventListener('click', onModalAddItemClick);
    }

    if (modalItemName) {
      modalItemName.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') {
          e.preventDefault();
          modalItemPrice.focus();
        }
      });
    }

    if (modalItemPrice) {
      modalItemPrice.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') {
          e.preventDefault();
          onModalAddItemClick();
        }
      });
    }

    // Single delegated listeners on modalPriceItems container
    if (modalPriceItems) {
      modalPriceItems.addEventListener('click', onModalPriceItemsClick);
      modalPriceItems.addEventListener('change', onModalPriceItemsChange);
      modalPriceItems.addEventListener('keydown', onModalPriceItemsKeydown);
    }
  }

  async function onModalAddItemClick() {
    const name = modalItemName.value.trim();
    const price = parseFloat(modalItemPrice.value);

    if (!name || isNaN(price) || price < 0) {
      modalItemName.focus();
      return;
    }

    btnModalAddItem.disabled = true;
    try {
      const item = await window.DataStore.addPriceItem(name, price);
      if (item) {
        allPriceItems = await window.DataStore.getPriceItems();
        modalItemName.value = '';
        modalItemPrice.value = '';
        renderPriceListModalItems();
        renderPriceItemsInForm();
        updateDrawerCounts();
        modalItemName.focus();
      }
    } finally {
      btnModalAddItem.disabled = false;
    }
  }

  function renderPriceListModalItems() {
    renderPriceItemsManager(modalPriceItems, {
      emptyText: 'No catalog items yet. Add your first item above.'
    });
  }

  // Generic Item Manager Renderer (no per-row function allocations)
  function renderPriceItemsManager(container, options = {}) {
    if (!container) return;
    container.innerHTML = '';

    if (!allPriceItems || allPriceItems.length === 0) {
      const emptyNote = document.createElement('div');
      emptyNote.className = 'empty-items-notice';
      emptyNote.textContent = options.emptyText || 'No items yet. Add an item above.';
      container.appendChild(emptyNote);
      return;
    }

    const fragment = document.createDocumentFragment();

    allPriceItems.forEach(it => {
      const row = document.createElement('div');
      row.className = 'price-item-row';
      row.dataset.id = it.id;
      row.style.cursor = 'default';

      const unitLabel = getSalesUnitLabel(it);
      const stockText = getItemStockText(it);

      row.innerHTML = `
        <div class="price-item-left">
          <div class="price-item-text">
            <span class="price-item-name">${escapeHtml(it.name)}</span>
            <span class="price-item-meta">${escapeHtml(getItemPackagingText(it))}</span>
            ${stockText ? `<span class="price-item-stock">${escapeHtml(stockText)}</span>` : ''}
          </div>
        </div>
        <div class="price-item-right">
          <div class="item-price-edit-box" title="Tap to customize catalog price">
            <span class="currency-symbol">₹</span>
            <input type="number" class="item-price-input" value="${it.price}" min="0" step="any" aria-label="Price per ${escapeHtml(unitLabel)} for ${escapeHtml(it.name)}">
            <span class="price-unit-suffix">/${escapeHtml(unitLabel)}</span>
          </div>
          <button type="button" class="btn-item-options" title="More options" aria-haspopup="menu" aria-label="Options for ${escapeHtml(it.name)}">
            <svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true"><circle cx="12" cy="5" r="2.2"></circle><circle cx="12" cy="12" r="2.2"></circle><circle cx="12" cy="19" r="2.2"></circle></svg>
          </button>
        </div>
      `;

      fragment.appendChild(row);
    });

    container.appendChild(fragment);
  }

  // Delegated handlers for modalPriceItems
  function onModalPriceItemsClick(e) {
    const btnOptions = e.target.closest('.btn-item-options');
    if (!btnOptions) return;

    const row = btnOptions.closest('.price-item-row');
    if (!row) return;

    const itemId = row.dataset.id;
    const item = allPriceItems.find(it => it.id === itemId);
    if (!item) return;

    e.stopPropagation();
    openItemOptionsMenu(btnOptions, item, {
      onCustomPrice: () => {
        const priceInput = row.querySelector('.item-price-input');
        if (priceInput) {
          priceInput.focus();
          priceInput.select();
        }
      }
    });
  }

  async function onModalPriceItemsChange(e) {
    const priceInput = e.target.closest('.item-price-input');
    if (!priceInput) return;

    const row = priceInput.closest('.price-item-row');
    if (!row) return;

    const itemId = row.dataset.id;
    const item = allPriceItems.find(it => it.id === itemId);
    if (!item) return;

    const newPrice = parseFloat(priceInput.value);
    if (isNaN(newPrice) || newPrice < 0) {
      priceInput.value = item.price;
      return;
    }

    if (Math.abs(newPrice - parseFloat(item.price)) < 0.001) {
      return;
    }

    await window.DataStore.updatePriceItem(itemId, { price: newPrice });
    allPriceItems = await window.DataStore.getPriceItems();
    item.price = newPrice;

    if (selectedItemsMap.has(itemId)) {
      selectedItemsMap.get(itemId).item.price = newPrice;
    }

    renderPriceItemsInForm();
    saveDraft();
  }

  function onModalPriceItemsKeydown(e) {
    if (e.key === 'Enter') {
      const priceInput = e.target.closest('.item-price-input');
      if (priceInput) {
        e.preventDefault();
        priceInput.blur();
      }
    }
  }

  // Cloud / Supabase Settings Setup (safely guarded)
  function setupCloudSettings() {
    if (linkCloudSettings) {
      linkCloudSettings.addEventListener('click', () => {
        cfgSupabaseUrl.value = window.CONFIG.SUPABASE_URL && !window.CONFIG.SUPABASE_URL.includes('YOUR_SUPABASE_URL') ? window.CONFIG.SUPABASE_URL : '';
        cfgSupabaseKey.value = window.CONFIG.SUPABASE_ANON_KEY && !window.CONFIG.SUPABASE_ANON_KEY.includes('YOUR_SUPABASE_ANON_KEY') ? window.CONFIG.SUPABASE_ANON_KEY : '';
        updateCloudModalIndicator();
        cloudModal.style.display = 'flex';
      });
    }

    if (btnCloseCloudModal) {
      btnCloseCloudModal.addEventListener('click', () => {
        cloudModal.style.display = 'none';
      });
    }

    if (btnSaveCloud) {
      btnSaveCloud.addEventListener('click', async () => {
        const url = cfgSupabaseUrl.value.trim();
        const key = cfgSupabaseKey.value.trim();
        window.CONFIG.updateCredentials(url, key);
        window.DataStore.invalidateCache();
        updateCloudModalIndicator();
        await loadAndRenderCustomers();
        cloudModal.style.display = 'none';
      });
    }
  }

  function updateCloudModalIndicator() {
    if (!cloudConnectionIndicator) return;
    if (window.CONFIG.isSupabaseConfigured()) {
      cloudConnectionIndicator.textContent = 'Supabase Connected';
      cloudConnectionIndicator.style.color = '#7A5A36';
    } else {
      cloudConnectionIndicator.textContent = 'Offline (localStorage mode)';
      cloudConnectionIndicator.style.color = '#7A5A36';
    }
  }

  // Stock Management
  function closeStockModal() {
    if (stockModal) stockModal.style.display = 'none';
  }

  function openStockModalView() {
    if (!stockModal) return;
    stockModal.style.display = 'flex';
  }

  function populateStockItemSelect() {
    if (!stockItemSelect) return;
    const current = stockItemSelect.value;
    stockItemSelect.innerHTML = '<option value="">Select existing item…</option><option value="__new__">+ New item</option>';
    (allPriceItems || []).forEach(it => {
      const opt = document.createElement('option');
      opt.value = String(it.id);
      opt.textContent = `${it.name} — ${it.stockPieces || 0} pcs`;
      stockItemSelect.appendChild(opt);
    });
    if ([...stockItemSelect.options].some(o => o.value === current)) stockItemSelect.value = current;
  }

  function toggleStockNewItemFields() {
    const isNew = stockItemSelect && stockItemSelect.value === '__new__';
    if (stockNewNameGroup) stockNewNameGroup.style.display = isNew ? 'block' : 'none';
    if (stockNewPriceGroup) stockNewPriceGroup.style.display = isNew ? 'block' : 'none';
  }

  function formatStockMovementType(type) {
    const map = { in: 'Stock In', out: 'Stock Out', adjustment: 'Adjustment', set: 'Stock Set', sale: 'Sale', initial: 'Initial Stock' };
    return map[type] || (type || 'Movement');
  }

  function renderStockItemsList() {
    if (!stockItemsList) return;
    stockItemsList.innerHTML = '';
    const term = (stockSearchTerm || '').trim().toLowerCase();
    let items = [...(allPriceItems || [])];
    if (term) {
      items = items.filter(it => {
        const hay = `${it.name || ''} ${it.category || ''} ${it.unitDescription || ''} ${it.stockPieces || 0}`.toLowerCase();
        return hay.includes(term);
      });
    }
    if (items.length === 0) {
      const empty = document.createElement('div');
      empty.className = 'empty-items-notice';
      empty.textContent = term ? 'No stock items match your search.' : 'No items found. Add a new item with stock above.';
      stockItemsList.appendChild(empty);
      return;
    }

    const frag = document.createDocumentFragment();
    items.forEach(it => {
      const stock = parseInt(it.stockPieces, 10) || 0;
      const ppu = parseInt(it.piecesPerUnit, 10) || 1;
      const low = stock > 0 && stock <= Math.max(2, ppu);
      const badgeClass = stock <= 0 ? 'out' : (low ? 'low' : 'ok');
      const badgeText = stock <= 0 ? 'Out of stock' : (low ? 'Low stock' : 'In stock');
      const card = document.createElement('div');
      card.className = 'stock-item-card';
      card.dataset.id = String(it.id);
      card.innerHTML = `
        <div class="stock-item-main">
          <p class="stock-item-title">${escapeHtml(it.name || 'Item')}</p>
          <p class="stock-item-meta">${escapeHtml(getItemPackagingText(it))}</p>
          <div class="stock-badges">
            <span class="stock-badge ${badgeClass}">${badgeText}</span>
            <span class="stock-badge neutral">Remaining: ${stock} pcs${ppu > 1 ? ` (${Math.floor(stock / ppu)} unit${Math.floor(stock / ppu) === 1 ? '' : 's'})` : ''}</span>
            <span class="stock-badge neutral">Price: ${formatCurrency(it.price)}/${escapeHtml(getSalesUnitLabel(it))}</span>
          </div>
          <div class="stock-inline-form" id="stock-inline-${escapeHtml(String(it.id))}" style="display:none;">
            <div class="field-group">
              <label class="field-label">Add quantity (pcs)</label>
              <input type="number" class="field-input stock-inline-qty" min="1" step="1" placeholder="e.g. 10">
            </div>
            <div class="field-group">
              <label class="field-label">Note</label>
              <input type="text" class="field-input stock-inline-note" placeholder="Optional note">
            </div>
            <div class="field-group">
              <button type="button" class="btn-primary stock-inline-save">Save</button>
            </div>
          </div>
        </div>
        <div class="stock-item-actions">
          <button type="button" class="btn-secondary stock-btn-quick-add">+ Add Stock</button>
          <button type="button" class="btn-secondary stock-btn-history">History</button>
          <button type="button" class="btn-secondary stock-btn-edit">Edit Item</button>
        </div>
      `;
      frag.appendChild(card);
    });
    stockItemsList.appendChild(frag);
  }

  async function openStockModal() {
    allPriceItems = await window.DataStore.getPriceItems();
    populateStockItemSelect();
    toggleStockNewItemFields();
    renderStockItemsList();
    openStockModalView();
    updateDrawerCounts();
  }

  async function submitStockAdd() {
    if (!btnStockAddSubmit) return;
    const selected = stockItemSelect ? stockItemSelect.value : '';
    const qty = parseInt(stockQtyInput ? stockQtyInput.value : '', 10);
    const note = (stockNoteInput ? stockNoteInput.value : '').trim();

    if (!selected) { alert('Please select an item or choose New item.'); return; }
    if (isNaN(qty) || qty <= 0) { alert('Enter a valid stock quantity (pieces) greater than 0.'); if (stockQtyInput) stockQtyInput.focus(); return; }

    btnStockAddSubmit.disabled = true;
    try {
      if (selected === '__new__') {
        const name = (stockNewName ? stockNewName.value : '').trim();
        const price = parseFloat(stockNewPrice ? stockNewPrice.value : '0');
        if (!name) { alert('Enter new item name.'); if (stockNewName) stockNewName.focus(); return; }
        if (isNaN(price) || price < 0) { alert('Enter a valid price for the new item.'); if (stockNewPrice) stockNewPrice.focus(); return; }
        const created = await window.DataStore.addPriceItem(name, price, 'General', {
          stockPieces: qty,
          stockNote: note || 'Initial stock added while creating item'
        });
        if (!created) { alert('Could not create item.'); return; }
      } else {
        const result = await window.DataStore.adjustStock(selected, qty, 'add', note || 'Manual stock added');
        if (!result) { alert('Could not update stock for selected item.'); return; }
      }

      allPriceItems = await window.DataStore.getPriceItems();
      populateStockItemSelect();
      renderStockItemsList();
      renderPriceItemsInForm();
      if (priceListModal && priceListModal.style.display === 'flex') renderPriceListModalItems();
      updateDrawerCounts();
      saveDraft();

      if (stockQtyInput) stockQtyInput.value = '';
      if (stockNoteInput) stockNoteInput.value = '';
      if (selected === '__new__') {
        if (stockNewName) stockNewName.value = '';
        if (stockNewPrice) stockNewPrice.value = '';
        if (stockItemSelect) stockItemSelect.value = '';
        toggleStockNewItemFields();
      }
    } catch (e) {
      console.error('Stock add failed', e);
      alert('Failed to add/update stock. Please try again.');
    } finally {
      btnStockAddSubmit.disabled = false;
    }
  }

  async function openStockHistoryModal(item) {
    if (!stockHistoryModal) return;
    if (stockHistoryTitle) stockHistoryTitle.textContent = item ? `Stock History: ${item.name}` : 'Stock History';
    if (stockHistorySubtitle) stockHistorySubtitle.textContent = item ? 'Recent stock movements for this item' : 'Recent stock movements';
    if (stockHistoryList) stockHistoryList.innerHTML = '<div class="empty-items-notice">Loading stock history...</div>';
    stockHistoryModal.style.display = 'flex';
    try {
      const movements = await window.DataStore.getStockMovements(item ? item.id : null, 300);
      renderStockHistoryList(movements, item);
    } catch (e) {
      if (stockHistoryList) stockHistoryList.innerHTML = '<div class="empty-items-notice">Could not load stock history.</div>';
    }
  }

  function renderStockHistoryList(movements, item) {
    if (!stockHistoryList) return;
    stockHistoryList.innerHTML = '';
    if (!movements || movements.length === 0) {
      const empty = document.createElement('div');
      empty.className = 'empty-items-notice';
      empty.textContent = item ? 'No stock movements recorded for this item yet.' : 'No stock movements recorded yet.';
      stockHistoryList.appendChild(empty);
      return;
    }

    const frag = document.createDocumentFragment();
    movements.forEach(m => {
      const delta = parseInt(m.quantity_delta, 10) || 0;
      const deltaText = `${delta > 0 ? '+' : ''}${delta} pcs`;
      const deltaClass = delta >= 0 ? 'pos' : 'neg';
      const dateText = formatHistoryDate(m.created_at, true);
      const row = document.createElement('div');
      row.className = 'stock-history-item';
      row.innerHTML = `
        <div class="stock-history-top">
          <div class="stock-history-type">${escapeHtml(formatStockMovementType(m.movement_type))}${item ? '' : ` — ${escapeHtml(m.item_name || 'Item')}`}</div>
          <div class="stock-history-delta ${deltaClass}">${escapeHtml(deltaText)}</div>
        </div>
        <div class="stock-history-meta">
          <span>Before: ${parseInt(m.quantity_before, 10) || 0} pcs</span>
          <span>After: ${parseInt(m.quantity_after, 10) || 0} pcs</span>
          <span>${escapeHtml(dateText)}</span>
          ${m.reference_id ? `<span>Ref: ${escapeHtml(String(m.reference_id))}</span>` : ''}
        </div>
        ${m.note ? `<div class="stock-history-note">${escapeHtml(m.note)}</div>` : ''}
      `;
      frag.appendChild(row);
    });
    stockHistoryList.appendChild(frag);
  }

  function closeStockHistoryModal() {
    if (stockHistoryModal) stockHistoryModal.style.display = 'none';
  }

  function setupStockManagement() {
    if (btnBackStockModal) btnBackStockModal.addEventListener('click', closeStockModal);
    if (btnCloseStockModal) btnCloseStockModal.addEventListener('click', closeStockModal);
    if (btnStockAddSubmit) btnStockAddSubmit.addEventListener('click', submitStockAdd);
    if (btnStockRefresh) btnStockRefresh.addEventListener('click', openStockModal);
    if (stockItemSelect) stockItemSelect.addEventListener('change', toggleStockNewItemFields);
    if (stockSearchInput) stockSearchInput.addEventListener('input', () => { stockSearchTerm = stockSearchInput.value || ''; renderStockItemsList(); });
    if (stockQtyInput) stockQtyInput.addEventListener('keydown', (e) => { if (e.key === 'Enter') { e.preventDefault(); submitStockAdd(); } });

    if (stockItemsList) {
      stockItemsList.addEventListener('click', async (e) => {
        const card = e.target.closest('.stock-item-card');
        if (!card) return;
        const itemId = card.dataset.id;
        const item = (allPriceItems || []).find(it => String(it.id) === String(itemId));
        if (!item) return;

        if (e.target.closest('.stock-btn-history')) {
          await openStockHistoryModal(item);
          return;
        }
        if (e.target.closest('.stock-btn-edit')) {
          openItemEditModal(item);
          return;
        }
        if (e.target.closest('.stock-btn-quick-add')) {
          const form = card.querySelector('.stock-inline-form');
          if (form) form.style.display = form.style.display === 'none' ? 'grid' : 'none';
          const qtyInput = card.querySelector('.stock-inline-qty');
          if (qtyInput) qtyInput.focus();
          return;
        }
        if (e.target.closest('.stock-inline-save')) {
          const qtyInput = card.querySelector('.stock-inline-qty');
          const noteInput = card.querySelector('.stock-inline-note');
          const qty = parseInt(qtyInput ? qtyInput.value : '', 10);
          const note = noteInput ? noteInput.value.trim() : '';
          if (isNaN(qty) || qty <= 0) { alert('Enter a valid quantity to add.'); if (qtyInput) qtyInput.focus(); return; }
          const btn = e.target.closest('.stock-inline-save');
          if (btn) btn.disabled = true;
          try {
            await window.DataStore.adjustStock(item.id, qty, 'add', note || 'Manual stock added from stock manager');
            allPriceItems = await window.DataStore.getPriceItems();
            renderStockItemsList();
            populateStockItemSelect();
            renderPriceItemsInForm();
            if (priceListModal && priceListModal.style.display === 'flex') renderPriceListModalItems();
            updateDrawerCounts();
          } finally {
            if (btn) btn.disabled = false;
          }
        }
      });
    }

    const closeHistory = () => closeStockHistoryModal();
    if (btnBackStockHistory) btnBackStockHistory.addEventListener('click', closeHistory);
    if (btnCloseStockHistoryModal) btnCloseStockHistoryModal.addEventListener('click', closeHistory);
    if (btnFooterBackStockHistory) btnFooterBackStockHistory.addEventListener('click', closeHistory);
    if (btnFooterCloseStockHistory) btnFooterCloseStockHistory.addEventListener('click', closeHistory);
  }

  // Application Entry Point
  document.addEventListener('DOMContentLoaded', init);

})();
