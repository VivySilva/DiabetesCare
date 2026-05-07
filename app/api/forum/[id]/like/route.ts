import { NextRequest, NextResponse } from "next/server";
import supabase from "@/config/supabase";
import { verifyToken, unauthorizedResponse } from "@/lib/auth";

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const user = await verifyToken(req);
  if (!user) return unauthorizedResponse();

  try {
    const { id: topicId } = await params;

    const { data: existing } = await supabase
      .from("forum_likes")
      .select("id")
      .eq("topic_id", topicId)
      .eq("user_id", user.id)
      .maybeSingle();

    const { data: topic } = await supabase
      .from("forum_topics")
      .select("likes_count")
      .eq("id", topicId)
      .single();

    let currentLikes = topic?.likes_count || 0;

    if (existing) {
      await supabase.from("forum_likes").delete().eq("id", existing.id);
      const newCount = Math.max(0, currentLikes - 1);
      await supabase.from("forum_topics").update({ likes_count: newCount }).eq("id", topicId);
      return NextResponse.json({ mensagem: "Curtida removida!", liked: false, likes_count: newCount });
    } else {
      await supabase.from("forum_likes").insert([{ topic_id: topicId, user_id: user.id }]);
      const newCount = currentLikes + 1;
      await supabase.from("forum_topics").update({ likes_count: newCount }).eq("id", topicId);
      return NextResponse.json({ mensagem: "Tópico curtido!", liked: true, likes_count: newCount });
    }
  } catch (error) {
    console.error("General error in toggle like:", error);
    return NextResponse.json({ erro: "Erro ao processar curtida." }, { status: 500 });
  }
}
