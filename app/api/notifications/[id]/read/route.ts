import { NextRequest, NextResponse } from "next/server";
import supabase from "@/config/supabase";
import { verifyToken, unauthorizedResponse } from "@/lib/auth";

/**
 * PATCH /api/notifications/[id]/read
 * 
 * Marca uma notificação específica como lida.
 * 
 * @param {NextRequest} req - Objeto de requisição.
 * @param {Object} context - Contexto da rota.
 * @param {Object} context.params - Parâmetros da URL.
 * @param {string} context.params.id - ID da notificação a ser lida.
 * @returns {Promise<Response>} Mensagem de sucesso ou erro (401, 500).
 */
export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const user = await verifyToken(req);
  if (!user) return unauthorizedResponse();

  try {
    const { id } = await params;

    const { error } = await supabase
      .from("notifications")
      .update({ read: true })
      .eq("id", id)
      .eq("user_id", user.id);

    if (error) {
      return NextResponse.json({ erro: "Erro ao marcar notificação como lida." }, { status: 500 });
    }

    return NextResponse.json({ mensagem: "Notificação marcada como lida." }, { status: 200 });
  } catch (error) {
    console.error("General error marking notification:", error);
    return NextResponse.json({ erro: "Erro interno no servidor." }, { status: 500 });
  }
}
