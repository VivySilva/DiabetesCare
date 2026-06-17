import { NextRequest, NextResponse } from "next/server";
import supabase from "@/config/supabase";
import { verifyToken, unauthorizedResponse } from "@/lib/auth";

/**
 * GET /api/community
 * 
 * Recupera a lista de todas as publicações da comunidade, ordenadas por data.
 * 
 * @returns {Promise<Response>} Lista de posts com dados do autor.
 */
export async function GET() {
  try {
    const { data, error } = await supabase
      .from("community_posts")
      .select("id, title, cover_image_url, category, content_html, is_moderated, created_at, author_id")
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Error fetching community posts:", error);
      return NextResponse.json({ erro: "Erro ao buscar publicações." }, { status: 500 });
    }

    const authorIds = Array.from(new Set((data || []).map(post => post.author_id)));
    
    let usersMap: Record<string, any> = {};
    if (authorIds.length > 0) {
      // 1. Busca dados comuns na tabela users
      const { data: authUsers } = await supabase.from("users").select("id, avatar_url, role").in("id", authorIds);
      
      // 2. Busca nomes na tabela patients
      const { data: patients } = await supabase.from("patients").select("id, name").in("id", authorIds);
      
      // 3. Busca nomes na tabela professionals
      const { data: professionals } = await supabase.from("professionals").select("id, name, license_number").in("id", authorIds);
      
      // 4. Combina os dados
      authUsers?.forEach(u => {
        const p = patients?.find(pat => pat.id === u.id);
        const prof = professionals?.find(pr => pr.id === u.id);
        
        usersMap[u.id] = {
          id: u.id,
          avatar_url: u.avatar_url,
          role: u.role,
          name: p?.name || prof?.name || "Usuário Anônimo",
          license_number: prof?.license_number || null
        };
      });
    }

    const formattedData = data?.map(post => ({
      ...post,
      users: usersMap[post.author_id] || null
    })) || [];

    return NextResponse.json({ posts: formattedData }, { status: 200 });
  } catch (error) {
    console.error("General error listing posts:", error);
    return NextResponse.json({ erro: "Erro interno no servidor." }, { status: 500 });
  }
}

/**
 * POST /api/community
 * 
 * Cria uma nova publicação na comunidade. Requer autenticação.
 * 
 * @param {NextRequest} req - Objeto de requisição.
 * @param {Object} req.body - Conteúdo da publicação.
 * @param {string} req.body.title - Título da postagem.
 * @param {string} [req.body.cover_image_url] - URL da imagem de capa.
 * @param {string} [req.body.category] - Categoria (ex: Saúde, Alimentação).
 * @param {string} req.body.content_html - Conteúdo da postagem em HTML.
 * @returns {Promise<Response>} Post criado ou erro (400, 401, 500).
 */
import { communityPostSchema } from "@/schemas/community";

export async function POST(req: NextRequest) {
  const user = await verifyToken(req);
  if (!user) return unauthorizedResponse();

  try {
    const jsonBody = await req.json();
    const result = communityPostSchema.safeParse(jsonBody);

    if (!result.success) {
      return NextResponse.json(
        { erro: "Dados inválidos.", detalhes: result.error.issues },
        { status: 400 }
      );
    }

    const { title, cover_image_url, category, content_html } = result.data;

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
              console.error("Erro ao tentar criar bucket 'avatars':", createErr);
            }
          }

          if (uploadError) {
            console.error("Erro ao fazer upload da imagem de capa:", uploadError);
            throw uploadError;
          }

          const { data: { publicUrl } } = supabase.storage
            .from('avatars')
            .getPublicUrl(fileName);

          uploadedImageUrl = publicUrl;
        }
      } catch (e) {
        console.error("Falha ao processar cover_image base64:", e);
      }
    }

    const { data, error } = await supabase
      .from("community_posts")
      .insert([
        {
          author_id: user.id,
          title,
          cover_image_url: uploadedImageUrl || null,
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
