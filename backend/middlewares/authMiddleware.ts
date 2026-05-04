import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";

interface AuthRequest extends Request {
  user?: any;
}

export const authMiddleware = (req: AuthRequest, res: Response, next: NextFunction): void | Response => {
  const authHeader = req.headers.authorization;

  if (!authHeader) {
    return res.status(401).json({ erro: "Token de autenticação não fornecido." });
  }

  const [, token] = authHeader.split(" ");

  if (!token) {
    return res.status(401).json({ erro: "Token mal formatado." });
  }

  try {
    const jwtSecret = process.env.JWT_SECRET;
    
    if (!jwtSecret) {
      console.error("ERRO CRÍTICO: JWT_SECRET não definida no arquivo .env");
      return res.status(500).json({ erro: "Erro de configuração de segurança no servidor." });
    }

    const decoded = jwt.verify(token, jwtSecret);
    req.user = decoded;
    next();
  } catch (error) {
    return res.status(401).json({ erro: "Token inválido ou expirado." });
  }
};
