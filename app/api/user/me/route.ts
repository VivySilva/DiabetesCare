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
    const table = user.role === 'PROFESSIONAL' ? 'professionals' : 'patients';
    const { data, error } = await supabase
      .from(table)
      .select("*")
      .eq("id", user.id)
      .single();

    if (error) {
      console.error("Supabase GET error:", error);
      return NextResponse.json(
        { erro: "Erro ao buscar dados do usuário.", detalhe: error.message },
        { status: 500 }
      );
    }

    if (!data) {
      return NextResponse.json({ erro: "Usuário não encontrado." }, { status: 404 });
    }

    // Remove campos sensíveis antes de retornar ao cliente
    const {
      password_hash,
      password_reset_token,
      password_reset_expires,
      ...safeUser
    } = data as any;

    return NextResponse.json({ user: safeUser }, { status: 200 });
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

    // Verifica e-mail duplicado em outra conta
    if (email) {
      const { data: existingPatient } = await supabase.from("patients").select("id").eq("email", email).neq("id", user.id).maybeSingle();
      const { data: existingProfessional } = await supabase.from("professionals").select("id").eq("email", email).neq("id", user.id).maybeSingle();

      if (existingPatient || existingProfessional) {
        return NextResponse.json(
          { erro: "Este e-mail já está sendo usado por outra conta." },
          { status: 409 }
        );
      }
    }

    // Monta o payload — só inclui campos que foram enviados (não undefined)
    const updates: Record<string, any> = {};

    if (name !== undefined)            updates.name            = name;
    if (email !== undefined)           updates.email           = email;
    if (age !== undefined)             updates.age             = age;
    if (gender !== undefined)          updates.gender          = gender;
    if (diabetes_type !== undefined)   updates.diabetes_type   = diabetes_type;
    if (phone !== undefined)           updates.phone           = phone;
    if (avatar_url !== undefined)      updates.avatar_url      = avatar_url;
    // Campos do profissional — ignorados automaticamente se a coluna não existir
    if (cpf !== undefined)             updates.cpf             = cpf;
    if (birth_date !== undefined)      updates.birth_date      = birth_date;
    if (specialty !== undefined)       updates.specialty       = specialty;
    if (crm !== undefined)             updates.crm             = crm;
    if (crm_uf !== undefined)          updates.crm_uf          = crm_uf;
    if (education !== undefined)       updates.education       = education;
    if (clinic_address !== undefined)  updates.clinic_address  = clinic_address;
    if (license_number !== undefined)  updates.license_number  = license_number;

    // Hash da nova senha se fornecida
    if (password && password.trim() !== "") {
      const salt = await bcrypt.genSalt(10);
      updates.password_hash = await bcrypt.hash(password, salt);
    }

    if (Object.keys(updates).length === 0) {
      return NextResponse.json({ mensagem: "Nenhum dado para atualizar." }, { status: 200 });
    }

    // Executa o update com retry automático para colunas ausentes
    const { error: updateError } = await performUpdate(table, user.id, updates);

    if (updateError) {
      console.error("SUPABASE UPDATE ERROR (final):", JSON.stringify(updateError));
      return NextResponse.json(
        {
          erro: `Erro ao atualizar perfil: ${updateError.message}`,
          detalhe: updateError.message,
          codigo: updateError.code,
        },
        { status: 500 }
      );
    }

    return NextResponse.json({ mensagem: "Perfil atualizado com sucesso!" }, { status: 200 });
  } catch (error) {
    console.error("Erro ao atualizar perfil:", error);
    return NextResponse.json({ erro: "Erro interno no servidor." }, { status: 500 });
  }
}
