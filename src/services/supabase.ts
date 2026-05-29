import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://mock-project.supabase.co';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'mock-anon-key';

export const isMockSupabase = !import.meta.env.VITE_SUPABASE_URL || !import.meta.env.VITE_SUPABASE_ANON_KEY;

if (isMockSupabase) {
  console.warn(
    'Supabase environment variables (VITE_SUPABASE_URL/VITE_SUPABASE_ANON_KEY) are missing. Running in mock offline mode.'
  );
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
