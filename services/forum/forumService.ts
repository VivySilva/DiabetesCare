import { httpClient } from "@/lib/httpClient";

export async function getForumTopics() {
  return httpClient.get("/forum");
}

export async function getForumTopicById(id: string) {
  return httpClient.get(`/forum/${id}`);
}

export async function createForumTopic(data: { title: string; preview?: string }, token: string) {
  return httpClient.post("/forum", data, token);
}

export async function replyToForumTopic(topicId: string, content: string, token: string) {
  return httpClient.post(`/forum/${topicId}/reply`, { content }, token);
}

export async function likeForumTopic(topicId: string, token: string) {
  return httpClient.post(`/forum/${topicId}/like`, {}, token);
}

export async function unlikeForumTopic(topicId: string, token: string) {
  return httpClient.delete(`/forum/${topicId}/like`, token);
}
