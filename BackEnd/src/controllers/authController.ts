import { Request, Response } from 'express';
import { db } from '../database/db';
import * as firebirdDb from '../database/firebird';
import { possuiBiometriaCadastrada } from '../services/biometriaService';
import logger from '../utils/logger';

// Validar senha do funcionário
async function validarSenha(req: Request, res: Response): Promise<any> {
  const { senha } = req.body;

  logger.info('Tentativa de autenticação', { ip: req.ip });

  if (!senha) {
    logger.warn('Autenticação falhou: Senha não fornecida', { ip: req.ip });
    return res.status(400).json({
      sucesso: false,
      mensagem: 'Senha é obrigatória'
    });
  }

  if (senha.length !== 6) {
    logger.warn('Autenticação falhou: Senha com tamanho inválido', { ip: req.ip, tamanho: senha.length });
    return res.status(400).json({
      sucesso: false,
      mensagem: 'Senha deve ter 6 dígitos'
    });
  }

  try {
    // Buscar funcionário no Firebird usando SENHA_SISTEMA
    const funcionario = await firebirdDb.buscarFuncionarioPorSenha(senha);

    if (!funcionario) {
      logger.warn('Autenticação falhou: Senha inválida', { ip: req.ip });
      return res.status(401).json({
        sucesso: false,
        mensagem: 'Senha inválida'
      });
    }

    const possuiBiometria = await possuiBiometriaCadastrada(funcionario.CODIGO);
  const trabalharFacial = await firebirdDb.obterTrabalharFacial();

    logger.info('Autenticação bem-sucedida', {
      funcionario_codigo: funcionario.CODIGO,
      funcionario_nome: funcionario.NOME,
      possui_biometria: possuiBiometria,
      trabalhar_facial: trabalharFacial
    });

    // Armazenar localmente no SQLite para modo offline
    db.run(
      `INSERT OR REPLACE INTO funcionarios (id, codigo_firebird, nome, ativo)
       VALUES (?, ?, ?, 1)`,
      [funcionario.CODIGO, funcionario.CODIGO, funcionario.NOME],
      (err: Error | null) => {
        if (err) {
          logger.error('Erro ao cachear funcionário', { erro: err.message, codigo: funcionario.CODIGO });
        }
      }
    );

    res.json({
      sucesso: true,
      mensagem: 'Autenticação realizada com sucesso',
      funcionario: {
        codigo: funcionario.CODIGO,
        nome: funcionario.NOME,
        usuario_sistema: funcionario.USUARIO_SISTEMA,
        possui_biometria: possuiBiometria,
        trabalhar_facial: trabalharFacial
      }
    });
  } catch (erro: any) {
    logger.error('Erro na autenticação', { erro: erro.message, stack: erro.stack });
    res.status(500).json({
      sucesso: false,
      mensagem: 'Erro ao validar senha',
      erro: erro.message
    });
  }
}

export { validarSenha };
