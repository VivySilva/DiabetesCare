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
import { forumReplySchema } from "@/schemas/forum";

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const user = await verifyToken(req);
  if (!user) return unauthorizedResponse();

  try {
    const { id: topicId } = await params;
    const jsonBody = await req.json();
    const result = forumReplySchema.safeParse(jsonBody);

    if (!result.success) {
      return NextResponse.json(
        { erro: "Dados inválidos.", detalhes: result.error.issues },
        { status: 400 }
      );
    }

    const { content } = result.data;

    const { data: topic } = await supabase
      .from("forum_topics")
      .select("id, author_id, title")
      .eq("id", topicId)
      .single();

    if (!topic) {
      return NextResponse.json({ erro: "Tópico não encontrado." }, { status: 404 });
    }

    const { data: newReply, error: insertError } = await supabase
      .from("forum_replies")
      .insert([
        {
          topic_id: topicId,
          content,
          author_id: user.id,
        },
      ])
      .select("id, content, created_at, author_id")
      .single();

    if (insertError) {
      console.error("Error inserting reply:", insertError);
      return NextResponse.json({ erro: "Erro ao adicionar resposta." }, { status: 500 });
    }

    const { data: authorData } = await supabase
      .from(user.role.toLowerCase() === 'professional' ? 'professionals' : 'patients')
      .select("name, avatar_url, role")
      .eq("id", user.id)
      .single();
      
    (newReply as any).users = authorData;

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

    return NextResponse.json({ mensagem: "Resposta enviada com sucesso!", reply: newReply }, { status: 201 });
  } catch (error) {
    console.error("General error replying:", error);
    return NextResponse.json({ erro: "Erro interno no servidor." }, { status: 500 });
  }
}
