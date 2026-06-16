import { NextRequest, NextResponse } from "next/server";
import supabase from "@/config/supabase";
import { verifyToken, unauthorizedResponse } from "@/lib/auth";
import bcrypt from "bcrypt";

/**
 * Executa um UPDATE no Supabase com retry automático.
 * Se uma coluna não existir no schema (PGRST204), ela é removida e o update é refeito.
 * Isso garante funcionamento mesmo sem migrações de colunas opcionais aplicadas.
 */
async function performUpdate(
  table: string,
  userId: string,
  updates: Record<string, any>
): Promise<{ error: any }> {
  if (Object.keys(updates).length === 0) {
    return { error: null };
  }

  const { error } = await supabase
    .from(table)
    .update(updates)
    .eq("id", userId);

  // PGRST204 = coluna não encontrada no schema cache
  if (error?.code === "PGRST204") {
    const match = error.message.match(/the '(.+?)' column/);
    if (match) {
      const missingCol = match[1];
      console.warn(`[profile/update] Coluna '${missingCol}' não existe no banco — ignorando e reexecutando.`);
      const retry = { ...updates };
      delete retry[missingCol];
      return performUpdate(table, userId, retry);
    }
  }

  return { error };
}

/**
 * GET /api/user/me
 * Recupera os dados do perfil do usuário autenticado.
 */
export async function GET(req: NextRequest) {
  const user = await verifyToken(req);
  if (!user) return unauthorizedResponse();

  try {
    const { data: authData, error: authError } = await supabase
      .from("users")
      .select("email, avatar_url, role, created_at")
      .eq("id", user.id)
      .single();

    const table = user.role === 'PROFESSIONAL' ? 'professionals' : 'patients';
    const { data: specificData, error: specificError } = await supabase
      .from(table)
      .select("*")
      .eq("id", user.id)
      .single();

    if (authError || specificError) {
      console.error("Supabase GET error:", authError || specificError);
      return NextResponse.json(
        { erro: "Erro ao buscar dados do usuário." },
        { status: 500 }
      );
    }

    if (!authData || !specificData) {
      return NextResponse.json({ erro: "Usuário não encontrado." }, { status: 404 });
    }

    const combinedUser = { ...authData, ...specificData };

    return NextResponse.json({ user: combinedUser }, { status: 200 });
  } catch (error) {
    console.error("Erro ao buscar perfil:", error);
    return NextResponse.json({ erro: "Erro interno no servidor." }, { status: 500 });
  }
}

/**
 * PUT /api/user/me
 * Atualiza os dados do perfil do usuário autenticado.
 * Colunas ausentes no banco são ignoradas automaticamente (sem precisar de migração).
 */
import { updateUserSchema } from "@/schemas/user";

