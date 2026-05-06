import crypto from 'crypto';
import { db } from '../database/db';

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

function obterTemplate(funcionarioCodigo: number): Promise<string | null> {
  return new Promise((resolve) => {
    db.get(
      `SELECT hash_biometria FROM biometrias_funcionario WHERE funcionario_codigo = ?`,
      [funcionarioCodigo],
      (erro: Error | null, row: any) => {
        if (erro) {
          resolve(null);
          return;
        }
        resolve(row?.hash_biometria || null);
      }
    );
  });
}

function registrarTemplateBiometrico(funcionarioCodigo: number, base64Face: string): Promise<{ hash: string }> {
  return new Promise((resolve, reject) => {
    const hash = criarHashBiometria(base64Face);

    db.run(
      `INSERT INTO biometrias_funcionario (funcionario_codigo, hash_biometria, atualizado_em)
       VALUES (?, ?, CURRENT_TIMESTAMP)
       ON CONFLICT(funcionario_codigo) DO UPDATE SET
         hash_biometria = excluded.hash_biometria,
         atualizado_em = CURRENT_TIMESTAMP`,
      [funcionarioCodigo, hash],
      (erro: Error | null) => {
        if (erro) {
          reject(erro);
          return;
        }
        resolve({ hash });
      }
    );
  });
}

async function verificarBiometria(funcionarioCodigo: number, base64Face: string): Promise<ResultadoVerificacaoBiometrica> {
  const hashAtual = criarHashBiometria(base64Face);
  const template = await obterTemplate(funcionarioCodigo);

  if (!template) {
    return {
      verificada: false,
      score: 0,
      hash: hashAtual,
      motivo: 'BIOMETRIA_NAO_CADASTRADA'
    };
  }

  const verificada = template === hashAtual;

  return {
    verificada,
    score: verificada ? 0.99 : 0.2,
    hash: hashAtual,
    motivo: verificada ? undefined : 'FACE_NAO_CORRESPONDE'
  };
}

function auditarVerificacaoBiometrica(dados: RegistroBiometria): Promise<void> {
  return new Promise((resolve, reject) => {
    db.run(
      `INSERT INTO ponto_biometria_auditoria
        (funcionario_codigo, hash_biometria, score, origem, metodo)
       VALUES (?, ?, ?, ?, ?)`,
      [dados.funcionario_codigo, dados.hash_biometria, dados.score, dados.origem, dados.metodo],
      (erro: Error | null) => {
        if (erro) {
          reject(erro);
          return;
        }
        resolve();
      }
    );
  });
}

export {
  criarHashBiometria,
  verificarBiometria,
  registrarTemplateBiometrico,
  auditarVerificacaoBiometrica
};

export type { ResultadoVerificacaoBiometrica };
