import { Router, Response } from "express";
import supabase from "../config/supabase";
import { authMiddleware } from "../middlewares/authMiddleware";
import bcrypt from "bcrypt";

const router = Router();

/**
 * @route GET /user/me
 * @desc Get current logged in user details
 */
router.get("/me", authMiddleware, async (req: any, res: Response) => {
    try {
        const userId = req.user.id;

        const { data, error } = await supabase
            .from("users")
            .select("id, name, email, role, avatar_url, age, gender, diabetes_type, phone, license_number")
            .eq("id", userId)
            .single();

        if (error || !data) {
            return res.status(404).json({ erro: "Usuário não encontrado." });
        }

        return res.status(200).json({ user: data });
    } catch (error) {
        console.error("Erro ao buscar perfil:", error);
        return res.status(500).json({ erro: "Erro interno no servidor." });
    }
});

/**
 * @route PUT /user/me
 * @desc Update current user profile
 */
router.put("/me", authMiddleware, async (req: any, res: Response) => {
    try {
        const userId = req.user.id;
        const { name, email, age, gender, diabetes_type, phone, avatar_url, password } = req.body;

        // VERIFICAÇÃO: Se o e-mail mudou, checar se já existe em outro usuário
        if (email) {
            const { data: existingUser } = await supabase
                .from("users")
                .select("id")
                .eq("email", email)
                .neq("id", userId) // que não seja eu mesmo
                .maybeSingle();

            if (existingUser) {
                return res.status(409).json({ erro: "Este e-mail já está sendo usado por outra conta." });
            }
        }

        // Preparar objeto de atualização
        const updates: any = {
            name,
            email,
            age,
            gender,
            diabetes_type,
            phone,
            avatar_url,
            updated_at: new Date().toISOString()
        };

        // Se enviou senha, criptografar
        if (password && password.trim() !== "") {
            const salt = await bcrypt.genSalt(10);
            updates.password = await bcrypt.hash(password, salt);
        }

        const { data, error: updateError } = await supabase
            .from("users")
            .update(updates)
            .eq("id", userId)
            .select()
            .single();

        if (updateError) {
            console.error("SUPABASE UPDATE ERROR:", updateError);
            return res.status(500).json({ 
                erro: "Erro ao atualizar perfil no banco de dados.", 
                detalhe: updateError.message,
                codigo: updateError.code
            });
        }

        return res.status(200).json({ mensagem: "Perfil atualizado!", user: data });
    } catch (error) {
        console.error("Erro ao atualizar perfil:", error);
        return res.status(500).json({ erro: "Erro interno no servidor." });
    }
});

export default router;
