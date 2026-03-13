export const CATEGORIES = [
  { value: "전체", label: "전체", emoji: "🍽️" },
  { value: "한식", label: "한식", emoji: "🍚" },
  { value: "중식", label: "중식", emoji: "🥟" },
  { value: "일식", label: "일식", emoji: "🍣" },
  { value: "양식", label: "양식", emoji: "🍝" },
  { value: "분식", label: "분식", emoji: "🍢" },
  { value: "고기", label: "고기", emoji: "🥩" },
  { value: "해산물", label: "해산물", emoji: "🦐" },
  { value: "카페", label: "카페", emoji: "☕" },
  { value: "술집", label: "술집", emoji: "🍺" },
  { value: "야식", label: "야식", emoji: "🌙" },
  { value: "길거리", label: "길거리", emoji: "🛒" },
] as const;

export type CategoryValue = (typeof CATEGORIES)[number]["value"];

export const AVATAR_EMOJIS = [
  "🍚", "🍜", "🍲", "🥘", "🍖", "🥩", "🍗", "🥟",
  "🍱", "🍛", "🥗", "🍝", "🌶️", "🧄", "🥬", "🍳",
  "🍕", "🍔", "🌮", "🥐", "🍰", "🧁", "🍩", "🍪",
] as const;

export const CATEGORY_COLORS: Record<string, string> = {
  한식: "bg-orange-100 text-orange-700",
  중식: "bg-red-100 text-red-700",
  일식: "bg-blue-100 text-blue-700",
  양식: "bg-emerald-100 text-emerald-700",
  분식: "bg-pink-100 text-pink-700",
  고기: "bg-rose-100 text-rose-700",
  해산물: "bg-cyan-100 text-cyan-700",
  카페: "bg-amber-100 text-amber-700",
  술집: "bg-purple-100 text-purple-700",
  야식: "bg-indigo-100 text-indigo-700",
  길거리: "bg-yellow-100 text-yellow-700",
};

export const HOT_THRESHOLD = 5;
