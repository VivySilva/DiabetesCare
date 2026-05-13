import { NextRequest } from "next/server";
import supabase from "@/config/supabase";
import { verifyToken, unauthorizedResponse } from "@/lib/auth";
import { glucoseSchema } from "@/schemas/glucose";
import { successResponse, errorResponse } from "@/lib/api-response";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  const user = await verifyToken(req);
  if (!user) return unauthorizedResponse();

  try {
    const { data, error } = await supabase
      .from("glucose_records")
      .select("*")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Error fetching glucose records:", error);
      return errorResponse("Erro ao buscar registros de glicose.", 500);
    }

    return successResponse({ records: data });
  } catch (error) {
    console.error("General error in glucose listing:", error);
    return errorResponse("Internal server error.", 500);
  }
}

export async function POST(req: NextRequest) {
  const user = await verifyToken(req);
  if (!user) return unauthorizedResponse();

  try {
    const body = await req.json();
    
    // Validação com Zod
    const result = glucoseSchema.safeParse(body);
    if (!result.success) {
      return errorResponse(result.error.errors[0].message, 400);
    }

    const {
      glucose_value,
      period,
      took_insulin,
      insulin_type,
      insulin_amount,
      injection_site,
      symptoms,
      symptom_intensity,
    } = result.data;

    const { data, error } = await supabase
      .from("glucose_records")
      .insert([
        {
          user_id: user.id,
          glucose_value,
          period,
          took_insulin,
          insulin_type: took_insulin ? insulin_type : null,
          insulin_amount: took_insulin ? insulin_amount : null,
          injection_site: took_insulin ? injection_site : null,
          symptoms: symptoms || [],
          symptom_intensity: symptom_intensity || null,
        },
      ])
      .select()
      .single();

    if (error) {
      console.error("Error inserting glucose record:", error);
      return errorResponse("Erro interno ao criar registro de glicose.", 500);
    }

    return successResponse({ mensagem: "Registro criado com sucesso!", record: data }, 201);
  } catch (error) {
    console.error("General error in glucose registration:", error);
    return errorResponse("Internal server error.", 500);
  }
}
