"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { seedData } from "@/lib/actions/seed-actions";

export function SeedButton() {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [done, setDone] = useState(false);

  const handleSeed = () => {
    startTransition(async () => {
      const result = await seedData();
      if (!result.error) {
        setDone(true);
        router.refresh();
      }
    });
  };

  if (done) return null;

  return (
    <Button
      onClick={handleSeed}
      disabled={isPending}
      variant="outline"
      className="rounded-xl border-orange-200 text-orange-600 hover:bg-orange-50"
    >
      {isPending ? "데이터 생성 중..." : "🌱 샘플 데이터 생성하기"}
    </Button>
  );
}
