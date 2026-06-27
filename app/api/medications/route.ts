import { NextRequest, NextResponse } from "next/server";
import supabase from "@/config/supabase";
import { verifyToken, unauthorizedResponse } from "@/lib/auth";
import { medicationSchema } from "@/schemas/medication";

/**
 * GET /api/medications
 * * Recupera a lista de medicamentos do usuário autenticado.
 * * @param {NextRequest} req - Objeto de requisição.
 * @returns {Promise<Response>} Lista de medicamentos ou erro (401, 500).
 */
export async function GET(req: NextRequest) {
  const user = await verifyToken(req);
  if (!user) return unauthorizedResponse();

  try {
    const { data, error } = await supabase
      .from("medication_records")
      .select("*")
      .eq("patient_id", user.id)
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
 * * Registra um novo medicamento no cronograma do usuário.
 * * @param {NextRequest} req - Objeto de requisição.
 * @param {Object} req.body - Dados do medicamento.
 * @param {string} req.body.category - Categoria (ex: Insulina, Oral).
 * @param {string} req.body.medication_name - Nome do remédio.
 * @param {string[]} req.body.times - Array de horários da dose (ex: ["08:00", "20:00"]).
 * @param {boolean} req.body.notify - Se deseja receber notificação.
 * @returns {Promise<Response>} Registro criado ou erro (400, 401, 500).
 */
export async function POST(req: NextRequest) {
  const user = await verifyToken(req);
  if (!user) return unauthorizedResponse();

  try {
    const jsonBody = await req.json();
    const result = medicationSchema.safeParse(jsonBody);

    if (!result.success) {
      return NextResponse.json(
        { erro: "Dados inválidos.", detalhes: result.error.issues },
        { status: 400 }
      );
    }

    // Correção: Extraindo 'times' (plural) conforme o seu Schema do Zod
    const { category, medication_name, times, notify } = result.data;

    const { data, error } = await supabase
      .from("medication_records")
      .insert([
        {
          patient_id: user.id,
          category,
          medication_name,
          times, // Correção: Passando o array de horários
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

    // Sempre cria uma notificação para dar feedback ao usuário (mesmo sem background jobs reais ainda)
    const { error: notifError } = await supabase.from("notifications").insert([
      {
        user_id: user.id,
        type: "MEDICATION",
        title: "Lembrete de Medicamento configurado!",
        // Correção: Como 'times' é um array, usamos .join(', ') para formatar a string corretamente
        body: `Você configurou o alarme para ${medication_name} às ${times.join(', ')}.`,
        read: false,
      },
    ]);

    if (notifError) console.error("Error creating medication notification:", notifError);

    return NextResponse.json(
      { mensagem: "Registro criado com sucesso!", record: data },
      { status: 201 }
    );
  } catch (error) {
    console.error("General error in medication registration:", error);
    return NextResponse.json({ erro: "Internal server error." }, { status: 500 });
  }
}