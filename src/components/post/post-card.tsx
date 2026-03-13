"use client";

import Link from "next/link";
import Image from "next/image";
import { motion } from "framer-motion";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { HotBadge } from "@/components/shared/hot-badge";
import { BookmarkButton } from "@/components/shared/bookmark-button";
import { relativeTime, truncate } from "@/lib/utils";
import { CATEGORY_COLORS, HOT_THRESHOLD } from "@/lib/constants";

interface PostCardProps {
  post: {
    id: string;
    restaurant_name: string;
    menu_item: string;
    location: string;
    claim: string;
    category: string;
    image_url?: string | null;
    acknowledge_count: number;
    challenge_count: number;
    created_at: string;
    profiles: {
      nickname: string;
      avatar_emoji: string;
    };
  };
  index: number;
}

export function PostCard({ post, index }: PostCardProps) {
  const isHot =
    post.acknowledge_count + post.challenge_count >= HOT_THRESHOLD;
  const categoryColor =
    CATEGORY_COLORS[post.category] || "bg-gray-100 text-gray-700";

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: index * 0.05 }}
    >
      <Card className="border-orange-100/60 hover:shadow-md transition-shadow bg-white rounded-2xl overflow-hidden">
        <Link href={`/post/${post.id}`}>
          {post.image_url && (
            <div className="relative w-full h-40">
              <Image
                src={post.image_url}
                alt={post.restaurant_name}
                fill
                className="object-cover"
              />
            </div>
          )}
          <CardContent className="p-4">
            <div className="flex items-start justify-between gap-2 mb-2">
              <div className="flex items-center gap-2 min-w-0">
                <div className="w-8 h-8 rounded-full bg-orange-50 flex items-center justify-center text-base shrink-0">
                  {post.profiles.avatar_emoji}
                </div>
                <div className="min-w-0">
                  <p className="text-xs text-[#1A1A1A]/50 truncate">
                    {post.profiles.nickname}
                  </p>
                  <p className="text-xs text-[#1A1A1A]/30">
                    {relativeTime(post.created_at)}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-1.5 shrink-0">
                {isHot && <HotBadge />}
                <Badge
                  variant="secondary"
                  className={`text-[10px] font-medium px-2 py-0.5 ${categoryColor}`}
                >
                  {post.category}
                </Badge>
              </div>
            </div>

            <div className="mb-2">
              <h3 className="font-bold text-[#1A1A1A] text-base leading-snug">
                {post.restaurant_name}
                <span className="text-[#E54D2E] ml-1">·</span>
                <span className="text-[#1A1A1A]/70 font-semibold ml-1">
                  {post.menu_item}
                </span>
              </h3>
              <p className="text-xs text-[#1A1A1A]/40 mt-0.5">
                📍 {post.location}
              </p>
            </div>

            <p className="text-sm text-[#1A1A1A]/70 leading-relaxed line-clamp-2 mb-3">
              &ldquo;{truncate(post.claim, 100)}&rdquo;
            </p>

            <div className="flex items-center justify-between pt-2 border-t border-orange-50">
              <div className="flex items-center gap-3">
                <span className="flex items-center gap-1.5 text-sm text-green-600 font-medium">
                  <span>👍</span>
                  <span>인정 {post.acknowledge_count}</span>
                </span>
                <span className="flex items-center gap-1.5 text-sm text-orange-600 font-medium">
                  <span>🔥</span>
                  <span>도전 {post.challenge_count}</span>
                </span>
              </div>
            </div>
          </CardContent>
        </Link>
        <div className="absolute top-2 right-2 z-10" onClick={(e) => e.stopPropagation()}>
          <BookmarkButton postId={post.id} size="sm" />
        </div>
      </Card>
    </motion.div>
  );
}
