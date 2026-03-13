"use client";

import { useState, useTransition } from "react";
import { motion } from "framer-motion";
import { Badge } from "@/components/ui/badge";
import { relativeTime } from "@/lib/utils";
import { toggleChallengeVote } from "@/lib/actions/vote-actions";
import { useAuthStore } from "@/lib/stores/auth-store";

interface ChallengeCardProps {
  challenge: {
    id: string;
    post_id: string;
    type: string;
    reason: string;
    alt_restaurant_name: string | null;
    alt_menu_item: string | null;
    alt_location: string | null;
    vote_count: number;
    created_at: string;
    profiles: {
      nickname: string;
      avatar_emoji: string;
    };
  };
  index: number;
}

export function ChallengeCard({ challenge, index }: ChallengeCardProps) {
  const [isPending, startTransition] = useTransition();
  const [localVoteCount, setLocalVoteCount] = useState(challenge.vote_count);
  const [voted, setVoted] = useState(false);
  const { user, openLoginModal } = useAuthStore();

  const isAcknowledge = challenge.type === "인정";

  const handleVote = () => {
    if (!user) {
      openLoginModal();
      return;
    }

    startTransition(async () => {
      const result = await toggleChallengeVote(
        challenge.id,
        challenge.post_id
      );
      if (!result.error) {
        setVoted(result.voted ?? false);
        setLocalVoteCount((prev) => (result.voted ? prev + 1 : prev - 1));
      }
    });
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.2, delay: index * 0.05 }}
      className={`rounded-xl p-4 ${
        isAcknowledge
          ? "bg-green-50/60 border border-green-100"
          : "bg-orange-50/60 border border-orange-100"
      }`}
    >
      <div className="flex items-start justify-between mb-2">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-full bg-white flex items-center justify-center text-sm">
            {challenge.profiles.avatar_emoji}
          </div>
          <div>
            <p className="text-xs font-medium text-[#1A1A1A]">
              {challenge.profiles.nickname}
            </p>
            <p className="text-[10px] text-[#1A1A1A]/40">
              {relativeTime(challenge.created_at)}
            </p>
          </div>
        </div>
        <Badge
          variant="secondary"
          className={`text-xs font-bold ${
            isAcknowledge
              ? "bg-green-100 text-green-700"
              : "bg-orange-100 text-orange-700"
          }`}
        >
          {isAcknowledge ? "👍 인정" : "🔥 도전"}
        </Badge>
      </div>

      <p className="text-sm text-[#1A1A1A]/80 leading-relaxed mb-2">
        {challenge.reason}
      </p>

      {!isAcknowledge && challenge.alt_restaurant_name && (
        <div className="bg-white/70 rounded-lg p-2.5 mb-2 border border-orange-100/50">
          <p className="text-xs font-semibold text-orange-700 mb-0.5">
            대안 추천
          </p>
          <p className="text-sm font-bold text-[#1A1A1A]">
            {challenge.alt_restaurant_name}
            {challenge.alt_menu_item && (
              <span className="text-[#1A1A1A]/60 font-medium">
                {" "}
                · {challenge.alt_menu_item}
              </span>
            )}
          </p>
          {challenge.alt_location && (
            <p className="text-xs text-[#1A1A1A]/40 mt-0.5">
              📍 {challenge.alt_location}
            </p>
          )}
        </div>
      )}

      <button
        onClick={handleVote}
        disabled={isPending}
        className={`flex items-center gap-1.5 text-xs font-medium transition-colors ${
          voted
            ? "text-[#E54D2E]"
            : "text-[#1A1A1A]/40 hover:text-[#1A1A1A]/60"
        }`}
      >
        <span>{voted ? "❤️" : "🤍"}</span>
        <span>{localVoteCount}</span>
      </button>
    </motion.div>
  );
}
