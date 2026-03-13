"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { motion } from "framer-motion";
import { markAsRead, markAllAsRead } from "@/lib/actions/notification-actions";
import { relativeTime } from "@/lib/utils";
import { EmptyState } from "@/components/shared/empty-state";

interface Notification {
  id: string;
  type: string;
  title: string;
  body: string;
  post_id: string | null;
  is_read: boolean;
  created_at: string;
  actor: {
    nickname: string;
    avatar_emoji: string;
  } | null;
}

interface NotificationsClientProps {
  notifications: Notification[];
}

function groupByDate(notifications: Notification[]) {
  const groups: Record<string, Notification[]> = {};

  for (const n of notifications) {
    const date = new Date(n.created_at);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    let key: string;
    if (date.toDateString() === today.toDateString()) {
      key = "오늘";
    } else if (date.toDateString() === yesterday.toDateString()) {
      key = "어제";
    } else {
      key = `${date.getMonth() + 1}월 ${date.getDate()}일`;
    }

    if (!groups[key]) groups[key] = [];
    groups[key].push(n);
  }

  return groups;
}

function NotificationIcon({ type }: { type: string }) {
  switch (type) {
    case "acknowledge":
      return <span className="text-lg">👍</span>;
    case "challenge":
      return <span className="text-lg">🔥</span>;
    case "vote":
      return <span className="text-lg">❤️</span>;
    default:
      return <span className="text-lg">📢</span>;
  }
}

export function NotificationsClient({ notifications }: NotificationsClientProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const handleMarkAllRead = () => {
    startTransition(async () => {
      await markAllAsRead();
      router.refresh();
    });
  };

  const handleNotificationClick = (notification: Notification) => {
    if (!notification.is_read) {
      startTransition(async () => {
        await markAsRead(notification.id);
      });
    }
  };

  const grouped = groupByDate(notifications);
  const hasUnread = notifications.some((n) => !n.is_read);

  return (
    <div className="px-4 py-4 space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-extrabold text-[#1A1A1A]">알림</h2>
        </div>
        {hasUnread && (
          <button
            onClick={handleMarkAllRead}
            disabled={isPending}
            className="text-sm text-[#E54D2E] font-medium hover:text-[#D4432A] transition-colors"
          >
            모두 읽음
          </button>
        )}
      </div>

      {notifications.length === 0 ? (
        <EmptyState
          message="아직 알림이 없어요"
          sub="인정/도전을 받으면 여기에 표시됩니다"
        />
      ) : (
        <div className="space-y-4">
          {Object.entries(grouped).map(([date, items]) => (
            <div key={date}>
              <h3 className="text-xs font-bold text-[#1A1A1A]/40 mb-2">
                {date}
              </h3>
              <div className="space-y-1">
                {items.map((notification, index) => (
                  <motion.div
                    key={notification.id}
                    initial={{ opacity: 0, y: 5 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.15, delay: index * 0.03 }}
                  >
                    <Link
                      href={notification.post_id ? `/post/${notification.post_id}` : "#"}
                      onClick={() => handleNotificationClick(notification)}
                    >
                      <div
                        className={`flex items-start gap-3 p-3 rounded-xl transition-colors ${
                          notification.is_read
                            ? "bg-white"
                            : "bg-orange-50 border border-orange-100"
                        } hover:bg-orange-50`}
                      >
                        <div className="w-9 h-9 rounded-full bg-orange-50 flex items-center justify-center shrink-0">
                          {notification.actor ? (
                            <span className="text-base">
                              {notification.actor.avatar_emoji}
                            </span>
                          ) : (
                            <NotificationIcon type={notification.type} />
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm text-[#1A1A1A]/80 leading-snug">
                            {notification.title}
                          </p>
                          {notification.body && (
                            <p className="text-xs text-[#1A1A1A]/40 mt-0.5 truncate">
                              {notification.body}
                            </p>
                          )}
                          <p className="text-[10px] text-[#1A1A1A]/30 mt-1">
                            {relativeTime(notification.created_at)}
                          </p>
                        </div>
                        {!notification.is_read && (
                          <div className="w-2 h-2 rounded-full bg-[#E54D2E] shrink-0 mt-2" />
                        )}
                      </div>
                    </Link>
                  </motion.div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
