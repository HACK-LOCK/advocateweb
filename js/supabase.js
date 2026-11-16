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
    name: 'Notary (₹450 Base)',
    category: 'Notary',
    price: 440,
    baseCost: 450,
    salesUnit: 'sheet',
    piecesPerUnit: 108,
    stockPieces: 108,
    unitDescription: '1 sheet = 108 pcs · ₹450 base · sold at ₹440 per sheet',
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
  'notary - rs 540', 'notary (₹540)', 'notary (₹450 base)',
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
  },
  CACHE_TTL_MS: 45000, // 45 seconds

  // Local price-change history (used by the item History modal)
  _priceHistoryKey: 'portal_price_history',

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
      stockPieces: options.stockPieces !== undefined ? parseInt(options.stockPieces, 10) : 100,
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
          return resNorm;
        }
      } catch (e) {
        console.warn('Could not save price item to Supabase:', e);
      }
    }

    return newItem;
  },

  // Update item price, stock level, name, or metadata (Price Override & Direct Stock Maintenance)
  async updatePriceItem(id, updates = {}) {
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
  async deductStock(billItems) {
    if (!billItems || billItems.length === 0) return;
    const currentItems = await this.getPriceItems();
    let hasChanges = false;

    for (const billItem of billItems) {
      const itemId = String(billItem.price_item_id || billItem.id || '');
      const matchIndex = currentItems.findIndex(it => String(it.id) === itemId || it.name === billItem.item_name);
      if (matchIndex !== -1) {
        const item = currentItems[matchIndex];
        const piecesPerUnit = item.piecesPerUnit || 1;
        const qty = billItem.quantity || 1;
        const totalPiecesDeducted = piecesPerUnit * qty;
        const newStock = Math.max(0, (item.stockPieces || 0) - totalPiecesDeducted);
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

            return {
              ...c,
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

      const newCustomer = {
        id: tempId,
        customer_date: customerData.customer_date,
        case_time: customerData.case_time || null,
        name: (customerData.name || '').trim(),
        phone: (customerData.phone || '').trim() || null,
        address: (customerData.address || '').trim() || null,
        problem: (customerData.problem || '').trim() || null,
        total: parseFloat(customerData.total) || 0,
        created_at: nowIso,
        updated_at: nowIso,
        items: formattedItems
      };

      // Automatic Stock Deduction
      if (billItems && billItems.length > 0) {
        await this.deductStock(billItems);
      }

      // Save to localStorage immediately without duplicates
      const existingIdx = localCustomers.findIndex(c => c.id === tempId);
      if (existingIdx === -1) {
        localCustomers.unshift(newCustomer);
        window.localStorage.setItem('portal_customers', JSON.stringify(localCustomers));
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
            total: newCustomer.total
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

  // Invalidate cache
  invalidateCache() {
    this._cache.customers = null;
    this._cache.customersTime = 0;
    this._cache.priceItems = null;
    this._cache.priceItemsTime = 0;
    this._cache.customerItems.clear();
  }
};

window.DataStore.init();
