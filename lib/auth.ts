import { NextRequest, NextResponse } from "next/server";
import { getUserFromRequest, AuthUser } from "./jwt";

export type { AuthUser };

/**
 * Verify authentication token.
 * 
 * Verifica o token de autenticação presente na requisição e retorna os dados do usuário se for válido.
 * 
 * @param {NextRequest} req - O objeto de requisição do Next.js.
 * @returns {Promise<AuthUser | null>} Uma promessa que resolve com os dados do usuário ou null se o token for inválido.
 */
export async function verifyToken(req: NextRequest): Promise<AuthUser | null> {
  return getUserFromRequest(req);
}

/**
 * Send unauthorized response.
 * 
 * Retorna uma resposta padronizada de erro 401 (Não autorizado) quando o token é inválido ou não fornecido.
 * 
 * @returns {NextResponse} Um objeto NextResponse com status 401.
 */
export function unauthorizedResponse() {
  return NextResponse.json(
    { erro: "Token de autenticação não fornecido ou inválido." },
    { status: 401 }
  );
}
