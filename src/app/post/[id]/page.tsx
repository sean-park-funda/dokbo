import { notFound } from "next/navigation";
import { getPost } from "@/lib/actions/post-actions";
import { getChallenges } from "@/lib/actions/challenge-actions";
import { PostDetail } from "@/components/post/post-detail";
import { ChallengeCard } from "@/components/challenge/challenge-card";
import { ChallengeForm } from "@/components/challenge/challenge-form";

interface PostPageProps {
  params: Promise<{ id: string }>;
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
