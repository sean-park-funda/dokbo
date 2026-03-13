"use client";

import { useAuthStore } from "@/lib/stores/auth-store";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { signInWithKakao } from "@/lib/actions/auth-actions";
import { useTransition } from "react";

export function LoginModal() {
  const { isLoginModalOpen, closeLoginModal } = useAuthStore();
  const [isPending, startTransition] = useTransition();

  const handleKakaoLogin = () => {
    startTransition(async () => {
      await signInWithKakao();
    });
  };

  return (
    <Dialog open={isLoginModalOpen} onOpenChange={(open) => !open && closeLoginModal()}>
      <DialogContent className="rounded-2xl p-6" showCloseButton={false}>
        <DialogHeader className="items-center text-center">
          <div className="text-5xl mb-2">🏆</div>
          <DialogTitle className="text-xl font-extrabold text-[#1A1A1A]">
            독보적에 오신 걸 환영합니다
          </DialogTitle>
          <DialogDescription className="text-sm text-[#1A1A1A]/50">
            로그인하고 독보적인 맛집을 공유해보세요
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-3 mt-4">
          <Button
            onClick={handleKakaoLogin}
            disabled={isPending}
            className="w-full rounded-xl py-3 text-base font-bold bg-[#FEE500] hover:bg-[#FDD800] text-[#191919] border-0 shadow-sm"
          >
            {isPending ? "로그인 중..." : "카카오로 시작하기"}
          </Button>

          <Button
            variant="ghost"
            onClick={closeLoginModal}
            className="w-full rounded-xl py-3 text-base font-medium text-[#1A1A1A]/50 hover:text-[#1A1A1A]/70"
          >
            둘러보기
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
