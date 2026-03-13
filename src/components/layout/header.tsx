"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useAuthStore } from "@/lib/stores/auth-store";
import { createClient } from "@/lib/supabase/client";
import { Search, Bell } from "lucide-react";

export function Header() {
  const { user, profile, openLoginModal } = useAuthStore();
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    if (!user) return;

    const supabase = createClient();
    supabase
      .from("notifications")
      .select("id", { count: "exact", head: true })
      .eq("user_id", user.id)
      .eq("is_read", false)
      .then(({ count }) => {
        if (count !== null) setUnreadCount(count);
      });
  }, [user]);

  return (
    <header className="sticky top-0 z-50 bg-[#FFFAF5]/80 backdrop-blur-md border-b border-orange-100">
      <div className="max-w-lg mx-auto px-4 h-14 flex items-center justify-between">
        <Link href="/">
          <h1 className="text-xl font-extrabold tracking-tight">
            <span className="text-[#E54D2E]">독보적</span>
          </h1>
        </Link>

        <div className="flex items-center gap-2">
          <Link
            href="/search"
            className="w-8 h-8 rounded-full flex items-center justify-center text-[#1A1A1A]/50 hover:text-[#1A1A1A]/80 hover:bg-orange-50 transition-colors"
          >
            <Search className="w-[18px] h-[18px]" />
          </Link>

          {user && (
            <Link
              href="/notifications"
              className="relative w-8 h-8 rounded-full flex items-center justify-center text-[#1A1A1A]/50 hover:text-[#1A1A1A]/80 hover:bg-orange-50 transition-colors"
            >
              <Bell className="w-[18px] h-[18px]" />
              {unreadCount > 0 && (
                <span className="absolute -top-0.5 -right-0.5 min-w-[16px] h-4 rounded-full bg-[#E54D2E] text-white text-[10px] font-bold flex items-center justify-center px-1">
                  {unreadCount > 99 ? "99+" : unreadCount}
                </span>
              )}
            </Link>
          )}

          {profile ? (
            <Link href="/my" className="flex items-center gap-2">
              <span className="text-sm text-[#1A1A1A]/60 font-medium truncate max-w-[120px]">
                {profile.nickname}
              </span>
              <div className="w-8 h-8 rounded-full bg-orange-100 flex items-center justify-center text-lg">
                {profile.avatar_emoji}
              </div>
            </Link>
          ) : (
            <button
              onClick={openLoginModal}
              className="text-sm font-semibold text-[#E54D2E] hover:text-[#D4432A] transition-colors px-2 py-1"
            >
              로그인
            </button>
          )}
        </div>
      </div>
    </header>
  );
}
