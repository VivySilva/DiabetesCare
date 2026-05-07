import { NextRequest } from "next/server";
import { hashPassword } from "@/lib/hash";
import supabase from "@/config/supabase";
import { registerSchema } from "@/schemas/auth";
import { successResponse, errorResponse } from "@/lib/api-response";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    
    // Validação com Zod
    const result = registerSchema.safeParse(body);
    if (!result.success) {
      return errorResponse(result.error.errors[0].message, 400);
    }

    const { name, email, password, role, licenseNumber, phone } = result.data;

    const userRole = role === 'professional' ? 'PROFESSIONAL' : 'PATIENT';

    if (userRole === 'PROFESSIONAL' && !licenseNumber) {
      return errorResponse("Profissionais de saúde devem informar o número de registro (CRM ou CRN).", 400);
    }

    const { data: existingUser, error: searchError } = await supabase
      .from("users")
      .select("id")
      .eq("email", email)
      .maybeSingle();

    if (existingUser) {
      return errorResponse("Este email já está cadastrado.", 400);
    }

    const passwordHash = await hashPassword(password);

    const { data: newUser, error: insertError } = await supabase
      .from("users")
      .insert([
        {
          name,
          email,
          password_hash: passwordHash,
          role: userRole,
          license_number: userRole === 'PROFESSIONAL' ? licenseNumber : null,
          phone: phone || null,
        },
      ])
      .select("id, name, email, role, license_number, phone")
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
