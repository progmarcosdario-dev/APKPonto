import { db } from '../database/db';
import * as firebirdDb from '../database/firebird';
import logger from '../utils/logger';

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

// ========== SINCRONIZAÇÃO COM FIREBIRD COMENTADA ==========
// Trabalharemos diretamente no Firebird para evitar conflitos de sincronização
// async function sincronizarPendentes(): Promise<SincronizacaoResponse> {
//   return new Promise(async (resolve, reject) => {
//     try {
//       logger.info('Iniciando sincronização de registros pendentes');

//       // Buscar registros não sincronizados
//       db.all(
//         `SELECT * FROM ponto_funcionario WHERE sincronizado = 0 ORDER BY data_criacao ASC`,
//         async (err: Error | null, registros: Registro[] | undefined) => {
//           if (err) {
//             logger.error('Erro ao buscar registros pendentes', { erro: err.message });
//             return reject(err);
//           }

//           if (!registros || registros.length === 0) {
//             logger.info('Nenhum registro para sincronizar');
//             return resolve({ sucesso: true, sincronizados: 0, total: 0 });
//           }

//           logger.info('Registros encontrados para sincronização', { total: registros.length });

//           let sincronizados = 0;
//           let erros: string[] = [];

//           for (const registro of registros) {
//             try {
//               // Sincronizar com Firebird
//               const resultado = await firebirdDb.registrarPontoFirebird({
//                 funcionario: registro.funcionario_codigo,
//                 tipo_marcacao: registro.tipo_marcacao,
//                 data: registro.data,
//                 hora: registro.hora,
//                 observacao: registro.observacao
//               });

//               // Marcar como sincronizado no SQLite
//               db.run(
//                 `UPDATE ponto_funcionario SET sincronizado = 1, id_firebird = ? WHERE id = ?`,
//                 [resultado.codigo, registro.id],
//                 (updateErr: Error | null) => {
//                   if (!updateErr) {
//                     sincronizados++;
//                     logger.info(`Registro sincronizado`, { registro_id: registro.id, firebird_id: resultado.codigo });
//                   } else {
//                     const erroMsg = `Erro ao atualizar registro ${registro.id}: ${(updateErr as any).message}`;
//                     erros.push(erroMsg);
//                     logger.error('Erro ao atualizar registro', { registro_id: registro.id, erro: (updateErr as any).message });
//                   }
//                 }
//               );
//             } catch (erro: any) {
//               erros.push(`Erro ao sincronizar registro ${registro.id}: ${erro.message}`);
//               console.error(`Erro ao sincronizar registro ${registro.id}:`, erro);
//             }
//           }

//           resolve({
//             sucesso: erros.length === 0,
//             sincronizados,
//             total: registros.length,
//             ...(erros.length > 0 && { erros })
//           });
//         }
//       );
//     } catch (erro) {
//       reject(erro);
//     }
//   });
// }
// ========== FIM SINCRONIZAÇÃO COMENTADA ==========

// Função stub para manter compatibilidade
async function sincronizarPendentes(): Promise<SincronizacaoResponse> {
  logger.info('Sincronização desabilitada - trabalhando diretamente no Firebird');
  return { sucesso: true, sincronizados: 0, total: 0 };
}

// Registrar ação de sincronização (obsoleta - não mais usada)
function registrarAcaoSync(tabela: string, registroId: number, acao: string): Promise<void> {
  return new Promise((resolve) => {
    logger.info('registrarAcaoSync desabilitado - trabalhando apenas com Firebird', { tabela, registroId, acao });
    resolve();
  });
}

// Status da sincronização (retorna vazio pois não há mais sincronização)
function obterStatusSync(): Promise<StatusResponse> {
  return new Promise((resolve) => {
    logger.info('obterStatusSync retornando vazio - trabalhando apenas com Firebird');
    resolve({
      pendentes: 0,
      registros: []
    });
  });
}

export {
  sincronizarPendentes,
  registrarAcaoSync,
  obterStatusSync
};
