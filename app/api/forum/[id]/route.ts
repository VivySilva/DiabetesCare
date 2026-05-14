import { NextRequest, NextResponse } from "next/server";
import supabase from "@/config/supabase";

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

    const { data: topic, error: topicError } = await supabase
      .from("forum_topics")
      .select("id, title, preview, is_moderated, likes_count, created_at, author_id, users(name, avatar_url, role)")
      .eq("id", id)
      .maybeSingle();

    if (topicError || !topic) {
      return NextResponse.json({ erro: "Tópico não encontrado." }, { status: 404 });
    }

    const { data: replies, error: repliesError } = await supabase
      .from("forum_replies")
      .select("id, content, created_at, author_id, users(name, avatar_url, role)")
      .eq("topic_id", id)
      .order("created_at", { ascending: true });

    if (repliesError) {
      console.error("Error fetching replies:", repliesError);
    }

    return NextResponse.json({ topic, replies: replies || [] }, { status: 200 });
  } catch (error) {
    console.error("General error fetching topic:", error);
    return NextResponse.json({ erro: "Erro interno no servidor." }, { status: 500 });
  }
}
