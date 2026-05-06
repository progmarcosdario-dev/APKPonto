import { Request, Response } from 'express';
import logger from '../utils/logger';
import {
  registrarTemplateBiometrico,
  verificarBiometria
} from '../services/biometriaService';

async function cadastrarBiometria(req: Request, res: Response): Promise<any> {
  const funcionarioRaw = req.body?.funcionario_codigo ?? req.body?.codigoFuncionario;
  const faceBase64 = req.body?.face_base64;

  if (!funcionarioRaw || !faceBase64) {
    return res.status(400).json({
      sucesso: false,
      mensagem: 'funcionario_codigo e face_base64 são obrigatórios'
    });
  }

  const funcionarioCodigo = Number(funcionarioRaw);
  if (!Number.isFinite(funcionarioCodigo)) {
    return res.status(400).json({
      sucesso: false,
      mensagem: 'Código do funcionário inválido'
    });
  }

  try {
    const resultado = await registrarTemplateBiometrico(funcionarioCodigo, faceBase64);
    return res.status(201).json({
      sucesso: true,
      mensagem: 'Biometria cadastrada com sucesso',
      hash: resultado.hash
    });
  } catch (erro: any) {
    logger.error('Erro ao cadastrar biometria', { erro: erro.message });
    return res.status(500).json({
      sucesso: false,
      mensagem: 'Erro ao cadastrar biometria',
      erro: erro.message
    });
  }
}

async function validarBiometria(req: Request, res: Response): Promise<any> {
  const funcionarioRaw = req.body?.funcionario_codigo ?? req.body?.codigoFuncionario;
  const faceBase64 = req.body?.face_base64;

  if (!funcionarioRaw || !faceBase64) {
    return res.status(400).json({
      sucesso: false,
      mensagem: 'funcionario_codigo e face_base64 são obrigatórios'
    });
  }

  const funcionarioCodigo = Number(funcionarioRaw);
  if (!Number.isFinite(funcionarioCodigo)) {
    return res.status(400).json({
      sucesso: false,
      mensagem: 'Código do funcionário inválido'
    });
  }

  try {
    const resultado = await verificarBiometria(funcionarioCodigo, faceBase64);
    return res.json({
      sucesso: true,
      biometria: resultado
    });
  } catch (erro: any) {
    logger.error('Erro ao validar biometria', { erro: erro.message });
    return res.status(500).json({
      sucesso: false,
      mensagem: 'Erro ao validar biometria',
      erro: erro.message
    });
  }
}

export { cadastrarBiometria, validarBiometria };
