import { z } from "zod";

export const updateUserSchema = z.object({
  name: z.string().min(2, "Nome muito curto").max(255, "Nome muito longo").optional(),
  email: z.string().email("Email inválido").max(255, "Email muito longo").optional(),
  age: z.number().int().min(0, "Idade inválida").max(130, "Idade inválida").optional().nullable(),
  gender: z.string().max(50).optional().nullable(),
  diabetes_type: z.string().max(100).optional().nullable(),
  phone: z.string().max(20).optional().nullable(),
  avatar_url: z.string().max(5000000).optional().nullable(), // Aceita base64 ou URL
  password: z.string().min(6, "A senha deve ter pelo menos 6 caracteres").max(255).optional(),
  birth_date: z.string().optional().nullable(),
  
  // Professional fields
  cpf: z.string().regex(/^\d{11}$/, "O CPF deve conter exatamente 11 números").optional(),
  specialty: z.string().max(255).optional(),
  crm: z.string().max(50).optional(),
  crm_uf: z.string().length(2, "UF deve ter 2 caracteres").optional(),
  education: z.string().max(255).optional(),
  clinic_address: z.string().max(500).optional(),
  license_number: z.string().max(50).optional(),
  bio: z.string().max(2000).optional(),
  professional_email: z.string().email("Email profissional inválido").max(255).optional().or(z.literal("")),
  professional_phone: z.string().max(20).optional(),
  clinic_name: z.string().max(255).optional(),
});
