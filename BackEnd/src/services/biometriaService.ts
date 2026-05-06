import crypto from 'crypto';
import { executarQuery } from '../database/firebird';
import {
  extrairDescriptor,
  serializarDescriptor,
  deserializarDescriptor,
  calcularSimilaridade
} from './faceService';

interface ResultadoVerificacaoBiometrica {
  verificada: boolean;
  score: number;
  hash: string;
  motivo?: string;
}

class BiometriaError extends Error {
  code: string;

  constructor(code: string, message: string) {
    super(message);
    this.code = code;
    this.name = 'BiometriaError';
  }
}

interface RegistroBiometria {
  funcionario_codigo: number;
  hash_biometria: string;
  score: number;
  origem: string;
  metodo: string;
}

function normalizarBase64(base64: string): string {
  return (base64 || '').replace(/^data:image\/[a-zA-Z]+;base64,/, '').trim();
}

function criarHashBiometria(base64: string): string {
  const normalizada = normalizarBase64(base64);
  return crypto.createHash('sha256').update(normalizada).digest('hex');
}

function atualizarStatusBiometria(funcionarioCodigo: number, possuiBiometria: boolean): Promise<void> {
  return executarQuery(
    `UPDATE OR INSERT INTO BIOMETRIA_STATUS_FUNCIONARIO
       (FUNCIONARIO_CODIGO, POSSUI_BIOMETRIA, ATUALIZADO_EM)
     VALUES (?, ?, CURRENT_TIMESTAMP)
     MATCHING (FUNCIONARIO_CODIGO)`,
    [funcionarioCodigo, possuiBiometria ? 1 : 0]
  ).then(() => undefined);
}

async function possuiBiometriaCadastrada(funcionarioCodigo: number): Promise<boolean> {
  const status = await executarQuery(
    `SELECT POSSUI_BIOMETRIA FROM BIOMETRIA_STATUS_FUNCIONARIO WHERE FUNCIONARIO_CODIGO = ?`,
    [funcionarioCodigo]
  ).then((resultado: any[]) => resultado?.[0]?.POSSUI_BIOMETRIA)
   .catch(() => undefined);

  if (status !== undefined && status !== null) {
    return Number(status) === 1;
  }

  const row = await obterRegistroBiometria(funcionarioCodigo);
  const possui = !!row;
  await atualizarStatusBiometria(funcionarioCodigo, possui).catch(() => undefined);
  return possui;
}

function obterRegistroBiometria(funcionarioCodigo: number): Promise<{ HASH_BIOMETRIA: string; FACE_DESCRIPTOR: string | null } | null> {
  return executarQuery(
    `SELECT HASH_BIOMETRIA, FACE_DESCRIPTOR FROM BIOMETRIAS_FUNCIONARIO WHERE FUNCIONARIO_CODIGO = ?`,
    [funcionarioCodigo]
  ).then((resultado: any[]) => resultado?.[0] ?? null)
   .catch(() => null);
}

async function registrarTemplateBiometrico(funcionarioCodigo: number, base64Face: string): Promise<{ hash: string }> {
  const hash = criarHashBiometria(base64Face);

  // Cadastro só é válido quando conseguimos extrair descriptor facial.
  const descriptor = await extrairDescriptor(base64Face).catch((e) => {
    console.error('[face-api] Erro ao extrair descriptor no cadastro:', e);
    throw new BiometriaError('ERRO_EXTRACAO_DESCRIPTOR', 'Erro ao processar rosto no cadastro');
  });

  if (!descriptor) {
    console.warn(`[face-api] Nenhum rosto detectado na imagem de cadastro do funcionário ${funcionarioCodigo}`);
    throw new BiometriaError('ROSTO_NAO_DETECTADO_CADASTRO', 'Nenhum rosto detectado. Centralize o rosto e tente novamente.');
  }

  const descriptorJson = serializarDescriptor(descriptor);
  console.log(`[face-api] Descriptor extraído para funcionário ${funcionarioCodigo} ✅`);

  await executarQuery(
    `UPDATE OR INSERT INTO BIOMETRIAS_FUNCIONARIO
       (FUNCIONARIO_CODIGO, HASH_BIOMETRIA, FACE_DESCRIPTOR, ATUALIZADO_EM)
     VALUES (?, ?, ?, CURRENT_TIMESTAMP)
     MATCHING (FUNCIONARIO_CODIGO)`,
    [funcionarioCodigo, hash, descriptorJson]
  );

  await atualizarStatusBiometria(funcionarioCodigo, true);
  return { hash };
}

