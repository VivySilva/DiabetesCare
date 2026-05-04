import { Router, Response } from "express";
import supabase from "../config/supabase";
import { authMiddleware } from "../middlewares/authMiddleware";

/**
 * @class NotificationController
 * @description Controller for user notifications.
 */
class NotificationController {
    /**
     * @method listAll
     * @description Returns all notifications for the authenticated user.
     */
    public async listAll(req: any, res: Response): Promise<Response | any> {
        try {
            const userId = req.user.id;

            const { data, error } = await supabase
                .from("notifications")
                .select("id, type, title, body, read, scheduled_for, created_at")
                .eq("user_id", userId)
                .order("created_at", { ascending: false });

            if (error) {
                console.error("Error fetching notifications:", error);
                return res.status(500).json({ erro: "Erro ao buscar notificações." });
            }

            return res.status(200).json({ notifications: data });
        } catch (error) {
            console.error("General error listing notifications:", error);
            return res.status(500).json({ erro: "Erro interno no servidor." });
        }
    }

    /**
     * @method markRead
     * @description Marks a single notification as read.
     */
    public async markRead(req: any, res: Response): Promise<Response | any> {
        try {
            const userId = req.user.id;
            const { id } = req.params;

            const { error } = await supabase
                .from("notifications")
                .update({ read: true })
                .eq("id", id)
                .eq("user_id", userId);

            if (error) {
                return res.status(500).json({ erro: "Erro ao marcar notificação como lida." });
            }

            return res.status(200).json({ mensagem: "Notificação marcada como lida." });
        } catch (error) {
            console.error("General error marking notification:", error);
            return res.status(500).json({ erro: "Erro interno no servidor." });
        }
    }

    /**
     * @method markAllRead
     * @description Marks all notifications of the user as read.
     */
    public async markAllRead(req: any, res: Response): Promise<Response | any> {
        try {
            const userId = req.user.id;

            const { error } = await supabase
                .from("notifications")
                .update({ read: true })
                .eq("user_id", userId)
                .eq("read", false);

            if (error) {
                return res.status(500).json({ erro: "Erro ao marcar notificações como lidas." });
            }

            return res.status(200).json({ mensagem: "Todas as notificações foram marcadas como lidas." });
        } catch (error) {
            console.error("General error marking all notifications:", error);
            return res.status(500).json({ erro: "Erro interno no servidor." });
        }
    }
}

const router = Router();
const notificationController = new NotificationController();

router.get("/", authMiddleware, notificationController.listAll);
router.patch("/read_all", authMiddleware, notificationController.markAllRead);
router.patch("/:id/read", authMiddleware, notificationController.markRead);

export default router;
