import { Request, Response } from 'express';
import { db } from '../database/db';
import * as firebirdDb from '../database/firebird';

// Validar senha do funcionário
async function validarSenha(req: Request, res: Response): Promise<any> {
  const { senha } = req.body;

  if (!senha) {
    return res.status(400).json({
      sucesso: false,
      mensagem: 'Senha é obrigatória'
    });
  }

  if (senha.length !== 6) {
    return res.status(400).json({
      sucesso: false,
      mensagem: 'Senha deve ter 6 dígitos'
    });
  }

  try {
    // Buscar funcionário no Firebird usando SENHA_SISTEMA
    const funcionario = await firebirdDb.buscarFuncionarioPorSenha(senha);

    if (!funcionario) {
      return res.status(401).json({
        sucesso: false,
        mensagem: 'Senha inválida'
      });
    }

    // Armazenar localmente no SQLite para modo offline
    db.run(
      `INSERT OR REPLACE INTO funcionarios (id, codigo_firebird, nome, ativo)
       VALUES (?, ?, ?, 1)`,
      [funcionario.CODIGO, funcionario.CODIGO, funcionario.NOME],
      (err: Error | null) => {
        if (err) {
          console.error('Erro ao cachear funcionário:', err);
        }
      }
    );

    res.json({
      sucesso: true,
      mensagem: 'Autenticação realizada com sucesso',
      funcionario: {
        codigo: funcionario.CODIGO,
        nome: funcionario.NOME,
        usuario_sistema: funcionario.USUARIO_SISTEMA
      }
    });
  } catch (erro: any) {
    console.error('Erro na autenticação:', erro);
    res.status(500).json({
      sucesso: false,
      mensagem: 'Erro ao validar senha',
      erro: erro.message
    });
  }
}

export { validarSenha };
