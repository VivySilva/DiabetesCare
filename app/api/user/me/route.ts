import { NextRequest, NextResponse } from "next/server";
import supabase from "@/config/supabase";
import { verifyToken, unauthorizedResponse } from "@/lib/auth";
import bcrypt from "bcrypt";

/**
 * GET /api/user/me
 * 
 * Recupera os dados do perfil do usuário autenticado.
 * 
 * @param {NextRequest} req - Objeto de requisição.
 * @returns {Promise<Response>} Dados do usuário ou erro (401, 404, 500).
 */
export async function GET(req: NextRequest) {
  const user = await verifyToken(req);
  if (!user) return unauthorizedResponse();

  try {
    const { data, error } = await supabase
      .from("users")
      .select("id, name, email, role, avatar_url, age, gender, diabetes_type, phone, license_number")
      .eq("id", user.id)
      .single();

    if (error || !data) {
      return NextResponse.json({ erro: "Usuário não encontrado." }, { status: 404 });
    }

    return NextResponse.json({ user: data }, { status: 200 });
  } catch (error) {
    console.error("Erro ao buscar perfil:", error);
    return NextResponse.json({ erro: "Erro interno no servidor." }, { status: 500 });
  }
}

/**
 * PUT /api/user/me
 * 
 * Atualiza os dados do perfil do usuário autenticado.
 * 
 * @param {NextRequest} req - Objeto de requisição.
 * @param {Object} req.body - Dados para atualização.
 * @param {string} [req.body.name] - Novo nome.
 * @param {string} [req.body.email] - Novo e-mail.
 * @param {number} [req.body.age] - Nova idade.
 * @param {string} [req.body.gender] - Gênero.
 * @param {string} [req.body.diabetes_type] - Tipo de diabetes.
 * @param {string} [req.body.phone] - Novo telefone.
 * @param {string} [req.body.avatar_url] - Nova URL da imagem de perfil.
 * @param {string} [req.body.password] - Nova senha (será hasheada).
 * @returns {Promise<Response>} Perfil atualizado ou erro (401, 409, 500).
 */
export async function PUT(req: NextRequest) {
  const user = await verifyToken(req);
  if (!user) return unauthorizedResponse();

  try {
    const body = await req.json();
    const { name, email, age, gender, diabetes_type, phone, avatar_url, password } = body;

    if (email) {
      const { data: existingUser } = await supabase
        .from("users")
        .select("id")
        .eq("email", email)
        .neq("id", user.id)
        .maybeSingle();

      if (existingUser) {
        return NextResponse.json(
          { erro: "Este e-mail já está sendo usado por outra conta." },
          { status: 409 }
        );
      }
    }

    const updates: any = {
      name,
      email,
      age,
      gender,
      diabetes_type,
      phone,
      avatar_url,
      // license_number is kept for professional accounts
      license_number: body.license_number,
      updated_at: new Date().toISOString(),
    };

    if (password && password.trim() !== "") {
      const salt = await bcrypt.genSalt(10);
      updates.password_hash = await bcrypt.hash(password, salt);
    }

    const { data, error: updateError } = await supabase
      .from("users")
      .update(updates)
      .eq("id", user.id)
      .select()
      .single();

    if (updateError) {
      console.error("SUPABASE UPDATE ERROR:", updateError);
      return NextResponse.json(
        {
          erro: "Erro ao atualizar perfil no banco de dados.",
          detalhe: updateError.message,
          codigo: updateError.code,
        },
        { status: 500 }
      );
    }

    return NextResponse.json({ mensagem: "Perfil atualizado!", user: data }, { status: 200 });
  } catch (error) {
    console.error("Erro ao atualizar perfil:", error);
    return NextResponse.json({ erro: "Erro interno no servidor." }, { status: 500 });
  }
}
