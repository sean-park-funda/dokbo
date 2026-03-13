import type { Metadata, Viewport } from "next";
import "./globals.css";
import { Header } from "@/components/layout/header";
import { BottomNav } from "@/components/layout/bottom-nav";
import { AuthGate } from "@/components/shared/auth-gate";

export const metadata: Metadata = {
  title: "독보적 - 대체 불가 맛집 발견",
  description:
    "이 맛은 여기서만! 독보적인 맛집을 공유하고, 인정하거나 도전하세요.",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  themeColor: "#FFFAF5",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko">
      <head>
        <link
          rel="stylesheet"
          as="style"
          crossOrigin="anonymous"
          href="https://cdn.jsdelivr.net/gh/orioncactus/pretendard@v1.3.9/dist/web/variable/pretendardvariable-dynamic-subset.min.css"
        />
      </head>
      <body
        className="antialiased bg-[#FFFAF5]"
        style={{ fontFamily: "'Pretendard Variable', Pretendard, -apple-system, BlinkMacSystemFont, system-ui, Roboto, sans-serif" }}
      >
        <AuthGate>
          <Header />
          <main className="max-w-lg mx-auto pb-24 min-h-screen">
            {children}
          </main>
          <BottomNav />
        </AuthGate>
      </body>
    </html>
  );
}
