"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { cn } from "@/lib/utils";
import { CATEGORIES } from "@/lib/constants";

export function CategoryTabs() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const activeCategory = searchParams.get("category") || "전체";

  const handleClick = (value: string) => {
    if (value === "전체") {
      router.push("/");
    } else {
      router.push(`/?category=${encodeURIComponent(value)}`);
    }
  };

  return (
    <div className="overflow-x-auto scrollbar-hide">
      <div className="flex gap-2 px-4 py-3 min-w-max">
        {CATEGORIES.map((cat) => (
          <button
            key={cat.value}
            onClick={() => handleClick(cat.value)}
            className={cn(
              "flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-sm font-medium whitespace-nowrap transition-all active:scale-95",
              activeCategory === cat.value
                ? "bg-[#E54D2E] text-white shadow-sm"
                : "bg-white text-[#1A1A1A]/60 hover:bg-orange-50 border border-orange-100"
            )}
          >
            <span className="text-sm">{cat.emoji}</span>
            <span>{cat.label}</span>
          </button>
        ))}
      </div>
    </div>
  );
}
