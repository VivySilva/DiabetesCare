import { z } from "zod";

export const loginSchema = z.object({
  email: z.string().email("Email inválido").max(255, "Email muito longo"),
  password: z.string().min(6, "A senha deve ter pelo menos 6 caracteres").max(255),
});

export const registerSchema = z.object({
  name: z.string().min(2, "Nome muito curto").max(255, "Nome muito longo"),
  email: z.string().email("Email inválido").max(255, "Email muito longo"),
  password: z.string().min(6, "A senha deve ter pelo menos 6 caracteres").max(255),
  confirmPassword: z.string(),
  role: z.enum(["patient", "professional"]),
  licenseNumber: z.string().max(50, "Registro muito longo").optional(),
  phone: z.string()
    .regex(/^\d{10,11}$/, "O telefone deve conter apenas números e ter entre 10 e 11 dígitos")
    .optional(),
  dateOfBirth: z.string().optional(),
  diabetesType: z.string().optional(),
  gender: z.string().optional(),
}).refine((data) => data.password === data.confirmPassword, {
  message: "As senhas não coincidem",
  path: ["confirmPassword"],
});

export const forgotPasswordSchema = z.object({
  email: z.string().email("Email inválido").max(255),
});

export const resetPasswordSchema = z.object({
  token: z.string(),
  new_password: z.string().min(6, "A senha deve ter pelo menos 6 caracteres").max(255),
});
