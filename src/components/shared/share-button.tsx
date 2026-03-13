"use client";

import { useState } from "react";
import { Share2, Check } from "lucide-react";
import { cn } from "@/lib/utils";

interface ShareButtonProps {
  title: string;
  text: string;
  url: string;
  size?: "sm" | "default";
}

export function ShareButton({ title, text, url, size = "default" }: ShareButtonProps) {
  const [copied, setCopied] = useState(false);

  const handleShare = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    const fullUrl = typeof window !== "undefined" ? `${window.location.origin}${url}` : url;

    if (typeof navigator !== "undefined" && navigator.share) {
      try {
        await navigator.share({ title, text, url: fullUrl });
        return;
      } catch {
        // User cancelled or not supported, fall through to clipboard
      }
    }

    try {
      await navigator.clipboard.writeText(fullUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Clipboard not available
    }
  };

  const iconSize = size === "sm" ? "w-4 h-4" : "w-5 h-5";
  const buttonSize = size === "sm" ? "w-7 h-7" : "w-8 h-8";

  return (
    <button
      onClick={handleShare}
      className={cn(
        buttonSize,
        "rounded-full flex items-center justify-center transition-colors",
        copied
          ? "text-green-600 bg-green-50"
          : "text-[#1A1A1A]/30 hover:text-[#1A1A1A]/60 hover:bg-orange-50"
      )}
    >
      {copied ? (
        <Check className={iconSize} />
      ) : (
        <Share2 className={iconSize} />
      )}
    </button>
  );
}
