import { z } from "zod";

export const medicationSchema = z.object({
  category: z.enum(["Insulina", "Medicamento Oral", "Injetáveis não Insulinicos", "Outros"], { error: "Categoria inválida" }),
  medication_name: z.string().min(2, "Nome do medicamento muito curto").max(255, "Nome muito longo"),
  times: z.array(z.string().regex(/^([01]\d|2[0-3]):([0-5]\d)$/, "O horário deve estar no formato HH:mm")).min(1, "Selecione pelo menos um horário"),
  notify: z.boolean(),
});
