import { NextRequest } from "next/server";
import { hashPassword } from "@/lib/hash";
import supabase from "@/config/supabase";
import { registerSchema } from "@/schemas/auth";
import { successResponse, errorResponse } from "@/lib/api-response";

/**
 * POST /api/auth/register
 * 
 * Realiza o cadastro de um novo usuário (paciente ou profissional) no sistema.
 * 
 * @param {NextRequest} req - Objeto de requisição do Next.js.
 * @param {Object} req.body - Conteúdo da requisição.
 * @param {string} req.body.name - Nome completo do usuário.
 * @param {string} req.body.email - Endereço de e-mail.
 * @param {string} req.body.password - Senha.
 * @param {"patient" | "professional"} req.body.role - Papel do usuário.
 * @param {string} [req.body.licenseNumber] - Registro profissional (obrigatório para profissionais).
 * @param {string} [req.body.phone] - Telefone opcional.
 * @returns {Promise<Response>} Resposta JSON com status 201 (criado) ou erro (400, 500).
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    
    const result = registerSchema.safeParse(body);
    if (!result.success) {
      return errorResponse(result.error.issues[0].message, 400);
    }

    const { name, email, password, role, licenseNumber, phone } = result.data;

    const userRole = role === 'professional' ? 'PROFESSIONAL' : 'PATIENT';

    if (userRole === 'PROFESSIONAL' && !licenseNumber) {
      return errorResponse("Profissionais de saúde devem informar o número de registro (CRM ou CRN).", 400);
    }

    const table = userRole === 'PROFESSIONAL' ? "professionals" : "patients";

    const { data: existingPatient } = await supabase
      .from("patients")
      .select("id")
      .eq("email", email)
      .maybeSingle();

    const { data: existingProfessional } = await supabase
      .from("professionals")
      .select("id")
      .eq("email", email)
      .maybeSingle();

    if (existingPatient || existingProfessional) {
      return errorResponse("Este email já está cadastrado.", 400);
    }

    const passwordHash = await hashPassword(password);

    const insertData: any = {
      name,
      email,
      password_hash: passwordHash,
      role: userRole,
      phone: phone || null,
    };

    if (userRole === 'PROFESSIONAL') {
      insertData.license_number = licenseNumber;
    }

    const { data: newUser, error: insertError } = await supabase
      .from(table)
      .insert([insertData])
      .select(userRole === 'PROFESSIONAL' ? "id, name, email, role, license_number, phone" : "id, name, email, role, phone")
      .single();

    if (insertError) {
      console.error("Error inserting into Supabase:", insertError);
      return errorResponse("Erro interno ao cadastrar usuário no banco de dados.", 500);
    }

    return successResponse({ mensagem: "Usuário cadastrado com sucesso!", user: newUser }, 201);
  } catch (error) {
    console.error("General registration error:", error);
    return errorResponse("Internal server error during registration.", 500);
  }
}
