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
      .select("id, title, cover_image_url, category, content_html, is_moderated, created_at, author_id")
      .eq("id", id)
      .single();

    if (error) {
      console.error("Error fetching community post:", error);
      return NextResponse.json({ erro: "Publicação não encontrada." }, { status: 404 });
    }

    let authorInfo = null;
    if (data.author_id) {
      const { data: patient } = await supabase.from("patients").select("name, avatar_url, role").eq("id", data.author_id).maybeSingle();
      if (patient) authorInfo = patient;
      else {
        const { data: prof } = await supabase.from("professionals").select("name, avatar_url, role, license_number").eq("id", data.author_id).maybeSingle();
        if (prof) authorInfo = prof;
      }
    }

    const formattedData = {
      ...data,
      users: authorInfo
    };

    return NextResponse.json(formattedData, { status: 200 });
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

    let uploadedImageUrl = cover_image_url;

    if (cover_image_url && cover_image_url.startsWith('data:image')) {
      try {
        const matches = cover_image_url.match(/^data:image\/([a-zA-Z0-9]+);base64,(.+)$/);
        if (matches && matches.length === 3) {
          const ext = matches[1];
          const base64Data = matches[2];
          const buffer = Buffer.from(base64Data, 'base64');
          const fileName = `post-cover-${user.id}-${Date.now()}.${ext}`;

          let { data: uploadData, error: uploadError } = await supabase.storage
            .from('avatars')
            .upload(fileName, buffer, {
              contentType: `image/${ext}`,
              upsert: true
            });

          if (uploadError && (uploadError as any).message === 'Bucket not found') {
            try {
              await supabase.storage.createBucket('avatars', { public: true });
              const retry = await supabase.storage
                .from('avatars')
                .upload(fileName, buffer, {
                  contentType: `image/${ext}`,
                  upsert: true
                });
              uploadData = retry.data;
              uploadError = retry.error;
            } catch (createErr) {
              console.error("Erro ao tentar criar bucket 'avatars' no PUT:", createErr);
            }
          }

          if (uploadError) {
            console.error("Erro ao fazer upload da imagem de capa no PUT:", uploadError);
            throw uploadError;
          }

          const { data: { publicUrl } } = supabase.storage
            .from('avatars')
            .getPublicUrl(fileName);

          uploadedImageUrl = publicUrl;
        }
      } catch (e) {
        console.error("Falha ao processar cover_image base64 no PUT:", e);
      }
    }

    const { data, error } = await supabase
      .from("community_posts")
      .update({ title, cover_image_url: uploadedImageUrl, category, content_html, updated_at: new Date().toISOString() })
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
