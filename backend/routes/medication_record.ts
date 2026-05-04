import { Router, Response } from "express";
import supabase from "../config/supabase";
import { authMiddleware } from "../middlewares/authMiddleware";

/**
 * @openapi
 * /medications:
 *   post:
 *     tags:
 *       - Medications
 *     summary: Record medication
 *     description: Creates a new medication record for the authenticated user.
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - category
 *               - medication_name
 *               - time
 *               - notify
 *             properties:
 *               category:
 *                 type: string
 *               medication_name:
 *                 type: string
 *               time:
 *                 type: string
 *                 format: time
 *               notify:
 *                 type: boolean
 *     responses:
 *       201:
 *         description: Medication record created successfully
 *       400:
 *         description: Validation error
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Internal server error
 */

class MedicationsController {
    public async createRecord(req: any, res: Response): Promise<Response | any> {
        try {
            const userId = req.user.id;
            const { category, medication_name, time, notify } = req.body;

            if (!category || !medication_name || !time || notify === undefined) {
                return res.status(400).json({ erro: "Categoria, nome do medicamento, horário e notificação são obrigatórios." });
            }

            const { data, error } = await supabase
                .from("medication_records")
                .insert([{
                    user_id: userId,
                    category,
                    medication_name,
                    time,
                    notify
                }])
                .select()
                .single();

            if (error) {
                console.error("Error inserting medication record:", error);
                return res.status(500).json({ erro: "Erro interno ao criar registro de medicamento.", detail: error.message });
            }

            // GATILHO: Se notify for true, criar uma notificação de lembrete
            if (notify) {
                await supabase
                    .from("notifications")
                    .insert([{
                        user_id: userId,
                        type: "MEDICATION_REMINDER",
                        title: "Lembrete de Medicamento",
                        body: `Está quase na hora de tomar seu ${medication_name} (${time}).`,
                        read: false
                    }]);
            }

            return res.status(201).json({ mensagem: "Registro criado com sucesso!", record: data });

        } catch (error) {
            console.error("General error in medication registration:", error);
            return res.status(500).json({ erro: "Internal server error." });
        }
    }
}

const router = Router();
const medicationsController = new MedicationsController();

router.post("/", authMiddleware, medicationsController.createRecord);

export default router;
