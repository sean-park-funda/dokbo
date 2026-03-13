import { PostForm } from "@/components/post/post-form";

export default function NewPostPage() {
  return (
    <div className="px-4 py-6">
      <div className="mb-6">
        <h2 className="text-2xl font-extrabold text-[#1A1A1A]">
          🔥 독보적 맛집 등록
        </h2>
        <p className="text-sm text-[#1A1A1A]/50 mt-1">
          다른 곳에서는 절대 대체할 수 없는 그 맛을 알려주세요
        </p>
      </div>
      <PostForm />
    </div>
  );
}
