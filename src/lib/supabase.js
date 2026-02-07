import supabaseClient from '../supabase/supabase';

// Re-export the singleton client from the standard location
export const supabase = supabaseClient;

export const isSupabaseConfigured = Boolean(
  import.meta.env.VITE_SUPABASE_URL && 
  import.meta.env.VITE_SUPABASE_ANON_KEY
);