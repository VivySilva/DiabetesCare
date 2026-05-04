import { Router, Request, Response } from "express";
import supabase from "../config/supabase";
import { authMiddleware } from "../middlewares/authMiddleware";

/**
 * @class ForumController
 * @description Controller for forum topics, replies and likes.
 * Both patients and professionals can create topics and reply.
 */
class ForumController {
    /**
     * @method listTopics
     * @description Returns all forum topics ordered by most recent.
     */
    public async listTopics(req: Request, res: Response): Promise<Response | any> {
        try {
            const { data, error } = await supabase
                .from("forum_topics")
                .select("id, title, preview, is_moderated, likes_count, created_at, author_id, users(name, avatar_url, role)")
                .order("created_at", { ascending: false });

            if (error) {
                console.error("Error fetching forum topics:", error);
                return res.status(500).json({ erro: "Erro ao buscar tópicos do fórum." });
            }

            // Get reply counts for each topic
            const topicIds = (data || []).map((t: any) => t.id);
            const { data: replyCounts } = await supabase
                .from("forum_replies")
                .select("topic_id")
                .in("topic_id", topicIds);

            const countMap: Record<string, number> = {};
            (replyCounts || []).forEach((r: any) => {
                countMap[r.topic_id] = (countMap[r.topic_id] || 0) + 1;
            });

            const topicsWithCounts = (data || []).map((topic: any) => ({
                ...topic,
                replies_count: countMap[topic.id] || 0,
            }));

            return res.status(200).json({ topics: topicsWithCounts });
        } catch (error) {
            console.error("General error listing topics:", error);
            return res.status(500).json({ erro: "Erro interno no servidor." });
        }
    }

    /**
     * @method getTopicById
     * @description Returns a single topic with all its replies.
     */
    public async getTopicById(req: Request, res: Response): Promise<Response | any> {
        try {
            const { id } = req.params;

            const { data: topic, error: topicError } = await supabase
                .from("forum_topics")
                .select("id, title, preview, is_moderated, likes_count, created_at, author_id, users(name, avatar_url, role)")
                .eq("id", id)
                .maybeSingle();

            if (topicError || !topic) {
                return res.status(404).json({ erro: "Tópico não encontrado." });
            }

            const { data: replies, error: repliesError } = await supabase
                .from("forum_replies")
                .select("id, content, created_at, author_id, users(name, avatar_url, role)")
                .eq("topic_id", id)
                .order("created_at", { ascending: true });

            if (repliesError) {
                console.error("Error fetching replies:", repliesError);
            }

            return res.status(200).json({ topic, replies: replies || [] });
        } catch (error) {
            console.error("General error fetching topic:", error);
            return res.status(500).json({ erro: "Erro interno no servidor." });
        }
    }

    /**
     * @method createTopic
     * @description Creates a new forum topic (any authenticated user).
     */
    public async createTopic(req: any, res: Response): Promise<Response | any> {
        try {
            const authorId = req.user.id;
            const { title, preview } = req.body;

            if (!title) {
                return res.status(400).json({ erro: "O título do tópico é obrigatório." });
            }

            const { data, error } = await supabase
                .from("forum_topics")
                .insert([{
                    author_id: authorId,
                    title,
                    preview: preview || title.substring(0, 120),
                    is_moderated: false,
                    likes_count: 0,
                }])
                .select()
                .single();

            if (error) {
                console.error("Error creating forum topic:", error);
                return res.status(500).json({ erro: "Erro ao criar tópico.", detalhe: error.message });
            }

            return res.status(201).json({ mensagem: "Tópico criado com sucesso!", topic: data });
        } catch (error) {
            console.error("General error creating topic:", error);
            return res.status(500).json({ erro: "Erro interno no servidor." });
        }
    }

