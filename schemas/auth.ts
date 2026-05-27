import { z } from "zod";

export const loginSchema = z.object({
  email: z.string().email("Email inválido"),
  password: z.string().min(6, "A senha deve ter pelo menos 6 caracteres"),
});

export const registerSchema = z.object({
  name: z.string().min(2, "Nome muito curto"),
  email: z.string().email("Email inválido"),
  password: z.string().min(6, "A senha deve ter pelo menos 6 caracteres"),
  confirmPassword: z.string(),
  role: z.enum(["patient", "professional"]),
  dateOfBirth: z.string().optional(), // Data de nascimento no formato YYYY-MM-DD
  licenseNumber: z.string().optional(),
  phone: z.string().optional(),
  diabetesType: z.string().optional(),
  gender: z.string().optional(),
}).refine((data) => data.password === data.confirmPassword, {
  message: "As senhas não coincidem",
  path: ["confirmPassword"],
});

export const forgotPasswordSchema = z.object({
  email: z.string().email("Email inválido"),
});

export const resetPasswordSchema = z.object({
  token: z.string(),
  new_password: z.string().min(6, "A senha deve ter pelo menos 6 caracteres"),
});
