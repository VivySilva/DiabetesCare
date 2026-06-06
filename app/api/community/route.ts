import { NextRequest, NextResponse } from "next/server";
import supabase from "@/config/supabase";
import { verifyToken, unauthorizedResponse } from "@/lib/auth";

/**
 * GET /api/community
 * 
 * Recupera a lista de todas as publicações da comunidade, ordenadas por data.
 * 
 * @returns {Promise<Response>} Lista de posts com dados do autor.
 */
export async function GET() {
  try {
    const { data, error } = await supabase
      .from("community_posts")
      .select("id, title, cover_image_url, category, content_html, is_moderated, created_at, author_id")
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Error fetching community posts:", error);
      return NextResponse.json({ erro: "Erro ao buscar publicações." }, { status: 500 });
    }

    const authorIds = Array.from(new Set((data || []).map(post => post.author_id)));
    
    let usersMap: Record<string, any> = {};
    if (authorIds.length > 0) {
      const { data: patients } = await supabase.from("patients").select("id, name, avatar_url, role").in("id", authorIds);
      const { data: professionals } = await supabase.from("professionals").select("id, name, avatar_url, role, license_number").in("id", authorIds);
      
      patients?.forEach(p => usersMap[p.id] = p);
      professionals?.forEach(p => usersMap[p.id] = p);
    }

    const formattedData = data?.map(post => ({
      ...post,
      users: usersMap[post.author_id] || null
    })) || [];

    return NextResponse.json(formattedData, { status: 200 });
  } catch (error) {
    console.error("General error listing posts:", error);
    return NextResponse.json({ erro: "Erro interno no servidor." }, { status: 500 });
  }
}

/**
 * POST /api/community
 * 
 * Cria uma nova publicação na comunidade. Requer autenticação.
 * 
 * @param {NextRequest} req - Objeto de requisição.
 * @param {Object} req.body - Conteúdo da publicação.
 * @param {string} req.body.title - Título da postagem.
 * @param {string} [req.body.cover_image_url] - URL da imagem de capa.
 * @param {string} [req.body.category] - Categoria (ex: Saúde, Alimentação).
 * @param {string} req.body.content_html - Conteúdo da postagem em HTML.
 * @returns {Promise<Response>} Post criado ou erro (400, 401, 500).
 */
import { communityPostSchema } from "@/schemas/community";

export async function POST(req: NextRequest) {
  const user = await verifyToken(req);
  if (!user) return unauthorizedResponse();

  try {
    const jsonBody = await req.json();
    const result = communityPostSchema.safeParse(jsonBody);

    if (!result.success) {
      return NextResponse.json(
        { erro: "Dados inválidos.", detalhes: result.error.issues },
        { status: 400 }
      );
    }

    const { title, cover_image_url, category, content_html } = result.data;

    const { data, error } = await supabase
      .from("community_posts")
      .insert([
        {
          author_id: user.id,
          title,
          cover_image_url: cover_image_url || null,
          category: category || "Saúde",
          content_html,
          is_moderated: false,
        },
      ])
      .select()
      .single();

    if (error) {
      console.error("Error creating community post:", error);
      return NextResponse.json({ erro: "Erro ao criar publicação.", detalhe: error.message }, { status: 500 });
    }

    return NextResponse.json({ mensagem: "Publicação criada com sucesso!", post: data }, { status: 201 });
  } catch (error) {
    console.error("General error creating post:", error);
    return NextResponse.json({ erro: "Erro interno no servidor." }, { status: 500 });
  }
}
