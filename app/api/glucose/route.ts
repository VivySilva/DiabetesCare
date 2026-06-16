import { NextRequest } from "next/server";
import supabase from "@/config/supabase";
import { verifyToken, unauthorizedResponse } from "@/lib/auth";
import { glucoseSchema } from "@/schemas/glucose";
import { successResponse, errorResponse } from "@/lib/api-response";

export const dynamic = "force-dynamic";

/**
 * GET /api/glucose
 * 
 * Recupera o histórico de medições de glicose do usuário autenticado.
 * 
 * @param {NextRequest} req - Objeto de requisição.
 * @returns {Promise<Response>} Lista de registros de glicose ou erro (401, 500).
 */
export async function GET(req: NextRequest) {
  const user = await verifyToken(req);
  if (!user) return unauthorizedResponse();

  try {
    const { data, error } = await supabase
      .from("glucose_records")
      .select("*")
      .eq("patient_id", user.id)
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

/**
 * POST /api/glucose
 * 
 * Registra uma nova medição de glicose.
 * 
 * @param {NextRequest} req - Objeto de requisição.
 * @param {Object} req.body - Dados da medição.
 * @param {number} req.body.glucose_value - Valor da glicemia medida.
 * @param {string} req.body.period - Período (Jejum, Pré-Prandial, etc).
 * @param {boolean} req.body.took_insulin - Se houve aplicação de insulina.
 * @param {string} [req.body.insulin_type] - Tipo da insulina.
 * @param {number} [req.body.insulin_amount] - Quantidade de unidades.
 * @param {string} [req.body.injection_site] - Local da aplicação.
 * @param {string[]} [req.body.symptoms] - Lista de sintomas.
 * @param {number} [req.body.symptom_intensity] - Intensidade dos sintomas.
 * @returns {Promise<Response>} Registro criado ou erro (400, 401, 500).
 */
export async function POST(req: NextRequest) {
  const user = await verifyToken(req);
  if (!user) return unauthorizedResponse();

  try {
    const body = await req.json();
    
    const result = glucoseSchema.safeParse(body);
    if (!result.success) {
      return errorResponse(result.error.issues[0].message, 400);
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
          patient_id: user.id, // ID na tabela users = ID na tabela patients
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

    // Gatilho para Notificação (Paciente)
    let alertBody = null;
    let alertTitle = null;

    if (glucose_value > 180) {
      alertTitle = "Atenção: Glicose Alta (Hiperglicemia)";
      alertBody = `Sua glicose registrou ${glucose_value} mg/dL. Recomendamos hidratação e acompanhamento.`;
    } else if (glucose_value < 70) {
      alertTitle = "Atenção: Glicose Baixa (Hipoglicemia)";
      alertBody = `Sua glicose registrou ${glucose_value} mg/dL. Ingira carboidratos de ação rápida.`;
    }

    if (alertTitle && alertBody) {
      // Criar notificação para o paciente
      const { error: notifError } = await supabase.from("notifications").insert([{
        user_id: user.id,
        title: alertTitle,
        body: alertBody,
        type: "GLUCOSE"
      }]);
      
      if (notifError) console.error("Error creating patient notification:", notifError);

      // Bônus: Criar notificação para profissionais logados ou admins (simulado)
      // Como não temos vínculo direto paciente-profissional, enviamos uma notificação
      // de emergência se for muito grave (< 50 ou > 300).
      if (glucose_value < 50 || glucose_value > 300) {
        const { data: professionals } = await supabase.from("users").select("id").eq("role", "PROFESSIONAL").limit(10);
        if (professionals && professionals.length > 0) {
          const profNotifs = professionals.map(prof => ({
            user_id: prof.id,
            title: `Alerta Crítico: Paciente precisa de atenção!`,
            body: `Um paciente registrou glicemia de ${glucose_value} mg/dL.`,
            type: "SYSTEM"
          }));
          const { error: profError } = await supabase.from("notifications").insert(profNotifs);
          if (profError) console.error("Error creating professional notifications:", profError);
        }
      }
    }

    return successResponse({ mensagem: "Registro criado com sucesso!", record: data }, 201);
  } catch (error) {
    console.error("General error in glucose registration:", error);
    return errorResponse("Internal server error.", 500);
  }
}
