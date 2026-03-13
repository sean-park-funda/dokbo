"use client";

import { useEffect, useState, useCallback } from "react";
import { createClient } from "@/lib/supabase/client";
import { signInAnonymously } from "@/lib/actions/auth-actions";

interface AuthGateProps {
  children: React.ReactNode;
}

export function AuthGate({ children }: AuthGateProps) {
  const [ready, setReady] = useState(false);
  const [loading, setLoading] = useState(true);

  const checkAuth = useCallback(async () => {
    const supabase = createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (user) {
      setReady(true);
      setLoading(false);
      return;
    }

    const result = await signInAnonymously();
    if (result && !("error" in result && !result.user)) {
      setReady(true);
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[200px]">
        <div className="flex flex-col items-center gap-3">
          <div className="text-4xl animate-bounce">🍚</div>
          <p className="text-sm text-[#1A1A1A]/40">맛집 불러오는 중...</p>
        </div>
      </div>
    );
  }

  if (!ready) {
    return (
      <div className="flex items-center justify-center min-h-[200px]">
        <div className="text-center px-4">
          <div className="text-4xl mb-3">😅</div>
          <p className="text-sm text-[#1A1A1A]/60 mb-3">
            접속에 문제가 생겼어요
          </p>
          <button
            onClick={checkAuth}
            className="px-4 py-2 bg-[#E54D2E] text-white rounded-xl text-sm font-medium"
          >
            다시 시도
          </button>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
