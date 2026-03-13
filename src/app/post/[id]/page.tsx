import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { getPost } from "@/lib/actions/post-actions";
import { getChallenges } from "@/lib/actions/challenge-actions";
import { PostDetail } from "@/components/post/post-detail";
import { ChallengeCard } from "@/components/challenge/challenge-card";
import { ChallengeForm } from "@/components/challenge/challenge-form";

interface PostPageProps {
  params: Promise<{ id: string }>;
}

export async function generateMetadata({
  params,
}: PostPageProps): Promise<Metadata> {
  const { id } = await params;
  const { data: post } = await getPost(id);

  if (!post) {
    return { title: "독보적" };
  }

  const title = `${post.restaurant_name} · ${post.menu_item} - 독보적`;
  const description = post.claim.slice(0, 150);

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      images: post.image_url ? [{ url: post.image_url }] : [],
    },
    twitter: {
      card: post.image_url ? "summary_large_image" : "summary",
      title,
      description,
    },
  };
}

export default async function PostPage({ params }: PostPageProps) {
  const { id } = await params;
  const { data: post, error } = await getPost(id);

  if (error || !post) {
    notFound();
  }

  const { data: challenges } = await getChallenges(id);

  const acknowledges = challenges.filter(
    (c: { type: string }) => c.type === "인정"
  );
  const contestations = challenges.filter(
    (c: { type: string }) => c.type === "도전"
  );

  return (
    <div className="px-4 py-4 space-y-4">
      <PostDetail post={post} />

      <div className="space-y-3">
        <ChallengeForm postId={id} />

        {challenges.length > 0 && (
          <div className="space-y-4">
            {acknowledges.length > 0 && (
              <div>
                <h3 className="text-sm font-bold text-green-700 mb-2 flex items-center gap-1">
                  👍 인정{" "}
                  <span className="text-[#1A1A1A]/40 font-normal">
                    {acknowledges.length}
                  </span>
                </h3>
                <div className="space-y-2">
                  {acknowledges.map(
                    (
                      challenge: React.ComponentProps<
                        typeof ChallengeCard
                      >["challenge"],
                      index: number
                    ) => (
                      <ChallengeCard
                        key={challenge.id}
                        challenge={challenge}
                        index={index}
                      />
                    )
                  )}
                </div>
              </div>
            )}

            {contestations.length > 0 && (
              <div>
                <h3 className="text-sm font-bold text-orange-700 mb-2 flex items-center gap-1">
                  🔥 도전{" "}
                  <span className="text-[#1A1A1A]/40 font-normal">
                    {contestations.length}
                  </span>
                </h3>
                <div className="space-y-2">
                  {contestations.map(
                    (
                      challenge: React.ComponentProps<
                        typeof ChallengeCard
                      >["challenge"],
                      index: number
                    ) => (
                      <ChallengeCard
                        key={challenge.id}
                        challenge={challenge}
                        index={index}
                      />
                    )
                  )}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
