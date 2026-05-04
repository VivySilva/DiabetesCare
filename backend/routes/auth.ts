import { Router, Request, Response } from "express";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import supabase from "../config/supabase";

/**
 * @openapi
 * /auth/login:
 *   post:
 *     tags:
 *       - Authentication
 *     summary: User login
 *     description: Authenticate a user with email and password, returning a JWT token.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - password
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *               password:
 *                 type: string
 *     responses:
 *       200:
 *         description: Login successful, returns JWT token and user data
 *       400:
 *         description: Validation error if email or password are missing
 *       401:
 *         description: Unauthorized error if credentials are invalid
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
     * @route POST /auth/login
     * @param {Request} req - The Express request object.
     * @param {string} req.body.email - The user's email address.
     * @param {string} req.body.password - The user's password.
     * @param {Response} res - The Express response object.
     * @returns {Promise<Response>} 200 - Success message, JWT token, and basic user data.
     * @returns {Promise<Response>} 400 - Validation error if email or password are missing.
     * @returns {Promise<Response>} 401 - Unauthorized error if credentials are invalid.
     * @returns {Promise<Response>} 500 - Internal server error.
     */
    public async login(req: Request, res: Response): Promise<Response | any> {
        try {
            const { email, password } = req.body;

            if (!email || !password) {
                return res.status(400).json({ erro: "Email e senha são obrigatórios." });
            }

            const { data: user, error: searchError } = await supabase
                .from("users")
                .select("id, name, email, password_hash, role, license_number")
                .eq("email", email)
                .maybeSingle();

            if (searchError || !user) {
                return res.status(401).json({ erro: "Credenciais inválidas. Usuário não encontrado." });
            }

            const validPassword = await bcrypt.compare(password, user.password_hash);

            if (!validPassword) {
                return res.status(401).json({ erro: "Credenciais inválidas. Senha incorreta." });
            }

            const jwtSecret = process.env.JWT_SECRET;

            if (!jwtSecret) {
                console.error("ERRO CRÍTICO: JWT_SECRET não definida no arquivo .env");
                return res.status(500).json({ erro: "Erro de configuração de segurança no servidor." });
            }

            const token = jwt.sign(
                {
                    id: user.id,
                    name: user.name,
                    email: user.email,
                    role: user.role
                },
                jwtSecret,
                { expiresIn: "1d" }
            );

            const ipAddress =
                (req.headers["x-forwarded-for"] as string || req.socket.remoteAddress || "").toString();

            const { error: loginError } = await supabase
                .from("login_logs")
                .insert([
                    {
                        user_id: user.id,
                        action: "LOGIN_SUCCESS",
                        ip_address: ipAddress
                    }
                ]);

            if (loginError) {
                console.error("Erro ao salvar login:", loginError.message);
            }

            return res.status(200).json({
                mensagem: "Login realizado com sucesso!",
                token,
                user: {
                    id: user.id,
                    name: user.name,
                    email: user.email,
                    role: user.role,
                    license_number: user.license_number
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
