import { NextRequest, NextResponse } from "next/server";
import supabase from "@/config/supabase";
import { verifyToken, unauthorizedResponse } from "@/lib/auth";
import { glucoseSchema } from "@/schemas/glucose";

/**
 * PUT /api/glucose/[id]
 * 
 * Atualiza um registro de medição de glicose existente.
 * Requer que o registro pertença ao usuário autenticado.
 * 
 * @param {NextRequest} req - Objeto de requisição.
 * @param {Object} context - Contexto da rota.
 * @param {Object} context.params - Parâmetros da URL.
 * @param {string} context.params.id - ID do registro de glicose a editar.
 * @param {Object} req.body - Dados atualizados da medição.
 * @returns {Promise<Response>} Registro atualizado ou erro (400, 401, 404, 500).
 */
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const user = await verifyToken(req);
  if (!user) return unauthorizedResponse();

  try {
    const { id } = await params;

    const { data: record, error } = await supabase
      .from("glucose_records")
      .select("*")
      .eq("id", id)
      .eq("patient_id", user.id)
      .single();

    if (error || !record) {
      return NextResponse.json(
        { erro: "Registro de glicose não encontrado." },
        { status: 404 }
      );
    }

    return NextResponse.json({ record }, { status: 200 });
  } catch (error) {
    console.error("General error fetching glucose record:", error);
    return NextResponse.json({ erro: "Erro interno no servidor." }, { status: 500 });
  }
}

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const user = await verifyToken(req);
  if (!user) return unauthorizedResponse();

  try {
    const { id } = await params;
    const body = await req.json();

    const result = glucoseSchema.safeParse(body);
    if (!result.success) {
      return NextResponse.json(
        { erro: result.error.issues[0].message },
        { status: 400 }
      );
    }

    const { data: existingRecord } = await supabase
      .from("glucose_records")
      .select("id")
      .eq("id", id)
      .eq("patient_id", user.id)
      .maybeSingle();

    if (!existingRecord) {
      return NextResponse.json(
        { erro: "Registro de glicose não encontrado." },
        { status: 404 }
      );
    }

    const {
      glucose_value,
      period,
      took_insulin,
      insulin_type,
      insulin_amount,
      injection_site,
      symptoms,
      symptom_intensity,
    } = result.data;

    const { data, error } = await supabase
      .from("glucose_records")
      .update({
        glucose_value,
        period,
        took_insulin,
        insulin_type: took_insulin ? insulin_type : null,
        insulin_amount: took_insulin ? insulin_amount : null,
        injection_site: took_insulin ? injection_site : null,
        symptoms: symptoms || [],
        symptom_intensity: symptom_intensity || null,
      })
      .eq("id", id)
      .select()
      .single();

    if (error) {
      console.error("Error updating glucose record:", error);
      return NextResponse.json(
        { erro: "Erro ao atualizar registro de glicose." },
        { status: 500 }
      );
    }

    return NextResponse.json(
      { mensagem: "Registro atualizado com sucesso!", record: data },
      { status: 200 }
    );
  } catch (error) {
    console.error("General error updating glucose record:", error);
    return NextResponse.json({ erro: "Erro interno no servidor." }, { status: 500 });
  }
}

/**
 * DELETE /api/glucose/[id]
 * 
 * Remove um registro de medição de glicose do usuário autenticado.
 * 
 * @param {NextRequest} req - Objeto de requisição.
 * @param {Object} context - Contexto da rota.
 * @param {Object} context.params - Parâmetros da URL.
 * @param {string} context.params.id - ID do registro de glicose a remover.
 * @returns {Promise<Response>} Mensagem de sucesso ou erro (401, 404, 500).
 */
export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const user = await verifyToken(req);
  if (!user) return unauthorizedResponse();

  try {
    const { id } = await params;

    const { data: existingRecord } = await supabase
      .from("glucose_records")
      .select("id")
      .eq("id", id)
      .eq("patient_id", user.id)
      .maybeSingle();

    if (!existingRecord) {
      return NextResponse.json(
        { erro: "Registro de glicose não encontrado." },
        { status: 404 }
      );
    }

    const { error } = await supabase
      .from("glucose_records")
      .delete()
      .eq("id", id);

    if (error) {
      console.error("Error deleting glucose record:", error);
      return NextResponse.json(
        { erro: "Erro ao remover registro de glicose." },
        { status: 500 }
      );
    }

    return NextResponse.json(
      { mensagem: "Registro de glicose removido com sucesso!" },
      { status: 200 }
    );
  } catch (error) {
    console.error("General error deleting glucose record:", error);
    return NextResponse.json({ erro: "Erro interno no servidor." }, { status: 500 });
  }
}
