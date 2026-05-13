// Environment variables configuration and validation
import { z } from "zod";

const envSchema = z.object({
  SUPABASE_URL: z.string().url(),
  SUPABASE_KEY: z.string().min(1),
  JWT_SECRET: z.string().min(10, "JWT_SECRET deve ter pelo menos 10 caracteres"),
  SMTP_HOST: z.string().optional(),
  SMTP_PORT: z.string().optional(),
  EMAIL_USER: z.string().optional(),
  EMAIL_PASS: z.string().optional(),
  SMTP_FROM: z.string().optional(),
});

const _env = envSchema.safeParse(process.env);

if (!_env.success) {
  const errors = _env.error.flatten().fieldErrors;
  const missingVars = Object.keys(errors).join(", ");
  
  console.error("❌ Erro de Configuração: Variáveis de ambiente inválidas ou ausentes:", missingVars);
  console.error("Detalhes:", JSON.stringify(errors, null, 2));
  
  throw new Error(`Configuração Inválida: Verifique seu arquivo .env.local. Variáveis afetadas: ${missingVars}`);
}

export const env = _env.data;
