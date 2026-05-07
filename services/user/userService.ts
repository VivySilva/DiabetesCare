import { httpClient } from "@/lib/httpClient";

export async function getUserProfile(token: string) {
  return httpClient.get("/user/me", token);
}

export async function updateUserProfile(data: any, token: string) {
  return httpClient.put("/user/me", data, token);
}
