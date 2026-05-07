import { httpClient } from "@/lib/httpClient";

export async function getNotifications(token: string) {
  return httpClient.get("/notifications", token);
}

export async function markNotificationRead(id: string, token: string) {
  return httpClient.patch(`/notifications/${id}/read`, {}, token);
}

export async function markAllNotificationsRead(token: string) {
  return httpClient.patch("/notifications/read-all", {}, token);
}
