import { db } from '../database/db';
import * as firebirdDb from '../database/firebird';

interface Registro {
  id: number;
  funcionario_codigo: number;
  tipo_marcacao: number;
  data: string;
  hora: string;
  observacao?: string;
}

interface SincronizacaoResponse {
  sucesso: boolean;
  sincronizados: number;
  total: number;
  erros?: string[];
}

interface StatusResponse {
  pendentes: number;
  registros: Registro[];
}

// Sincronizar registros pendentes com Firebird
async function sincronizarPendentes(): Promise<SincronizacaoResponse> {
  return new Promise(async (resolve, reject) => {
    try {
      // Buscar registros não sincronizados
      db.all(
        `SELECT * FROM ponto_funcionario WHERE sincronizado = 0 ORDER BY data_criacao ASC`,
        async (err: Error | null, registros: Registro[] | undefined) => {
          if (err) {
            console.error('Erro ao buscar registros pendentes:', err);
            return reject(err);
          }

          if (!registros || registros.length === 0) {
            console.log('Nenhum registro para sincronizar');
            return resolve({ sucesso: true, sincronizados: 0, total: 0 });
          }

          let sincronizados = 0;
          let erros: string[] = [];

          for (const registro of registros) {
            try {
              // Sincronizar com Firebird
              const resultado = await firebirdDb.registrarPontoFirebird({
                funcionario: registro.funcionario_codigo,
                tipo_marcacao: registro.tipo_marcacao,
                data: registro.data,
                hora: registro.hora,
                observacao: registro.observacao
              });

              // Marcar como sincronizado no SQLite
              db.run(
                `UPDATE ponto_funcionario SET sincronizado = 1, id_firebird = ? WHERE id = ?`,
                [resultado.codigo, registro.id],
                (updateErr: Error | null) => {
                  if (!updateErr) {
                    sincronizados++;
                    console.log(`Registro ${registro.id} sincronizado com sucesso`);
                  } else {
                    erros.push(`Erro ao atualizar registro ${registro.id}: ${(updateErr as any).message}`);
                  }
                }
              );
            } catch (erro: any) {
              erros.push(`Erro ao sincronizar registro ${registro.id}: ${erro.message}`);
              console.error(`Erro ao sincronizar registro ${registro.id}:`, erro);
            }
          }

          resolve({
            sucesso: erros.length === 0,
            sincronizados,
            total: registros.length,
            ...(erros.length > 0 && { erros })
          });
        }
      );
    } catch (erro) {
      reject(erro);
    }
  });
}

// Registrar ação de sincronização
function registrarAcaoSync(tabela: string, registroId: number, acao: string): Promise<void> {
  return new Promise((resolve, reject) => {
    db.run(
      `INSERT OR IGNORE INTO sync_control (tabela, registro_id, acao, sincronizado)
       VALUES (?, ?, ?, 0)`,
      [tabela, registroId, acao],
      (err: Error | null) => {
        if (err) {
          reject(err);
        } else {
          resolve();
        }
      }
    );
  });
}

// Status da sincronização
function obterStatusSync(): Promise<StatusResponse> {
  return new Promise((resolve, reject) => {
    db.all(
      `SELECT * FROM ponto_funcionario WHERE sincronizado = 0`,
      (err: Error | null, registros: Registro[] | undefined) => {
        if (err) {
          reject(err);
        } else {
          resolve({
            pendentes: registros ? registros.length : 0,
            registros: registros || []
          });
        }
      }
    );
  });
}

export {
  sincronizarPendentes,
  registrarAcaoSync,
  obterStatusSync
};
