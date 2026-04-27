import { Router, Request, Response } from "express";
import bcrypt from "bcrypt";
import supabase from "../config/supabase";

/**
 * @class CadastroController
 * @description Controller class responsible for handling user registration operations.
 */

class CadastroController {
    /**
     * @method register
     * @description Route to register a new user.
     * Validates input data, checks for email duplication, and stores the user data with a securely hashed password.
     * 
     * @route POST /cadastro
     * @param {Request} req - The Express request object.
     * @param {string} req.body.nome - The user's full name.
     * @param {string} req.body.email - The user's email address.
     * @param {string} req.body.senha - The desired password.
     * @param {string} req.body.confirmarSenha - The password confirmation.
     * @param {string} req.body.tipo - The user type ('profissional' or 'paciente').
     * @param {string} [req.body.registro_conselho] - The professional council registration (mandatory for professionals, e.g., CRM, CRN).
     * @param {Response} res - The Express response object.
     * @returns {Promise<Response>} 201 - Success message and the basic data of the newly registered user.
     * @returns {Promise<Response>} 400 - Validation error or conflict if the email is already registered.
     * @returns {Promise<Response>} 500 - Internal server error during the registration process in the database.
     */
    public async register(req: Request, res: Response): Promise<Response | any> {
        try {
            const { nome, email, senha, confirmarSenha, tipo, registro_conselho } = req.body;

            if (!nome || !email || !senha || !confirmarSenha) {
                return res.status(400).json({ erro: "Os campos (nome, email, senha, confirmarSenha) são obrigatórios." });
            }

            const tipoUsuario = tipo === 'profissional' ? 'PROFISSIONAL' : 'PACIENTE';

            if (tipoUsuario === 'PROFISSIONAL' && !registro_conselho) {
                return res.status(400).json({ erro: "Profissionais de saúde devem informar o registro do conselho (CRM ou CRN)." });
            }

            if (senha !== confirmarSenha) {
                return res.status(400).json({ erro: "As senhas não coincidem." });
            }

            const { data: usuarioExistente, error: errorBusca } = await supabase
                .from("usuario")
                .select("id")
                .eq("email", email)
                .maybeSingle();

            if (usuarioExistente) {
                return res.status(400).json({ erro: "Este email já está cadastrado." });
            }

            const salt = await bcrypt.genSalt(10);
            const senhaHash = await bcrypt.hash(senha, salt);

            const { data: novoUsuario, error: erroInsert } = await supabase
                .from("usuario")
                .insert([{
                    nome,
                    email,
                    senha_criptografada: senhaHash,
                    perfil: tipoUsuario,
                    especialidade: tipoUsuario === 'PROFISSIONAL' ? registro_conselho : null
                }])
                .select("id, nome, email, perfil, especialidade")
                .single();

            if (erroInsert) {
                console.error("Erro ao inserir no Supabase:", erroInsert);
                return res.status(500).json({ erro: "Erro interno ao cadastrar usuário no banco de dados.", detalhe: erroInsert.message });
            }

            return res.status(201).json({ mensagem: "Usuário cadastrado com sucesso!", usuario: novoUsuario });

        } catch (error) {
            console.error("Erro geral no cadastro:", error);
            return res.status(500).json({ erro: "Erro interno no servidor durante o cadastro." });
        }
    }
}

/**
 * Express router for handling user registration routes.
 */
const router = Router();
const cadastroController = new CadastroController();

// ==========================================
// ROUTE: Register User
// ==========================================
router.post("/", cadastroController.register);
router.post("/", cadastroController.register);

export default router;
