import crypto from 'crypto';
import { executarQuery } from '../database/firebird';

interface ResultadoVerificacaoBiometrica {
  verificada: boolean;
  score: number;
  hash: string;
  motivo?: string;
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

  const template = await obterTemplate(funcionarioCodigo);
  const possui = !!template;
  await atualizarStatusBiometria(funcionarioCodigo, possui).catch(() => undefined);
  return possui;
}

function obterTemplate(funcionarioCodigo: number): Promise<string | null> {
  return executarQuery(
    `SELECT HASH_BIOMETRIA FROM BIOMETRIAS_FUNCIONARIO WHERE FUNCIONARIO_CODIGO = ?`,
    [funcionarioCodigo]
  ).then((resultado: any[]) => resultado?.[0]?.HASH_BIOMETRIA ?? null)
   .catch(() => null);
}

function registrarTemplateBiometrico(funcionarioCodigo: number, base64Face: string): Promise<{ hash: string }> {
  const hash = criarHashBiometria(base64Face);
  return executarQuery(
    `UPDATE OR INSERT INTO BIOMETRIAS_FUNCIONARIO
       (FUNCIONARIO_CODIGO, HASH_BIOMETRIA, ATUALIZADO_EM)
     VALUES (?, ?, CURRENT_TIMESTAMP)
     MATCHING (FUNCIONARIO_CODIGO)`,
    [funcionarioCodigo, hash]
  ).then(async () => {
    await atualizarStatusBiometria(funcionarioCodigo, true);
    return { hash };
  });
}

async function verificarBiometria(funcionarioCodigo: number, base64Face: string): Promise<ResultadoVerificacaoBiometrica> {
  const hashAtual = criarHashBiometria(base64Face);
  const template = await obterTemplate(funcionarioCodigo);

  if (!template) {
    await atualizarStatusBiometria(funcionarioCodigo, false).catch(() => undefined);
    return {
      verificada: false,
      score: 0,
      hash: hashAtual,
      motivo: 'BIOMETRIA_NAO_CADASTRADA'
    };
  }

  const verificada = template === hashAtual;
  await atualizarStatusBiometria(funcionarioCodigo, true).catch(() => undefined);

  return {
    verificada,
    score: verificada ? 0.99 : 0.2,
    hash: hashAtual,
    motivo: verificada ? undefined : 'FACE_NAO_CORRESPONDE'
  };
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
