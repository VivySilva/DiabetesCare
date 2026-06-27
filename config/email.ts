import nodemailer from "nodemailer";
import { env } from "./env";

/**
 * Transporte de e-mail configurável via variáveis de ambiente.
 *
 * Suporta dois modos:
 * 1. SMTP genérico: defina SMTP_HOST, SMTP_PORT, EMAIL_USER, EMAIL_PASS
 * 2. Gmail (legado): se SMTP_HOST não for definido, usa service: "gmail"
 *
 * Para Vercel:
 * - Recomendado usar SMTP_HOST (ex: smtp.gmail.com, smtp.sendgrid.net, smtp.mailgun.org)
 * - Porta 587 (STARTTLS) funciona melhor que 465 em serverless functions
 * - Para Gmail, gere uma "Senha de App" em https://myaccount.google.com/apppasswords
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
      // Timeout reduzido para serverless functions (Vercel tem limite de 10s no free)
      connectionTimeout: 8000,
      greetingTimeout: 8000,
      socketTimeout: 10000,
    });
  }

  // Fallback para Gmail (compatibilidade retroativa)
  return nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: env.EMAIL_USER,
      pass: env.EMAIL_PASS,
    },
    connectionTimeout: 8000,
    greetingTimeout: 8000,
    socketTimeout: 10000,
  });
}

const transporter = createTransporter();

export default transporter;

export const EMAIL_FROM = env.EMAIL_USER 
  ? `"DiabetesCare" <${env.EMAIL_USER}>`
  : `"DiabetesCare" <noreply@diabetescare.app>`;