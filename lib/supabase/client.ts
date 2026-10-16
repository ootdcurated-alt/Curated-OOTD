import { createBrowserClient } from "@supabase/ssr";

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_KEY = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;

function createMockClient() {
  return {
    auth: {
      getClaims: async () => ({ data: null, error: null }),
      getUser: async () => ({ data: { user: null }, error: null }),
      getSession: async () => ({ data: { session: null }, error: null }),
      signInWithPassword: async () => ({ data: null, error: { message: "Supabase not configured" } }),
      signInWithOAuth: async () => ({ data: null, error: { message: "Supabase not configured" } }),
      signUp: async () => ({ data: null, error: { message: "Supabase not configured" } }),
      signOut: async () => ({ error: null }),
      onAuthStateChange: () => ({ data: { subscription: { unsubscribe: () => {} } } }),
    },
    from: () => ({
      select: () => ({ data: null, error: null, eq: () => ({ data: null, error: null, maybeSingle: async () => ({ data: null, error: null }) }), order: () => ({ data: [], error: null }), maybeSingle: async () => ({ data: null, error: null }) }),
      insert: () => ({ data: null, error: null }),
      upsert: () => ({ data: null, error: null }),
      update: () => ({ data: null, error: null, eq: () => ({ data: null, error: null }) }),
      delete: () => ({ data: null, error: null, eq: () => ({ data: null, error: null }) }),
    }),
  } as any;
}

export function createClient() {
  if (!SUPABASE_URL || !SUPABASE_KEY) {
    return createMockClient();
  }
  return createBrowserClient(SUPABASE_URL, SUPABASE_KEY);
}
