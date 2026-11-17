// Configuration for Supabase
// Credentials are read in this order:
//   1. Deployment environment variables exposed by /api/config (Render)
//   2. Values saved in-app via Cloud Sync (browser localStorage)
//   3. Default production project credentials (fucneugflbekdybbdfes)

(function () {
  'use strict';

  const DEFAULT_URL = 'https://fucneugflbekdybbdfes.supabase.co';
  const DEFAULT_KEY = 'sb_publishable_uMmTd-bOmBUBQKRWSR1_fQ_KFPuC19_';
  const PLACEHOLDER_URL = 'YOUR_SUPABASE_URL';
  const PLACEHOLDER_KEY = 'YOUR_SUPABASE_ANON_KEY';
  const OLD_PROJECT_REF = 'owywsfvejuugtihsessz';

  function isValidUrl(url) {
    return Boolean(
      url &&
      typeof url === 'string' &&
      url.startsWith('https://') &&
      !url.includes(PLACEHOLDER_URL)
    );
  }

  function isValidKey(key) {
    return Boolean(
      key &&
      typeof key === 'string' &&
      key.trim().length > 10 &&
      !key.includes(PLACEHOLDER_KEY)
    );
  }

  // Clear stale cached project URL if user previously connected to the old project
  let savedUrl = window.localStorage.getItem('portal_supabase_url') || '';
  let savedKey = window.localStorage.getItem('portal_supabase_anon_key') || '';

  if (savedUrl && savedUrl.includes(OLD_PROJECT_REF)) {
    window.localStorage.removeItem('portal_supabase_url');
    window.localStorage.removeItem('portal_supabase_anon_key');
    savedUrl = '';
    savedKey = '';
  }

  const activeUrl = isValidUrl(savedUrl) ? savedUrl : DEFAULT_URL;
  const activeKey = isValidKey(savedKey) ? savedKey : DEFAULT_KEY;

  window.CONFIG = {
    SUPABASE_URL: activeUrl,
    SUPABASE_ANON_KEY: activeKey,
    source: isValidUrl(savedUrl) ? 'localStorage' : 'default',

    // Checks if valid Supabase credentials have been configured
    isSupabaseConfigured() {
      const url = this.SUPABASE_URL;
      const key = this.SUPABASE_ANON_KEY;
      return Boolean(
        url &&
        key &&
        url.startsWith('https://') &&
        !url.includes(PLACEHOLDER_URL) &&
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
    applyServerConfig(serverConfig) {
      if (!serverConfig) return false;

      const url = (
        serverConfig.SUPABASE_URL ||
        serverConfig.NEXT_PUBLIC_SUPABASE_URL ||
        ''
      ).trim();

      const key = (
        serverConfig.SUPABASE_ANON_KEY ||
        serverConfig.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ||
        serverConfig.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
        ''
      ).trim();

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

  // Fetch deployment configuration from Render /api/config
  fetch('/api/config', { credentials: 'omit' })
    .then((response) => (response.ok ? response.json() : null))
    .then((data) => {
      if (data) window.CONFIG.applyServerConfig(data);
    })
    .catch(() => {
      // Static hosting or offline: default values remain active
    });
})();
