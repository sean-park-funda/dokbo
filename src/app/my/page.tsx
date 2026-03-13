import { getCurrentUser } from "@/lib/actions/auth-actions";
import { getMyPosts } from "@/lib/actions/my-actions";
import { getMyBookmarks } from "@/lib/actions/bookmark-actions";
import { MyPageClient } from "@/components/my/my-page-client";

export default async function MyPage() {
  const currentUser = await getCurrentUser();

  if (!currentUser) {
    return <MyPageClient user={null} profile={null} posts={[]} bookmarks={[]} />;
  }

  const [postsResult, bookmarksResult] = await Promise.all([
    getMyPosts(),
    getMyBookmarks(),
  ]);

  return (
    <MyPageClient
      user={currentUser.user}
      profile={currentUser.profile}
      posts={postsResult.data || []}
      bookmarks={(bookmarksResult.data as typeof postsResult.data) || []}
    />
  );
}
