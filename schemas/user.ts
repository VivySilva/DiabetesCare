import { z } from "zod";

export const updateUserSchema = z.object({
  name: z.string().min(2, "Nome muito curto").max(255, "Nome muito longo").optional(),
  email: z.string().email("Email inválido").max(255, "Email muito longo").optional(),
  age: z.number().int().min(0, "Idade inválida").max(130, "Idade inválida").optional(),
  gender: z.string().max(50).optional(),
  diabetes_type: z.string().max(100).optional(),
  phone: z.string().regex(/^\d{10,11}$/, "O telefone deve conter apenas números e ter entre 10 e 11 dígitos").optional(),
  avatar_url: z.string().url("URL inválida").max(1000).optional(),
  password: z.string().min(6, "A senha deve ter pelo menos 6 caracteres").max(255).optional(),
  
  // Professional fields
  cpf: z.string().regex(/^\d{11}$/, "O CPF deve conter exatamente 11 números").optional(),
  birth_date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Data deve estar no formato YYYY-MM-DD").optional(),
  specialty: z.string().max(255).optional(),
  crm: z.string().max(50).optional(),
  crm_uf: z.string().length(2, "UF deve ter 2 caracteres").optional(),
  education: z.string().max(255).optional(),
  clinic_address: z.string().max(500).optional(),
  license_number: z.string().max(50).optional(),
}).strict(); // strict prevents any extra fields from being passed