export async function PUT(req: NextRequest) {
  const user = await verifyToken(req);
  if (!user) return unauthorizedResponse();

  try {
    const jsonBody = await req.json();
    const result = updateUserSchema.safeParse(jsonBody);

    if (!result.success) {
      return NextResponse.json(
        { erro: "Dados inválidos.", detalhes: result.error.issues },
        { status: 400 }
      );
    }

    const body = result.data;
    const {
      name, email, age, gender, diabetes_type, phone, avatar_url, password,
      cpf, birth_date, specialty, crm, crm_uf, education, clinic_address, license_number,
    } = body;

    const table = user.role === 'PROFESSIONAL' ? 'professionals' : 'patients';

    // Verifica e-mail duplicado na tabela 'users'
    if (email) {
      const { data: existingUser } = await supabase.from("users").select("id").eq("email", email).neq("id", user.id).maybeSingle();

      if (existingUser) {
        return NextResponse.json(
          { erro: "Este e-mail já está sendo usado por outra conta." },
          { status: 409 }
        );
      }
    }

    const userUpdates: Record<string, any> = {};
    const specificUpdates: Record<string, any> = {};

    // Dados da tabela users
    if (email !== undefined)           userUpdates.email           = email;
    
    if (avatar_url !== undefined) {
      if (avatar_url && avatar_url.startsWith('data:image')) {
        try {
          // Extrair a extensão e os dados base64
          const matches = avatar_url.match(/^data:image\/([a-zA-Z0-9]+);base64,(.+)$/);
          if (matches && matches.length === 3) {
            const ext = matches[1];
            const base64Data = matches[2];
            const buffer = Buffer.from(base64Data, 'base64');
            const fileName = `${user.id}-${Date.now()}.${ext}`;

            const { data: uploadData, error: uploadError } = await supabase.storage
              .from('avatars')
              .upload(fileName, buffer, {
                contentType: `image/${ext}`,
                upsert: true
              });

            if (uploadError) {
              console.error("Erro ao fazer upload do avatar:", uploadError);
              throw uploadError;
            }

            const { data: { publicUrl } } = supabase.storage
              .from('avatars')
              .getPublicUrl(fileName);

            userUpdates.avatar_url = publicUrl;
          }
        } catch (e) {
          console.error("Falha ao processar avatar base64:", e);
          userUpdates.avatar_url = avatar_url; // fallback to original or throw
        }
      } else {
        userUpdates.avatar_url = avatar_url;
      }
    }

    if (password && password.trim() !== "") {
      const salt = await bcrypt.genSalt(10);
      userUpdates.password_hash = await bcrypt.hash(password, salt);
    }

    // Dados da tabela específica (patients ou professionals)
    if (name !== undefined)            specificUpdates.name            = name;
    if (gender !== undefined)          specificUpdates.gender          = gender;
    if (diabetes_type !== undefined)   specificUpdates.diabetes_type   = diabetes_type;
    if (phone !== undefined)           specificUpdates.phone           = phone ? phone.replace(/\D/g, '') : null;
    
    // Se recebemos birth_date, calculamos a idade e salvamos ambos na tabela patients
    if (birth_date !== undefined && birth_date) {
      try {
        const birthDateObj = new Date(birth_date);
        const ageDifMs = Date.now() - birthDateObj.getTime();
        const ageDate = new Date(ageDifMs);
        specificUpdates.age = Math.abs(ageDate.getUTCFullYear() - 1970);
        specificUpdates.birth_date = birth_date; // Salva a data original também
      } catch (e) {
        console.warn("Erro ao calcular idade a partir de birth_date:", e);
      }
    }
    if (age !== undefined)             specificUpdates.age             = age;
    
    // Campos do profissional
    if (cpf !== undefined)             specificUpdates.cpf             = cpf;
    if (specialty !== undefined)       specificUpdates.specialty       = specialty;
    if (crm !== undefined)             specificUpdates.crm             = crm;
    if (crm_uf !== undefined)          specificUpdates.crm_uf          = crm_uf;
    if (education !== undefined)       specificUpdates.education       = education;
    if (clinic_address !== undefined)  specificUpdates.clinic_address  = clinic_address;
    if (license_number !== undefined)  specificUpdates.license_number  = license_number;

    if (Object.keys(userUpdates).length === 0 && Object.keys(specificUpdates).length === 0) {
      return NextResponse.json({ mensagem: "Nenhum dado para atualizar." }, { status: 200 });
    }

    // Executa as atualizações separadamente
    if (Object.keys(userUpdates).length > 0) {
      const { error: userError } = await performUpdate("users", user.id, userUpdates);
      if (userError) {
        console.error("SUPABASE UPDATE ERROR (users):", userError);
        return NextResponse.json({ erro: "Erro ao atualizar dados de autenticação." }, { status: 500 });
      }
    }

    if (Object.keys(specificUpdates).length > 0) {
      const { error: specificError } = await performUpdate(table, user.id, specificUpdates);
      if (specificError) {
        console.error("SUPABASE UPDATE ERROR (specific):", specificError);
        return NextResponse.json({ erro: "Erro ao atualizar dados de perfil." }, { status: 500 });
      }
    }

    return NextResponse.json({ mensagem: "Perfil atualizado com sucesso!" }, { status: 200 });
  } catch (error) {
    console.error("Erro ao atualizar perfil:", error);
    return NextResponse.json({ erro: "Erro interno no servidor." }, { status: 500 });
  }
}

/**
 * DELETE /api/user/me
 * 
 * Exclui permanentemente a conta do usuário autenticado e todos os dados associados.
 */
export async function DELETE(req: NextRequest) {
  const user = await verifyToken(req);
  if (!user) return unauthorizedResponse();

  try {
    // 1. Excluir registros do paciente (Glicemias e Medicamentos)
    await supabase.from("glucose_records").delete().eq("patient_id", user.id);
    await supabase.from("medication_records").delete().eq("patient_id", user.id);

    // 2. Excluir logs de login e notificações
    await supabase.from("login_logs").delete().eq("user_id", user.id);
    await supabase.from("notifications").delete().eq("user_id", user.id);

    // 3. Excluir tópicos de fórum, respostas e likes
    await supabase.from("forum_likes").delete().eq("user_id", user.id);
    await supabase.from("forum_replies").delete().eq("user_id", user.id);
    await supabase.from("forum_topics").delete().eq("user_id", user.id);

    // 4. Excluir publicações da comunidade (caso profissional)
    await supabase.from("community_posts").delete().eq("author_id", user.id);

    // 5. Excluir a conta de usuário na tabela 'users'
    const { error: deleteError } = await supabase
      .from("users")
      .delete()
      .eq("id", user.id);

    if (deleteError) {
      console.error("Erro ao excluir conta do Supabase:", deleteError);
      return NextResponse.json(
        { erro: "Erro ao excluir conta do banco de dados.", detalhe: deleteError.message },
        { status: 500 }
      );
    }

    return NextResponse.json({ mensagem: "Conta excluída com sucesso!" }, { status: 200 });
  } catch (error) {
    console.error("Erro interno ao excluir conta:", error);
    return NextResponse.json({ erro: "Erro interno ao processar a exclusão." }, { status: 500 });
  }
}
