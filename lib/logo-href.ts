/**
 * Retorna a rota correta para a logo do DiabetesCare.
 *
 * - Se o usuário está logado → vai para o dashboard correspondente ao role
 *   (paciente vai para /patient, profissional vai para /professional)
 * - Se não está logado → vai para a home pública (/)
 */
export function getSmartHomeHref(): string {
  if (typeof window === "undefined") return "/";

  const token = localStorage.getItem("token");
  if (!token) return "/";

  const userStr = localStorage.getItem("user");
  if (userStr) {
    try {
      const user = JSON.parse(userStr);
      if (user.role === "PROFESSIONAL") return "/professional";
    } catch {
      // Ignora erro de parsing – fallback para /patient
    }
  }

  return "/patient";
}
