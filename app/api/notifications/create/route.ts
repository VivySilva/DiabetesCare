import { NextRequest } from "next/server";
import supabase from "@/config/supabase";
import { verifyToken, unauthorizedResponse } from "@/lib/auth";
import { successResponse, errorResponse } from "@/lib/api-response";

/**
 * POST /api/notifications/create
 * * Cria uma nova notificação para o usuário (ex: lembrete de glicemia ou medicação).
 */
export async function POST(req: NextRequest) {
  const user = await verifyToken(req);
  if (!user) return unauthorizedResponse();

  try {
    const { title, body, type, scheduled_for } = await req.json();

    // Validação simples: não podemos criar uma notificação sem título ou mensagem
    if (!title || !body) {
      return errorResponse(
        "Título e corpo da notificação são obrigatórios.",
        400,
      );
    }

    const { data, error } = await supabase
      .from("notifications")
      .insert([
        {
          user_id: user.id,
          title,
          body,
          type: type || "SYSTEM",
          scheduled_for: scheduled_for || null,
          read: false,
        },
      ])
      .select();

    if (error) {
      console.error("Error creating notification:", error);
      return errorResponse("Erro ao criar notificação no banco de dados.", 500);
    }

    return successResponse({ notification: data?.[0] });
  } catch (error) {
    console.error("General error creating notification:", error);
    return errorResponse("Erro interno no servidor.", 500);
  }
}
