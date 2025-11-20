import { Request, Response, NextFunction } from 'express';

interface AuthRequest extends Request {
  usuario?: any;
}

// Middleware simples - sem autenticação (não necessária neste projeto)
function autenticar(req: AuthRequest, res: Response, next: NextFunction): any {
  next();
}

export { autenticar, AuthRequest };
