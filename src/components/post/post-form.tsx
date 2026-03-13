"use client";

import { useState, useTransition, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent } from "@/components/ui/card";
import { CATEGORIES } from "@/lib/constants";
import { createPost, updatePost } from "@/lib/actions/post-actions";
import { ImageUpload } from "@/components/shared/image-upload";
import { useAuthStore } from "@/lib/stores/auth-store";

interface PostFormProps {
  initialData?: {
    id: string;
    restaurant_name: string;
    menu_item: string;
    location: string;
    category: string;
    claim: string;
    image_url: string | null;
  };
}

export function PostForm({ initialData }: PostFormProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [claim, setClaim] = useState(initialData?.claim || "");
  const [category, setCategory] = useState(initialData?.category || "한식");
  const [imageUrl, setImageUrl] = useState<string | null>(
    initialData?.image_url || null
  );
  const { user, openLoginModal } = useAuthStore();
  const isEdit = !!initialData;

  useEffect(() => {
    if (!user) {
      openLoginModal();
    }
  }, [user, openLoginModal]);

  const handleSubmit = (formData: FormData) => {
    if (!user) {
      openLoginModal();
      return;
    }

    setError(null);
    formData.set("category", category);
    if (imageUrl) {
      formData.set("image_url", imageUrl);
    }

    startTransition(async () => {
      const result = isEdit
        ? await updatePost(initialData!.id, formData)
        : await createPost(formData);

      if (result.error) {
        setError(result.error);
      } else if (result.data) {
        router.push(`/post/${result.data.id}`);
      }
    });
  };

  return (
    <Card className="border-orange-100/60 bg-white rounded-2xl">
      <CardContent className="p-5">
        <form action={handleSubmit} className="space-y-4">
          <div>
            <label className="text-sm font-semibold text-[#1A1A1A] mb-1.5 block">
              🏪 가게 이름
            </label>
            <Input
              name="restaurant_name"
              placeholder="예: 을지로 노가리 골목 OO집"
              defaultValue={initialData?.restaurant_name}
              className="rounded-xl border-orange-200 focus:border-[#E54D2E] focus:ring-[#E54D2E]/20 bg-orange-50/30"
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-sm font-semibold text-[#1A1A1A] mb-1.5 block">
                🍽️ 메뉴
              </label>
              <Input
                name="menu_item"
                placeholder="예: 노가리 + 맥주"
                defaultValue={initialData?.menu_item}
                className="rounded-xl border-orange-200 focus:border-[#E54D2E] focus:ring-[#E54D2E]/20 bg-orange-50/30"
                required
              />
            </div>
            <div>
              <label className="text-sm font-semibold text-[#1A1A1A] mb-1.5 block">
                📍 위치
              </label>
              <Input
                name="location"
                placeholder="예: 을지로3가역"
                defaultValue={initialData?.location}
                className="rounded-xl border-orange-200 focus:border-[#E54D2E] focus:ring-[#E54D2E]/20 bg-orange-50/30"
                required
              />
            </div>
          </div>

          <div>
            <label className="text-sm font-semibold text-[#1A1A1A] mb-1.5 block">
              📂 카테고리
            </label>
            <div className="flex flex-wrap gap-2">
              {CATEGORIES.filter((c) => c.value !== "전체").map((cat) => (
                <button
                  key={cat.value}
                  type="button"
                  onClick={() => setCategory(cat.value)}
                  className={`px-3 py-1.5 rounded-full text-sm font-medium transition-all ${
                    category === cat.value
                      ? "bg-[#E54D2E] text-white shadow-sm"
                      : "bg-orange-50 text-[#1A1A1A]/60 hover:bg-orange-100"
                  }`}
                >
                  {cat.emoji} {cat.label}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="text-sm font-semibold text-[#1A1A1A] mb-1.5 block">
              📷 사진
            </label>
            <ImageUpload value={imageUrl} onChange={setImageUrl} />
          </div>

          <div>
            <label className="text-sm font-semibold text-[#1A1A1A] mb-1.5 block">
              ✍️ 왜 독보적인가요?
            </label>
            <Textarea
              name="claim"
              placeholder="이 집의 이 메뉴가 독보적인 이유를 알려주세요. 다른 곳에서는 절대 따라올 수 없는 그 맛..."
              className="rounded-xl border-orange-200 focus:border-[#E54D2E] focus:ring-[#E54D2E]/20 bg-orange-50/30 min-h-[120px] resize-none"
              value={claim}
              onChange={(e) => setClaim(e.target.value)}
              maxLength={500}
              required
            />
            <p className="text-xs text-[#1A1A1A]/40 mt-1 text-right">
              {claim.length}/500
            </p>
          </div>

          {error && (
            <div className="bg-red-50 text-red-600 text-sm px-3 py-2 rounded-xl">
              {error}
            </div>
          )}

          <Button
            type="submit"
            disabled={isPending}
            className="w-full rounded-xl bg-[#E54D2E] hover:bg-[#D4432A] text-white font-bold py-3 text-base shadow-lg shadow-red-200 disabled:opacity-50"
          >
            {isPending
              ? isEdit
                ? "수정 중..."
                : "등록 중..."
              : isEdit
              ? "수정 완료"
              : "🔥 독보적 등록하기"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
