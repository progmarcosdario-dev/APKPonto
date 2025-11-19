import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

interface AuthRequest extends Request {
  usuario?: any;
}

function autenticar(req: AuthRequest, res: Response, next: NextFunction): any {
  const token = req.headers.authorization?.split(' ')[1];

  if (!token) {
    return res.status(401).json({
      sucesso: false,
      mensagem: 'Token não fornecido'
    });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'sua_chave_secreta');
    req.usuario = decoded;
    next();
  } catch (erro) {
    return res.status(401).json({
      sucesso: false,
      mensagem: 'Token inválido'
    });
  }
}

export { autenticar, AuthRequest };
