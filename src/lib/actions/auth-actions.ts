"use server";

import { createClient } from "@/lib/supabase/server";

export async function signInAnonymously() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (user) {
    const { data: profile } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", user.id)
      .single();
    return { user, profile };
  }

  const { data, error } = await supabase.auth.signInAnonymously();

  if (error) {
    return { error: error.message };
  }

  // Wait briefly for trigger to create profile
  await new Promise((r) => setTimeout(r, 500));

  const { data: profile } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", data.user!.id)
    .single();

  return { user: data.user, profile };
}

export async function getCurrentUser() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return null;

  const { data: profile } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .single();

  return { user, profile };
}

export async function updateNickname(nickname: string) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return { error: "로그인이 필요합니다" };

  const { error } = await supabase
    .from("profiles")
    .update({ nickname })
    .eq("id", user.id);

  if (error) return { error: error.message };
  return { success: true };
}
