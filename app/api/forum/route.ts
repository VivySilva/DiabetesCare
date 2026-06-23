import { NextRequest, NextResponse } from "next/server";
import supabase from "@/config/supabase";
import { verifyToken, unauthorizedResponse } from "@/lib/auth";

/**
 * GET /api/forum
 * 
 * Recupera a lista de todos os tópicos do fórum, incluindo contagem de curtidas e respostas.
 * 
 * @returns {Promise<Response>} Lista de tópicos com dados do autor e contadores.
 */
export async function GET() {
  try {
    const { data, error } = await supabase
      .from("forum_topics")
      .select("id, title, preview, is_moderated, likes_count, created_at, author_id")
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Error fetching forum topics:", error);
      return NextResponse.json({ erro: "Erro ao buscar tópicos do fórum." }, { status: 500 });
    }

    const authorIds = Array.from(new Set((data || []).map(post => post.author_id)));
    
    let usersMap: Record<string, any> = {};
    if (authorIds.length > 0) {
      // 1. Busca todos da tabela users
      const { data: authUsers } = await supabase.from("users").select("id, avatar_url, role").in("id", authorIds);
      // 2. Busca profissionais
      const { data: professionals } = await supabase.from("professionals").select("id, name, license_number").in("id", authorIds);
      // 3. Busca pacientes
      const { data: patients } = await supabase.from("patients").select("id, name").in("id", authorIds);
      
      authUsers?.forEach(u => {
        if (u.role?.toLowerCase() === 'professional') {
          const prof = professionals?.find(pr => pr.id === u.id);
          usersMap[u.id] = {
            id: u.id,
            avatar_url: u.avatar_url,
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
    }

    const topicIds = (data || []).map((t: any) => t.id);
    const { data: replyCounts } = await supabase
      .from("forum_replies")
      .select("topic_id")
      .in("topic_id", topicIds);

    const countMap: Record<string, number> = {};
    (replyCounts || []).forEach((r: any) => {
      countMap[r.topic_id] = (countMap[r.topic_id] || 0) + 1;
    });

    const topicsWithCounts = (data || []).map((topic: any) => {
      let isAnonymous = true;
      let cleanPreview = topic.preview || "";

      if (topic.preview && topic.preview.startsWith("[anonymous:")) {
        const match = topic.preview.match(/^\[anonymous:(true|false)\]([\s\S]*)$/);
        if (match) {
          isAnonymous = match[1] === "true";
          cleanPreview = match[2];
        }
      }

      const mappedUser = usersMap[topic.author_id]
        ? { ...usersMap[topic.author_id] }
        : { name: "Usuário Anônimo", role: "patient" };

      if (mappedUser.role?.toLowerCase() !== 'professional') {
        if (isAnonymous) {
          mappedUser.name = "Usuário Anônimo";
          mappedUser.avatar_url = null;
        } else {
          mappedUser.name = mappedUser.real_name || "Paciente";
          mappedUser.avatar_url = mappedUser.real_avatar_url || null;
        }
        delete mappedUser.real_name;
        delete mappedUser.real_avatar_url;
      }

      return {
        ...topic,
        preview: cleanPreview,
        users: mappedUser,
        replies_count: countMap[topic.id] || 0,
      };
    });

    return NextResponse.json({ topics: topicsWithCounts }, { status: 200 });
  } catch (error) {
    console.error("General error listing topics:", error);
    return NextResponse.json({ erro: "Erro interno no servidor." }, { status: 500 });
  }
}

/**
 * POST /api/forum
 * 
 * Cria um novo tópico no fórum. Requer autenticação.
 * 
 * @param {NextRequest} req - Objeto de requisição.
 * @param {Object} req.body - Conteúdo do tópico.
 * @param {string} req.body.title - Título do tópico.
 * @param {string} [req.body.preview] - Breve descrição ou resumo.
 * @returns {Promise<Response>} Tópico criado ou erro (400, 401, 500).
 */
import { forumTopicSchema } from "@/schemas/forum";

export async function POST(req: NextRequest) {
  const user = await verifyToken(req);
  if (!user) return unauthorizedResponse();

  try {
    const jsonBody = await req.json();
    const result = forumTopicSchema.safeParse(jsonBody);

    if (!result.success) {
      // Pega a primeira mensagem de erro do Zod (ex: "Título muito curto")
      const errorMessage = result.error.issues[0]?.message || "Dados inválidos.";
      return NextResponse.json(
        { erro: errorMessage, detalhes: result.error.issues },
        { status: 400 }
      );
    }

    const { title, content, is_anonymous } = result.data;
    const isProfessional = user.role.toLowerCase() === 'professional';
    const anonFlag = isProfessional ? false : (is_anonymous ?? true);
    const preview = `[anonymous:${anonFlag}]${content || ""}`;

    const { data, error } = await supabase
      .from("forum_topics")
      .insert([
        {
          author_id: user.id,
          title,
          preview: preview,
          is_moderated: false,
          likes_count: 0,
        },
      ])
      .select()
      .single();

    if (error) {
      console.error("Error creating forum topic:", error);
      return NextResponse.json({ erro: "Erro ao criar tópico.", detalhe: error.message }, { status: 500 });
    }

    return NextResponse.json({ mensagem: "Tópico criado com sucesso!", topic: data }, { status: 201 });
  } catch (error) {
    console.error("General error creating topic:", error);
    return NextResponse.json({ erro: "Erro interno no servidor." }, { status: 500 });
  }
}
