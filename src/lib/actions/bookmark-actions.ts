"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

export async function toggleBookmark(postId: string) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { error: "로그인이 필요합니다" };
  }

  const { data: existing } = await supabase
    .from("bookmarks")
    .select("id")
    .eq("user_id", user.id)
    .eq("post_id", postId)
    .maybeSingle();

  if (existing) {
    await supabase.from("bookmarks").delete().eq("id", existing.id);
    revalidatePath("/my");
    return { bookmarked: false };
  }

  const { error } = await supabase.from("bookmarks").insert({
    user_id: user.id,
    post_id: postId,
  });

  if (error) {
    return { error: error.message };
  }

  revalidatePath("/my");
  return { bookmarked: true };
}

export async function getMyBookmarks() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { data: [] };
  }

  const { data, error } = await supabase
    .from("bookmarks")
    .select("post_id, posts(*, profiles!posts_author_id_fkey(nickname, avatar_emoji))")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false });

  if (error) {
    return { error: error.message, data: [] };
  }

  return { data: data?.map((b) => b.posts).filter(Boolean) || [] };
}

export async function isBookmarked(postId: string) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return false;

  const { data } = await supabase
    .from("bookmarks")
    .select("id")
    .eq("user_id", user.id)
    .eq("post_id", postId)
    .maybeSingle();

  return !!data;
}
