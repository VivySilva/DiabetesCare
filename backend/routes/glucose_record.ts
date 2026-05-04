import { Router, Response } from "express";
import supabase from "../config/supabase";
import { authMiddleware } from "../middlewares/authMiddleware";

/**
 * @openapi
 * /glucose:
 *   post:
 *     tags:
 *       - Glicose
 *     summary: Record blood glicose
 *     description: Creates a new glicose record for the authenticated user.
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - glicose_value
 *               - period
 *               - took_insulin
 *             properties:
 *               glucose_value:
 *                 type: integer
 *               period:
 *                 type: string
 *               took_insulin:
 *                 type: boolean
 *               insulin_type:
 *                 type: string
 *               insulin_amount:
 *                 type: integer
 *               injection_site:
 *                 type: string
 *               symptoms:
 *                 type: array
 *                 items:
 *                   type: string
 *               symptom_intensity:
 *                 type: integer
 *     responses:
 *       201:
 *         description: Glucose record created successfully
 *       400:
 *         description: Validation error
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Internal server error
 */

class GlucoseController {
    public async createRecord(req: any, res: Response): Promise<Response | any> {
        try {
            const userId = req.user.id;
            const {
                glucose_value,
                period,
                took_insulin,
                insulin_type,
                insulin_amount,
                injection_site,
                symptoms,
                symptom_intensity
            } = req.body;

            if (glucose_value === undefined || !period || took_insulin === undefined) {
                return res.status(400).json({ erro: "O valor da glicose, período e uso de insulina são obrigatórios." });
            }

            const { data, error } = await supabase
                .from("glucose_records")
                .insert([{
                    user_id: userId,
                    glucose_value,
                    period,
                    took_insulin,
                    insulin_type: took_insulin ? insulin_type : null,
                    insulin_amount: took_insulin ? insulin_amount : null,
                    injection_site: took_insulin ? injection_site : null,
                    symptoms: symptoms || [],
                    symptom_intensity: symptom_intensity || null
                }])
                .select()
                .single();

            if (error) {
                console.error("Error inserting glucose record:", error);
                return res.status(500).json({ erro: "Erro interno ao criar registro de glicose.", detail: error.message });
            }

            return res.status(201).json({ mensagem: "Registro criado com sucesso!", record: data });

        } catch (error) {
            console.error("General error in glucose registration:", error);
        }
    }

    public async listRecords(req: any, res: Response): Promise<Response | any> {
        try {
            const userId = req.user.id;
            const { data, error } = await supabase
                .from("glucose_records")
                .select("*")
                .eq("user_id", userId)
                .order("created_at", { ascending: false });

            if (error) {
                console.error("Error fetching glucose records:", error);
                return res.status(500).json({ erro: "Erro ao buscar registros de glicose." });
            }

            return res.status(200).json({ records: data });
        } catch (error) {
            console.error("General error in glucose listing:", error);
            return res.status(500).json({ erro: "Internal server error." });
        }
    }
}

const router = Router();
const glucoseController = new GlucoseController();

router.post("/", authMiddleware, glucoseController.createRecord);
router.get("/", authMiddleware, glucoseController.listRecords);

export default router;
