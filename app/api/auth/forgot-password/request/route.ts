import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";
import supabase from "@/config/supabase";
import transporter, { EMAIL_FROM } from "@/config/email";
import { env } from "@/config/env";

/**
 * POST /api/auth/forgot-password/request
 * 
 * Inicia o processo de recuperação de senha enviando um e-mail com um token único.
 * 
 * @param {NextRequest} req - Objeto de requisição do Next.js.
 * @param {Object} req.body - Conteúdo da requisição.
 * @param {string} req.body.email - E-mail do usuário que solicita a recuperação.
 * @returns {Promise<Response>} Resposta JSON confirmando o envio da solicitação ou erro (400, 500).
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { email } = body;

    if (!email) {
      return NextResponse.json({ erro: "O email é obrigatório." }, { status: 400 });
    }

    const { data: user, error: errorBusca } = await supabase
      .from("users")
      .select("id, name")
      .eq("email", email)
      .maybeSingle();

    if (errorBusca || !user) {
      return NextResponse.json({
        mensagem: "Se o e-mail existir, um link de recuperação será enviado.",
      });
    }

    const token = crypto.randomBytes(32).toString("hex");

    const expiresAt = new Date();
    expiresAt.setHours(expiresAt.getHours() + 1);

    const { error: insertError } = await supabase.from("password_recoveries").insert([
      {
        user_id: user.id,
        token: token,
        expires_at: expiresAt.toISOString(),
        used: false,
      },
    ]);

    if (insertError) {
      console.error("Error inserting recovery token:", insertError);
      return NextResponse.json({ erro: "Erro ao gerar recuperação de senha." }, { status: 500 });
    }

    try {
      const frontendUrl = env.FRONTEND_URL || "http://localhost:3000";
      const resetLink = `${frontendUrl}/reset-password?token=${token}`;

      // Promise com timeout para evitar que a serverless function do Vercel exceda o limite
      const sendMailPromise = transporter.sendMail({
        from: EMAIL_FROM,
        to: email,
        subject: "Recuperação de Senha - DiabetesCare",
        text: `Olá, ${user.name}\n\nVocê solicitou a recuperação da sua senha.\n\nUse o link abaixo para redefinir sua senha:\n${resetLink}\n\nEsse link expira em 1 hora.`,
        html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 10px;">
            <h2 style="color: #2b6cb0; text-align: center;">DiabetesCare</h2>
            <p style="font-size: 16px; color: #333;">Olá, <strong>${user.name}</strong>,</p>
            <p style="font-size: 16px; color: #333;">Recebemos uma solicitação para redefinir a senha da sua conta.</p>
            <div style="text-align: center; margin: 30px 0;">
                <a href="${resetLink}" style="background-color: #2b6cb0; color: white; padding: 12px 25px; text-decoration: none; border-radius: 5px; font-size: 16px; font-weight: bold;">Redefinir Minha Senha</a>
            </div>
            <p style="font-size: 14px; color: #666;">Se o botão não funcionar, copie e cole o link abaixo no seu navegador:</p>
            <p style="font-size: 14px; color: #2b6cb0; word-break: break-all;">${resetLink}</p>
            <p style="font-size: 14px; color: #888; margin-top: 30px;">Este link de recuperação expirará em 1 hora. Se você não solicitou essa alteração, nenhuma ação é necessária.</p>
            <hr style="border: none; border-top: 1px solid #e0e0e0; margin: 20px 0;" />
            <p style="font-size: 12px; color: #aaa; text-align: center;">© ${new Date().getFullYear()} DiabetesCare. Todos os direitos reservados.</p>
        </div>
        `,
      });

      // Timeout de 12s para o envio do e-mail (Vercel Hobby tem limite de 10s)
      const timeoutPromise = new Promise((_, reject) =>
        setTimeout(() => reject(new Error("Timeout ao enviar e-mail")), 12000)
      );

      await Promise.race([sendMailPromise, timeoutPromise]);

      console.log("EMAIL ENVIADO COM SUCESSO PARA:", email);
    } catch (err) {
      console.error("ERRO AO ENVIAR EMAIL:", err);
      // Em produção, não retornamos erro interno para não expor informações
      // O token já foi salvo, então o usuário pode tentar novamente
      return NextResponse.json({
        mensagem: "Se o e-mail existir, um link de recuperação será enviado.",
      });
    }

    return NextResponse.json({
      mensagem: "Se o e-mail existir, um link de recuperação será enviado.",
    });
  } catch (error) {
    console.error("Erro geral:", error);
    return NextResponse.json({ erro: "Erro interno no servidor." }, { status: 500 });
  }
}
