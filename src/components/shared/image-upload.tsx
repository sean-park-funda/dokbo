"use client";

import { useState, useRef, useTransition } from "react";
import { Camera, X, Loader2 } from "lucide-react";
import { uploadPostImage } from "@/lib/actions/image-actions";
import Image from "next/image";

interface ImageUploadProps {
  value?: string | null;
  onChange: (url: string | null) => void;
}

export function ImageUpload({ value, onChange }: ImageUploadProps) {
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleSelect = () => {
    inputRef.current?.click();
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setError(null);

    startTransition(async () => {
      const formData = new FormData();
      formData.append("file", file);
      const result = await uploadPostImage(formData);
      if (result.error) {
        setError(result.error);
      } else if (result.url) {
        onChange(result.url);
      }
    });

    // Reset input
    if (inputRef.current) inputRef.current.value = "";
  };

  const handleRemove = () => {
    onChange(null);
    setError(null);
  };

  return (
    <div>
      <input
        ref={inputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp,image/gif"
        onChange={handleChange}
        className="hidden"
      />

      {value ? (
        <div className="relative rounded-xl overflow-hidden border border-orange-200">
          <Image
            src={value}
            alt="업로드된 이미지"
            width={400}
            height={300}
            className="w-full h-48 object-cover"
          />
          <button
            type="button"
            onClick={handleRemove}
            className="absolute top-2 right-2 w-7 h-7 rounded-full bg-black/50 text-white flex items-center justify-center hover:bg-black/70 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      ) : (
        <button
          type="button"
          onClick={handleSelect}
          disabled={isPending}
          className="w-full h-32 rounded-xl border-2 border-dashed border-orange-200 bg-orange-50/30 flex flex-col items-center justify-center gap-2 text-[#1A1A1A]/40 hover:text-[#1A1A1A]/60 hover:border-orange-300 transition-colors disabled:opacity-50"
        >
          {isPending ? (
            <>
              <Loader2 className="w-6 h-6 animate-spin" />
              <span className="text-sm">업로드 중...</span>
            </>
          ) : (
            <>
              <Camera className="w-6 h-6" />
              <span className="text-sm">사진 추가 (선택)</span>
            </>
          )}
        </button>
      )}

      {error && (
        <p className="text-xs text-red-500 mt-1">{error}</p>
      )}
    </div>
  );
}
