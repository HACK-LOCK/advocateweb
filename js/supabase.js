// Supabase & Local Data Storage Layer
// Offline-first with browser localStorage, switches seamlessly to Supabase PostgREST API when configured

const DEFAULT_PRICE_ITEMS = [
  {
    id: '10000000-0000-4000-8000-000000000001',
    name: 'Counter Fee (₹1 / 80 pieces)',
    category: 'Counter Fee',
    price: 80,
    baseCost: 1,
    salesUnit: 'sheet',
    piecesPerUnit: 80,
    stockPieces: 80,
    unitDescription: 'Full sheet of 80 pcs · ₹80 per sheet · sold as a whole sheet only',
    is_active: true
  },
  {
    id: '10000000-0000-4000-8000-000000000002',
    name: 'Counter Fee (₹2 / 160 pieces)',
    category: 'Counter Fee',
    price: 160,
    baseCost: 2,
    salesUnit: 'sheet',
    piecesPerUnit: 160,
    stockPieces: 160,
    unitDescription: 'Full sheet of 160 pcs · ₹160 per sheet · sold as a whole sheet only',
    is_active: true
  },
  {
    id: '10000000-0000-4000-8000-000000000003',
    name: 'Counter Fee (₹5 per piece)',
    category: 'Counter Fee',
    price: 5,
    baseCost: 5,
    salesUnit: 'piece',
    piecesPerUnit: 1,
    stockPieces: 0,
    unitDescription: 'Sold strictly per single piece · ₹5 per piece · no sheet unit',
    is_active: true
  },
  {
    id: '10000000-0000-4000-8000-000000000004',
    name: 'Counter Fee (₹20 per piece)',
    category: 'Counter Fee',
    price: 20,
    baseCost: 20,
    salesUnit: 'piece',
    piecesPerUnit: 1,
    stockPieces: 0,
    unitDescription: 'Sold strictly per single piece · ₹20 per piece · no sheet unit',
    is_active: true
  },
  {
    id: '10000000-0000-4000-8000-000000000005',
    name: 'Marriage Certificate / Stamp (2 pieces)',
    category: 'Marriage',
    price: 200,
    baseCost: 0,
    salesUnit: 'pair',
    piecesPerUnit: 2,
    stockPieces: 128,
    unitDescription: 'Sold per 2-pc unit · ₹200 for 2 pieces · price editable',
    is_active: true
  },
  {
    id: '10000000-0000-4000-8000-000000000006',
    name: 'Notary (₹540 Base)',
    category: 'Notary',
    price: 540,
    baseCost: 540,
    salesUnit: 'sheet',
    piecesPerUnit: 108,
    stockPieces: 108,
    unitDescription: '1 sheet = 108 pcs · ₹540 base · sold at ₹540 per sheet',
    is_active: true
  },
  {
    id: '10000000-0000-4000-8000-000000000007',
    name: 'Notary (₹900 Base)',
    category: 'Notary',
    price: 900,
    baseCost: 900,
    salesUnit: 'sheet',
    piecesPerUnit: 180,
    stockPieces: 180,
    unitDescription: '1 sheet = 180 pcs · ₹900 per sheet · auto price, editable',
    is_active: true
  }
];

const LEGACY_DEFAULT_ITEM_NAMES = new Set([
  'notary - rs 540', 'notary (₹540)', 'notary (₹540 base)',
  'marriage ticket', 'marriage certificate / stamp',
  'court fee - rs 1', 'court fee - ₹1 (80 pieces)', 'counter fee (₹1 / 80 pieces)',
  'court fee - rs 2', 'court fee - ₹2 (160 pieces)', 'counter fee (₹2 / 160 pieces)',
  'court fee - rs 5', 'court fee - ₹5', 'counter fee (₹5 per piece)',
  'court fee - rs 20', 'court fee - ₹20', 'counter fee (₹20 per piece)',
  'notary - rs 900', 'notary - ₹900', 'notary (₹900 base)'
]);

function isLegacyDefaultItem(it) {
  if (!it) return false;
  if (['1', '2', '3', '4', '5', '6', '7'].includes(String(it.id))) return true;
  return LEGACY_DEFAULT_ITEM_NAMES.has(String(it.name || '').trim().toLowerCase());
}

function sortPriceItems(items) {
  return (items || []).slice().sort((a, b) =>
    String(a.name || '').localeCompare(String(b.name || ''), undefined, {
      numeric: true,
      sensitivity: 'base'
    })
  );
}


function normalizePriceItem(it) {
  if (!it) return null;
  return {
    ...it,
    id: String(it.id),
    name: it.name || '',
    category: it.category || 'General',
    price: parseFloat(it.price) || 0,
    baseCost: it.base_cost !== undefined ? parseFloat(it.base_cost) : (it.baseCost !== undefined ? parseFloat(it.baseCost) : 0),
    salesUnit: it.sales_unit || it.salesUnit || 'piece',
    piecesPerUnit: parseInt(it.pieces_per_unit !== undefined ? it.pieces_per_unit : (it.piecesPerUnit !== undefined ? it.piecesPerUnit : 1), 10),
    stockPieces: parseInt(it.stock_pieces !== undefined ? it.stock_pieces : (it.stockPieces !== undefined ? it.stockPieces : 0), 10),
    unitDescription: it.unit_description || it.unitDescription || '',
    is_active: it.is_active !== undefined ? it.is_active : true
  };
}

const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
function isValidUuid(id) {
  return typeof id === 'string' && UUID_REGEX.test(id);
}

function deduplicateCustomerList(customers) {
  if (!Array.isArray(customers)) return [];
  const seenIds = new Set();
  const deduped = [];

  for (let i = 0; i < customers.length; i++) {
    const c = customers[i];
    if (!c || !c.id || seenIds.has(c.id)) continue;

    // Check if there is an earlier record with identical details created within 60 seconds (accidental double submission)
    const duplicateIdx = deduped.findIndex(prev => {
      const sameName = (prev.name || '').trim().toLowerCase() === (c.name || '').trim().toLowerCase();
      const samePhone = (prev.phone || '').trim() === (c.phone || '').trim();
      const sameProblem = (prev.problem || '').trim().toLowerCase() === (c.problem || '').trim().toLowerCase();
      const sameTotal = Math.abs(parseFloat(prev.total || 0) - parseFloat(c.total || 0)) < 0.01;
      const prevTime = new Date(prev.created_at || 0).getTime();
      const cTime = new Date(c.created_at || 0).getTime();
      const timeDiff = Math.abs(prevTime - cTime);
      return sameName && samePhone && sameTotal && sameProblem && (timeDiff < 60000 || (!prevTime && !cTime));
    });

    if (duplicateIdx !== -1) {
      // Preserve items if current record has items and existing duplicate doesn't
      if ((!deduped[duplicateIdx].items || deduped[duplicateIdx].items.length === 0) && (c.items && c.items.length > 0)) {
        deduped[duplicateIdx].items = c.items;
      }
      continue;
    }

    seenIds.add(c.id);
    deduped.push(c);
  }
  return deduped;
}

