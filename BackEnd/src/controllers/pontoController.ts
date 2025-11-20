import { Request, Response } from 'express';
import { db } from '../database/db';
import * as firebirdDb from '../database/firebird';
import logger from '../utils/logger';

// Obter tipos de marcação
async function obterTiposMarcacao(req: Request, res: Response): Promise<any> {
  try {
    logger.info('Buscando tipos de marcação');
    const tipos = await firebirdDb.obterTiposMarcacao();
    logger.info('Tipos de marcação obtidos com sucesso', { quantidade: tipos?.length });
    res.json({
      sucesso: true,
      tipos: tipos || []
    });
  } catch (erro: any) {
    logger.error('Erro ao obter tipos de marcação', { erro: erro.message });
    res.status(500).json({
      sucesso: false,
      mensagem: 'Erro ao obter tipos de marcação',
      erro: erro.message
    });
  }
}

// Registrar ponto
async function registrarPonto(req: Request, res: Response): Promise<any> {
  const { funcionario_codigo, tipo_marcacao, data, hora, observacao } = req.body;

  if (!funcionario_codigo || !tipo_marcacao) {
    return res.status(400).json({
      sucesso: false,
      mensagem: 'Código do funcionário e tipo de marcação são obrigatórios'
    });
  }

  try {
    // Usar data/hora do cliente ou gerar automaticamente
    const agora = new Date();
    const dataRegistro = data || agora.toISOString().split('T')[0];
    const horaRegistro = hora || agora.toTimeString().slice(0, 5);

    // Observação vazia como string, não null
    const obs = observacao || '';

    console.log(`[pontoController] Dados recebidos: func=${funcionario_codigo}, tipo=${tipo_marcacao}, data=${dataRegistro}, hora=${horaRegistro}, obs="${obs}"`);

    // Registrar no SQLite local
    db.run(
      `INSERT INTO ponto_funcionario (funcionario_codigo, tipo_marcacao, data, hora, observacao, sincronizado)
       VALUES (?, ?, ?, ?, ?, 0)`,
      [funcionario_codigo, tipo_marcacao, dataRegistro, horaRegistro, obs],
      async function(this: any, err: Error | null) {
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
            data: dataRegistro,
            hora: horaRegistro,
            observacao: obs
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
        } catch (firebaseErr: any) {
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
  } catch (erro: any) {
    res.status(500).json({
      sucesso: false,
      mensagem: 'Erro ao registrar ponto',
      erro: erro.message
    });
  }
}

// Obter histórico de ponto
function obterHistorico(req: Request, res: Response): void {
  const { funcionario_codigo } = req.params;
  const { data } = req.query;

  let query = `
    SELECT id, funcionario_codigo, tipo_marcacao, data, hora, observacao, sincronizado
    FROM ponto_funcionario
    WHERE funcionario_codigo = ?
  `;
  let params: any[] = [funcionario_codigo];

  if (data) {
    query += ` AND data = ?`;
    params.push(data);
  }

  query += ` ORDER BY data DESC, hora DESC`;

  db.all(query, params, (err: Error | null, registros: any[]) => {
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

export {
  obterTiposMarcacao,
  registrarPonto,
  obterHistorico
};
