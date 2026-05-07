import { NextRequest, NextResponse } from "next/server";
import supabase from "@/config/supabase";
import { verifyToken, unauthorizedResponse } from "@/lib/auth";

export async function PATCH(req: NextRequest) {
  const user = await verifyToken(req);
  if (!user) return unauthorizedResponse();

  try {
    const { error } = await supabase
      .from("notifications")
      .update({ read: true })
      .eq("user_id", user.id)
      .eq("read", false);

    if (error) {
      return NextResponse.json({ erro: "Erro ao marcar notificações como lidas." }, { status: 500 });
    }

    return NextResponse.json({ mensagem: "Todas as notificações foram marcadas como lidas." }, { status: 200 });
  } catch (error) {
    console.error("General error marking all notifications:", error);
    return NextResponse.json({ erro: "Erro interno no servidor." }, { status: 500 });
  }
}
