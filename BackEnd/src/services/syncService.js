const { db } = require('../database/db');
const firebirdDb = require('../database/firebird');

// Sincronizar registros pendentes com Firebird
async function sincronizarPendentes() {
  return new Promise(async (resolve, reject) => {
    try {
      // Buscar registros não sincronizados
      db.all(
        `SELECT * FROM ponto_funcionario WHERE sincronizado = 0 ORDER BY data_criacao ASC`,
        async (err, registros) => {
          if (err) {
            console.error('Erro ao buscar registros pendentes:', err);
            return reject(err);
          }

          if (!registros || registros.length === 0) {
            console.log('Nenhum registro para sincronizar');
            return resolve({ sucesso: true, sincronizados: 0 });
          }

          let sincronizados = 0;
          let erros = [];

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
                (updateErr) => {
                  if (!updateErr) {
                    sincronizados++;
                    console.log(`Registro ${registro.id} sincronizado com sucesso`);
                  } else {
                    erros.push(`Erro ao atualizar registro ${registro.id}: ${updateErr.message}`);
                  }
                }
              );
            } catch (erro) {
              erros.push(`Erro ao sincronizar registro ${registro.id}: ${erro.message}`);
              console.error(`Erro ao sincronizar registro ${registro.id}:`, erro);
            }
          }

          resolve({
            sucesso: erros.length === 0,
            sincronizados,
            total: registros.length,
            erros: erros.length > 0 ? erros : undefined
          });
        }
      );
    } catch (erro) {
      reject(erro);
    }
  });
}

// Registrar ação de sincronização
function registrarAcaoSync(tabela, registroId, acao) {
  return new Promise((resolve, reject) => {
    db.run(
      `INSERT OR IGNORE INTO sync_control (tabela, registro_id, acao, sincronizado)
       VALUES (?, ?, ?, 0)`,
      [tabela, registroId, acao],
      (err) => {
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
function obterStatusSync() {
  return new Promise((resolve, reject) => {
    db.all(
      `SELECT * FROM ponto_funcionario WHERE sincronizado = 0`,
      (err, registros) => {
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

module.exports = {
  sincronizarPendentes,
  registrarAcaoSync,
  obterStatusSync
};
