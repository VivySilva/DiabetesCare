import { NextRequest, NextResponse } from "next/server";
import supabase from "@/config/supabase";
import { verifyToken, unauthorizedResponse } from "@/lib/auth";

/**
 * GET /api/community/[id]
 * 
 * Recupera os detalhes de uma publicação específica da comunidade pelo ID.
 * 
 * @param {NextRequest} req - Objeto de requisição.
 * @param {Object} context - Contexto da rota.
 * @param {Object} context.params - Parâmetros da URL.
 * @param {string} context.params.id - ID da publicação.
 * @returns {Promise<Response>} Dados da publicação ou erro (404, 500).
 */
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const { data, error } = await supabase
      .from("community_posts")
      .select("id, title, cover_image_url, category, content_html, is_moderated, created_at, author_id, users(name, avatar_url, role, license_number)")
      .eq("id", id)
      .maybeSingle();

    if (error || !data) {
      return NextResponse.json({ erro: "Publicação não encontrada." }, { status: 404 });
    }

    return NextResponse.json({ post: data }, { status: 200 });
  } catch (error) {
    console.error("General error fetching post:", error);
    return NextResponse.json({ erro: "Erro interno no servidor." }, { status: 500 });
  }
}

/**
 * PUT /api/community/[id]
 * 
 * Atualiza uma publicação existente. Requer que o usuário seja o autor.
 * 
 * @param {NextRequest} req - Objeto de requisição.
 * @param {Object} context - Contexto da rota.
 * @param {Object} context.params - Parâmetros da URL.
 * @param {string} context.params.id - ID da publicação a editar.
 * @param {Object} req.body - Dados para atualização.
 * @param {string} [req.body.title] - Novo título.
 * @param {string} [req.body.cover_image_url] - Nova URL da imagem.
 * @param {string} [req.body.category] - Nova categoria.
 * @param {string} [req.body.content_html] - Novo conteúdo em HTML.
 * @returns {Promise<Response>} Post atualizado ou erro (403, 404, 500).
 */
export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const user = await verifyToken(req);
  if (!user) return unauthorizedResponse();

  try {
    const { id } = await params;
    const body = await req.json();
    const { title, cover_image_url, category, content_html } = body;

    const { data: existingPost } = await supabase
      .from("community_posts")
      .select("author_id")
      .eq("id", id)
      .maybeSingle();

    if (!existingPost) {
      return NextResponse.json({ erro: "Publicação não encontrada." }, { status: 404 });
    }

    if (existingPost.author_id !== user.id) {
      return NextResponse.json({ erro: "Sem permissão para editar esta publicação." }, { status: 403 });
    }

    const { data, error } = await supabase
      .from("community_posts")
      .update({ title, cover_image_url, category, content_html, updated_at: new Date().toISOString() })
      .eq("id", id)
      .select()
      .single();

    if (error) {
      return NextResponse.json({ erro: "Erro ao atualizar publicação.", detalhe: error.message }, { status: 500 });
    }

    return NextResponse.json({ mensagem: "Publicação atualizada com sucesso!", post: data }, { status: 200 });
  } catch (error) {
    console.error("General error updating post:", error);
    return NextResponse.json({ erro: "Erro interno no servidor." }, { status: 500 });
  }
}

/**
 * DELETE /api/community/[id]
 * 
 * Remove uma publicação da comunidade. Requer que o usuário seja o autor.
 * 
 * @param {NextRequest} req - Objeto de requisição.
 * @param {Object} context - Contexto da rota.
 * @param {Object} context.params - Parâmetros da URL.
 * @param {string} context.params.id - ID da publicação a remover.
 * @returns {Promise<Response>} Mensagem de sucesso ou erro (403, 404, 500).
 */
export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const user = await verifyToken(req);
  if (!user) return unauthorizedResponse();

  try {
    const { id } = await params;

    const { data: existingPost } = await supabase
      .from("community_posts")
      .select("author_id")
      .eq("id", id)
      .maybeSingle();

    if (!existingPost) {
      return NextResponse.json({ erro: "Publicação não encontrada." }, { status: 404 });
    }

    if (existingPost.author_id !== user.id) {
      return NextResponse.json({ erro: "Sem permissão para remover esta publicação." }, { status: 403 });
    }

    const { error } = await supabase
      .from("community_posts")
      .delete()
      .eq("id", id);

    if (error) {
      return NextResponse.json({ erro: "Erro ao remover publicação.", detalhe: error.message }, { status: 500 });
    }

    return NextResponse.json({ mensagem: "Publicação removida com sucesso!" }, { status: 200 });
  } catch (error) {
    console.error("General error removing post:", error);
    return NextResponse.json({ erro: "Erro interno no servidor." }, { status: 500 });
  }
}
