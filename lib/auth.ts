import { NextRequest, NextResponse } from "next/server";
import { getUserFromRequest, AuthUser } from "./jwt";

export type { AuthUser };

export async function verifyToken(req: NextRequest): Promise<AuthUser | null> {
  return getUserFromRequest(req);
}

export function unauthorizedResponse() {
  return NextResponse.json(
    { erro: "Token de autenticação não fornecido ou inválido." },
    { status: 401 }
  );
}
