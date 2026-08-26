import { createClient } from '@supabase/supabase-js';

// Read Supabase credentials safely from Vite environment variables or configured project
const DEFAULT_SUPABASE_URL = 'https://pbyynherzipobltfejhj.supabase.co';
const DEFAULT_SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBieXluaGVyemlwb2JsdGZlamhqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODc0ODA4MDYsImV4cCI6MjEwMzA1NjgwNn0.7PEdOP7ZxSY3ilpEOWR1yKw8MGk7njdttjFq3ESiSko';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || DEFAULT_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || DEFAULT_SUPABASE_ANON_KEY;

export const isSupabaseConfigured = true;

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true,
    storage: typeof window !== 'undefined' ? window.localStorage : undefined,
  },
  realtime: {
    params: {
      eventsPerSecond: 10,
    },
  },
});
