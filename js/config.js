// Configuration for Supabase
// Credentials are read in this order:
//   1. Values saved in-app via Cloud Sync (browser localStorage)
//   2. Deployment environment variables exposed by /api/config (Render)
//   3. Placeholders (offline localStorage mode)

(function () {
  'use strict';

  const PLACEHOLDER_URL = 'YOUR_SUPABASE_URL';
  const PLACEHOLDER_KEY = 'YOUR_SUPABASE_ANON_KEY';

  function isValidUrl(url) {
    return Boolean(url && url.startsWith('https://') && !url.includes(PLACEHOLDER_URL));
  }

  function isValidKey(key) {
    return Boolean(key && !key.includes(PLACEHOLDER_KEY));
  }

  const savedUrl = window.localStorage.getItem('portal_supabase_url') || '';
  const savedKey = window.localStorage.getItem('portal_supabase_anon_key') || '';

  window.CONFIG = {
    SUPABASE_URL: isValidUrl(savedUrl) ? savedUrl : PLACEHOLDER_URL,
    SUPABASE_ANON_KEY: isValidKey(savedKey) ? savedKey : PLACEHOLDER_KEY,
    source: 'localStorage',

    // Checks if valid Supabase credentials have been configured
    isSupabaseConfigured() {
      const url = this.SUPABASE_URL;
      const key = this.SUPABASE_ANON_KEY;
      return Boolean(
        url &&
        key &&
        !url.includes(PLACEHOLDER_URL) &&
        url.startsWith('https://') &&
        !key.includes(PLACEHOLDER_KEY)
      );
    },

    // Update credentials at runtime if provided
    updateCredentials(url, key) {
      this.SUPABASE_URL = (url || '').trim();
      this.SUPABASE_ANON_KEY = (key || '').trim();
      this.source = 'localStorage';
      window.localStorage.setItem('portal_supabase_url', this.SUPABASE_URL);
      window.localStorage.setItem('portal_supabase_anon_key', this.SUPABASE_ANON_KEY);
      window.dispatchEvent(new CustomEvent('portal:config-updated'));
    },

    // Apply credentials supplied by the server through environment variables.
    // In-app saved credentials always take precedence.
    applyServerConfig(serverConfig) {
      if (!serverConfig || this.isSupabaseConfigured()) return false;

      const url = (serverConfig.SUPABASE_URL || '').trim();
      const key = (serverConfig.SUPABASE_ANON_KEY || '').trim();
      if (!isValidUrl(url) || !isValidKey(key)) return false;

      this.SUPABASE_URL = url;
      this.SUPABASE_ANON_KEY = key;
      this.source = 'environment';

      if (window.DataStore && typeof window.DataStore.invalidateCache === 'function') {
        window.DataStore.invalidateCache();
      }
      window.dispatchEvent(new CustomEvent('portal:config-updated'));
      return true;
    }
  };

  // Fetch deployment configuration. Browsers cannot read process.env directly.
  fetch('/api/config', { credentials: 'omit' })
    .then((response) => (response.ok ? response.json() : null))
    .then((data) => {
      if (data) window.CONFIG.applyServerConfig(data);
    })
    .catch(() => {
      // Offline or static hosting: keep localStorage / placeholder values.
    });
})();
