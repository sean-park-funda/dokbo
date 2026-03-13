import { Suspense } from "react";
import { getPosts } from "@/lib/actions/post-actions";
import { PostCard } from "@/components/post/post-card";
import { CategoryTabs } from "@/components/layout/category-tabs";
import { EmptyState } from "@/components/shared/empty-state";
import { SeedButton } from "@/components/shared/seed-button";

interface HomeProps {
  searchParams: Promise<{ category?: string }>;
}

export default async function Home({ searchParams }: HomeProps) {
  const params = await searchParams;
  const category = params.category || "전체";
  const { data: posts } = await getPosts(category);

  return (
    <div>
      <Suspense fallback={null}>
        <CategoryTabs />
      </Suspense>

      <div className="px-4 space-y-3 mt-1">
        {posts.length === 0 ? (
          <div>
            <EmptyState />
            <div className="flex justify-center mt-4">
              <SeedButton />
            </div>
          </div>
        ) : (
          posts.map((post: Record<string, unknown>, index: number) => (
            <PostCard
              key={post.id as string}
              post={post as unknown as React.ComponentProps<typeof PostCard>["post"]}
              index={index}
            />
          ))
        )}
      </div>
    </div>
  );
}
