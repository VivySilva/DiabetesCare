import { NextRequest, NextResponse } from "next/server";
import supabase from "@/config/supabase";
import { verifyToken, unauthorizedResponse } from "@/lib/auth";

/**
 * DELETE /api/medications/[id]
 * 
 * Remove um registro de medicamento do usuário autenticado.
 * 
 * @param {NextRequest} req - Objeto de requisição.
 * @param {Object} context - Contexto da rota.
 * @param {Object} context.params - Parâmetros da URL.
 * @param {string} context.params.id - ID do registro de medicamento a remover.
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
      .from("medication_records")
      .select("id")
      .eq("id", id)
      .eq("user_id", user.id)
      .maybeSingle();

    if (!existingRecord) {
      return NextResponse.json(
        { erro: "Registro de medicamento não encontrado." },
        { status: 404 }
      );
    }

    const { error } = await supabase
      .from("medication_records")
      .delete()
      .eq("id", id);

    if (error) {
      console.error("Error deleting medication record:", error);
      return NextResponse.json(
        { erro: "Erro ao remover registro de medicamento." },
        { status: 500 }
      );
    }

    return NextResponse.json(
      { mensagem: "Registro de medicamento removido com sucesso!" },
      { status: 200 }
    );
  } catch (error) {
    console.error("General error deleting medication record:", error);
    return NextResponse.json({ erro: "Erro interno no servidor." }, { status: 500 });
  }
}
