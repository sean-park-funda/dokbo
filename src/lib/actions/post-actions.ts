"use server";

import { createClient } from "@/lib/supabase/server";
import { postSchema } from "@/lib/validators";
import { revalidatePath } from "next/cache";

export async function createPost(formData: FormData) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { error: "로그인이 필요합니다" };
  }

  const rawData = {
    restaurant_name: formData.get("restaurant_name") as string,
    menu_item: formData.get("menu_item") as string,
    location: formData.get("location") as string,
    category: formData.get("category") as string,
    claim: formData.get("claim") as string,
  };

  const result = postSchema.safeParse(rawData);
  if (!result.success) {
    const firstError = result.error.issues[0];
    return { error: firstError.message };
  }

  const { data, error } = await supabase
    .from("posts")
    .insert({
      ...result.data,
      author_id: user.id,
    })
    .select()
    .single();

  if (error) {
    return { error: error.message };
  }

  revalidatePath("/");
  return { data };
}

export async function getPosts(category?: string) {
  const supabase = await createClient();

  let query = supabase
    .from("posts")
    .select("*, profiles!posts_author_id_fkey(nickname, avatar_emoji)")
    .eq("status", "active")
    .order("created_at", { ascending: false });

  if (category && category !== "전체") {
    query = query.eq("category", category);
  }

  const { data, error } = await query.limit(50);

  if (error) {
    return { error: error.message, data: [] };
  }

  return { data: data || [] };
}

export async function getPost(id: string) {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("posts")
    .select("*, profiles!posts_author_id_fkey(nickname, avatar_emoji)")
    .eq("id", id)
    .single();

  if (error) {
    return { error: error.message };
  }

  return { data };
}
