import nodemailer from "nodemailer";
import { env } from "./env";

/**
 * Transporte de e-mail configurável via variáveis de ambiente.
 *
 * Suporta dois modos:
 * 1. SMTP genérico: defina SMTP_HOST, SMTP_PORT, EMAIL_USER, EMAIL_PASS
 * 2. Gmail (legado): se SMTP_HOST não for definido, usa service: "gmail"
 */
function createTransporter() {
  if (env.SMTP_HOST) {
    return nodemailer.createTransport({
      host: env.SMTP_HOST,
      port: Number(env.SMTP_PORT) || 587,
      secure: Number(env.SMTP_PORT) === 465,
      auth: {
        user: env.EMAIL_USER,
        pass: env.EMAIL_PASS,
      },
    });
  }

  // Fallback para Gmail (compatibilidade retroativa)
  return nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: env.EMAIL_USER,
      pass: env.EMAIL_PASS,
    },
  });
}

const transporter = createTransporter();

export default transporter;

export const EMAIL_FROM = env.EMAIL_USER 
  ? `"DiabetesCare" <${env.EMAIL_USER}>`
  : `"DiabetesCare" <noreply@diabetescare.app>`;