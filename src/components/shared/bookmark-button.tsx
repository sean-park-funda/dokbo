"use client";

import { useState, useTransition } from "react";
import { Bookmark } from "lucide-react";
import { toggleBookmark } from "@/lib/actions/bookmark-actions";
import { useAuthStore } from "@/lib/stores/auth-store";
import { cn } from "@/lib/utils";

interface BookmarkButtonProps {
  postId: string;
  initialBookmarked?: boolean;
  size?: "sm" | "default";
}

export function BookmarkButton({
  postId,
  initialBookmarked = false,
  size = "default",
}: BookmarkButtonProps) {
  const [bookmarked, setBookmarked] = useState(initialBookmarked);
  const [isPending, startTransition] = useTransition();
  const { user, openLoginModal } = useAuthStore();

  const handleToggle = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (!user) {
      openLoginModal();
      return;
    }

    // Optimistic update
    setBookmarked(!bookmarked);

    startTransition(async () => {
      const result = await toggleBookmark(postId);
      if (result.error) {
        setBookmarked(bookmarked); // Revert
      } else if (result.bookmarked !== undefined) {
        setBookmarked(result.bookmarked);
      }
    });
  };

  const iconSize = size === "sm" ? "w-4 h-4" : "w-5 h-5";
  const buttonSize = size === "sm" ? "w-7 h-7" : "w-8 h-8";

  return (
    <button
      onClick={handleToggle}
      disabled={isPending}
      className={cn(
        buttonSize,
        "rounded-full flex items-center justify-center transition-colors",
        bookmarked
          ? "text-[#E54D2E] bg-[#E54D2E]/10"
          : "text-[#1A1A1A]/30 hover:text-[#1A1A1A]/60 hover:bg-orange-50"
      )}
    >
      <Bookmark
        className={cn(iconSize, bookmarked && "fill-current")}
      />
    </button>
  );
}
