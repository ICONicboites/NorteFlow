import { createClient } from "@supabase/supabase-js";

// Vite environment variables:
// - VITE_SUPABASE_URL: your project ref URL (e.g. https://xxxx.supabase.co)
// - VITE_SUPABASE_ANON_KEY: anon/public key from Supabase Dashboard -> Settings -> API
// Put them in `.env.local` at the repo root.
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL as string | undefined;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY as
  | string
  | undefined;

if (!supabaseUrl) {
  throw new Error("Missing VITE_SUPABASE_URL in .env.local");
}
if (!supabaseAnonKey) {
  throw new Error("Missing VITE_SUPABASE_ANON_KEY in .env.local");
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  db: { schema: "public" },
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true,
  },
});

