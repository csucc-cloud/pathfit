// src/lib/supabaseClient.js
import { createClient } from '@supabase/supabase-js';

// Access environment variables
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

/**
 * GUARDED CLIENT LOGIC:
 * We check if variables exist. If they don't (like during a Vercel build 
 * or local setup), we provide a placeholder to prevent the app from crashing.
 */
const isConfigured = supabaseUrl && supabaseAnonKey;

if (!isConfigured) {
  console.warn(
    "⚠️ PATHFit Pro: Supabase credentials are missing. " +
    "Check your .env.local file or Vercel Environment Variables."
  );
}

export const supabase = createClient(
  supabaseUrl || 'https://placeholder-project.supabase.co',
  supabaseAnonKey || 'placeholder-anon-key'
);

/**
 * EXPORTING UTILITIES:
 * This ensures you can easily check the session or handle auth 
 * across your 500+ student accounts from any component.
 */
export const getActiveSession = async () => {
  const { data: { session }, error } = await supabase.auth.getSession();
  if (error) return null;
  return session;
};
