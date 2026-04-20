import { redirect } from "next/navigation";

/**
 * Rota raiz (/).
 * Durante o desenvolvimento, redireciona direto para a home do paciente.
 * TODO: quando auth estiver pronto, verificar token e redirecionar
 * para /paciente ou /especialista conforme o perfil do usuário.
 */
export default function RootPage() {
  redirect("/paciente");
}
