import { z } from "zod";

export const glucoseSchema = z.object({
  glucose_value: z.number().min(0, "Glicose não pode ser negativa").max(600, "Valor de glicose muito alto"),
  period: z.string().max(50),
  took_insulin: z.boolean(),
  insulin_type: z.string().max(100).optional(),
  insulin_amount: z.number().min(0).max(1000).optional(),
  injection_site: z.string().max(100).optional(),
  symptoms: z.array(z.string().max(100)).optional(),
  symptom_intensity: z.number().min(0).max(10).optional(),
});
