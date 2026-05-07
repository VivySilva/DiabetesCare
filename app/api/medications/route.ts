import { NextRequest, NextResponse } from "next/server";
import supabase from "@/config/supabase";
import { verifyToken, unauthorizedResponse } from "@/lib/auth";

export async function POST(req: NextRequest) {
  const user = await verifyToken(req);
  if (!user) return unauthorizedResponse();

  try {
    const body = await req.json();
    const { category, medication_name, time, notify } = body;

    if (!category || !medication_name || !time || notify === undefined) {
      return NextResponse.json(
        { erro: "Categoria, nome do medicamento, horário e notificação são obrigatórios." },
        { status: 400 }
      );
    }

    const { data, error } = await supabase
      .from("medication_records")
      .insert([
        {
          user_id: user.id,
          category,
          medication_name,
          time,
          notify,
        },
      ])
      .select()
      .single();

    if (error) {
      console.error("Error inserting medication record:", error);
      return NextResponse.json(
        { erro: "Erro interno ao criar registro de medicamento.", detail: error.message },
        { status: 500 }
      );
    }

    // GATILHO: Se notify for true, criar uma notificação de lembrete
    if (notify) {
      await supabase.from("notifications").insert([
        {
          user_id: user.id,
          type: "MEDICATION_REMINDER",
          title: "Lembrete de Medicamento",
          body: `Está quase na hora de tomar seu ${medication_name} (${time}).`,
          read: false,
        },
      ]);
    }

    return NextResponse.json(
      { mensagem: "Registro criado com sucesso!", record: data },
      { status: 201 }
    );
  } catch (error) {
    console.error("General error in medication registration:", error);
    return NextResponse.json({ erro: "Internal server error." }, { status: 500 });
  }
}
