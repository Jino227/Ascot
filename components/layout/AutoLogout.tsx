"use client";

import { useEffect, useRef } from "react";
import { useAuth } from "@/hooks/use-auth";
import { useQuery } from "@tanstack/react-query";
import { checkIsAdmin } from "@/lib/actions";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export function AutoLogout() {
  const { user, loading: authLoading } = useAuth();
  
  const { data: adminData, isLoading: adminLoading } = useQuery({
    queryKey: ["isAdmin", user?.id],
    queryFn: () => checkIsAdmin(user!.id),
    enabled: !!user,
  });
  
  const isAdmin = adminData?.isAdmin ?? false;
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    // Only apply inactivity timeout to logged in non-admins.
    if (!user || authLoading || adminLoading || isAdmin) {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
      return;
    }

    const INACTIVITY_LIMIT = 10 * 60 * 1000; // 10 minutes

    const resetTimer = () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
      timeoutRef.current = setTimeout(() => {
        toast.error("You have been logged out due to inactivity.");
        supabase.auth.signOut();
      }, INACTIVITY_LIMIT);
    };

    // Initialize the timer
    resetTimer();

    // List of events that constitute "activity"
    const events = ['mousedown', 'mousemove', 'keypress', 'scroll', 'touchstart'];
    
    // Throttle the reset slightly to prevent excessive calls, though clearTimeout is very fast.
    let throttleTimer = false;
    const handleActivity = () => {
      if (!throttleTimer) {
        resetTimer();
        throttleTimer = true;
        setTimeout(() => { throttleTimer = false; }, 500);
      }
    };

    events.forEach(event => {
      window.addEventListener(event, handleActivity, { passive: true });
    });

    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
      events.forEach(event => {
        window.removeEventListener(event, handleActivity);
      });
    };
  }, [user, isAdmin, authLoading, adminLoading]);

  return null;
}
