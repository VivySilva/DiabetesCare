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

    const { data: topicData, error } = await supabase
      .from("forum_topics")
      .select("id, title, preview, is_moderated, likes_count, created_at, author_id")
      .eq("id", id)
      .single();

    if (error) {
      console.error("Error fetching topic:", error);
      return NextResponse.json({ erro: "Tópico não encontrado." }, { status: 404 });
    }

    let authorInfo = null;
    if (topicData.author_id) {
      const { data: patient } = await supabase.from("patients").select("name, avatar_url, role").eq("id", topicData.author_id).maybeSingle();
      if (patient) authorInfo = patient;
      else {
        const { data: prof } = await supabase.from("professionals").select("name, avatar_url, role").eq("id", topicData.author_id).maybeSingle();
        if (prof) authorInfo = prof;
      }
    }

    const topic = { ...topicData, users: authorInfo };

    const { data: repliesData } = await supabase
      .from("forum_replies")
      .select("id, content, created_at, author_id")
      .eq("topic_id", id)
      .order("created_at", { ascending: true });

    let finalReplies = repliesData || [];
    const replyAuthorIds = Array.from(new Set(finalReplies.map((r: any) => r.author_id)));
    if (replyAuthorIds.length > 0) {
      let usersMap: Record<string, any> = {};
      const { data: patients } = await supabase.from("patients").select("name, avatar_url, role, id").in("id", replyAuthorIds);
      const { data: profs } = await supabase.from("professionals").select("name, avatar_url, role, id").in("id", replyAuthorIds);
      patients?.forEach(p => usersMap[p.id] = p);
      profs?.forEach(p => usersMap[p.id] = p);
      
      finalReplies = finalReplies.map((r: any) => ({
        ...r,
        users: usersMap[r.author_id] || null
      }));
    }

    return NextResponse.json({ topic, replies: finalReplies }, { status: 200 });
  } catch (error) {
    console.error("General error fetching topic:", error);
    return NextResponse.json({ erro: "Erro interno no servidor." }, { status: 500 });
  }
}
