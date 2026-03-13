import {
  getTrendingPosts,
  getMostChallengedPosts,
  getTopAcknowledgedPosts,
} from "@/lib/actions/ranking-actions";
import { RankingClient } from "@/components/ranking/ranking-client";

export default async function RankingPage() {
  const [trending, mostChallenged, topAcknowledged] = await Promise.all([
    getTrendingPosts(),
    getMostChallengedPosts(),
    getTopAcknowledgedPosts(),
  ]);

  return (
    <RankingClient
      trending={trending.data || []}
      mostChallenged={mostChallenged.data || []}
      topAcknowledged={topAcknowledged.data || []}
    />
  );
}
