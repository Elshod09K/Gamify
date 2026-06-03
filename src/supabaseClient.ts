import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || '';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

// Fallback warning if keys are missing
if (!supabaseUrl || !supabaseAnonKey) {
  console.warn(
    'Supabase keys are missing! Set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY in your environment. Falling back to local storage.'
  );
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
export const hasSupabaseKeys = !!supabaseUrl && !!supabaseAnonKey;
export default supabase;
