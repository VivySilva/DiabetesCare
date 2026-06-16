import { NextRequest } from "next/server";
import supabase from "@/config/supabase";
import { verifyToken, unauthorizedResponse } from "@/lib/auth";
import { successResponse, errorResponse } from "@/lib/api-response";

/**
 * GET /api/notifications
 * 
 * Recupera a lista de notificações do usuário autenticado.
 * 
 * @param {NextRequest} req - Objeto de requisição.
 * @returns {Promise<Response>} Lista de notificações ou erro (401, 500).
 */
export async function GET(req: NextRequest) {
  console.log("GET /api/notifications called");
  const user = await verifyToken(req);
  if (!user) return unauthorizedResponse();

  try {
    const { data, error } = await supabase
      .from("notifications")
      .select("id, type, title, body, read, scheduled_for, created_at")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Error fetching notifications:", error);
      return errorResponse("Erro ao buscar notificações.", 500);
    }

    return successResponse({ notifications: data });
  } catch (error) {
    console.error("General error listing notifications:", error);
    return errorResponse("Erro interno no servidor.", 500);
  }
}

/**
 * POST /api/notifications
 * 
 * Cria uma nova notificação para o usuário autenticado.
 */
export async function POST(req: NextRequest) {
  const user = await verifyToken(req);
  if (!user) return unauthorizedResponse();

  try {
    const jsonBody = await req.json();
    const { title, body, type } = jsonBody;

    if (!title || !body || !type) {
      return errorResponse("Dados incompletos.", 400);
    }

    const { data, error } = await supabase
      .from("notifications")
      .insert([
        {
          user_id: user.id,
          title,
          body,
          type,
          read: false
        }
      ])
      .select()
      .single();

    if (error) {
      console.error("Error creating notification:", error);
      return errorResponse("Erro ao criar notificação.", 500);
    }

    return successResponse({ notification: data }, 201);
  } catch (error) {
    console.error("General error creating notification:", error);
    return errorResponse("Erro interno no servidor.", 500);
  }
}
