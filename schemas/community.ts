import { z } from "zod";

export const communityPostSchema = z.object({
  title: z.string().min(5, "Título muito curto").max(255, "Título muito longo"),
  content_html: z.string().min(10, "Conteúdo muito curto").max(10000, "Conteúdo muito longo"),
  category: z.string().max(100).optional(),
  cover_image_url: z
    .string()
    .refine(
      (val) => {
        if (!val) return true;
        if (val.startsWith("data:image/")) return true;
        try {
          new URL(val);
          return true;
        } catch {
          return false;
        }
      },
      "URL de imagem inválida ou formato base64 incorreto"
    )
    .optional()
    .nullable(),
});
