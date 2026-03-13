"use client";

import Link from "next/link";
import { useState } from "react";
import { motion } from "framer-motion";
import { PostCard } from "@/components/post/post-card";
import { EmptyState } from "@/components/shared/empty-state";
import { useAuthStore } from "@/lib/stores/auth-store";
import { signOut } from "@/lib/actions/auth-actions";
import { Settings, LogOut, ChevronRight } from "lucide-react";

type Post = React.ComponentProps<typeof PostCard>["post"];

interface MyPageClientProps {
  user: { id: string } | null;
  profile: {
    nickname: string;
    avatar_emoji: string;
    bio: string;
  } | null;
  posts: Post[];
  bookmarks: Post[];
}

const TABS = [
  { key: "posts", label: "내 선언" },
  { key: "bookmarks", label: "찜한 맛집" },
] as const;

export function MyPageClient({
  user,
  profile,
  posts,
  bookmarks,
}: MyPageClientProps) {
  const [activeTab, setActiveTab] = useState<"posts" | "bookmarks">("posts");
  const { openLoginModal } = useAuthStore();

  if (!user || !profile) {
    return (
      <div className="px-4 py-16 text-center">
        <div className="text-6xl mb-4">👤</div>
        <h2 className="text-xl font-bold text-[#1A1A1A] mb-2">
          로그인이 필요해요
        </h2>
        <p className="text-sm text-[#1A1A1A]/50 mb-6">
          로그인하고 나만의 독보적 맛집을 관리해보세요
        </p>
        <button
          onClick={openLoginModal}
          className="px-8 py-3 bg-[#E54D2E] text-white font-bold rounded-xl shadow-lg shadow-red-200 hover:bg-[#D4432A] transition-colors"
        >
          로그인하기
        </button>
      </div>
    );
  }

  const currentPosts = activeTab === "posts" ? posts : bookmarks;

  return (
    <div className="pb-4">
      {/* Profile section */}
      <div className="px-4 py-6">
        <div className="flex items-center gap-4 mb-4">
          <div className="w-16 h-16 rounded-full bg-orange-100 flex items-center justify-center text-3xl">
            {profile.avatar_emoji}
          </div>
          <div className="flex-1 min-w-0">
            <h2 className="text-lg font-bold text-[#1A1A1A] truncate">
              {profile.nickname}
            </h2>
            {profile.bio && (
              <p className="text-sm text-[#1A1A1A]/50 truncate">{profile.bio}</p>
            )}
          </div>
        </div>

        <div className="flex gap-2">
          <Link
            href="/my/profile"
            className="flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-xl bg-orange-50 text-sm font-medium text-[#1A1A1A]/70 hover:bg-orange-100 transition-colors"
          >
            <Settings className="w-4 h-4" />
            프로필 편집
          </Link>
          <form action={signOut}>
            <button
              type="submit"
              className="flex items-center justify-center gap-1.5 py-2.5 px-4 rounded-xl bg-gray-50 text-sm font-medium text-[#1A1A1A]/50 hover:bg-gray-100 transition-colors"
            >
              <LogOut className="w-4 h-4" />
              로그아웃
            </button>
          </form>
        </div>
      </div>

      {/* Stats */}
      <div className="px-4 mb-4">
        <div className="grid grid-cols-2 gap-3">
          <div className="bg-white rounded-xl p-4 border border-orange-100 text-center">
            <p className="text-2xl font-black text-[#E54D2E]">{posts.length}</p>
            <p className="text-xs text-[#1A1A1A]/40 mt-0.5">내 선언</p>
          </div>
          <div className="bg-white rounded-xl p-4 border border-orange-100 text-center">
            <p className="text-2xl font-black text-[#E54D2E]">{bookmarks.length}</p>
            <p className="text-xs text-[#1A1A1A]/40 mt-0.5">찜한 맛집</p>
          </div>
        </div>
      </div>

      {/* Quick links */}
      <div className="px-4 mb-4">
        <Link
          href="/notifications"
          className="flex items-center justify-between py-3 px-4 bg-white rounded-xl border border-orange-100 hover:bg-orange-50 transition-colors"
        >
          <span className="text-sm font-medium text-[#1A1A1A]/70">알림</span>
          <ChevronRight className="w-4 h-4 text-[#1A1A1A]/30" />
        </Link>
      </div>

      {/* Tabs */}
      <div className="px-4 mb-4">
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
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Content */}
      <div className="px-4 space-y-3">
        <motion.div
          key={activeTab}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.2 }}
          className="space-y-3"
        >
          {currentPosts.length === 0 ? (
            <EmptyState
              message={
                activeTab === "posts"
                  ? "아직 등록한 선언이 없어요"
                  : "아직 찜한 맛집이 없어요"
              }
              sub={
                activeTab === "posts"
                  ? "독보적인 맛집을 등록해보세요!"
                  : "마음에 드는 맛집을 찜해보세요!"
              }
            />
          ) : (
            currentPosts.map((post: Post, index: number) => (
              <PostCard key={post.id} post={post} index={index} />
            ))
          )}
        </motion.div>
      </div>
    </div>
  );
}
