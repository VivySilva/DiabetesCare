import { Router, Request, Response } from "express";
import bcrypt from "bcrypt";
import supabase from "../config/supabase";

/**
 * @openapi
 * /register:
 *   post:
 *     tags:
 *       - Cadastro
 *     summary: New user registration
 *     description: Register a new user (patient or healthcare professional).
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *               - email
 *               - password
 *               - confirm_password
 *               - role
 *             properties:
 *               name:
 *                 type: string
 *               email:
 *                 type: string
 *                 format: email
 *               password:
 *                 type: string
 *               confirm_password:
 *                 type: string
 *               role:
 *                 type: string
 *                 enum: [profissional, paciente]
 *               license_number:
 *                 type: string
 *                 description: Required for professionals (CRM, CRN, etc.)
 *     responses:
 *       201:
 *         description: User registered successfully
 *       400:
 *         description: Validation error
 *       409:
 *         description: Email already registered
 */

/**
 * @class CadastroController
 * @description Controller class responsible for handling user registration operations.
 */

class RegisterController {
    /**
     * @method register
     * @description Route to register a new user.
     * Validates input data, checks for email duplication, and stores the user data with a securely hashed password.
     * 
     * @route POST /register
     * @param {Request} req - The Express request object.
     * @param {string} req.body.name - The user's full name.
     * @param {string} req.body.email - The user's email address.
     * @param {string} req.body.password - The desired password.
     * @param {string} req.body.confirm_password - The password confirmation.
     * @param {string} req.body.role - The user type ('profissional' or 'paciente').
     * @param {string} [req.body.license_number] - The professional council registration (mandatory for professionals, e.g., CRM, CRN).
     * @param {Response} res - The Express response object.
     * @returns {Promise<Response>} 201 - Success message and the basic data of the newly registered user.
     * @returns {Promise<Response>} 400 - Validation error or conflict if the email is already registered.
     * @returns {Promise<Response>} 500 - Internal server error during the registration process in the database.
     */
    public async register(req: Request, res: Response): Promise<Response | any> {
        try {
            const { name, email, password, confirmPassword, role, licenseNumber, phone } = req.body;

            if (!name || !email || !password || !confirmPassword) {
                return res.status(400).json({ erro: "Os campos (name, email, password, confirmPassword) são obrigatórios." });
            }

            const userRole = role === 'professional' ? 'PROFESSIONAL' : 'PATIENT';

            if (userRole === 'PROFESSIONAL' && !licenseNumber) {
                return res.status(400).json({ erro: "Profissionais de saúde devem informar o número de registro (CRM ou CRN)." });
            }

            if (password !== confirmPassword) {
                return res.status(400).json({ erro: "As senhas não coincidem." });
            }

            const { data: existingUser, error: searchError } = await supabase
                .from("users")
                .select("id")
                .eq("email", email)
                .maybeSingle();

            if (existingUser) {
                return res.status(400).json({ erro: "Este email já está cadastrado." });
            }

            const salt = await bcrypt.genSalt(10);
            const passwordHash = await bcrypt.hash(password, salt);

            const { data: newUser, error: insertError } = await supabase
                .from("users")
                .insert([{
                    name,
                    email,
                    password_hash: passwordHash,
                    role: userRole,
                    license_number: userRole === 'PROFESSIONAL' ? licenseNumber : null,
                    phone: phone || null
                }])
                .select("id, name, email, role, license_number, phone")
                .single();

            if (insertError) {
                console.error("Error inserting into Supabase:", insertError);
                return res.status(500).json({ erro: "Erro interno ao cadastrar usuário no banco de dados.", detalhe: insertError.message });
            }

            return res.status(201).json({ mensagem: "Usuário cadastrado com sucesso!", user: newUser });

        } catch (error) {
            console.error("General registration error:", error);
            return res.status(500).json({ error: "Internal server error during registration." });
        }
    }
}

/**
 * Express router for handling user registration routes.
 */
const router = Router();
const registerController = new RegisterController();

// ==========================================
// ROUTE: Register User
// ==========================================
router.post("/", registerController.register);

export default router;
