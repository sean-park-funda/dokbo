import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "독보적 - 이 맛은 여기 아니면 안 돼",
  description:
    "대체 불가능한 맛집을 발견하고, 인정하거나 도전하세요. 독보적인 맛의 세계.",
  openGraph: {
    title: "독보적 - 이 맛은 여기 아니면 안 돼",
    description: "대체 불가능한 맛집을 발견하고, 인정하거나 도전하세요.",
  },
};

export default function LandingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="fixed inset-0 z-[100] bg-[#FFFAF5] overflow-y-auto overflow-x-hidden">
      {children}
    </div>
  );
}
