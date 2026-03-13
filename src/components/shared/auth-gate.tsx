"use client";

import { useEffect, useCallback } from "react";
import { createClient } from "@/lib/supabase/client";
import { useAuthStore } from "@/lib/stores/auth-store";
import { LoginModal } from "@/components/shared/login-modal";

interface AuthGateProps {
  children: React.ReactNode;
}

export function AuthGate({ children }: AuthGateProps) {
  const { setUser, setProfile, setIsLoading, clear } = useAuthStore();

  const loadSession = useCallback(async () => {
    try {
      const supabase = createClient();
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (user) {
        setUser({ id: user.id, email: user.email, is_anonymous: user.is_anonymous });
        const { data: profile } = await supabase
          .from("profiles")
          .select("id, nickname, avatar_emoji, avatar_url, bio")
          .eq("id", user.id)
          .single();
        if (profile) {
          setProfile(profile);
        }
      } else {
        clear();
      }
    } catch {
      // Auth is optional - app works without it (read-only)
    } finally {
      setIsLoading(false);
    }
  }, [setUser, setProfile, setIsLoading, clear]);

  useEffect(() => {
    loadSession();

    const supabase = createClient();
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session?.user) {
        setUser({
          id: session.user.id,
          email: session.user.email,
          is_anonymous: session.user.is_anonymous,
        });
        // Reload profile
        supabase
          .from("profiles")
          .select("id, nickname, avatar_emoji, avatar_url, bio")
          .eq("id", session.user.id)
          .single()
          .then(({ data }) => {
            if (data) setProfile(data);
          });
      } else {
        clear();
      }
    });

    return () => subscription.unsubscribe();
  }, [loadSession, setUser, setProfile, clear]);

  return (
    <>
      {children}
      <LoginModal />
    </>
  );
}
