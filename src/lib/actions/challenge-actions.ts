"use server";

import { createClient } from "@/lib/supabase/server";
import { challengeSchema } from "@/lib/validators";
import { revalidatePath } from "next/cache";

export async function createChallenge(postId: string, formData: FormData) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { error: "로그인이 필요합니다" };
  }

  const rawData = {
    type: formData.get("type") as string,
    reason: formData.get("reason") as string,
    alt_restaurant_name: (formData.get("alt_restaurant_name") as string) || undefined,
    alt_menu_item: (formData.get("alt_menu_item") as string) || undefined,
    alt_location: (formData.get("alt_location") as string) || undefined,
  };

  const result = challengeSchema.safeParse(rawData);
  if (!result.success) {
    const firstError = result.error.issues[0];
    return { error: firstError.message };
  }

  const { data, error } = await supabase
    .from("challenges")
    .insert({
      post_id: postId,
      author_id: user.id,
      type: result.data.type,
      reason: result.data.reason,
      alt_restaurant_name: result.data.alt_restaurant_name || null,
      alt_menu_item: result.data.alt_menu_item || null,
      alt_location: result.data.alt_location || null,
    })
    .select()
    .single();

  if (error) {
    return { error: error.message };
  }

  revalidatePath(`/post/${postId}`);
  return { data };
}

export async function getChallenges(postId: string) {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("challenges")
    .select("*, profiles!challenges_author_id_fkey(nickname, avatar_emoji)")
    .eq("post_id", postId)
    .order("created_at", { ascending: false });

  if (error) {
    return { error: error.message, data: [] };
  }

  return { data: data || [] };
}
