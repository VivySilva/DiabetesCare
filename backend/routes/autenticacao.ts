import { Router, Request, Response } from "express";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import supabase from "../config/supabase";

/**
 * @openapi
 * /autenticacao/login:
 *   post:
 *     tags:
 *       - Autenticação
 *     summary: Login de usuário
 *     description: Autentica um usuário com email e senha, retornando um token JWT.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - senha
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *               senha:
 *                 type: string
 *     responses:
 *       200:
 *         description: Login realizado com sucesso
 *       400:
 *         description: Email e senha são obrigatórios
 *       401:
 *         description: Credenciais inválidas
 */

/**
 * @class AuthController
 * @description Controller class responsible for handling authentication operations.
 */
class AuthController {
    /**
     * @method login
     * @description Route to handle user login.
     * 
     * @route POST /autenticacao/login
     * @param {Request} req - The Express request object.
     * @param {string} req.body.email - The user's email address.
     * @param {string} req.body.senha - The user's password.
     * @param {Response} res - The Express response object.
     * @returns {Promise<Response>} 200 - Success message, JWT token, and basic user data.
     * @returns {Promise<Response>} 400 - Validation error if email or password are missing.
     * @returns {Promise<Response>} 401 - Unauthorized error if credentials are invalid.
     * @returns {Promise<Response>} 500 - Internal server error.
     */
    public async login(req: Request, res: Response): Promise<Response | any> {
        try {
            const { email, senha } = req.body;

            if (!email || !senha) {
                return res.status(400).json({ erro: "Email e senha são obrigatórios." });
            }

            const { data: usuario, error: erroBusca } = await supabase
                .from("usuario")
                .select("id, nome, email, senha_criptografada, perfil, especialidade")
                .eq("email", email)
                .maybeSingle();

            if (erroBusca || !usuario) {
                return res.status(401).json({ erro: "Credenciais inválidas. Usuário não encontrado." });
            }

            const senhaValida = await bcrypt.compare(senha, usuario.senha_criptografada);

            if (!senhaValida) {
                return res.status(401).json({ erro: "Credenciais inválidas. Senha incorreta." });
            }

            const jwtSecret = process.env.JWT_SECRET || "chave-secreta-padrao-temporaria-diabetes-care";

            const token = jwt.sign(
                {
                    id: usuario.id,
                    nome: usuario.nome,
                    email: usuario.email,
                    perfil: usuario.perfil
                },
                jwtSecret,
                { expiresIn: "1d" }
            );

            const ipOrigem =
                (req.headers["x-forwarded-for"] as string || req.socket.remoteAddress || "").toString();

            const { error: erroLogin } = await supabase
                .from("login")
                .insert([
                    {
                        usuario_id: usuario.id,
                        acao: "LOGIN_SUCESSO",
                        ip_origem: ipOrigem
                    }
                ]);

            if (erroLogin) {
                console.error("Erro ao salvar login:", erroLogin.message);
            }

            return res.status(200).json({
                mensagem: "Login realizado com sucesso!",
                token,
                usuario: {
                    id: usuario.id,
                    nome: usuario.nome,
                    email: usuario.email,
                    perfil: usuario.perfil,
                    especialidade: usuario.especialidade
                }
            });

        } catch (error) {
            console.error("Erro geral no login:", error);
            return res.status(500).json({ erro: "Erro interno no servidor durante o login." });
        }
    }
}

/**
 * Express router for handling authentication routes.
 */
const router = Router();
const authController = new AuthController();

// ==========================================
// ROUTE: Login
// ==========================================
router.post("/login", authController.login);

export default router;