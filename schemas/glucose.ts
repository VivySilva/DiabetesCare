import { z } from "zod";

export const glucoseSchema = z.object({
  glucose_value: z.number().min(0).max(600),
  period: z.string(),
  took_insulin: z.boolean(),
  insulin_type: z.string().optional(),
  insulin_amount: z.number().optional(),
  injection_site: z.string().optional(),
  symptoms: z.array(z.string()).optional(),
  symptom_intensity: z.number().min(0).max(10).optional(),
});
