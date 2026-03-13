"use client";

import { useEffect, useCallback } from "react";
import { createClient } from "@/lib/supabase/client";
import { signInAnonymously } from "@/lib/actions/auth-actions";

interface AuthGateProps {
  children: React.ReactNode;
}

export function AuthGate({ children }: AuthGateProps) {
  const tryAuth = useCallback(async () => {
    try {
      const supabase = createClient();
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (user) return;
      await signInAnonymously();
    } catch {
      // Auth is optional - app works without it (read-only)
    }
  }, []);

  useEffect(() => {
    tryAuth();
  }, [tryAuth]);

  return <>{children}</>;
}
