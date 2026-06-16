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
 * @param {string} [req.body.dateOfBirth] - Data de nascimento no formato YYYY-MM-DD (opcional).
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

    const { name, email, password, role, licenseNumber, phone, dateOfBirth, diabetesType, gender } = result.data;

    const userRole = role === 'professional' ? 'PROFESSIONAL' : 'PATIENT';

    if (userRole === 'PROFESSIONAL' && !licenseNumber) {
      return errorResponse("Profissionais de saúde devem informar o número de registro (CRM ou CRN).", 400);
    }

    // 1. Verificar se o e-mail já existe na tabela 'users'
    const { data: existingUser } = await supabase
      .from("users")
      .select("id")
      .eq("email", email)
      .maybeSingle();

    if (existingUser) {
      return errorResponse("Este email já está cadastrado.", 400);
    }

    const passwordHash = await hashPassword(password);

    // 2. Inserir na tabela 'users'
    const { data: newUser, error: insertUserError } = await supabase
      .from("users")
      .insert([{
        email,
        password_hash: passwordHash,
        role: userRole
      }])
      .select("id, email, role")
      .single();

    if (insertUserError || !newUser) {
      console.error("Error inserting into users table:", insertUserError);
      return errorResponse("Erro interno ao cadastrar credenciais.", 500);
    }

    // 3. Inserir dados específicos
    let specificData: any = {
      id: newUser.id,
      name,
      phone: phone || null,
    };

    if (userRole === 'PATIENT') {
      // Calcular idade baseada na data de nascimento
      let age = null;
      if (dateOfBirth) {
        const birthDateObj = new Date(dateOfBirth);
        const ageDifMs = Date.now() - birthDateObj.getTime();
        const ageDate = new Date(ageDifMs);
        age = Math.abs(ageDate.getUTCFullYear() - 1970);
      }

      specificData.age = age;
      specificData.birth_date = dateOfBirth || null;
      specificData.gender = gender || null;
      specificData.diabetes_type = diabetesType || null;

      const { error: insertPatientError } = await supabase
        .from("patients")
        .insert([specificData]);

      if (insertPatientError) {
        console.error("Error inserting into patients:", insertPatientError);
        // Fallback: Delete the user if patient creation fails
        await supabase.from("users").delete().eq("id", newUser.id);
        return errorResponse("Erro ao salvar dados do paciente.", 500);
      }
    } else {
      specificData.license_number = licenseNumber;

      const { error: insertProfessionalError } = await supabase
        .from("professionals")
        .insert([specificData]);

      if (insertProfessionalError) {
        console.error("Error inserting into professionals:", insertProfessionalError);
        // Fallback: Delete the user if professional creation fails
        await supabase.from("users").delete().eq("id", newUser.id);
        return errorResponse("Erro ao salvar dados do profissional.", 500);
      }
    }

    // 4. Retornar resposta
    return successResponse({ 
      mensagem: "Usuário cadastrado com sucesso!", 
      user: {
        id: newUser.id,
        email: newUser.email,
        role: newUser.role,
        name: specificData.name
      }
    }, 201);

  } catch (error) {
    console.error("General registration error:", error);
    return errorResponse("Internal server error during registration.", 500);
  }
}
