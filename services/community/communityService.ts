import { httpClient } from "@/lib/httpClient";

export async function getCommunityPosts() {
  return httpClient.get("/community");
}

export async function getCommunityPostById(id: string) {
  return httpClient.get(`/community/${id}`);
}

export async function createCommunityPost(data: {
  title: string;
  cover_image_url?: string | null;
  category: string;
  content_html: string;
}, token: string) {
  return httpClient.post("/community", data, token);
}

export async function updateCommunityPost(id: string, data: {
  title?: string;
  cover_image_url?: string | null;
  category?: string;
  content_html?: string;
}, token: string) {
  return httpClient.put(`/community/${id}`, data, token);
}

export async function deleteCommunityPost(id: string, token: string) {
  return httpClient.delete(`/community/${id}`, token);
}
