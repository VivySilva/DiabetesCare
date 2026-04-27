import { Router, Request, Response } from "express";
import bcrypt from "bcrypt";
import crypto from "crypto";
import supabase from "../config/supabase";
import transporter from "../config/email";

/**
 * @class PasswordRecoveryController
 * @description Controller class responsible for handling password recovery operations.
 */

class PasswordRecoveryController {
    /**
     * @method requestRecovery
     * @description Route to request a password recovery link.
     * Generates a secure token, saves it to the database with a 1-hour expiration,
     * and sends an email containing the recovery link.
     * 
     * @route POST /esqueceu_a_senha/solicitar
     * @param {Request} req - The Express request object.
     * @param {string} req.body.email - The email of the user requesting password recovery.
     * @param {Response} res - The Express response object.
     * @returns {Promise<Response>} 200 - Generic confirmation message.
     * @returns {Promise<Response>} 400 - Bad request error if the email is missing.
     * @returns {Promise<Response>} 500 - Internal server error during token generation or email dispatch.
     */

    public async requestRecovery(req: Request, res: Response): Promise<Response | any> {
        try {
            const { email } = req.body;

            if (!email) {
                return res.status(400).json({ erro: "O email é obrigatório." });
            }

            const { data: usuario, error: errorBusca } = await supabase
                .from("usuario")
                .select("id, nome")
                .eq("email", email)
                .maybeSingle();

            if (errorBusca || !usuario) {
                return res.status(200).json({
                    mensagem: "Se o e-mail existir, um link de recuperação será enviado."
                });
            }

            const token = crypto.randomBytes(32).toString("hex");

            const expiraEm = new Date();
            expiraEm.setHours(expiraEm.getHours() + 1);

            const { error: errorInsert } = await supabase
                .from("recuperacao_senha")
                .insert([
                    {
                        usuario_id: usuario.id,
                        token: token,
                        expira_em: expiraEm.toISOString(),
                        usado: false
                    }
                ]);

            if (errorInsert) {
                console.error("Erro ao inserir token:", errorInsert);
                return res.status(500).json({ erro: "Erro ao gerar recuperação de senha." });
            }
            try {
                const frontendUrl = process.env.FRONTEND_URL || "http://localhost:3000";
                const resetLink = `${frontendUrl}/redefinir-senha?token=${token}`;

                await transporter.sendMail({
                    from: `"DiabetesCare" <${process.env.EMAIL_USER}>`,
                    to: email,
                    subject: "Recuperação de Senha - DiabetesCare",
                    text: `Olá, ${usuario.nome}\n\nVocê solicitou a recuperação da sua senha.\n\nUse o link abaixo para redefinir sua senha:\n${resetLink}\n\nEsse link expira em 1 hora.`,
                    html: `
                    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 10px;">
                        <h2 style="color: #2b6cb0; text-align: center;">DiabetesCare</h2>
                        <p style="font-size: 16px; color: #333;">Olá, <strong>${usuario.nome}</strong>,</p>
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
                    `
                });

                console.log("EMAIL ENVIADO COM SUCESSO PARA:", email);

            } catch (err) {
                console.error("ERRO AO ENVIAR EMAIL:", err);

                return res.status(500).json({
                    erro: "Falha ao enviar email de recuperação."
                });
            }

            return res.status(200).json({
                mensagem: "Se o e-mail existir, um link de recuperação será enviado."
            });

        } catch (error) {
            console.error("Erro geral:", error);
            return res.status(500).json({ erro: "Erro interno no servidor." });
        }
    }

    /**
     * @method resetPassword
     * @description Route to reset the user's password using the token received via email.
     * Verifies token validity (exists, unused, and unexpired) and securely updates the user's password.
     * 
     * @route POST /esqueceu_a_senha/redefinir
     * @param {Request} req - The Express request object.
     * @param {string} req.body.token - The previously generated password recovery token.
     * @param {string} req.body.novaSenha - The new password chosen by the user.
     * @param {Response} res - The Express response object.
     * @returns {Promise<Response>} 200 - Success message confirming the password has been reset.
     * @returns {Promise<Response>} 400 - Bad request error if the token or new password is missing, or if the token is invalid, used, or expired.
     * @returns {Promise<Response>} 500 - Internal server error while updating the password in the database.
     */

    public async resetPassword(req: Request, res: Response): Promise<Response | any> {
        try {
            const { token, novaSenha } = req.body;

            if (!token || !novaSenha) {
                return res.status(400).json({
                    erro: "Token e nova senha são obrigatórios."
                });
            }

            const { data: registroToken, error } = await supabase
                .from("recuperacao_senha")
                .select("id, usuario_id, expira_em, usado")
                .eq("token", token)
                .maybeSingle();

            if (error || !registroToken) {
                return res.status(400).json({ erro: "Token inválido." });
            }

            if (registroToken.usado) {
                return res.status(400).json({ erro: "Token já utilizado." });
            }

            const agora = new Date();
            const expiraEm = new Date(registroToken.expira_em);

            if (agora > expiraEm) {
                return res.status(400).json({ erro: "Token expirado." });
            }

            const salt = await bcrypt.genSalt(10);
            const senhaHash = await bcrypt.hash(novaSenha, salt);

            const { error: erroUpdate } = await supabase
                .from("usuario")
                .update({ senha_criptografada: senhaHash })
                .eq("id", registroToken.usuario_id);

            if (erroUpdate) {
                return res.status(500).json({
                    erro: "Erro ao atualizar senha."
                });
            }

            await supabase
                .from("recuperacao_senha")
                .update({ usado: true })
                .eq("id", registroToken.id);

            return res.status(200).json({
                mensagem: "Senha redefinida com sucesso!"
            });

        } catch (error) {
            console.error("Erro ao redefinir senha:", error);
            return res.status(500).json({ erro: "Erro interno." });
        }
    }
}

/**
 * Express router for handling password recovery routes.
 */
const router = Router();
const passwordRecoveryController = new PasswordRecoveryController();

// ==========================================
// ROUTE: Request Password Recovery
// ==========================================
router.post("/solicitar", passwordRecoveryController.requestRecovery);

// ==========================================
// ROUTE: Reset Password
// ==========================================
router.post("/redefinir", passwordRecoveryController.resetPassword);

export default router;