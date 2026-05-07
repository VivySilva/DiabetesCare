import { NextRequest, NextResponse } from "next/server";
import supabase from "@/config/supabase";
import { verifyToken, unauthorizedResponse } from "@/lib/auth";

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
