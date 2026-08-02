import { createClient } from "@supabase/supabase-js";

function createSupabaseAdmin() {
  const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const SUPABASE_SERVICE_ROLE_KEY = process.env.NEXT_PUBLIC_SUPABASE_SERVICE_ROLE_KEY!;
  if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
    throw new Error("Missing Supabase server env vars");
  }
  return createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}

let _admin: ReturnType<typeof createSupabaseAdmin> | undefined;

export const supabaseAdmin = new Proxy({} as ReturnType<typeof createSupabaseAdmin>, {
  get(_, prop, receiver) {
    if (!_admin) _admin = createSupabaseAdmin();
    return Reflect.get(_admin, prop, receiver);
  },
});
