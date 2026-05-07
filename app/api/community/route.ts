import { NextRequest, NextResponse } from "next/server";
import supabase from "@/config/supabase";
import { verifyToken, unauthorizedResponse } from "@/lib/auth";

export async function GET() {
  try {
    const { data, error } = await supabase
      .from("community_posts")
      .select("id, title, cover_image_url, category, content_html, is_moderated, created_at, author_id, users(name, avatar_url, role, license_number)")
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Error fetching community posts:", error);
      return NextResponse.json({ erro: "Erro ao buscar publicações." }, { status: 500 });
    }

    return NextResponse.json({ posts: data }, { status: 200 });
  } catch (error) {
    console.error("General error listing posts:", error);
    return NextResponse.json({ erro: "Erro interno no servidor." }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  const user = await verifyToken(req);
  if (!user) return unauthorizedResponse();

  try {
    const body = await req.json();
    const { title, cover_image_url, category, content_html } = body;

    if (!title || !content_html) {
      return NextResponse.json({ erro: "Título e conteúdo são obrigatórios." }, { status: 400 });
    }

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
