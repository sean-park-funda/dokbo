"use client";

import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { HotBadge } from "@/components/shared/hot-badge";
import { relativeTime } from "@/lib/utils";
import { CATEGORY_COLORS, HOT_THRESHOLD } from "@/lib/constants";

interface PostDetailProps {
  post: {
    id: string;
    restaurant_name: string;
    menu_item: string;
    location: string;
    claim: string;
    category: string;
    acknowledge_count: number;
    challenge_count: number;
    created_at: string;
    profiles: {
      nickname: string;
      avatar_emoji: string;
    };
  };
}

export function PostDetail({ post }: PostDetailProps) {
  const isHot =
    post.acknowledge_count + post.challenge_count >= HOT_THRESHOLD;
  const categoryColor =
    CATEGORY_COLORS[post.category] || "bg-gray-100 text-gray-700";

  return (
    <Card className="border-orange-100/60 bg-white rounded-2xl overflow-hidden">
      <CardContent className="p-5">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-full bg-orange-50 flex items-center justify-center text-xl">
            {post.profiles.avatar_emoji}
          </div>
          <div>
            <p className="text-sm font-medium text-[#1A1A1A]">
              {post.profiles.nickname}
            </p>
            <p className="text-xs text-[#1A1A1A]/40">
              {relativeTime(post.created_at)}
            </p>
          </div>
          <div className="ml-auto flex items-center gap-1.5">
            {isHot && <HotBadge />}
            <Badge
              variant="secondary"
              className={`text-xs font-medium px-2.5 py-0.5 ${categoryColor}`}
            >
              {post.category}
            </Badge>
          </div>
        </div>

        <div className="mb-4">
          <h2 className="text-xl font-extrabold text-[#1A1A1A] mb-1">
            {post.restaurant_name}
          </h2>
          <p className="text-base font-semibold text-[#E54D2E]">
            {post.menu_item}
          </p>
          <p className="text-sm text-[#1A1A1A]/50 mt-1">
            📍 {post.location}
          </p>
        </div>

        <div className="bg-orange-50/50 rounded-xl p-4 mb-4">
          <p className="text-[#1A1A1A]/80 leading-relaxed whitespace-pre-wrap">
            &ldquo;{post.claim}&rdquo;
          </p>
        </div>

        <div className="flex items-center gap-4 pt-3 border-t border-orange-50">
          <div className="flex items-center gap-2 text-green-600 font-bold">
            <span className="text-lg">👍</span>
            <span>인정 {post.acknowledge_count}</span>
          </div>
          <div className="flex items-center gap-2 text-orange-600 font-bold">
            <span className="text-lg">🔥</span>
            <span>도전 {post.challenge_count}</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
