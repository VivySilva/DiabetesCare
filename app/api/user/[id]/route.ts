import { NextRequest, NextResponse } from "next/server";
import supabase from "@/config/supabase";

/**
 * GET /api/user/:id
 *
 * Retorna o perfil público de um usuário (apenas profissionais têm perfil público completo).
 * Não requer autenticação — é uma rota pública.
 *
 * @param {NextRequest} req - Objeto de requisição.
 * @param {Object} context - Contexto da rota com o parâmetro dinâmico.
 * @returns {Promise<Response>} Dados públicos do perfil ou erro.
 */
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    if (!id) {
      return NextResponse.json({ erro: "ID do usuário é obrigatório." }, { status: 400 });
    }

    // 1. Buscar dados do usuário na tabela users
    const { data: authData, error: authError } = await supabase
      .from("users")
      .select("id, avatar_url, role, created_at")
      .eq("id", id)
      .maybeSingle();

    if (authError || !authData) {
      return NextResponse.json({ erro: "Usuário não encontrado." }, { status: 404 });
    }

    // 2. Se for profissional, retornar perfil público completo
    if (authData.role === "PROFESSIONAL") {
      const { data: profData, error: profError } = await supabase
        .from("professionals")
        .select("name, specialty, license_number, education, clinic_address, clinic_name, professional_email, professional_phone, bio, gender")
        .eq("id", id)
        .maybeSingle();

      if (profError || !profData) {
        return NextResponse.json({ erro: "Perfil profissional não encontrado." }, { status: 404 });
      }

      return NextResponse.json({
        profile: {
          id: authData.id,
          role: authData.role,
          avatar_url: authData.avatar_url,
          created_at: authData.created_at,
          name: profData.name,
          specialty: profData.specialty,
          license_number: profData.license_number,
          education: profData.education,
          clinic_address: profData.clinic_address,
          clinic_name: profData.clinic_name,
          professional_email: profData.professional_email,
          professional_phone: profData.professional_phone,
          bio: profData.bio,
          gender: profData.gender,
        },
      });
    }

    // 3. Pacientes não têm perfil público no momento
    return NextResponse.json(
      { erro: "Este perfil não está disponível publicamente." },
      { status: 403 }
    );
  } catch (error) {
    console.error("Erro ao buscar perfil público:", error);
    return NextResponse.json({ erro: "Erro interno no servidor." }, { status: 500 });
  }
}
