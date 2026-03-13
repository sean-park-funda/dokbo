"use server";

import { createClient } from "@/lib/supabase/server";

export async function searchPosts(query: string) {
  if (!query || query.trim().length === 0) {
    return { data: [] };
  }

  const supabase = await createClient();
  const searchTerm = `%${query.trim()}%`;

  const { data, error } = await supabase
    .from("posts")
    .select("*, profiles!posts_author_id_fkey(nickname, avatar_emoji)")
    .eq("status", "active")
    .or(
      `restaurant_name.ilike.${searchTerm},menu_item.ilike.${searchTerm},location.ilike.${searchTerm},claim.ilike.${searchTerm}`
    )
    .order("created_at", { ascending: false })
    .limit(30);

  if (error) {
    return { error: error.message, data: [] };
  }

  return { data: data || [] };
}
