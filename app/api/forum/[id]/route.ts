import { NextRequest, NextResponse } from "next/server";
import supabase from "@/config/supabase";
import { verifyToken, unauthorizedResponse } from "@/lib/auth";

export const dynamic = 'force-dynamic';

/**
 * GET /api/forum/[id]
 * 
 * Recupera os detalhes de um tópico específico do fórum e todas as suas respostas.
 * 
 * @param {NextRequest} req - Objeto de requisição.
 * @param {Object} context - Contexto da rota.
 * @param {Object} context.params - Parâmetros da URL.
 * @param {string} context.params.id - ID do tópico a ser recuperado.
 * @returns {Promise<Response>} Dados do tópico e lista de respostas ou erro (404, 500).
 */
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const { data: topicData, error } = await supabase
      .from("forum_topics")
      .select("id, title, preview, is_moderated, likes_count, created_at, author_id")
      .eq("id", id)
      .single();

    if (error) {
      console.error("Error fetching topic:", error);
      return NextResponse.json({ erro: "Tópico não encontrado." }, { status: 404 });
    }

    let isTopicAnonymous = true;
    let cleanPreview = topicData.preview || "";
    if (topicData.preview && topicData.preview.startsWith("[anonymous:")) {
      const match = topicData.preview.match(/^\[anonymous:(true|false)\]([\s\S]*)$/);
      if (match) {
        isTopicAnonymous = match[1] === "true";
        cleanPreview = match[2];
      }
    }

    let authorInfo = null;
    if (topicData.author_id) {
      const { data: authUser } = await supabase.from("users").select("role, avatar_url").eq("id", topicData.author_id).maybeSingle();
      
      if (authUser) {
        if (authUser.role?.toLowerCase() === 'professional') {
          const { data: prof } = await supabase.from("professionals").select("name, license_number").eq("id", topicData.author_id).maybeSingle();
          authorInfo = {
            role: authUser.role,
            avatar_url: authUser.avatar_url,
            name: prof?.name || "Profissional de Saúde",
            license_number: prof?.license_number || null,
            is_professional: true
          };
        } else {
          if (isTopicAnonymous) {
            authorInfo = {
              role: authUser.role,
              avatar_url: null,
              name: "Usuário Anônimo"
            };
          } else {
            const { data: patient } = await supabase.from("patients").select("name").eq("id", topicData.author_id).maybeSingle();
            authorInfo = {
              role: authUser.role,
              avatar_url: authUser.avatar_url || null,
              name: patient?.name || "Paciente"
            };
          }
        }
      }
    }

    const topic = { ...topicData, preview: cleanPreview, users: authorInfo };

    const { data: repliesData } = await supabase
      .from("forum_replies")
      .select("id, content, created_at, author_id")
      .eq("topic_id", id)
      .order("created_at", { ascending: true });

    let finalReplies = (repliesData || []).map((r: any) => {
      let isReplyAnonymous = true;
      let cleanContent = r.content || "";
      if (r.content && r.content.startsWith("[anonymous:")) {
        const match = r.content.match(/^\[anonymous:(true|false)\]([\s\S]*)$/);
        if (match) {
          isReplyAnonymous = match[1] === "true";
          cleanContent = match[2];
        }
      }
      return {
        ...r,
        content: cleanContent,
        is_anonymous: isReplyAnonymous
      };
    });

    const replyAuthorIds = Array.from(new Set(finalReplies.map((r: any) => r.author_id)));
    if (replyAuthorIds.length > 0) {
      let usersMap: Record<string, any> = {};
      const { data: authUsers } = await supabase.from("users").select("id, role, avatar_url").in("id", replyAuthorIds);
      const { data: professionals } = await supabase.from("professionals").select("id, name, license_number").in("id", replyAuthorIds);
      const { data: patients } = await supabase.from("patients").select("id, name").in("id", replyAuthorIds);
      
      authUsers?.forEach(u => {
        if (u.role?.toLowerCase() === 'professional') {
          const prof = professionals?.find(pr => pr.id === u.id);
          usersMap[u.id] = {
            id: u.id,
            avatar_url: u.avatar_url || null,
            role: u.role,
            name: prof?.name || "Profissional de Saúde",
            license_number: prof?.license_number || null,
            is_professional: true
          };
        } else {
          const patient = patients?.find(p => p.id === u.id);
          usersMap[u.id] = {
            id: u.id,
            role: u.role,
            real_avatar_url: u.avatar_url || null,
            real_name: patient?.name || "Paciente"
          };
        }
      });
      
      finalReplies = finalReplies.map((r: any) => {
        const mappedUser = usersMap[r.author_id] ? { ...usersMap[r.author_id] } : { name: "Usuário Anônimo", role: "patient" };
        if (mappedUser.role?.toLowerCase() !== 'professional') {
          if (r.is_anonymous) {
            mappedUser.name = "Usuário Anônimo";
            mappedUser.avatar_url = null;
          } else {
            mappedUser.name = mappedUser.real_name || "Paciente";
            mappedUser.avatar_url = mappedUser.real_avatar_url || null;
          }
          delete mappedUser.real_name;
          delete mappedUser.real_avatar_url;
        }
        delete r.is_anonymous;
        return {
          ...r,
          users: mappedUser
        };
      });
    }

    return NextResponse.json({ topic, replies: finalReplies }, { status: 200 });
  } catch (error) {
    console.error("General error fetching topic:", error);
    return NextResponse.json({ erro: "Erro interno no servidor." }, { status: 500 });
  }
}

/**
 * DELETE /api/forum/[id]
 * 
 * Remove um tópico específico do fórum, bem como todas as curtidas e respostas vinculadas a ele.
 * Requer que o usuário seja o autor do tópico.
 * 
 * @param {NextRequest} req - Objeto de requisição.
 * @param {Object} context - Contexto da rota.
 * @param {Object} context.params - Parâmetros da URL.
 * @param {string} context.params.id - ID do tópico a remover.
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

    const { data: existingTopic } = await supabase
      .from("forum_topics")
      .select("author_id")
      .eq("id", id)
      .maybeSingle();

    if (!existingTopic) {
      return NextResponse.json({ erro: "Tópico não encontrado." }, { status: 404 });
    }

    if (existingTopic.author_id !== user.id) {
      return NextResponse.json({ erro: "Sem permissão para remover este tópico." }, { status: 403 });
    }

    // 1. Remover curtidas associadas ao tópico
    await supabase.from("forum_likes").delete().eq("topic_id", id);

    // 2. Remover respostas associadas ao tópico
    await supabase.from("forum_replies").delete().eq("topic_id", id);

    // 3. Remover o tópico
    const { error: deleteError } = await supabase
      .from("forum_topics")
      .delete()
      .eq("id", id);

    if (deleteError) {
      console.error("Error deleting forum topic:", deleteError);
      return NextResponse.json({ erro: "Erro ao remover tópico.", detalhe: deleteError.message }, { status: 500 });
    }

    return NextResponse.json({ mensagem: "Tópico removido com sucesso!" }, { status: 200 });
  } catch (error) {
    console.error("General error removing topic:", error);
    return NextResponse.json({ erro: "Erro interno no servidor." }, { status: 500 });
  }
}

