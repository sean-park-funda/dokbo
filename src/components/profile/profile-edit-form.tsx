"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent } from "@/components/ui/card";
import { AVATAR_EMOJIS } from "@/lib/constants";
import { updateProfile } from "@/lib/actions/auth-actions";

interface ProfileEditFormProps {
  initialData: {
    nickname: string;
    avatar_emoji: string;
    bio: string;
  };
}

export function ProfileEditForm({ initialData }: ProfileEditFormProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [nickname, setNickname] = useState(initialData.nickname);
  const [avatarEmoji, setAvatarEmoji] = useState(initialData.avatar_emoji);
  const [bio, setBio] = useState(initialData.bio);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(false);

    if (!nickname.trim()) {
      setError("닉네임을 입력해주세요");
      return;
    }

    if (nickname.length > 20) {
      setError("닉네임은 20자 이내로 입력해주세요");
      return;
    }

    startTransition(async () => {
      const result = await updateProfile({
        nickname: nickname.trim(),
        avatar_emoji: avatarEmoji,
        bio: bio.trim(),
      });

      if (result.error) {
        setError(result.error);
      } else {
        setSuccess(true);
        setTimeout(() => {
          router.push("/my");
          router.refresh();
        }, 500);
      }
    });
  };

  return (
    <Card className="border-orange-100/60 bg-white rounded-2xl">
      <CardContent className="p-5">
        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Avatar emoji picker */}
          <div>
            <label className="text-sm font-semibold text-[#1A1A1A] mb-2 block">
              아바타
            </label>
            <div className="flex items-center gap-4 mb-3">
              <div className="w-16 h-16 rounded-full bg-orange-100 flex items-center justify-center text-3xl">
                {avatarEmoji}
              </div>
              <p className="text-sm text-[#1A1A1A]/50">
                아래에서 원하는 이모지를 선택하세요
              </p>
            </div>
            <div className="grid grid-cols-8 gap-2">
              {AVATAR_EMOJIS.map((emoji) => (
                <button
                  key={emoji}
                  type="button"
                  onClick={() => setAvatarEmoji(emoji)}
                  className={`w-10 h-10 rounded-xl flex items-center justify-center text-xl transition-all ${
                    avatarEmoji === emoji
                      ? "bg-[#E54D2E] scale-110 shadow-md"
                      : "bg-orange-50 hover:bg-orange-100"
                  }`}
                >
                  {emoji}
                </button>
              ))}
            </div>
          </div>

          {/* Nickname */}
          <div>
            <label className="text-sm font-semibold text-[#1A1A1A] mb-1.5 block">
              닉네임
            </label>
            <Input
              value={nickname}
              onChange={(e) => setNickname(e.target.value)}
              placeholder="닉네임을 입력해주세요"
              maxLength={20}
              className="rounded-xl border-orange-200 focus:border-[#E54D2E] focus:ring-[#E54D2E]/20 bg-orange-50/30"
              required
            />
            <p className="text-xs text-[#1A1A1A]/40 mt-1 text-right">
              {nickname.length}/20
            </p>
          </div>

          {/* Bio */}
          <div>
            <label className="text-sm font-semibold text-[#1A1A1A] mb-1.5 block">
              자기소개
            </label>
            <Textarea
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              placeholder="간단한 자기소개를 작성해보세요 (선택)"
              maxLength={100}
              className="rounded-xl border-orange-200 focus:border-[#E54D2E] focus:ring-[#E54D2E]/20 bg-orange-50/30 min-h-[80px] resize-none"
            />
            <p className="text-xs text-[#1A1A1A]/40 mt-1 text-right">
              {bio.length}/100
            </p>
          </div>

          {error && (
            <div className="bg-red-50 text-red-600 text-sm px-3 py-2 rounded-xl">
              {error}
            </div>
          )}

          {success && (
            <div className="bg-green-50 text-green-600 text-sm px-3 py-2 rounded-xl">
              프로필이 수정되었습니다!
            </div>
          )}

          <Button
            type="submit"
            disabled={isPending}
            className="w-full rounded-xl bg-[#E54D2E] hover:bg-[#D4432A] text-white font-bold py-3 text-base shadow-lg shadow-red-200 disabled:opacity-50"
          >
            {isPending ? "저장 중..." : "저장하기"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
