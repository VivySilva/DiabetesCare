import jwt from "jsonwebtoken";
import { env } from "@/config/env";
import { NextRequest } from "next/server";

const JWT_SECRET = env.JWT_SECRET || process.env.JWT_SECRET;
console.log("JWT_SECRET from env config:", env.JWT_SECRET?.length || 0);
console.log("JWT_SECRET from process.env:", process.env.JWT_SECRET?.length || 0);

/**
 * Interface representing the authenticated user payload.
 */
export interface AuthUser {
  id: string;
  name: string;
  email: string;
  role: string;
}

/**
 * Sign a JWT token.
 * 
 * Gera um token JWT assinado utilizando a chave secreta configurada e os dados do usuário.
 * 
 * @param {AuthUser} payload - Os dados do usuário que serão incluídos no token.
 * @param {string} expiresIn - O tempo de expiração do token (padrão: "1d").
 * @returns {string} O token JWT gerado.
 * @throws {Error} Lança um erro se a chave JWT_SECRET não estiver definida.
 */
export function signToken(payload: AuthUser, expiresIn: string = "1d"): string {
  if (!JWT_SECRET) {
    throw new Error("JWT_SECRET is not defined");
  }
  return jwt.sign(payload, JWT_SECRET as jwt.Secret, { expiresIn } as jwt.SignOptions);
}

/**
 * Verify a JWT token.
 * 
 * Verifica a validade de um token JWT e decodifica seu conteúdo.
 * 
 * @param {string} token - O token JWT a ser verificado.
 * @returns {AuthUser | null} O payload decodificado se o token for válido, ou null caso contrário.
 */
export function verifyToken(token: string): AuthUser | null {
  try {
    if (!JWT_SECRET) {
      console.error("JWT_SECRET is missing during verification");
      return null;
    }
    console.log("Verifying token (preview):", token.substring(0, 10) + "...");
    return jwt.verify(token, JWT_SECRET) as AuthUser;
  } catch (error) {
    console.error("JWT Verification failed for token:", token.substring(0, 10) + "...");
    console.error("Reason:", error instanceof Error ? error.message : error);
    return null;
  }
}

/**
 * Extract token from request headers.
 * 
 * Extrai o token de autenticação (Bearer) do cabeçalho Authorization da requisição.
 * 
 * @param {NextRequest} req - O objeto de requisição do Next.js.
 * @returns {string | null} O token extraído ou null se não for encontrado ou estiver no formato errado.
 */
export function getTokenFromRequest(req: NextRequest): string | null {
  const authHeader = req.headers.get("authorization");
  if (!authHeader) {
    console.warn("Authorization header missing");
    return null;
  }

  const [type, token] = authHeader.split(" ");
  if (type.toLowerCase() !== "bearer" || !token) {
    console.warn("Authorization header format invalid:", type);
    return null;
  }

  return token;
}

/**
 * Get authenticated user from request.
 * 
 * Recupera e valida o usuário autenticado a partir do token presente na requisição.
 * 
 * @param {NextRequest} req - O objeto de requisição do Next.js.
 * @returns {Promise<AuthUser | null>} Uma promessa que resolve com os dados do usuário ou null se a autenticação falhar.
 */
export async function getUserFromRequest(req: NextRequest): Promise<AuthUser | null> {
  const token = getTokenFromRequest(req);
  if (!token) return null;
  return verifyToken(token);
}