window.DataStore = {
  CATALOG_VERSION: 'v6_packaged_catalog_2026',
  _isSavingCustomer: false,

  // 30-60 second cache mechanism
  _cache: {
    customers: null,
    customersTime: 0,
    priceItems: null,
    priceItemsTime: 0,
    customerItems: new Map(), // customerId -> { items, timestamp }
    stockMovements: null,
    stockMovementsTime: 0,
    customerHistory: null,
    customerHistoryTime: 0
  },
  CACHE_TTL_MS: 45000, // 45 seconds

  // Local price-change history (used by the item History modal)
  _priceHistoryKey: 'portal_price_history',
  _stockMovementsKey: 'portal_stock_movements',
  _customerHistoryKey: 'portal_customer_history',

  _getCustomerHistoryLocal() {
    try {
      const raw = window.localStorage.getItem(this._customerHistoryKey);
      const parsed = raw ? JSON.parse(raw) : [];
      return Array.isArray(parsed) ? parsed : [];
    } catch (e) {
      return [];
    }
  },

  _saveCustomerHistoryLocal(list) {
    try {
      window.localStorage.setItem(this._customerHistoryKey, JSON.stringify(list || []));
    } catch (e) {
      console.warn('Could not save customer history locally:', e);
    }
  },

  async recordCustomerHistory(entry) {
    const nowIso = entry.created_at || new Date().toISOString();
    const localEntry = {
      id: entry.id || ((typeof crypto !== 'undefined' && crypto.randomUUID) ? crypto.randomUUID() : 'ch_' + Date.now() + '_' + Math.random().toString(36).slice(2, 8)),
      customer_id: (entry.customer_id && isValidUuid(String(entry.customer_id))) ? String(entry.customer_id) : (entry.customer_id || null),
      customer_name: String(entry.customer_name || 'Customer').trim() || 'Customer',
      event_type: String(entry.event_type || 'info').trim().toLowerCase(),
      details: entry.details ? String(entry.details) : '',
      changed_fields: entry.changed_fields ? String(entry.changed_fields) : '',
      created_at: nowIso
    };

    const local = this._getCustomerHistoryLocal();
    local.unshift(localEntry);
    this._saveCustomerHistoryLocal(local.slice(0, 1500));
    this._cache.customerHistory = null;
    this._cache.customerHistoryTime = 0;

    if (this.isSupabase()) {
      try {
        const payload = {
          customer_id: (localEntry.customer_id && isValidUuid(String(localEntry.customer_id))) ? localEntry.customer_id : null,
          customer_name: localEntry.customer_name,
          event_type: localEntry.event_type,
          details: localEntry.details || null,
          changed_fields: localEntry.changed_fields || null,
          created_at: localEntry.created_at
        };
        const res = await this._supabaseFetch('customer_history', {
          method: 'POST',
          headers: { 'Prefer': 'return=representation' },
          body: JSON.stringify(payload)
        });
        if (res && res[0]) {
          const saved = { ...localEntry, ...res[0], id: res[0].id || localEntry.id };
          const idx = local.findIndex(h => String(h.id) === String(localEntry.id));
          if (idx !== -1) local[idx] = saved; else local.unshift(saved);
          this._saveCustomerHistoryLocal(local.slice(0, 1500));
          return saved;
        }
      } catch (e) {
        console.warn('Could not save customer history to Supabase:', e);
      }
    }
    return localEntry;
  },

  async getCustomerHistory(limit = 300) {
    const now = Date.now();
    if (this.isSupabase()) {
      try {
        const path = `customer_history?select=*&order=created_at.desc&limit=${Math.max(1, Math.min(limit, 1000))}`;
        const data = await this._supabaseFetch(path);
        if (Array.isArray(data)) {
          const normalized = data.map(h => ({
            id: h.id,
            customer_id: h.customer_id || null,
            customer_name: h.customer_name || 'Customer',
            event_type: h.event_type || 'info',
            details: h.details || '',
            changed_fields: h.changed_fields || '',
            created_at: h.created_at
          }));
          this._cache.customerHistory = normalized;
          this._cache.customerHistoryTime = now;
          this._saveCustomerHistoryLocal(normalized);
          return normalized.slice(0, limit);
        }
      } catch (e) {
        console.warn('Supabase fetch failed for customer history, using local storage:', e);
      }
    }
    const local = this._getCustomerHistoryLocal()
      .slice()
      .sort((a, b) => new Date(b.created_at || 0) - new Date(a.created_at || 0));
    return local.slice(0, limit);
  },

  _getPriceHistoryLog() {
    try {
      const raw = window.localStorage.getItem(this._priceHistoryKey);
      const parsed = raw ? JSON.parse(raw) : [];
      return Array.isArray(parsed) ? parsed : [];
    } catch (e) {
      return [];
    }
  },

  _recordPriceEvent(event) {
    try {
      const log = this._getPriceHistoryLog();
      log.push(event);
      const trimmed = log.length > 1000 ? log.slice(log.length - 1000) : log;
      window.localStorage.setItem(this._priceHistoryKey, JSON.stringify(trimmed));
    } catch (e) {
      console.warn('Could not record price history:', e);
    }
  },

  _getStockMovementsLocal() {
    try {
      const raw = window.localStorage.getItem(this._stockMovementsKey);
      const parsed = raw ? JSON.parse(raw) : [];
      return Array.isArray(parsed) ? parsed : [];
    } catch (e) {
      return [];
    }
  },

  _saveStockMovementsLocal(movements) {
    try {
      const trimmed = (movements || []).slice(0, 2000);
      window.localStorage.setItem(this._stockMovementsKey, JSON.stringify(trimmed));
    } catch (e) {
      console.warn('Could not save stock movements locally:', e);
    }
  },

  async recordStockMovement(movement) {
    if (!movement) return null;
    const entry = {
      id: movement.id || ((typeof crypto !== 'undefined' && crypto.randomUUID) ? crypto.randomUUID() : 'sm_' + Date.now() + '_' + Math.random().toString(36).substr(2, 5)),
      price_item_id: movement.price_item_id || null,
      item_name: (movement.item_name || '').trim() || 'Item',
      movement_type: movement.movement_type || 'adjustment',
      quantity_delta: parseInt(movement.quantity_delta, 10) || 0,
      quantity_before: parseInt(movement.quantity_before, 10) || 0,
      quantity_after: parseInt(movement.quantity_after, 10) || 0,
      note: movement.note || null,
      reference_id: movement.reference_id || null,
      created_at: movement.created_at || new Date().toISOString()
    };

    const local = this._getStockMovementsLocal();
    local.unshift(entry);
    this._saveStockMovementsLocal(local);
    this._cache.stockMovements = null;
    this._cache.stockMovementsTime = 0;

    if (this.isSupabase()) {
      try {
        const payload = {
          price_item_id: (entry.price_item_id && isValidUuid(String(entry.price_item_id))) ? entry.price_item_id : null,
          item_name: entry.item_name,
          movement_type: entry.movement_type,
          quantity_delta: entry.quantity_delta,
          quantity_before: entry.quantity_before,
          quantity_after: entry.quantity_after,
          note: entry.note,
          reference_id: entry.reference_id,
          created_at: entry.created_at
        };
        const res = await this._supabaseFetch('stock_movements', {
          method: 'POST',
          headers: { 'Prefer': 'return=representation' },
          body: JSON.stringify(payload)
        });
        if (res && res[0]) {
          const saved = { ...entry, ...res[0], id: res[0].id || entry.id };
          const idx = local.findIndex(m => m.id === entry.id);
          if (idx !== -1) local[idx] = saved; else local.unshift(saved);
          this._saveStockMovementsLocal(local);
          return saved;
        }
      } catch (e) {
        console.warn('Could not save stock movement to Supabase:', e);
      }
    }
    return entry;
  },

  async getStockMovements(itemId = null, limit = 200) {
    const now = Date.now();
    const normalizedId = itemId ? String(itemId) : null;

    if (this.isSupabase()) {
      try {
        let path = `stock_movements?select=*&order=created_at.desc&limit=${Math.max(1, Math.min(limit, 1000))}`;
        if (normalizedId && isValidUuid(normalizedId)) {
          path = `stock_movements?select=*&price_item_id=eq.${normalizedId}&order=created_at.desc&limit=${Math.max(1, Math.min(limit, 1000))}`;
        }
        const data = await this._supabaseFetch(path);
        if (Array.isArray(data)) {
          const normalized = data.map(m => ({
            id: m.id,
            price_item_id: m.price_item_id,
            item_name: m.item_name || '',
            movement_type: m.movement_type || 'adjustment',
            quantity_delta: parseInt(m.quantity_delta, 10) || 0,
            quantity_before: parseInt(m.quantity_before, 10) || 0,
            quantity_after: parseInt(m.quantity_after, 10) || 0,
            note: m.note || '',
            reference_id: m.reference_id || null,
            created_at: m.created_at
          }));
          if (!normalizedId) {
            this._cache.stockMovements = normalized;
            this._cache.stockMovementsTime = now;
          }
          this._saveStockMovementsLocal(normalizedId ? this._mergeMovementsLocal(normalized) : normalized);
          return normalized;
        }
      } catch (e) {
        console.warn('Supabase fetch failed for stock movements, using local storage:', e);
      }
    }

    let local = this._getStockMovementsLocal();
    if (normalizedId) {
      local = local.filter(m => String(m.price_item_id || '') === normalizedId || (m.item_name || '').toLowerCase() === String(itemId || '').toLowerCase());
    }
    return local.slice(0, limit);
  },

  _mergeMovementsLocal(incoming) {
    const existing = this._getStockMovementsLocal();
    const byId = new Map();
    [...(incoming || []), ...existing].forEach(m => {
      if (!m) return;
      const key = String(m.id || `${m.price_item_id}-${m.created_at}-${m.quantity_after}`);
      if (!byId.has(key)) byId.set(key, m);
    });
    return Array.from(byId.values()).sort((a,b) => new Date(b.created_at || 0) - new Date(a.created_at || 0));
  },

  async adjustStock(itemId, amountPieces, mode = 'add', note = '') {
    const items = await this.getPriceItems();
    const idx = items.findIndex(it => String(it.id) === String(itemId));
    if (idx === -1) return null;
    const item = items[idx];
    const before = parseInt(item.stockPieces, 10) || 0;
    const amt = parseInt(amountPieces, 10);
    if (isNaN(amt)) return null;

    let after = before;
    let delta = 0;
    let movementType = 'adjustment';
    if (mode === 'set') {
      after = Math.max(0, amt);
      delta = after - before;
      movementType = 'set';
    } else if (mode === 'subtract') {
      delta = -Math.max(0, amt);
      after = Math.max(0, before + delta);
      movementType = delta < 0 ? 'out' : 'adjustment';
    } else {
      delta = Math.max(0, amt);
      after = before + delta;
      movementType = delta > 0 ? 'in' : 'adjustment';
    }

    if (delta === 0 && mode !== 'set') return { item, movement: null };

    await this.updatePriceItem(item.id, { stock_pieces: after }, { skipStockMovement: true });
    const refreshed = (await this.getPriceItems()).find(it => String(it.id) === String(item.id)) || { ...item, stockPieces: after };
    const movement = await this.recordStockMovement({
      price_item_id: item.id,
      item_name: item.name,
      movement_type: movementType,
      quantity_delta: delta,
      quantity_before: before,
      quantity_after: after,
      note: note || (mode === 'set' ? 'Manual stock set' : (delta > 0 ? 'Manual stock added' : 'Manual stock reduced'))
    });
    return { item: refreshed, movement };
  },

  // Initialize store: upgrade to the packaged catalog and deduplicate customer records
  init() {
    const currentVersion = window.localStorage.getItem('portal_catalog_version');
    const existing = window.localStorage.getItem('portal_price_items');

    if (!existing || currentVersion !== this.CATALOG_VERSION) {
      let sourceItems = [];
      if (existing) {
        try {
          const parsed = JSON.parse(existing);
          if (Array.isArray(parsed)) {
            sourceItems = parsed.map(normalizePriceItem).filter(Boolean);
          }
        } catch (e) {}
      }

      // Preserve user-created items, but replace legacy built-in defaults
      const defaultItems = DEFAULT_PRICE_ITEMS.map(def => {
        const existingDef = sourceItems.find(it =>
          String(it.id) === String(def.id) ||
          String(it.name || '').trim().toLowerCase() === String(def.name).trim().toLowerCase()
        );

        if (!existingDef) {
          return normalizePriceItem({ ...def, is_active: true });
        }

        // Keep the user's current price and stock. Legacy rows without packaging
        // metadata get the default stock for their new sheet/pack unit.
        const hadPackaging = existingDef.salesUnit === def.salesUnit &&
          existingDef.piecesPerUnit === def.piecesPerUnit;
        return normalizePriceItem({
          ...def,
          id: existingDef.id,
          price: existingDef.price !== undefined ? existingDef.price : def.price,
          stockPieces: hadPackaging
            ? existingDef.stockPieces
            : (existingDef.stockPieces > 0 ? existingDef.stockPieces : def.stockPieces),
          is_active: true
        });
      });

      const matchedDefaultIds = new Set(
        sourceItems
          .filter(it => defaultItems.some(def => String(def.id) === String(it.id) ||
            String(def.name || '').trim().toLowerCase() === String(it.name).trim().toLowerCase()))
          .map(it => String(it.id))
      );

      const customItems = sourceItems.filter(it => {
        if (isLegacyDefaultItem(it)) return false;
        if (matchedDefaultIds.has(String(it.id))) return false;
        return true;
      });

      const merged = sortPriceItems([...customItems, ...defaultItems]);
      window.localStorage.setItem('portal_price_items', JSON.stringify(merged));
      window.localStorage.setItem('portal_catalog_version', this.CATALOG_VERSION);
    }

    // Deduplicate existing customers in localStorage to resolve double bills
    const existingCustomers = window.localStorage.getItem('portal_customers');
    if (!existingCustomers) {
      window.localStorage.setItem('portal_customers', JSON.stringify([]));
    } else {
      try {
        const parsed = JSON.parse(existingCustomers);
        if (Array.isArray(parsed)) {
          const clean = deduplicateCustomerList(parsed);
          window.localStorage.setItem('portal_customers', JSON.stringify(clean));
        }
      } catch (e) {}
    }
  },

  isSupabase() {
    return window.CONFIG && window.CONFIG.isSupabaseConfigured();
  },

  async _supabaseFetch(path, options = {}) {
    const url = `${window.CONFIG.SUPABASE_URL}/rest/v1/${path}`;
    const headers = {
      'apikey': window.CONFIG.SUPABASE_ANON_KEY,
      'Authorization': `Bearer ${window.CONFIG.SUPABASE_ANON_KEY}`,
      'Content-Type': 'application/json',
      ...(options.headers || {})
    };

    const response = await fetch(url, { ...options, headers });
    if (!response.ok) {
      const errText = await response.text();
      throw new Error(`Supabase error (${response.status}): ${errText}`);
    }
    return response.json();
  },

  // Get price items (cached 45s)
  async getPriceItems() {
    const now = Date.now();
    if (this._cache.priceItems && (now - this._cache.priceItemsTime < this.CACHE_TTL_MS)) {
      this._cache.priceItems = sortPriceItems(this._cache.priceItems);
      return this._cache.priceItems;
    }

    if (this.isSupabase()) {
      try {
        const data = await this._supabaseFetch('price_items?select=*&is_active=eq.true&order=created_at.asc');
        if (Array.isArray(data)) {
          const normalized = sortPriceItems(data.map(normalizePriceItem).filter(Boolean));
          this._cache.priceItems = normalized;
          this._cache.priceItemsTime = now;
          // Sync to localStorage
          window.localStorage.setItem('portal_price_items', JSON.stringify(normalized));
          return normalized;
        }
      } catch (e) {
        console.warn('Supabase fetch failed for price items, using localStorage:', e);
      }
    }

    const local = JSON.parse(window.localStorage.getItem('portal_price_items') || '[]');
    const items = sortPriceItems(local.map(normalizePriceItem).filter(Boolean));
    this._cache.priceItems = items;
    this._cache.priceItemsTime = now;
    return items;
  },

  // Permanently add a price item
  async addPriceItem(name, price, category = 'General', options = {}) {
    const cleanName = (name || '').trim();
    const cleanPrice = parseFloat(price);
    if (!cleanName || isNaN(cleanPrice) || cleanPrice < 0) return null;

    const currentItems = await this.getPriceItems();
    const existing = currentItems.find(
      it => it.name.toLowerCase() === cleanName.toLowerCase() && parseFloat(it.price) === cleanPrice
    );
    if (existing) {
      return existing;
    }

    const newItem = normalizePriceItem({
      id: (typeof crypto !== 'undefined' && crypto.randomUUID) ? crypto.randomUUID() : 'pi_' + Date.now() + '_' + Math.random().toString(36).substr(2, 5),
      name: cleanName,
      price: cleanPrice,
      category: category,
      baseCost: options.baseCost || 0,
      salesUnit: options.salesUnit || 'piece',
      piecesPerUnit: options.piecesPerUnit || 1,
      stockPieces: options.stockPieces !== undefined ? parseInt(options.stockPieces, 10) : 0,
      unitDescription: options.unitDescription || 'Single piece unit',
      is_active: true,
      created_at: new Date().toISOString()
    });

    const updated = [...currentItems, newItem];
    window.localStorage.setItem('portal_price_items', JSON.stringify(updated));
    this._cache.priceItems = updated;
    this._cache.priceItemsTime = Date.now();

    if (this.isSupabase()) {
      try {
        const payload = {
          name: newItem.name,
          price: newItem.price,
          category: newItem.category,
          base_cost: newItem.baseCost,
          sales_unit: newItem.salesUnit,
          pieces_per_unit: newItem.piecesPerUnit,
          stock_pieces: newItem.stockPieces,
          unit_description: newItem.unitDescription,
          is_active: true
        };
        const res = await this._supabaseFetch('price_items', {
          method: 'POST',
          headers: { 'Prefer': 'return=representation' },
          body: JSON.stringify(payload)
        });
        if (res && res[0]) {
          const resNorm = normalizePriceItem(res[0]);
          const index = updated.findIndex(it => it.id === newItem.id);
          if (index !== -1) {
            updated[index] = resNorm;
            window.localStorage.setItem('portal_price_items', JSON.stringify(updated));
            this._cache.priceItems = updated;
          }
          await this.recordStockMovement({
            price_item_id: (resNorm || newItem).id,
            item_name: (resNorm || newItem).name,
            movement_type: 'initial',
            quantity_delta: parseInt((resNorm || newItem).stockPieces, 10) || 0,
            quantity_before: 0,
            quantity_after: parseInt((resNorm || newItem).stockPieces, 10) || 0,
            note: options.stockNote || 'Initial stock on item creation'
          });
          return resNorm;
        }
      } catch (e) {
        console.warn('Could not save price item to Supabase:', e);
      }
    }

    await this.recordStockMovement({
      price_item_id: newItem.id,
      item_name: newItem.name,
      movement_type: 'initial',
      quantity_delta: parseInt(newItem.stockPieces, 10) || 0,
      quantity_before: 0,
      quantity_after: parseInt(newItem.stockPieces, 10) || 0,
      note: options.stockNote || 'Initial stock on item creation'
    });
    return newItem;
  },

  // Update item price, stock level, name, or metadata (Price Override & Direct Stock Maintenance)
  async updatePriceItem(id, updates = {}, options = {}) {
    const currentItems = await this.getPriceItems();
    const index = currentItems.findIndex(it => String(it.id) === String(id));
    if (index === -1) return null;

    const current = currentItems[index];
    const updated = normalizePriceItem({
      ...current,
      ...updates
    });

    currentItems[index] = updated;
    window.localStorage.setItem('portal_price_items', JSON.stringify(currentItems));
    this._cache.priceItems = currentItems;
    this._cache.priceItemsTime = Date.now();

    // Remember every real price change so it can be shown in the item History modal
    if (updates.price !== undefined) {
      const oldPrice = parseFloat(current.price) || 0;
      const newPrice = parseFloat(updated.price) || 0;
      if (Math.abs(newPrice - oldPrice) >= 0.001) {
        this._recordPriceEvent({
          type: 'price',
          item_id: String(updated.id),
          item_name: updated.name,
          old_price: oldPrice,
          new_price: newPrice,
          changed_at: new Date().toISOString()
        });
      }
    }

    // Record manual stock adjustments/sets when stock is changed directly
    const stockChanged = (updates.stockPieces !== undefined || updates.stock_pieces !== undefined);
    if (stockChanged && !options.skipStockMovement) {
      const before = parseInt(current.stockPieces, 10) || 0;
      const after = parseInt(updated.stockPieces, 10) || 0;
      if (before !== after) {
        await this.recordStockMovement({
          price_item_id: updated.id,
          item_name: updated.name,
          movement_type: options.movementType || 'set',
          quantity_delta: after - before,
          quantity_before: before,
          quantity_after: after,
          note: options.stockNote || 'Stock updated from item edit'
        });
      }
    }

    if (this.isSupabase()) {
      try {
        const payload = {};
        if (updates.name !== undefined) payload.name = updated.name;
        if (updates.price !== undefined) payload.price = updated.price;
        if (updates.stockPieces !== undefined || updates.stock_pieces !== undefined) {
          payload.stock_pieces = updated.stockPieces;
        }
        if (updates.category !== undefined) payload.category = updated.category;
        if (updates.salesUnit !== undefined || updates.sales_unit !== undefined) {
          payload.sales_unit = updated.salesUnit;
        }
        if (updates.piecesPerUnit !== undefined || updates.pieces_per_unit !== undefined) {
          payload.pieces_per_unit = updated.piecesPerUnit;
        }
        if (updates.unitDescription !== undefined || updates.unit_description !== undefined) {
          payload.unit_description = updated.unitDescription;
        }

        await this._supabaseFetch(`price_items?id=eq.${id}`, {
          method: 'PATCH',
          headers: { 'Prefer': 'return=representation' },
          body: JSON.stringify(payload)
        });
      } catch (e) {
        console.warn('Could not update price item in Supabase:', e);
      }
    }

    return updated;
  },

  // Delete a price item permanently
  async deletePriceItem(id) {
    const currentItems = await this.getPriceItems();
    const filtered = currentItems.filter(it => String(it.id) !== String(id));
    window.localStorage.setItem('portal_price_items', JSON.stringify(filtered));
    this._cache.priceItems = filtered;
    this._cache.priceItemsTime = Date.now();

    if (this.isSupabase()) {
      try {
        await this._supabaseFetch(`price_items?id=eq.${id}`, {
          method: 'DELETE'
        });
      } catch (e) {
        console.warn('Could not delete price item from Supabase:', e);
      }
    }
    return true;
  },

  // Build a combined history for one price item:
  // - every recorded price change
  // - every past bill where this item was used
  async getItemPriceHistory(item) {
    if (!item) {
      return { currentPrice: 0, entries: [] };
    }

    const itemId = String(item.id);
    const itemName = (item.name || '').trim().toLowerCase();
    const entries = [];

    // 1. Recorded price changes
    this._getPriceHistoryLog().forEach(event => {
      if (String(event.item_id) !== itemId) return;
      entries.push({
        type: 'price',
        date: event.changed_at,
        oldPrice: parseFloat(event.old_price),
        price: parseFloat(event.new_price)
      });
    });

    // 2. Past bill usage (from cached or locally stored customers)
    let customers = this._cache.customers;
    if (!customers) {
      try {
        customers = JSON.parse(window.localStorage.getItem('portal_customers') || '[]');
      } catch (e) {
        customers = [];
      }
    }

    (customers || []).forEach(customer => {
      let billItems = (customer.items && customer.items.length)
        ? customer.items
        : ((this._cache.customerItems.get(customer.id) || {}).items || []);

      if (!Array.isArray(billItems)) return;

      billItems.forEach(billItem => {
        const billItemId = billItem.price_item_id != null ? String(billItem.price_item_id) : '';
        // Prefer the stable item id; fall back to the name only when the link is gone
        const matchById = billItemId !== '' && billItemId === itemId;
        const matchByName = billItemId === '' && (billItem.item_name || '').trim().toLowerCase() === itemName;
        if (!matchById && !matchByName) return;

        const unitPrice = parseFloat(billItem.unit_price);
        entries.push({
          type: 'bill',
          date: customer.customer_date || customer.created_at,
          time: customer.case_time || '',
          customerName: customer.name || '',
          price: isNaN(unitPrice) ? 0 : unitPrice,
          quantity: parseInt(billItem.quantity, 10) || 1,
          lineTotal: parseFloat(billItem.line_total) || 0
        });
      });
    });

    entries.sort((a, b) => {
      const aTime = new Date(a.date || 0).getTime() || 0;
      const bTime = new Date(b.date || 0).getTime() || 0;
      return bTime - aTime;
    });

    return {
      currentPrice: parseFloat(item.price) || 0,
      entries
    };
  },

  // Automatic Stock Deduction when customer items are added/saved
  async deductStock(billItems, context = {}) {
    if (!billItems || billItems.length === 0) return;
    const currentItems = await this.getPriceItems();
    let hasChanges = false;

    for (const billItem of billItems) {
      const itemId = String(billItem.price_item_id || billItem.id || '');
      const matchIndex = currentItems.findIndex(it => String(it.id) === itemId || it.name === (billItem.item_name || billItem.name));
      if (matchIndex !== -1) {
        const item = currentItems[matchIndex];
        const piecesPerUnit = item.piecesPerUnit || 1;
        const qty = parseInt(billItem.quantity, 10) || 1;
        const totalPiecesDeducted = piecesPerUnit * qty;
        const before = parseInt(item.stockPieces, 10) || 0;
        const newStock = Math.max(0, before - totalPiecesDeducted);
        item.stockPieces = newStock;
        hasChanges = true;

        if (this.isSupabase()) {
          try {
            await this._supabaseFetch(`price_items?id=eq.${item.id}`, {
              method: 'PATCH',
              headers: { 'Prefer': 'return=minimal' },
              body: JSON.stringify({ stock_pieces: newStock })
            });
          } catch (err) {
            console.warn('Could not update stock in Supabase:', err);
          }
        }

        if (before !== newStock) {
          await this.recordStockMovement({
            price_item_id: item.id,
            item_name: item.name,
            movement_type: 'sale',
            quantity_delta: newStock - before,
            quantity_before: before,
            quantity_after: newStock,
            note: context.customerName ? `Sold to ${context.customerName}` : 'Sold in customer bill',
            reference_id: context.customerId || null
          });
        }
      }
    }

    if (hasChanges) {
      window.localStorage.setItem('portal_price_items', JSON.stringify(currentItems));
      this._cache.priceItems = currentItems;
      this._cache.priceItemsTime = Date.now();
    }
    return currentItems;
  },

  // Get customers (cached 45s, deduplicated)
  async getCustomers() {
    const now = Date.now();
    if (this._cache.customers && (now - this._cache.customersTime < this.CACHE_TTL_MS)) {
      return this._cache.customers;
    }

    if (this.isSupabase()) {
      try {
        // Query customers with embedded customer_items for atomic, reliable bill items loading
        const data = await this._supabaseFetch(
          'customers?select=*,customer_items(*)&order=customer_date.desc,created_at.desc'
        );

        if (Array.isArray(data)) {
          const formattedData = data.map(c => {
            const rawItems = c.customer_items || c.items || [];
            const items = rawItems.map(it => ({
              id: it.id,
              customer_id: c.id,
              price_item_id: it.price_item_id || null,
              item_name: it.item_name || it.name || 'Item',
              quantity: parseInt(it.quantity, 10) || 1,
              unit_price: parseFloat(it.unit_price || it.price || 0),
              line_total: parseFloat(it.line_total || ((it.unit_price || it.price || 0) * (it.quantity || 1)))
            }));

            // Pre-seed items cache for instant customer card rendering
            this._cache.customerItems.set(c.id, {
              items,
              timestamp: now
            });

            const paidAmt = parseFloat(c.paid_amount != null ? c.paid_amount : 0);
            const totalAmt = parseFloat(c.total || 0);
            const payStatus = c.payment_status || (paidAmt >= totalAmt && totalAmt > 0 ? 'paid' : (paidAmt > 0 ? 'partial' : 'due'));
            return {
              ...c,
              paid_amount: paidAmt,
              payment_status: payStatus,
              items
            };
          });

          const dedupedData = deduplicateCustomerList(formattedData);
          this._cache.customers = dedupedData;
          this._cache.customersTime = now;
          window.localStorage.setItem('portal_customers', JSON.stringify(dedupedData));
          return dedupedData;
        }
      } catch (e) {
        console.warn('Supabase fetch failed for customers, using localStorage:', e);
      }
    }

    const local = JSON.parse(window.localStorage.getItem('portal_customers') || '[]');
    const deduped = deduplicateCustomerList(local);

    // Sort descending by date and creation
    deduped.sort((a, b) => {
      const dateDiff = new Date(b.customer_date || b.created_at) - new Date(a.customer_date || a.created_at);
      if (dateDiff !== 0) return dateDiff;
      return new Date(b.created_at || 0) - new Date(a.created_at || 0);
    });

    for (const c of deduped) {
      if (c.items && c.items.length > 0) {
        this._cache.customerItems.set(c.id, {
          items: c.items,
          timestamp: now
        });
      }
    }

    if (deduped.length !== local.length) {
      window.localStorage.setItem('portal_customers', JSON.stringify(deduped));
    }

    this._cache.customers = deduped;
    this._cache.customersTime = now;
    return deduped;
  },

  // Fetch bill items ONLY for the customer IDs actually shown on screen
  async getCustomerItemsForCustomers(customerIds) {
    if (!customerIds || customerIds.length === 0) return {};

    const now = Date.now();
    const result = {};
    const missingIds = [];

    // 1. Check in-memory cache first
    for (const id of customerIds) {
      const cached = this._cache.customerItems.get(id);
      if (cached && (now - cached.timestamp < this.CACHE_TTL_MS)) {
        result[id] = cached.items;
      } else {
        missingIds.push(id);
      }
    }

    if (missingIds.length === 0) {
      return result;
    }

    // 2. Check cached customers in memory or localStorage for customer.items
    const allCustomers = this._cache.customers || JSON.parse(window.localStorage.getItem('portal_customers') || '[]');
    const stillMissingIds = [];

    for (const mid of missingIds) {
      const cust = allCustomers.find(c => c && c.id === mid);
      if (cust && cust.items && cust.items.length > 0) {
        result[mid] = cust.items;
        this._cache.customerItems.set(mid, { items: cust.items, timestamp: now });
      } else {
        stillMissingIds.push(mid);
      }
    }

    if (stillMissingIds.length === 0) {
      return result;
    }

    // 3. If Supabase is active, query customer_items with clean unquoted UUIDs
    if (this.isSupabase()) {
      try {
        const validUuids = stillMissingIds.filter(isValidUuid);
        if (validUuids.length > 0) {
          const idFilter = validUuids.join(',');
          const items = await this._supabaseFetch(
            `customer_items?customer_id=in.(${idFilter})&select=*&order=created_at.asc`
          );
          
          const grouped = {};
          for (const mid of validUuids) {
            grouped[mid] = [];
          }
          for (const item of (items || [])) {
            if (!grouped[item.customer_id]) grouped[item.customer_id] = [];
            grouped[item.customer_id].push({
              id: item.id,
              customer_id: item.customer_id,
              price_item_id: item.price_item_id || null,
              item_name: item.item_name || item.name || 'Item',
              quantity: parseInt(item.quantity, 10) || 1,
              unit_price: parseFloat(item.unit_price || item.price || 0),
              line_total: parseFloat(item.line_total || ((item.unit_price || item.price || 0) * (item.quantity || 1))),
              sales_unit: item.sales_unit || null,
              pieces_per_unit: parseInt(item.pieces_per_unit, 10) || 1,
              unit_description: item.unit_description || ''
            });
          }

          for (const mid of validUuids) {
            result[mid] = grouped[mid] || [];
            this._cache.customerItems.set(mid, { items: result[mid], timestamp: now });
          }
        }
      } catch (e) {
        console.warn('Supabase fetch failed for customer_items, checking localStorage:', e);
      }
    }

    // Ensure all requested IDs have at least an empty array
    for (const id of customerIds) {
      if (!result[id]) {
        result[id] = [];
      }
    }

    return result;
  },

  // Save new customer with strict single-execution idempotency & stock deduction
  async saveCustomer(customerData, billItems) {
    if (this._isSavingCustomer) {
      console.warn('saveCustomer skipped: already saving');
      return null;
    }
    this._isSavingCustomer = true;

    try {
      const localCustomers = JSON.parse(window.localStorage.getItem('portal_customers') || '[]');

      // Rapid double-submission protection: if previous save occurred with identical details recently, return it
      const lastCust = localCustomers[0];
      if (lastCust) {
        const sameName = (lastCust.name || '').trim().toLowerCase() === (customerData.name || '').trim().toLowerCase();
        const samePhone = (lastCust.phone || '').trim() === (customerData.phone || '').trim();
        const sameProblem = (lastCust.problem || '').trim().toLowerCase() === (customerData.problem || '').trim().toLowerCase();
        const sameTotal = Math.abs(parseFloat(lastCust.total || 0) - parseFloat(customerData.total || 0)) < 0.01;
        const timeDiff = Math.abs(Date.now() - new Date(lastCust.created_at || 0).getTime());
        if (sameName && samePhone && sameProblem && sameTotal && timeDiff < 60000) {
          console.warn('Rapid duplicate customer save prevented:', lastCust.id);
          return lastCust;
        }
      }

      const nowIso = new Date().toISOString();
      const tempId = (typeof crypto !== 'undefined' && crypto.randomUUID) ? crypto.randomUUID() : 'c_' + Date.now() + '_' + Math.random().toString(36).substr(2, 5);

      const formattedItems = (billItems || []).map(it => ({
        id: it.id || ((typeof crypto !== 'undefined' && crypto.randomUUID) ? crypto.randomUUID() : 'it_' + Date.now() + '_' + Math.random().toString(36).substr(2, 5)),
        item_name: it.item_name || it.name,
        quantity: parseInt(it.quantity, 10) || 1,
        unit_price: parseFloat(it.unit_price || it.price || 0),
        line_total: parseFloat(it.line_total || ((it.unit_price || it.price || 0) * (it.quantity || 1))),
        price_item_id: it.price_item_id || it.id || null,
        sales_unit: it.sales_unit || null,
        pieces_per_unit: parseInt(it.pieces_per_unit, 10) || 1,
        unit_description: it.unit_description || ''
      }));

      const paidAmount = parseFloat(customerData.paid_amount != null ? customerData.paid_amount : 0);
      const totalAmount = parseFloat(customerData.total) || 0;
      const paymentStatus = customerData.payment_status || (paidAmount >= totalAmount && totalAmount > 0 ? 'paid' : (paidAmount > 0 ? 'partial' : 'due'));

      const newCustomer = {
        id: tempId,
        customer_date: customerData.customer_date,
        case_time: customerData.case_time || null,
        name: (customerData.name || '').trim(),
        phone: (customerData.phone || '').trim() || null,
        address: (customerData.address || '').trim() || null,
        problem: (customerData.problem || '').trim() || null,
        total: totalAmount,
        paid_amount: paidAmount,
        payment_status: paymentStatus,
        created_at: nowIso,
        updated_at: nowIso,
        items: formattedItems
      };

      // Automatic Stock Deduction
      if (billItems && billItems.length > 0) {
        await this.deductStock(billItems, { customerId: tempId, customerName: newCustomer.name });
      }

      // Save to localStorage immediately without duplicates
      const existingIdx = localCustomers.findIndex(c => c.id === tempId);
      const isNewLocalInsert = existingIdx === -1;
      if (isNewLocalInsert) {
        localCustomers.unshift(newCustomer);
        window.localStorage.setItem('portal_customers', JSON.stringify(localCustomers));
        await this.recordCustomerHistory({
          customer_id: newCustomer.id,
          customer_name: newCustomer.name || 'Customer',
          event_type: 'created',
          details: `New customer added${newCustomer.problem ? ` (${newCustomer.problem})` : ''}`,
          changed_fields: ''
        });
      }

      // Cache update for immediate responsive UI
      this._cache.customers = localCustomers;
      this._cache.customersTime = Date.now();
      this._cache.customerItems.set(tempId, {
        items: formattedItems,
        timestamp: Date.now()
      });

      if (this.isSupabase()) {
        try {
          const custPayload = {
            customer_date: newCustomer.customer_date,
            case_time: newCustomer.case_time,
            name: newCustomer.name,
            phone: newCustomer.phone,
            address: newCustomer.address,
            problem: newCustomer.problem,
            total: newCustomer.total,
            paid_amount: newCustomer.paid_amount,
            payment_status: newCustomer.payment_status
          };

          const custRes = await this._supabaseFetch('customers', {
            method: 'POST',
            headers: { 'Prefer': 'return=representation' },
            body: JSON.stringify(custPayload)
          });

          if (custRes && custRes[0]) {
            const savedCust = custRes[0];
            const realId = savedCust.id;

            if (billItems && billItems.length > 0) {
              const itemsPayload = billItems.map(it => {
                const pid = it.price_item_id || it.id;
                return {
                  customer_id: realId,
                  price_item_id: isValidUuid(pid) ? pid : null,
                  item_name: it.item_name || it.name,
                  quantity: parseInt(it.quantity, 10) || 1,
                  unit_price: parseFloat(it.unit_price || it.price || 0),
                  line_total: parseFloat(it.line_total || ((it.unit_price || it.price || 0) * (it.quantity || 1))),
                  sales_unit: it.sales_unit || 'piece',
                  pieces_per_unit: parseInt(it.pieces_per_unit, 10) || 1,
                  unit_description: it.unit_description || ''
                };
              });

              await this._supabaseFetch('customer_items', {
                method: 'POST',
                headers: { 'Prefer': 'return=minimal' },
                body: JSON.stringify(itemsPayload)
              });
            }

            // Update in-memory customer and local storage cleanly
            newCustomer.id = realId;

            // Cache items for the real Supabase ID
            this._cache.customerItems.set(realId, {
              items: formattedItems,
              timestamp: Date.now()
            });

            // Update localCustomers array
            const targetIdx = localCustomers.findIndex(c => c.id === tempId || c.id === realId);
            if (targetIdx !== -1) {
              localCustomers[targetIdx].id = realId;
              localCustomers[targetIdx].items = formattedItems;
            } else {
              localCustomers[0] = newCustomer;
            }

            window.localStorage.setItem('portal_customers', JSON.stringify(localCustomers));
            this._cache.customers = localCustomers;
            this._cache.customersTime = Date.now();

            return newCustomer;
          }
        } catch (e) {
          console.warn('Failed to insert customer to Supabase:', e);
        }
      }

      return newCustomer;
    } finally {
      this._isSavingCustomer = false;
    }
  },

  async updateCustomer(customerId, customerData, billItems) {
    try {
      const localCustomers = JSON.parse(window.localStorage.getItem('portal_customers') || '[]');
      const nowIso = new Date().toISOString();
      const paidAmount = parseFloat(customerData.paid_amount != null ? customerData.paid_amount : 0);
      const totalAmount = parseFloat(customerData.total) || 0;
      const paymentStatus = customerData.payment_status || (paidAmount >= totalAmount && totalAmount > 0 ? 'paid' : (paidAmount > 0 ? 'partial' : 'due'));

      const formattedItems = (billItems || []).map(it => ({
        id: it.id || ((typeof crypto !== 'undefined' && crypto.randomUUID) ? crypto.randomUUID() : 'it_' + Date.now() + '_' + Math.random().toString(36).substr(2, 5)),
        item_name: it.item_name || it.name,
        quantity: parseInt(it.quantity, 10) || 1,
        unit_price: parseFloat(it.unit_price || it.price || 0),
        line_total: parseFloat(it.line_total || ((it.unit_price || it.price || 0) * (it.quantity || 1))),
        price_item_id: it.price_item_id || it.id || null,
        sales_unit: it.sales_unit || null,
        pieces_per_unit: parseInt(it.pieces_per_unit, 10) || 1,
        unit_description: it.unit_description || ''
      }));

      const existingIdx = localCustomers.findIndex(c => String(c.id) === String(customerId));
      const oldCust = existingIdx !== -1 ? localCustomers[existingIdx] : null;

      const updatedCustomer = {
        id: customerId,
        customer_date: customerData.customer_date || (oldCust && oldCust.customer_date) || new Date().toISOString().slice(0, 10),
        case_time: customerData.case_time || (oldCust && oldCust.case_time) || null,
        name: (customerData.name || (oldCust && oldCust.name) || '').trim(),
        phone: (customerData.phone || (oldCust && oldCust.phone) || '').trim() || null,
        address: (customerData.address || (oldCust && oldCust.address) || '').trim() || null,
        problem: (customerData.problem || (oldCust && oldCust.problem) || '').trim() || null,
        total: totalAmount,
        paid_amount: paidAmount,
        payment_status: paymentStatus,
        created_at: (oldCust && oldCust.created_at) || nowIso,
        updated_at: nowIso,
        items: formattedItems
      };

      if (existingIdx !== -1) {
        localCustomers[existingIdx] = updatedCustomer;
      } else {
        localCustomers.unshift(updatedCustomer);
      }
      window.localStorage.setItem('portal_customers', JSON.stringify(localCustomers));

      this._cache.customers = localCustomers;
      this._cache.customersTime = Date.now();
      this._cache.customerItems.set(customerId, {
        items: formattedItems,
        timestamp: Date.now()
      });

      await this.recordCustomerHistory({
        customer_id: customerId,
        customer_name: updatedCustomer.name || 'Customer',
        event_type: 'updated',
        details: `Customer bill updated (Total: ₹${totalAmount}, Paid: ₹${paidAmount}, Status: ${paymentStatus})`,
        changed_fields: 'items, total, paid_amount, payment_status'
      });

      if (this.isSupabase() && isValidUuid(String(customerId))) {
        try {
          const updatePayload = {
            customer_date: updatedCustomer.customer_date,
            case_time: updatedCustomer.case_time,
            name: updatedCustomer.name,
            phone: updatedCustomer.phone,
            address: updatedCustomer.address,
            problem: updatedCustomer.problem,
            total: updatedCustomer.total,
            paid_amount: updatedCustomer.paid_amount,
            payment_status: updatedCustomer.payment_status,
            updated_at: nowIso
          };

          await this._supabaseFetch(`customers?id=eq.${customerId}`, {
            method: 'PATCH',
            headers: { 'Prefer': 'return=minimal' },
            body: JSON.stringify(updatePayload)
          });

          await this._supabaseFetch(`customer_items?customer_id=eq.${customerId}`, {
            method: 'DELETE',
            headers: { 'Prefer': 'return=minimal' }
          });

          if (formattedItems.length > 0) {
            const itemsPayload = formattedItems.map(it => {
              const pid = it.price_item_id || it.id;
              return {
                customer_id: customerId,
                price_item_id: isValidUuid(pid) ? pid : null,
                item_name: it.item_name || it.name,
                quantity: parseInt(it.quantity, 10) || 1,
                unit_price: parseFloat(it.unit_price || it.price || 0),
                line_total: parseFloat(it.line_total || ((it.unit_price || it.price || 0) * (it.quantity || 1))),
                sales_unit: it.sales_unit || 'piece',
                pieces_per_unit: parseInt(it.pieces_per_unit, 10) || 1,
                unit_description: it.unit_description || ''
              };
            });

            await this._supabaseFetch('customer_items', {
              method: 'POST',
              headers: { 'Prefer': 'return=minimal' },
              body: JSON.stringify(itemsPayload)
            });
          }
        } catch (supErr) {
          console.warn('Supabase updateCustomer sync failed, local data is preserved:', supErr);
        }
      }

      return updatedCustomer;
    } catch (err) {
      console.error('Error in updateCustomer:', err);
      throw err;
    }
  },

  async updateCustomerPayment(customerId, paidAmount) {
    try {
      const localCustomers = JSON.parse(window.localStorage.getItem('portal_customers') || '[]');
      const nowIso = new Date().toISOString();
      const existingIdx = localCustomers.findIndex(c => String(c.id) === String(customerId));
      if (existingIdx === -1) return null;

      const customer = localCustomers[existingIdx];
      const total = parseFloat(customer.total || 0);
      const paid = Math.max(0, parseFloat(paidAmount != null ? paidAmount : 0));
      const status = (paid >= total && total > 0) ? 'paid' : (paid > 0 ? 'partial' : 'due');

      customer.paid_amount = paid;
      customer.payment_status = status;
      customer.updated_at = nowIso;

      localCustomers[existingIdx] = customer;
      window.localStorage.setItem('portal_customers', JSON.stringify(localCustomers));
      this._cache.customers = localCustomers;
      this._cache.customersTime = Date.now();

      await this.recordCustomerHistory({
        customer_id: customerId,
        customer_name: customer.name || 'Customer',
        event_type: 'payment_update',
        details: `Payment updated: Collected ₹${paid} of ₹${total} (Remaining Due: ₹${Math.max(0, total - paid)}, Status: ${status.toUpperCase()})`,
        changed_fields: 'paid_amount, payment_status'
      });

      if (this.isSupabase() && isValidUuid(String(customerId))) {
        try {
          await this._supabaseFetch(`customers?id=eq.${customerId}`, {
            method: 'PATCH',
            headers: { 'Prefer': 'return=minimal' },
            body: JSON.stringify({
              paid_amount: paid,
              payment_status: status,
              updated_at: nowIso
            })
          });
        } catch (e) {
          console.warn('Supabase updateCustomerPayment sync failed, local state preserved:', e);
        }
      }

      return customer;
    } catch (err) {
      console.error('Error in updateCustomerPayment:', err);
      throw err;
    }
  },

  // Soft-delete a customer bill: archive to deleted_bills, remove from UI/localStorage
  async deleteCustomer(customerId) {
    try {
      const localCustomers = JSON.parse(window.localStorage.getItem('portal_customers') || '[]');
      const idx = localCustomers.findIndex(c => String(c.id) === String(customerId));
      if (idx === -1) return false;

      const customer = localCustomers[idx];
      const items = (this._cache.customerItems.get(customerId) || {}).items || customer.items || [];

      // Archive to Supabase deleted_bills if connected
      if (this.isSupabase() && isValidUuid(String(customerId))) {
        try {
          const payload = {
            original_customer_id: customerId,
            customer_data: JSON.stringify(customer),
            bill_items: JSON.stringify(items),
            deleted_at: new Date().toISOString(),
            deleted_reason: 'User deleted'
          };
          await this._supabaseFetch('deleted_bills', {
            method: 'POST',
            headers: { 'Prefer': 'return=minimal' },
            body: JSON.stringify(payload)
          });

          // Also delete from customers table in Supabase
          await this._supabaseFetch(`customer_items?customer_id=eq.${customerId}`, {
            method: 'DELETE',
            headers: { 'Prefer': 'return=minimal' }
          });
          await this._supabaseFetch(`customers?id=eq.${customerId}`, {
            method: 'DELETE',
            headers: { 'Prefer': 'return=minimal' }
          });
        } catch (e) {
          console.warn('Could not archive deleted bill to Supabase:', e);
        }
      }

      // Record history
      await this.recordCustomerHistory({
        customer_id: customerId,
        customer_name: customer.name || 'Customer',
        event_type: 'deleted',
        details: `Bill deleted (Total: ₹${customer.total || 0})`,
        changed_fields: ''
      });

      // Remove from local storage
      localCustomers.splice(idx, 1);
      window.localStorage.setItem('portal_customers', JSON.stringify(localCustomers));
      this._cache.customers = localCustomers;
      this._cache.customersTime = Date.now();
      this._cache.customerItems.delete(customerId);

      return true;
    } catch (err) {
      console.error('Error in deleteCustomer:', err);
      return false;
    }
  },

  // Invalidate cache
  invalidateCache() {
    this._cache.customers = null;
    this._cache.customersTime = 0;
    this._cache.priceItems = null;
    this._cache.priceItemsTime = 0;
    this._cache.customerItems.clear();
    this._cache.stockMovements = null;
    this._cache.stockMovementsTime = 0;
    this._cache.customerHistory = null;
    this._cache.customerHistoryTime = 0;
  }
};

window.DataStore.init();
