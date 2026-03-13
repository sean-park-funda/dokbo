"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { EmptyState } from "@/components/shared/empty-state";
import { CATEGORY_COLORS } from "@/lib/constants";

type Post = {
  id: string;
  restaurant_name: string;
  menu_item: string;
  location: string;
  category: string;
  acknowledge_count: number;
  challenge_count: number;
  profiles: {
    nickname: string;
    avatar_emoji: string;
  };
};

interface RankingClientProps {
  trending: Post[];
  mostChallenged: Post[];
  topAcknowledged: Post[];
}

const TABS = [
  { key: "trending", label: "인기", icon: "🔥" },
  { key: "challenged", label: "최다도전", icon: "⚔️" },
  { key: "acknowledged", label: "독보적", icon: "🏆" },
] as const;

const MEDALS = ["🥇", "🥈", "🥉"];

function RankingCard({ post, rank }: { post: Post; rank: number }) {
  const categoryColor =
    CATEGORY_COLORS[post.category] || "bg-gray-100 text-gray-700";

  return (
    <motion.div
      initial={{ opacity: 0, x: -10 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.2, delay: rank * 0.05 }}
    >
      <Link href={`/post/${post.id}`}>
        <Card className="border-orange-100/60 bg-white hover:shadow-md transition-shadow rounded-2xl overflow-hidden">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-orange-50 flex items-center justify-center text-2xl shrink-0">
                {rank < 3 ? MEDALS[rank] : (
                  <span className="text-sm font-bold text-[#1A1A1A]/30">
                    {rank + 1}
                  </span>
                )}
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-0.5">
                  <h3 className="font-bold text-[#1A1A1A] text-sm truncate">
                    {post.restaurant_name}
                  </h3>
                  <Badge
                    variant="secondary"
                    className={`text-[10px] font-medium px-1.5 py-0 shrink-0 ${categoryColor}`}
                  >
                    {post.category}
                  </Badge>
                </div>
                <p className="text-xs text-[#1A1A1A]/50 truncate">
                  {post.menu_item} · 📍 {post.location}
                </p>
              </div>

              <div className="flex flex-col items-end gap-0.5 shrink-0">
                <span className="text-xs text-green-600 font-semibold">
                  👍 {post.acknowledge_count}
                </span>
                <span className="text-xs text-orange-600 font-semibold">
                  🔥 {post.challenge_count}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>
      </Link>
    </motion.div>
  );
}

export function RankingClient({
  trending,
  mostChallenged,
  topAcknowledged,
}: RankingClientProps) {
  const [activeTab, setActiveTab] =
    useState<"trending" | "challenged" | "acknowledged">("trending");

  const posts =
    activeTab === "trending"
      ? trending
      : activeTab === "challenged"
      ? mostChallenged
      : topAcknowledged;

  return (
    <div className="px-4 py-4 space-y-4">
      <div>
        <h2 className="text-2xl font-extrabold text-[#1A1A1A]">
          🏆 랭킹
        </h2>
        <p className="text-sm text-[#1A1A1A]/50 mt-1">
          가장 주목받는 독보적 맛집들
        </p>
      </div>

      {/* Tabs */}
      <div className="flex bg-orange-50 rounded-xl p-1">
        {TABS.map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={`flex-1 py-2 rounded-lg text-sm font-semibold transition-all ${
              activeTab === tab.key
                ? "bg-white text-[#E54D2E] shadow-sm"
                : "text-[#1A1A1A]/40"
            }`}
          >
            {tab.icon} {tab.label}
          </button>
        ))}
      </div>

      {/* Rankings */}
      <motion.div
        key={activeTab}
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.2 }}
        className="space-y-2"
      >
        {posts.length === 0 ? (
          <EmptyState
            message="아직 랭킹 데이터가 없어요"
            sub="독보적 맛집을 등록하고 인정/도전을 받아보세요!"
          />
        ) : (
          posts.map((post, index) => (
            <RankingCard key={post.id} post={post} rank={index} />
          ))
        )}
      </motion.div>
    </div>
  );
}
