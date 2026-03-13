import { notFound, redirect } from "next/navigation";
import { getPost } from "@/lib/actions/post-actions";
import { requireAuth } from "@/lib/auth-guard";
import { PostForm } from "@/components/post/post-form";

interface EditPostPageProps {
  params: Promise<{ id: string }>;
}

export default async function EditPostPage({ params }: EditPostPageProps) {
  const { id } = await params;
  const { user, error: authError } = await requireAuth();

  if (authError || !user) {
    redirect("/");
  }

  const { data: post, error } = await getPost(id);

  if (error || !post) {
    notFound();
  }

  if (post.author_id !== user.id) {
    redirect(`/post/${id}`);
  }

  return (
    <div className="px-4 py-6">
      <div className="mb-6">
        <h2 className="text-2xl font-extrabold text-[#1A1A1A]">
          ✏️ 선언 수정
        </h2>
        <p className="text-sm text-[#1A1A1A]/50 mt-1">
          내용을 수정하고 저장하세요
        </p>
      </div>
      <PostForm
        initialData={{
          id: post.id,
          restaurant_name: post.restaurant_name,
          menu_item: post.menu_item,
          location: post.location,
          category: post.category,
          claim: post.claim,
          image_url: post.image_url,
        }}
      />
    </div>
  );
}
