"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { createChallenge } from "@/lib/actions/challenge-actions";

interface ChallengeFormProps {
  postId: string;
}

export function ChallengeForm({ postId }: ChallengeFormProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [type, setType] = useState<"인정" | "도전">("인정");
  const [open, setOpen] = useState(false);

  const handleSubmit = (formData: FormData) => {
    setError(null);
    formData.set("type", type);

    startTransition(async () => {
      const result = await createChallenge(postId, formData);
      if (result.error) {
        setError(result.error);
      } else {
        setOpen(false);
        router.refresh();
      }
    });
  };

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger
        render={
          <Button className="w-full rounded-xl bg-[#E54D2E] hover:bg-[#D4432A] text-white font-bold py-3 text-base shadow-lg shadow-red-200" />
        }
      >
        의견 남기기
      </SheetTrigger>
      <SheetContent side="bottom" className="rounded-t-3xl pb-8 bg-[#FFFAF5]">
        <SheetHeader className="mb-4">
          <SheetTitle className="text-lg font-bold text-[#1A1A1A]">
            어떻게 생각하세요?
          </SheetTitle>
        </SheetHeader>

        <form action={handleSubmit} className="space-y-4">
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => setType("인정")}
              className={`flex-1 py-3 rounded-xl font-bold text-base transition-all ${
                type === "인정"
                  ? "bg-green-500 text-white shadow-md"
                  : "bg-green-50 text-green-600 border border-green-200"
              }`}
            >
              👍 인정
            </button>
            <button
              type="button"
              onClick={() => setType("도전")}
              className={`flex-1 py-3 rounded-xl font-bold text-base transition-all ${
                type === "도전"
                  ? "bg-orange-500 text-white shadow-md"
                  : "bg-orange-50 text-orange-600 border border-orange-200"
              }`}
            >
              🔥 도전
            </button>
          </div>

          <div>
            <Textarea
              name="reason"
              placeholder={
                type === "인정"
                  ? "인정하는 이유를 알려주세요!"
                  : "독보적이지 않다고 생각하는 이유는?"
              }
              className="rounded-xl border-orange-200 focus:border-[#E54D2E] focus:ring-[#E54D2E]/20 bg-white min-h-[80px] resize-none"
              required
            />
          </div>

          {type === "도전" && (
            <div className="space-y-3 bg-orange-50/50 p-3 rounded-xl border border-orange-100">
              <p className="text-sm font-semibold text-orange-700">
                대안이 있다면 알려주세요
              </p>
              <Input
                name="alt_restaurant_name"
                placeholder="대안 가게 이름"
                className="rounded-xl border-orange-200 bg-white"
                required
              />
              <div className="grid grid-cols-2 gap-2">
                <Input
                  name="alt_menu_item"
                  placeholder="대안 메뉴"
                  className="rounded-xl border-orange-200 bg-white"
                  required
                />
                <Input
                  name="alt_location"
                  placeholder="위치 (선택)"
                  className="rounded-xl border-orange-200 bg-white"
                />
              </div>
            </div>
          )}

          {error && (
            <div className="bg-red-50 text-red-600 text-sm px-3 py-2 rounded-xl">
              {error}
            </div>
          )}

          <Button
            type="submit"
            disabled={isPending}
            className={`w-full rounded-xl font-bold py-3 text-base shadow-lg disabled:opacity-50 ${
              type === "인정"
                ? "bg-green-500 hover:bg-green-600 text-white shadow-green-200"
                : "bg-orange-500 hover:bg-orange-600 text-white shadow-orange-200"
            }`}
          >
            {isPending
              ? "등록 중..."
              : type === "인정"
              ? "👍 인정합니다!"
              : "🔥 도전합니다!"}
          </Button>
        </form>
      </SheetContent>
    </Sheet>
  );
}
