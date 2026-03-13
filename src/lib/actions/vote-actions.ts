"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

export async function togglePostVote(postId: string) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { error: "로그인이 필요합니다" };
  }

  const { data: existing } = await supabase
    .from("votes")
    .select("id")
    .eq("user_id", user.id)
    .eq("post_id", postId)
    .maybeSingle();

  if (existing) {
    await supabase.from("votes").delete().eq("id", existing.id);
    revalidatePath("/");
    return { voted: false };
  }

  const { error } = await supabase.from("votes").insert({
    user_id: user.id,
    post_id: postId,
  });

  if (error) {
    return { error: error.message };
  }

  revalidatePath("/");
  return { voted: true };
}

export async function toggleChallengeVote(challengeId: string, postId: string) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { error: "로그인이 필요합니다" };
  }

  const { data: existing } = await supabase
    .from("votes")
    .select("id")
    .eq("user_id", user.id)
    .eq("challenge_id", challengeId)
    .maybeSingle();

  if (existing) {
    await supabase.from("votes").delete().eq("id", existing.id);
    revalidatePath(`/post/${postId}`);
    return { voted: false };
  }

  const { error } = await supabase.from("votes").insert({
    user_id: user.id,
    challenge_id: challengeId,
  });

  if (error) {
    return { error: error.message };
  }

  revalidatePath(`/post/${postId}`);
  return { voted: true };
}