async function verificarBiometria(funcionarioCodigo: number, base64Face: string): Promise<ResultadoVerificacaoBiometrica> {
  const hashAtual = criarHashBiometria(base64Face);
  const registro = await obterRegistroBiometria(funcionarioCodigo);

  if (!registro) {
    await atualizarStatusBiometria(funcionarioCodigo, false).catch(() => undefined);
    return { verificada: false, score: 0, hash: hashAtual, motivo: 'BIOMETRIA_NAO_CADASTRADA' };
  }

  // Registros antigos podem ter apenas hash (sem descriptor), e nesses casos a validação por hash gera falso negativo.
  if (!registro.FACE_DESCRIPTOR) {
    await atualizarStatusBiometria(funcionarioCodigo, false).catch(() => undefined);
    return { verificada: false, score: 0, hash: hashAtual, motivo: 'BIOMETRIA_DESATUALIZADA' };
  }

  const descriptorAtual = await extrairDescriptor(base64Face).catch((e) => {
    console.error('[face-api] Erro ao extrair descriptor na validação:', e);
    throw new BiometriaError('ERRO_EXTRACAO_DESCRIPTOR', 'Erro ao processar rosto na validação');
  });

  if (!descriptorAtual) {
    return { verificada: false, score: 0, hash: hashAtual, motivo: 'ROSTO_NAO_DETECTADO' };
  }

  const descritorSalvoRaw = typeof registro.FACE_DESCRIPTOR === 'string'
    ? registro.FACE_DESCRIPTOR
    : await lerBlob(registro.FACE_DESCRIPTOR);

  const descritorSalvo = deserializarDescriptor(descritorSalvoRaw);

  const { verificada, score } = calcularSimilaridade(descriptorAtual, descritorSalvo);
  await atualizarStatusBiometria(funcionarioCodigo, true).catch(() => undefined);

  console.log(`[face-api] Funcionário ${funcionarioCodigo} - score: ${score}, verificada: ${verificada}`);
  return { verificada, score, hash: hashAtual, motivo: verificada ? undefined : 'FACE_NAO_CORRESPONDE' };
}

/** Lê blob do Firebird (pode vir como objeto Buffer/Stream) */
async function lerBlob(blob: any): Promise<string> {
  if (typeof blob === 'string') return blob;
  if (Buffer.isBuffer(blob)) return blob.toString('utf8');
  // node-firebird retorna blobs como função de callback
  if (typeof blob === 'function') {
    return new Promise((resolve, reject) => {
      blob((err: Error, _name: string, e: any) => {
        if (err) return reject(err);
        const chunks: Buffer[] = [];
        e.on('data', (chunk: Buffer) => chunks.push(chunk));
        e.on('end', () => resolve(Buffer.concat(chunks).toString('utf8')));
        e.on('error', reject);
      });
    });
  }
  return String(blob);
}

function auditarVerificacaoBiometrica(dados: RegistroBiometria): Promise<void> {
  return executarQuery(
    `INSERT INTO PONTO_BIOMETRIA_AUDITORIA
       (FUNCIONARIO_CODIGO, HASH_BIOMETRIA, SCORE, ORIGEM, METODO)
     VALUES (?, ?, ?, ?, ?)`,
    [dados.funcionario_codigo, dados.hash_biometria, dados.score, dados.origem, dados.metodo]
  ).then(() => undefined);
}

export {
  criarHashBiometria,
  verificarBiometria,
  possuiBiometriaCadastrada,
  registrarTemplateBiometrico,
  auditarVerificacaoBiometrica
};

export type { ResultadoVerificacaoBiometrica };
