import { Router, Request, Response } from "express";
import supabase from "../config/supabase";
import { authMiddleware } from "../middlewares/authMiddleware";

/**
 * @openapi
 * /community_post:
 *   get:
 *     tags:
 *       - Community Posts
 *     summary: List all published articles
 *     description: Returns all community articles ordered by most recent.
 *     responses:
 *       200:
 *         description: List of articles
 *
 * /community_post/{id}:
 *   get:
 *     tags:
 *       - Community Posts
 *     summary: Get a single article by ID
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Article data
 *       404:
 *         description: Article not found
 */

class CommunityPostController {
    /**
     * @method listAll
     * @description Returns all community posts ordered by creation date descending.
     */
    public async listAll(req: Request, res: Response): Promise<Response | any> {
        try {
            const { data, error } = await supabase
                .from("community_posts")
                .select("id, title, cover_image_url, category, content_html, is_moderated, created_at, author_id, users(name, avatar_url, role, license_number)")
                .order("created_at", { ascending: false });

            if (error) {
                console.error("Error fetching community posts:", error);
                return res.status(500).json({ erro: "Erro ao buscar publicações." });
            }

            return res.status(200).json({ posts: data });
        } catch (error) {
            console.error("General error listing posts:", error);
            return res.status(500).json({ erro: "Erro interno no servidor." });
        }
    }

    /**
     * @method getById
     * @description Returns a single community post by its ID.
     */
    public async getById(req: Request, res: Response): Promise<Response | any> {
        try {
            const { id } = req.params;

            const { data, error } = await supabase
                .from("community_posts")
                .select("id, title, cover_image_url, category, content_html, is_moderated, created_at, author_id, users(name, avatar_url, role, license_number)")
                .eq("id", id)
                .maybeSingle();

            if (error || !data) {
                return res.status(404).json({ erro: "Publicação não encontrada." });
            }

            return res.status(200).json({ post: data });
        } catch (error) {
            console.error("General error fetching post:", error);
            return res.status(500).json({ erro: "Erro interno no servidor." });
        }
    }

    /**
     * @method create
     * @description Creates a new community post (professionals only).
     */
    public async create(req: any, res: Response): Promise<Response | any> {
        try {
            const authorId = req.user.id;
            const { title, cover_image_url, category, content_html } = req.body;

            if (!title || !content_html) {
                return res.status(400).json({ erro: "Título e conteúdo são obrigatórios." });
            }

            const { data, error } = await supabase
                .from("community_posts")
                .insert([{
                    author_id: authorId,
                    title,
                    cover_image_url: cover_image_url || null,
                    category: category || "Saúde",
                    content_html,
                    is_moderated: false,
                }])
                .select()
                .single();

            if (error) {
                console.error("Error creating community post:", error);
                return res.status(500).json({ erro: "Erro ao criar publicação.", detalhe: error.message });
            }

            return res.status(201).json({ mensagem: "Publicação criada com sucesso!", post: data });
        } catch (error) {
            console.error("General error creating post:", error);
            return res.status(500).json({ erro: "Erro interno no servidor." });
        }
    }

    /**
     * @method update
     * @description Updates an existing post (author only).
     */
    public async update(req: any, res: Response): Promise<Response | any> {
        try {
            const authorId = req.user.id;
            const { id } = req.params;
            const { title, cover_image_url, category, content_html } = req.body;

            const { data: existingPost } = await supabase
                .from("community_posts")
                .select("author_id")
                .eq("id", id)
                .maybeSingle();

            if (!existingPost) {
                return res.status(404).json({ erro: "Publicação não encontrada." });
            }

            if (existingPost.author_id !== authorId) {
                return res.status(403).json({ erro: "Sem permissão para editar esta publicação." });
            }

            const { data, error } = await supabase
                .from("community_posts")
                .update({ title, cover_image_url, category, content_html, updated_at: new Date().toISOString() })
                .eq("id", id)
                .select()
                .single();

            if (error) {
                return res.status(500).json({ erro: "Erro ao atualizar publicação.", detalhe: error.message });
            }

            return res.status(200).json({ mensagem: "Publicação atualizada com sucesso!", post: data });
        } catch (error) {
            console.error("General error updating post:", error);
            return res.status(500).json({ erro: "Erro interno no servidor." });
        }
    }

    /**
     * @method remove
     * @description Deletes a post (author only).
     */
    public async remove(req: any, res: Response): Promise<Response | any> {
        try {
            const authorId = req.user.id;
            const { id } = req.params;

            const { data: existingPost } = await supabase
                .from("community_posts")
                .select("author_id")
                .eq("id", id)
                .maybeSingle();

            if (!existingPost) {
                return res.status(404).json({ erro: "Publicação não encontrada." });
            }

            if (existingPost.author_id !== authorId) {
                return res.status(403).json({ erro: "Sem permissão para remover esta publicação." });
            }

            const { error } = await supabase
                .from("community_posts")
                .delete()
                .eq("id", id);

            if (error) {
                return res.status(500).json({ erro: "Erro ao remover publicação.", detalhe: error.message });
            }

            return res.status(200).json({ mensagem: "Publicação removida com sucesso!" });
        } catch (error) {
            console.error("General error removing post:", error);
            return res.status(500).json({ erro: "Erro interno no servidor." });
        }
    }
}

const router = Router();
const communityPostController = new CommunityPostController();

// Public routes
router.get("/", communityPostController.listAll);
router.get("/:id", communityPostController.getById);

// Protected routes (JWT required)
router.post("/", authMiddleware, communityPostController.create);
router.put("/:id", authMiddleware, communityPostController.update);
router.delete("/:id", authMiddleware, communityPostController.remove);

export default router;
