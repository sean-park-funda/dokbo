import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/actions/auth-actions";
import { getNotifications } from "@/lib/actions/notification-actions";
import { NotificationsClient } from "@/components/notifications/notifications-client";

export default async function NotificationsPage() {
  const currentUser = await getCurrentUser();

  if (!currentUser) {
    redirect("/");
  }

  const { data: notifications } = await getNotifications();

  return <NotificationsClient notifications={notifications || []} />;
}
