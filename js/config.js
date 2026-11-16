// Configuration for Supabase
// Replace placeholders with your actual Supabase credentials or configure them in-app

window.CONFIG = {
  // Replace these placeholders with your actual Supabase Project URL and anon public key
  SUPABASE_URL: window.localStorage.getItem('portal_supabase_url') || 'YOUR_SUPABASE_URL',
  SUPABASE_ANON_KEY: window.localStorage.getItem('portal_supabase_anon_key') || 'YOUR_SUPABASE_ANON_KEY',

  // Checks if valid Supabase credentials have been configured
  isSupabaseConfigured() {
    const url = this.SUPABASE_URL;
    const key = this.SUPABASE_ANON_KEY;
    return Boolean(
      url && 
      key && 
      !url.includes('YOUR_SUPABASE_URL') && 
      url.startsWith('https://') &&
      !key.includes('YOUR_SUPABASE_ANON_KEY')
    );
  },

  // Update credentials at runtime if provided
  updateCredentials(url, key) {
    this.SUPABASE_URL = (url || '').trim();
    this.SUPABASE_ANON_KEY = (key || '').trim();
    window.localStorage.setItem('portal_supabase_url', this.SUPABASE_URL);
    window.localStorage.setItem('portal_supabase_anon_key', this.SUPABASE_ANON_KEY);
  }
};
