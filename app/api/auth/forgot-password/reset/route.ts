import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcrypt";
import supabase from "@/config/supabase";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { token, new_password: newPassword } = body;

    if (!token || !newPassword) {
      return NextResponse.json({ erro: "Token e nova senha são obrigatórios." }, { status: 400 });
    }

    const { data: tokenRecord, error: tokenError } = await supabase
      .from("password_recoveries")
      .select("id, user_id, expires_at, used")
      .eq("token", token)
      .maybeSingle();

    if (tokenError || !tokenRecord) {
      return NextResponse.json({ erro: "Token inválido." }, { status: 400 });
    }

    if (tokenRecord.used) {
      return NextResponse.json({ erro: "Token já utilizado." }, { status: 400 });
    }

    const now = new Date();
    const expiresAt = new Date(tokenRecord.expires_at);

    if (now > expiresAt) {
      return NextResponse.json({ erro: "Token expirado." }, { status: 400 });
    }

    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(newPassword, salt);

    const { error: updateError } = await supabase
      .from("users")
      .update({ password_hash: passwordHash })
      .eq("id", tokenRecord.user_id);

    if (updateError) {
      return NextResponse.json({ erro: "Erro ao atualizar senha." }, { status: 500 });
    }

    await supabase.from("password_recoveries").update({ used: true }).eq("id", tokenRecord.id);

    return NextResponse.json({ mensagem: "Senha redefinida com sucesso!" });
  } catch (error) {
    console.error("Error resetting password:", error);
    return NextResponse.json({ erro: "Erro interno." }, { status: 500 });
  }
}
