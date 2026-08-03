"use client";

import { useEffect, useState } from "react";
import type { Session, User } from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";

export function useAuth() {
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_e, s) => {
      setSession(s);
      setUser(s?.user ?? null);

      // Redirect to home if user explicitly logs out or token refresh fails (session expiry)
      if (_e === "SIGNED_OUT") {
        if (window.location.pathname !== "/") {
          window.location.href = "/";
        }
      }
    });

    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session);
      setUser(data.session?.user ?? null);
      setLoading(false);

      // Check if session is missing but we're on a protected route? 
      // Actually, middleware or the protected pages themselves should handle that,
      // but this handles the active expiry event.
    });

    return () => subscription.unsubscribe();
  }, []);

  return { session, user, loading };
}
