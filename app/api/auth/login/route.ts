import { NextRequest } from "next/server";
import { comparePassword } from "@/lib/hash";
import { signToken } from "@/lib/jwt";
import supabase from "@/config/supabase";
import { loginSchema } from "@/schemas/auth";
import { successResponse, errorResponse } from "@/lib/api-response";

/**
 * POST /api/auth/login
 * 
 * Authenticates a user in the DiabetesCare system.
 * 
 * Workflow:
 * 1. Validates input structure and types using Zod.
 * 2. Verifies user existence in the database by the provided email.
 * 3. Compares the provided password with the stored hash (bcrypt).
 * 4. On success, generates a JWT token containing essential user data.
 * 5. Records the login event in the logs system (non-blocking).
 * 6. Returns authenticated user data along with the access token.
 * 
 * Security: 
 * - Uses generic messages to prevent user enumeration.
 * - Rigorous input validation to prevent errors and attacks.
 * - Signed JWT token for access control.
 * - Access logging for auditing.
 * 
 * @param req - NextRequest containing:
 *  - email: string (required)
 *  - password: string (required)
 * @returns {response}
 * 
 * Possible Responses:
 * 
 * 200 - Login successful
 * {
 *  success: true,
 *  data:{
 *    mensagem: string,
 *    token: string,
 *    user:{
 *      id: string,
 *      name: string,
 *      email: string,
 *      role: string,
 *      license_number?: string
 *    }
 *  }
 * }
 * 
 * 400 - Invalid data
 * {
 *  success: false,
 *  error: string
 * }
 * 
 * 401 - Invalid credentials
 * {
 *  success: false,
 *  error: "Credenciais inválidas"
 * }
 * 
 * 500 - Internal server error
 * {
 *  success: false,
 *  error: "Erro interno no servidor"
 * }
 */

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    // 1. Validação estrutural e de tipos (Zod)
    // Validação estrutura e tipagem dos dados de entrada.
    // Garante que o playoud recebido atende ao contrato esperado antes de qualquer processamento
    const result = loginSchema.safeParse(body);
    if (!result.success) {
      return errorResponse(result.error.issues[0].message, 400);
    }

    const { email: validatedEmail, password: validatedPassword } = result.data;

    // Proteção extra contra tipos inesperados (ex: null, undefined ou tipos inválidos)
    // Evita falhas em funções críticas como comparação de senha.
    if (!validatedPassword || typeof validatedPassword !== "string") {
      return errorResponse("Senha inválida", 400);
    }

    // 2. Busca usuário por e-mail
    //maybeSingle evita erro não exista registro e retorna null de forma segura. 
    const { data: user, error: searchError } = await supabase
      .from("users")
      .select("id, name, email, password_hash, role, license_number")
      .eq("email", validatedEmail)
      .maybeSingle();

    // 3. Validação de usuário existente
    // Evita erro caso não exista registro.
    if (searchError || !user) {
      return errorResponse("Credenciais inválidas", 401);
    }

    // 4. Validação de senha
    // Compara a senha fornecida com o hash armazenado utilizando bcrypt.
    // Operação segura que nunca expõe a senha original.
    const validPassword = await comparePassword(
      validatedPassword,
      user.password_hash
    );

    if (!validPassword) {
      return errorResponse("Credenciais inválidas", 401);
    }

    // 5. Só depois de tudo validado, gera o token
    //Gera o token JWT com payload seguro, não inclui informações sensíveis.
    const token = signToken({
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
    });

    // 6. Logging do acesso (dentro de um try/catch para não impedir o login se o log falhar)
    try {
      const ipAddress = req.headers.get("x-forwarded-for") || "unknown";
      await supabase.from("login_logs").insert([
        {
          user_id: user.id,
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
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        license_number: user.license_number,
      },
    });
  } catch (error) {
    console.error("Erro interno no servidor durante o login:", error);
    return errorResponse("Erro interno no servidor", 500);
  }
}
