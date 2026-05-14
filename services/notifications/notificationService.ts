import { httpClient } from "@/lib/httpClient";

/**
 * Get user notifications.
 * 
 * Recupera a lista de notificações do usuário autenticado.
 * 
 * @param {string} token - Token de autenticação JWT.
 * @returns {Promise<any>} Lista de notificações.
 */
export async function getNotifications(token: string) {
  return httpClient.get("/notifications", token);
}

/**
 * Mark a specific notification as read.
 * 
 * Marca uma notificação individual como lida.
 * 
 * @param {string} id - ID da notificação.
 * @param {string} token - Token de autenticação JWT.
 * @returns {Promise<any>} Resposta da API.
 */
export async function markNotificationRead(id: string, token: string) {
  return httpClient.patch(`/notifications/${id}/read`, {}, token);
}

/**
 * Mark all notifications as read.
 * 
 * Marca todas as notificações pendentes como lidas.
 * 
 * @param {string} token - Token de autenticação JWT.
 * @returns {Promise<any>} Resposta da API.
 */
export async function markAllNotificationsRead(token: string) {
  return httpClient.patch("/notifications/read-all", {}, token);
}