    /**
     * @method replyToTopic
     * @description Adds a reply to a forum topic.
     */
    public async replyToTopic(req: any, res: Response): Promise<Response | any> {
        try {
            const authorId = req.user.id;
            const { id: topicId } = req.params;
            const { content } = req.body;

            if (!content?.trim()) {
                return res.status(400).json({ erro: "O conteúdo da resposta é obrigatório." });
            }

            const { data: topic } = await supabase
                .from("forum_topics")
                .select("id, author_id, title")
                .eq("id", topicId)
                .single();

            if (!topic) {
                return res.status(404).json({ erro: "Tópico não encontrado." });
            }

            const { data, error } = await supabase
                .from("forum_replies")
                .insert([{ topic_id: topicId, author_id: authorId, content }])
                .select("id, content, created_at, author_id, users(name, avatar_url, role)")
                .single();

            if (error) {
                console.error("Error creating reply:", error);
                return res.status(500).json({ erro: "Erro ao enviar resposta.", detalhe: error.message });
            }

            // GATILHO: Notificar o autor do tópico (se não for a mesma pessoa)
            if (topic.author_id !== authorId) {
                await supabase
                    .from("notifications")
                    .insert([{
                        user_id: topic.author_id,
                        type: "PERSONALIZED_TIP", // Poderia ser um novo tipo, mas esse serve por enquanto
                        title: "Nova resposta no fórum!",
                        body: `${req.user.name} respondeu ao seu tópico: "${topic.title}"`,
                        read: false
                    }]);
            }

            return res.status(201).json({ mensagem: "Resposta enviada com sucesso!", reply: data });
        } catch (error) {
            console.error("General error replying:", error);
            return res.status(500).json({ erro: "Erro interno no servidor." });
        }
    }

    /**
     * @method likeTopic
     * @description Likes a forum topic (toggle on).
     */
    public async likeTopic(req: any, res: Response): Promise<Response | any> {
        try {
            const userId = req.user.id;
            const { id: topicId } = req.params;

            // 1. Verifica se já existe a curtida
            const { data: existing, error: fetchError } = await supabase
                .from("forum_likes")
                .select("id")
                .eq("topic_id", topicId)
                .eq("user_id", userId)
                .maybeSingle();

            // Pega o contador atual
            const { data: topic } = await supabase.from("forum_topics").select("likes_count").eq("id", topicId).single();
            let currentLikes = topic?.likes_count || 0;

            if (existing) {
                // SE JÁ EXISTE: Remove a curtida (Unlike)
                await supabase.from("forum_likes").delete().eq("id", existing.id);
                const newCount = Math.max(0, currentLikes - 1);
                await supabase.from("forum_topics").update({ likes_count: newCount }).eq("id", topicId);
                return res.status(200).json({ mensagem: "Curtida removida!", liked: false, likes_count: newCount });
            } else {
                // SE NÃO EXISTE: Adiciona a curtida (Like)
                await supabase.from("forum_likes").insert([{ topic_id: topicId, user_id: userId }]);
                const newCount = currentLikes + 1;
                await supabase.from("forum_topics").update({ likes_count: newCount }).eq("id", topicId);
                return res.status(200).json({ mensagem: "Tópico curtido!", liked: true, likes_count: newCount });
            }
        } catch (error) {
            console.error("General error in toggle like:", error);
            return res.status(500).json({ erro: "Erro ao processar curtida." });
        }
    }

    /**
     * @method unlikeTopic
     * @description Removes a like from a forum topic.
     */
    public async unlikeTopic(req: any, res: Response): Promise<Response | any> {
        try {
            const userId = req.user.id;
            const { id: topicId } = req.params;

            const { error } = await supabase
                .from("forum_likes")
                .delete()
                .eq("topic_id", topicId)
                .eq("user_id", userId);

            if (error) {
                return res.status(500).json({ erro: "Erro ao remover curtida." });
            }

            // Get current count
            const { data: topic } = await supabase.from("forum_topics").select("likes_count").eq("id", topicId).single();
            const newCount = Math.max(0, (topic?.likes_count || 0) - 1);

            // Update likes_count manually
            await supabase.from("forum_topics").update({ likes_count: newCount }).eq("id", topicId);

            return res.status(200).json({ mensagem: "Curtida removida!" });
        } catch (error) {
            console.error("General error unliking:", error);
            return res.status(500).json({ erro: "Erro interno no servidor." });
        }
    }
}

const router = Router();
const forumController = new ForumController();

// Public
router.get("/", forumController.listTopics);
router.get("/:id", forumController.getTopicById);

// Protected (any authenticated user — patient or professional)
router.post("/", authMiddleware, forumController.createTopic);
router.post("/:id/reply", authMiddleware, forumController.replyToTopic);
router.post("/:id/like", authMiddleware, forumController.likeTopic);
router.delete("/:id/like", authMiddleware, forumController.unlikeTopic);

export default router;
