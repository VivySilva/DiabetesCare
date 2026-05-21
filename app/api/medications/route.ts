import { NextRequest, NextResponse } from "next/server";
import supabase from "@/config/supabase";
import { verifyToken, unauthorizedResponse } from "@/lib/auth";

/**
 * GET /api/medications
 * 
 * Recupera a lista de medicamentos do usuário autenticado.
 * 
 * @param {NextRequest} req - Objeto de requisição.
 * @returns {Promise<Response>} Lista de medicamentos ou erro (401, 500).
 */
export async function GET(req: NextRequest) {
  const user = await verifyToken(req);
  if (!user) return unauthorizedResponse();

  try {
    const { data, error } = await supabase
      .from("medication_records")
      .select("*")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Error fetching medication records:", error);
      return NextResponse.json(
        { erro: "Erro ao buscar medicamentos." },
        { status: 500 }
      );
    }

    return NextResponse.json({ records: data }, { status: 200 });
  } catch (error) {
    console.error("General error in medication listing:", error);
    return NextResponse.json({ erro: "Erro interno no servidor." }, { status: 500 });
  }
}

/**
 * POST /api/medications
 * 
 * Registra um novo medicamento no cronograma do usuário.
 * 
 * @param {NextRequest} req - Objeto de requisição.
 * @param {Object} req.body - Dados do medicamento.
 * @param {string} req.body.category - Categoria (ex: Insulina, Oral).
 * @param {string} req.body.medication_name - Nome do remédio.
 * @param {string} req.body.time - Horário da dose (HH:mm).
 * @param {boolean} req.body.notify - Se deseja receber notificação.
 * @returns {Promise<Response>} Registro criado ou erro (400, 401, 500).
 */
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
