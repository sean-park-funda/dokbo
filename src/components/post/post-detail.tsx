"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { HotBadge } from "@/components/shared/hot-badge";
import { ShareButton } from "@/components/shared/share-button";
import { BookmarkButton } from "@/components/shared/bookmark-button";
import { relativeTime } from "@/lib/utils";
import { CATEGORY_COLORS, HOT_THRESHOLD } from "@/lib/constants";
import { useAuthStore } from "@/lib/stores/auth-store";
import { deletePost } from "@/lib/actions/post-actions";
import { MoreHorizontal, Pencil, Trash2 } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

interface PostDetailProps {
  post: {
    id: string;
    author_id: string;
    restaurant_name: string;
    menu_item: string;
    location: string;
    claim: string;
    category: string;
    image_url: string | null;
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
  const router = useRouter();
  const { user } = useAuthStore();
  const [showMenu, setShowMenu] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [isPending, startTransition] = useTransition();

  const isAuthor = user?.id === post.author_id;
  const isHot =
    post.acknowledge_count + post.challenge_count >= HOT_THRESHOLD;
  const categoryColor =
    CATEGORY_COLORS[post.category] || "bg-gray-100 text-gray-700";

  const handleDelete = () => {
    startTransition(async () => {
      const result = await deletePost(post.id);
      if (!result.error) {
        router.push("/");
      }
    });
  };

  return (
    <>
      <Card className="border-orange-100/60 bg-white rounded-2xl overflow-hidden">
        {post.image_url && (
          <div className="relative w-full h-56">
            <Image
              src={post.image_url}
              alt={post.restaurant_name}
              fill
              className="object-cover"
            />
          </div>
        )}
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
              {isAuthor && (
                <div className="relative">
                  <button
                    onClick={() => setShowMenu(!showMenu)}
                    className="w-8 h-8 rounded-full flex items-center justify-center text-[#1A1A1A]/40 hover:text-[#1A1A1A]/70 hover:bg-orange-50 transition-colors"
                  >
                    <MoreHorizontal className="w-4 h-4" />
                  </button>
                  {showMenu && (
                    <div className="absolute right-0 top-9 bg-white rounded-xl shadow-lg border border-orange-100 py-1 z-10 min-w-[120px]">
                      <button
                        onClick={() => {
                          setShowMenu(false);
                          router.push(`/post/${post.id}/edit`);
                        }}
                        className="w-full flex items-center gap-2 px-4 py-2.5 text-sm text-[#1A1A1A]/70 hover:bg-orange-50 transition-colors"
                      >
                        <Pencil className="w-3.5 h-3.5" />
                        수정
                      </button>
                      <button
                        onClick={() => {
                          setShowMenu(false);
                          setShowDeleteConfirm(true);
                        }}
                        className="w-full flex items-center gap-2 px-4 py-2.5 text-sm text-red-500 hover:bg-red-50 transition-colors"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                        삭제
                      </button>
                    </div>
                  )}
                </div>
              )}
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

          <div className="flex items-center justify-between pt-3 border-t border-orange-50">
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2 text-green-600 font-bold">
                <span className="text-lg">👍</span>
                <span>인정 {post.acknowledge_count}</span>
              </div>
              <div className="flex items-center gap-2 text-orange-600 font-bold">
                <span className="text-lg">🔥</span>
                <span>도전 {post.challenge_count}</span>
              </div>
            </div>
            <div className="flex items-center gap-1">
              <BookmarkButton postId={post.id} />
              <ShareButton
                title={`${post.restaurant_name} - ${post.menu_item}`}
                text={post.claim}
                url={`/post/${post.id}`}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      <Dialog
        open={showDeleteConfirm}
        onOpenChange={(open) => !open && setShowDeleteConfirm(false)}
      >
        <DialogContent className="rounded-2xl" showCloseButton={false}>
          <DialogHeader>
            <DialogTitle className="text-lg font-bold text-[#1A1A1A]">
              정말 삭제하시겠어요?
            </DialogTitle>
            <DialogDescription className="text-sm text-[#1A1A1A]/50">
              삭제된 선언은 복구할 수 없습니다.
            </DialogDescription>
          </DialogHeader>
          <div className="flex gap-2 mt-2">
            <Button
              variant="outline"
              onClick={() => setShowDeleteConfirm(false)}
              className="flex-1 rounded-xl"
            >
              취소
            </Button>
            <Button
              onClick={handleDelete}
              disabled={isPending}
              className="flex-1 rounded-xl bg-red-500 hover:bg-red-600 text-white"
            >
              {isPending ? "삭제 중..." : "삭제"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
