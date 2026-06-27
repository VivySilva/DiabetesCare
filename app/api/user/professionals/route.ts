import { NextRequest, NextResponse } from "next/server";
import supabase from "@/config/supabase";

/**
 * GET /api/user/professionals
 *
 * Lista pública de profissionais de saúde cadastrados na plataforma.
 * Não requer autenticação — é uma rota pública para exibição na home e busca.
 *
 * @query {number} [page=1] - Número da página.
 * @query {number} [limit=8] - Itens por página (máx 20).
 * @returns {Promise<Response>} Lista paginada de profissionais com dados públicos.
 */
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const page = Math.max(1, parseInt(searchParams.get("page") || "1", 10) || 1);
    const limit = Math.min(20, Math.max(1, parseInt(searchParams.get("limit") || "8", 10) || 8));
    const from = (page - 1) * limit;
    const to = from + limit - 1;

    // Contar total de profissionais
    const { count: totalCount, error: countError } = await supabase
      .from("users")
      .select("*", { count: "exact", head: true })
      .eq("role", "PROFESSIONAL");

    if (countError) {
      console.error("Erro ao contar profissionais:", countError);
      return NextResponse.json({ erro: "Erro ao contar profissionais." }, { status: 500 });
    }

    // Buscar IDs dos profissionais com paginação
    const { data: userRows, error: usersError } = await supabase
      .from("users")
      .select("id, avatar_url, created_at")
      .eq("role", "PROFESSIONAL")
      .order("created_at", { ascending: false })
      .range(from, to);

    if (usersError || !userRows) {
      console.error("Erro ao buscar profissionais:", usersError);
      return NextResponse.json({ erro: "Erro ao buscar profissionais." }, { status: 500 });
    }

    const ids = userRows.map((u) => u.id);

    // Buscar dados específicos dos profissionais
    let professionalsData: any[] = [];
    if (ids.length > 0) {
      const { data: profRows } = await supabase
        .from("professionals")
        .select("id, name, specialty, license_number, education, clinic_address, clinic_name, professional_email, professional_phone, bio")
        .in("id", ids);

      professionalsData = profRows || [];
    }

    // Combinar dados
    const professionals = userRows.map((u) => {
      const prof = professionalsData.find((p) => p.id === u.id);
      return {
        id: u.id,
        avatar_url: u.avatar_url,
        created_at: u.created_at,
        name: prof?.name || "Profissional",
        specialty: prof?.specialty || null,
        license_number: prof?.license_number || null,
        education: prof?.education || null,
        clinic_address: prof?.clinic_address || null,
        bio: prof?.bio || null,
      };
    });

    const totalPages = Math.ceil((totalCount || 0) / limit);

    return NextResponse.json({
      professionals,
      pagination: {
        page,
        limit,
        total: totalCount || 0,
        totalPages,
        hasNext: page < totalPages,
        hasPrev: page > 1,
      },
    });
  } catch (error) {
    console.error("Erro geral ao listar profissionais:", error);
    return NextResponse.json({ erro: "Erro interno no servidor." }, { status: 500 });
  }
}
