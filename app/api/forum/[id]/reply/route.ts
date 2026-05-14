import { NextRequest, NextResponse } from "next/server";
import supabase from "@/config/supabase";
import { verifyToken, unauthorizedResponse } from "@/lib/auth";

/**
 * POST /api/forum/[id]/reply
 * 
 * Adiciona uma resposta a um tópico específico do fórum.
 * 
 * @param {NextRequest} req - Objeto de requisição.
 * @param {Object} context - Contexto da rota.
 * @param {Object} context.params - Parâmetros da URL.
 * @param {string} context.params.id - ID do tópico ao qual responder.
 * @param {Object} req.body - Conteúdo da resposta.
 * @param {string} req.body.content - Texto da resposta.
 * @returns {Promise<Response>} Resposta criada ou erro (400, 401, 404, 500).
 */
export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const user = await verifyToken(req);
  if (!user) return unauthorizedResponse();

  try {
    const { id: topicId } = await params;
    const body = await req.json();
    const { content } = body;

    if (!content?.trim()) {
      return NextResponse.json({ erro: "O conteúdo da resposta é obrigatório." }, { status: 400 });
    }

    const { data: topic } = await supabase
      .from("forum_topics")
      .select("id, author_id, title")
      .eq("id", topicId)
      .single();

    if (!topic) {
      return NextResponse.json({ erro: "Tópico não encontrado." }, { status: 404 });
    }

    const { data, error } = await supabase
      .from("forum_replies")
      .insert([{ topic_id: topicId, author_id: user.id, content }])
      .select("id, content, created_at, author_id, users(name, avatar_url, role)")
      .single();

    if (error) {
      console.error("Error creating reply:", error);
      return NextResponse.json({ erro: "Erro ao enviar resposta.", detalhe: error.message }, { status: 500 });
    }

    if (topic.author_id !== user.id) {
      await supabase.from("notifications").insert([
        {
          user_id: topic.author_id,
          type: "PERSONALIZED_TIP",
          title: "Nova resposta no fórum!",
          body: `${user.name} respondeu ao seu tópico: "${topic.title}"`,
          read: false,
        },
      ]);
    }

    return NextResponse.json({ mensagem: "Resposta enviada com sucesso!", reply: data }, { status: 201 });
  } catch (error) {
    console.error("General error replying:", error);
    return NextResponse.json({ erro: "Erro interno no servidor." }, { status: 500 });
  }
}
