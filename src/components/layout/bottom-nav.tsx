"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { useAuthStore } from "@/lib/stores/auth-store";

const NAV_ITEMS = [
  { href: "/", label: "홈", icon: "🏠" },
  { href: "/ranking", label: "랭킹", icon: "🏆" },
  { href: "/post/new", label: "글쓰기", icon: "+", isAction: true },
  { href: "/search", label: "검색", icon: "🔍" },
  { href: "/my", label: "마이", icon: "👤" },
];

export function BottomNav() {
  const pathname = usePathname();
  const { user, openLoginModal } = useAuthStore();

  const handleNavClick = (
    e: React.MouseEvent,
    item: (typeof NAV_ITEMS)[number]
  ) => {
    if (item.isAction && !user) {
      e.preventDefault();
      openLoginModal();
    }
  };

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 bg-white/90 backdrop-blur-md border-t border-orange-100 safe-area-bottom">
      <div className="max-w-lg mx-auto px-2 h-16 flex items-center justify-around">
        {NAV_ITEMS.map((item) => {
          const isActive =
            item.href === "/"
              ? pathname === "/"
              : pathname.startsWith(item.href);

          if (item.isAction) {
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={(e) => handleNavClick(e, item)}
                className="flex flex-col items-center gap-0.5 -mt-4"
              >
                <div className="w-12 h-12 rounded-full bg-[#E54D2E] flex items-center justify-center shadow-lg shadow-red-200 active:scale-95 transition-transform">
                  <span className="text-white text-2xl leading-none">+</span>
                </div>
                <span className="text-[10px] font-medium text-[#E54D2E]">
                  {item.label}
                </span>
              </Link>
            );
          }

          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex flex-col items-center gap-0.5 py-1 px-3 transition-colors",
                isActive ? "text-[#E54D2E]" : "text-[#1A1A1A]/40"
              )}
            >
              <span className="text-xl">{item.icon}</span>
              <span className="text-[10px] font-medium">{item.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
