import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/actions/auth-actions";
import { ProfileEditForm } from "@/components/profile/profile-edit-form";

export default async function ProfileEditPage() {
  const currentUser = await getCurrentUser();

  if (!currentUser) {
    redirect("/");
  }

  return (
    <div className="px-4 py-6">
      <div className="mb-6">
        <h2 className="text-2xl font-extrabold text-[#1A1A1A]">
          프로필 편집
        </h2>
        <p className="text-sm text-[#1A1A1A]/50 mt-1">
          닉네임과 아바타를 변경할 수 있어요
        </p>
      </div>
      <ProfileEditForm
        initialData={{
          nickname: currentUser.profile?.nickname || "",
          avatar_emoji: currentUser.profile?.avatar_emoji || "🍚",
          bio: currentUser.profile?.bio || "",
        }}
      />
    </div>
  );
}
