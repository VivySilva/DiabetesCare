import { NextRequest } from "next/server";
import { comparePassword } from "@/lib/hash";
import { signToken } from "@/lib/jwt";
import supabase from "@/config/supabase";
import { loginSchema } from "@/schemas/auth";
import { successResponse, errorResponse } from "@/lib/api-response";

/**
 * POST /api/auth/login
 * 
 * Realiza a autenticação de um usuário no sistema DiabetesCare.
 * 
 * @param {NextRequest} req - Objeto de requisição do Next.js.
 * @param {Object} req.body - Conteúdo da requisição.
 * @param {string} req.body.email - Endereço de e-mail do usuário.
 * @param {string} req.body.password - Senha do usuário.
 * @returns {Promise<Response>} Resposta JSON com o token e dados do usuário ou erro (400, 401, 500).
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    const result = loginSchema.safeParse(body);
    if (!result.success) {
      return errorResponse(result.error.issues[0].message, 400);
    }

    const { email: validatedEmail, password: validatedPassword } = result.data;

    if (!validatedPassword || typeof validatedPassword !== "string") {
      return errorResponse("Senha inválida", 400);
    }

    // 1. Buscar usuário na tabela base
    const { data: authUser } = await supabase
      .from("users")
      .select("id, email, password_hash, role")
      .eq("email", validatedEmail)
      .maybeSingle();

    if (!authUser) {
      return errorResponse("Credenciais inválidas", 401);
    }

    // 2. Validar a senha
    const validPassword = await comparePassword(
      validatedPassword,
      authUser.password_hash
    );

    if (!validPassword) {
      return errorResponse("Credenciais inválidas", 401);
    }

    // 3. Buscar dados específicos baseado na role
    let userData = { id: authUser.id, email: authUser.email, role: authUser.role, name: "", license_number: null };

    if (authUser.role === 'PATIENT') {
      const { data: patient } = await supabase.from("patients").select("name").eq("id", authUser.id).maybeSingle();
      if (patient) userData.name = patient.name;
    } else {
      const { data: professional } = await supabase.from("professionals").select("name, license_number").eq("id", authUser.id).maybeSingle();
      if (professional) {
        userData.name = professional.name;
        userData.license_number = professional.license_number;
      }
    }

    const token = signToken({
      id: userData.id,
      name: userData.name,
      email: userData.email,
      role: userData.role,
    });

    try {
      const ipAddress = req.headers.get("x-forwarded-for") || "unknown";
      await supabase.from("login_logs").insert([
        {
          user_id: userData.id,
          action: "LOGIN_SUCCESS",
          ip_address: ipAddress,
        },
      ]);
    } catch (logError) {
      console.warn("Erro ao salvar log de login:", logError);
    }

    return successResponse({
      mensagem: "Login realizado com sucesso!",
      token,
      user: {
        id: userData.id,
        name: userData.name,
        email: userData.email,
        role: userData.role,
        license_number: (userData as any).license_number || null,
      },
    });
  } catch (error) {
    console.error("Erro interno no servidor durante o login:", error);
    return errorResponse("Erro interno no servidor", 500);
  }
}
