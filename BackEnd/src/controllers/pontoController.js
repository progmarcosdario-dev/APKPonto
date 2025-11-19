const { db } = require('../database/db');
const firebirdDb = require('../database/firebird');

// Obter tipos de marcação
async function obterTiposMarcacao(req, res) {
  try {
    const tipos = await firebirdDb.obterTiposMarcacao();
    res.json({
      sucesso: true,
      tipos: tipos || []
    });
  } catch (erro) {
    res.status(500).json({
      sucesso: false,
      mensagem: 'Erro ao obter tipos de marcação',
      erro: erro.message
    });
  }
}

// Registrar ponto
async function registrarPonto(req, res) {
  const { funcionario_codigo, tipo_marcacao, observacao } = req.body;

  if (!funcionario_codigo || !tipo_marcacao) {
    return res.status(400).json({
      sucesso: false,
      mensagem: 'Código do funcionário e tipo de marcação são obrigatórios'
    });
  }

  try {
    const agora = new Date();
    const data = agora.toISOString().split('T')[0];
    const hora = agora.toTimeString().slice(0, 5);

    // Registrar no SQLite local
    db.run(
      `INSERT INTO ponto_funcionario (funcionario_codigo, tipo_marcacao, data, hora, observacao, sincronizado)
       VALUES (?, ?, ?, ?, ?, 0)`,
      [funcionario_codigo, tipo_marcacao, data, hora, observacao || null],
      async function(err) {
        if (err) {
          return res.status(500).json({
            sucesso: false,
            mensagem: 'Erro ao registrar ponto'
          });
        }

        const registroId = this.lastID;

        // Tentar sincronizar com Firebird imediatamente
        try {
          const resultado = await firebirdDb.registrarPontoFirebird({
            funcionario: funcionario_codigo,
            tipo_marcacao: tipo_marcacao,
            data: data,
            hora: hora,
            observacao: observacao
          });

          // Marcar como sincronizado
          db.run(
            `UPDATE ponto_funcionario SET sincronizado = 1, id_firebird = ? WHERE id = ?`,
            [resultado.codigo, registroId]
          );

          return res.status(201).json({
            sucesso: true,
            mensagem: 'Ponto registrado e sincronizado com sucesso',
            registroId: registroId,
            sincronizado: true
          });
        } catch (firebaseErr) {
          // Se falhar, fica no modo offline
          console.log('Firebird indisponível, registrado localmente:', firebaseErr.message);

          return res.status(201).json({
            sucesso: true,
            mensagem: 'Ponto registrado localmente (Firebird indisponível)',
            registroId: registroId,
            sincronizado: false,
            aviso: 'Será sincronizado quando a conexão estiver disponível'
          });
        }
      }
    );
  } catch (erro) {
    res.status(500).json({
      sucesso: false,
      mensagem: 'Erro ao registrar ponto',
      erro: erro.message
    });
  }
}

// Obter histórico de ponto
function obterHistorico(req, res) {
  const { funcionario_codigo } = req.params;
  const { data } = req.query;

  let query = `
    SELECT id, funcionario_codigo, tipo_marcacao, data, hora, observacao, sincronizado
    FROM ponto_funcionario
    WHERE funcionario_codigo = ?
  `;
  let params = [funcionario_codigo];

  if (data) {
    query += ` AND data = ?`;
    params.push(data);
  }

  query += ` ORDER BY data DESC, hora DESC`;

  db.all(query, params, (err, registros) => {
    if (err) {
      return res.status(500).json({
        sucesso: false,
        mensagem: 'Erro ao buscar histórico'
      });
    }

    res.json({
      sucesso: true,
      registros: registros || []
    });
  });
}

module.exports = {
  obterTiposMarcacao,
  registrarPonto,
  obterHistorico
};
