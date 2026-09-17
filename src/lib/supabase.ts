import { createClient, type SupabaseClient } from "@supabase/supabase-js";

/**
 * Supabase client (anon key only — safe for the browser).
 * Service-role / Resend keys live ONLY in Edge Function secrets.
 */

const url = import.meta.env.VITE_SUPABASE_URL as string | undefined;
const anon = import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined;

export const isSupabaseConfigured = (): boolean => Boolean(url && anon);

let client: SupabaseClient | null = null;

export function supabase(): SupabaseClient {
  if (!isSupabaseConfigured()) {
    throw new Error(
      "Supabase is not configured. Add VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY (see .env.example)."
    );
  }
  if (!client) client = createClient(url!, anon!);
  return client;
}
