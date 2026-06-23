import { z } from "zod";

export const forumTopicSchema = z.object({
  title: z.string().min(5, "Título muito curto").max(255, "Título muito longo"),
  content: z.string().min(10, "Conteúdo muito curto").max(5000, "Conteúdo muito longo"),
  category: z.string().max(100).optional(),
  is_anonymous: z.boolean().optional(),
});

export const forumReplySchema = z.object({
  content: z.string().min(1, "A resposta não pode estar vazia").max(5000, "Resposta muito longa"),
  is_anonymous: z.boolean().optional(),
});
