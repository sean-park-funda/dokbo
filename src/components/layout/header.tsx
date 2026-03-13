"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";

interface Profile {
  nickname: string;
  avatar_emoji: string;
}

export function Header() {
  const [profile, setProfile] = useState<Profile | null>(null);

  useEffect(() => {
    const supabase = createClient();

    async function loadProfile() {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (user) {
        const { data } = await supabase
          .from("profiles")
          .select("nickname, avatar_emoji")
          .eq("id", user.id)
          .single();
        if (data) setProfile(data);
      }
    }

    loadProfile();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(() => {
      loadProfile();
    });

    return () => subscription.unsubscribe();
  }, []);

  return (
    <header className="sticky top-0 z-50 bg-[#FFFAF5]/80 backdrop-blur-md border-b border-orange-100">
      <div className="max-w-lg mx-auto px-4 h-14 flex items-center justify-between">
        <h1 className="text-xl font-extrabold tracking-tight">
          <span className="text-[#E54D2E]">독보적</span>
        </h1>
        {profile && (
          <div className="flex items-center gap-2">
            <span className="text-sm text-[#1A1A1A]/60 font-medium truncate max-w-[120px]">
              {profile.nickname}
            </span>
            <div className="w-8 h-8 rounded-full bg-orange-100 flex items-center justify-center text-lg">
              {profile.avatar_emoji}
            </div>
          </div>
        )}
      </div>
    </header>
  );
}
