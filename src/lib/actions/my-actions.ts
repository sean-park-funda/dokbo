"use server";

import { createClient } from "@/lib/supabase/server";

export async function getMyPosts() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return { data: [] };

  const { data, error } = await supabase
    .from("posts")
    .select("*, profiles!posts_author_id_fkey(nickname, avatar_emoji)")
    .eq("author_id", user.id)
    .eq("status", "active")
    .order("created_at", { ascending: false });

  if (error) return { error: error.message, data: [] };
  return { data: data || [] };
}

export async function getMyVotes() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return { data: [] };

  // Get posts I voted on
  const { data: postVotes } = await supabase
    .from("votes")
    .select("post_id")
    .eq("user_id", user.id)
    .not("post_id", "is", null);

  if (!postVotes || postVotes.length === 0) return { data: [] };

  const postIds = postVotes.map((v) => v.post_id).filter(Boolean);

  const { data, error } = await supabase
    .from("posts")
    .select("*, profiles!posts_author_id_fkey(nickname, avatar_emoji)")
    .in("id", postIds)
    .eq("status", "active")
    .order("created_at", { ascending: false });

  if (error) return { error: error.message, data: [] };
  return { data: data || [] };
}

export async function getMyChallenges() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return { data: [] };

  // Get challenges I made, and their associated posts
  const { data: challenges } = await supabase
    .from("challenges")
    .select("post_id")
    .eq("author_id", user.id);

  if (!challenges || challenges.length === 0) return { data: [] };

  const postIds = [...new Set(challenges.map((c) => c.post_id))];

  const { data, error } = await supabase
    .from("posts")
    .select("*, profiles!posts_author_id_fkey(nickname, avatar_emoji)")
    .in("id", postIds)
    .eq("status", "active")
    .order("created_at", { ascending: false });

  if (error) return { error: error.message, data: [] };
  return { data: data || [] };
}
