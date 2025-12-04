/**
 * Módulo de integração com Firebird usando node-firebird
 *
 * Realiza consultas e sincronizações com o banco Firebird central.
 * Estrutura esperada do Firebird:
 * - FUNCIONARIOS: CODIGO, NOME, SENHA_SISTEMA, USUARIO_SISTEMA
 * - TIPO_MARCACAO: CODIGO, DESCRICAO
 * - PONTO_FUNCIONARIO: CODIGO, FUNCIONARIO, DATA, HORA, TIPO_MARCACAO, OBSERVACAO, HORA_SISTEMA
 */

import firebird from 'node-firebird';

interface FirebirdConfig {
  host: string;
  port: number;
  database: string;
  user: string;
  password: string;
  lowercase_keys: boolean;
  pageSize: number;
}

interface Funcionario {
  CODIGO: number;
  NOME: string;
  USUARIO_SISTEMA: string;
}

interface TipoMarcacao {
  CODIGO: number;
  DESCRICAO: string;
}

interface DadosPonto {
  funcionario: number;
  tipo_marcacao: number;
  data: string;
  hora: string;
  observacao?: string | null;
}

interface ResultadoPonto {
  codigo: number;
  sucesso: boolean;
}

interface RegistroPonto {
  id: number;
  funcionario_codigo: number;
  tipo_marcacao: number;
  data: string;
  hora: string;
  observacao?: string;
}

interface SincronizacaoResult {
  sincronizados: number;
  erros: string[];
  total: number;
}

// Configuração do Firebird
const firebirdConfig: FirebirdConfig = {
  host: process.env.FIREBIRD_HOST || 'localhost',
  port: parseInt(process.env.FIREBIRD_PORT || '3050'),
  database: process.env.FIREBIRD_DATABASE || 'C:\\Apta\\Dados\\APTA.FDB',
  user: process.env.FIREBIRD_USER || 'SYSDBA',
  password: process.env.FIREBIRD_PASSWORD || 'masterkey',
  lowercase_keys: false,
  pageSize: 4096
};

// Pool de conexões
let pool: any = null;

/**
 * Inicializar conexão com Firebird
 */
function inicializarConexao(): Promise<any> {
  return new Promise((resolve, reject) => {
    firebird.attach(firebirdConfig, (err: Error | null, db: any) => {
      if (err) {
        console.error('Erro ao conectar ao Firebird:', err.message);
        reject(err);
      } else {
        pool = db;
        console.log('Conectado com sucesso ao banco Firebird:', firebirdConfig.database);
        resolve(db);
      }
    });
  });
}

/**
 * Executar query no Firebird
 */
function executarQuery(sql: string, params: any[] = []): Promise<any> {
  return new Promise((resolve, reject) => {
    if (!pool) {
      return reject(new Error('Firebird não está conectado. Tente inicializar a conexão.'));
    }

    pool.query(sql, params, (err: Error | null, resultado: any) => {
      if (err) {
        console.error('Erro ao executar query:', err);
        reject(err);
      } else {
        resolve(resultado);
      }
    });
  });
}

/**
 * Buscar dados completos do funcionário (incluindo horários)
 */
function obterDadosFuncionario(codigo: string | number): Promise<any> {
  return new Promise((resolve, reject) => {
    if (!pool) {
      return reject(new Error('Firebird não está conectado.'));
    }

    const sql = `
      SELECT
        CODIGO,
        NOME,
        USUARIO_SISTEMA,
        INICIO_SEGUNDA_SEXTA,
        PAUSA_SEGUNDA_SEXTA,
        RETORNO_SEGUNDA_SEXTA,
        FINAL_SEGUNDA_SEXTA,
        INICIO_SABADO,
        PAUSA_SABADO,
        RETORNO_SABADO,
        FINAL_SABADO,
        INICIO_DOMINGO,
        PAUSA_DOMINGO,
        RETORNO_DOMINGO,
        FINAL_DOMINGO
      FROM FUNCIONARIOS
      WHERE CODIGO = ?
    `;

    pool.query(sql, [codigo], (err: Error | null, result: any[]) => {
      if (err) {
        reject(err);
      } else {
        resolve(result && result.length > 0 ? result[0] : null);
      }
    });
  });
}

/**
 * Buscar funcionário pela senha (similar ao código Delphi)
 * SELECT * FROM FUNCIONARIOS WHERE SENHA_SISTEMA = '123456'
 */
async function buscarFuncionarioPorSenha(senha: string): Promise<Funcionario | null> {
  try {
    const sql = 'SELECT CODIGO, NOME, USUARIO_SISTEMA FROM FUNCIONARIOS WHERE SENHA_SISTEMA = ?';
    const resultado = await executarQuery(sql, [senha]);

    if (!resultado || resultado.length === 0) {
      return null;
    }

    return resultado[0];
  } catch (erro) {
    console.error('Erro ao buscar funcionário por senha:', erro);
    throw erro;
  }
}

/**
 * Obter tipos de marcação da tabela TIPO_MARCACAO
 */
async function obterTiposMarcacao(): Promise<TipoMarcacao[]> {
  try {
    const sql = 'SELECT CODIGO, DESCRICAO FROM TIPO_MARCACAO ORDER BY CODIGO';
    const resultado = await executarQuery(sql);

    return resultado || [];
  } catch (erro) {
    console.error('Erro ao obter tipos de marcação:', erro);
    throw erro;
  }
}

/**
 * Registrar ponto no Firebird (similar ao código Delphi)
 * INSERT INTO PONTO_FUNCIONARIO
 *   (CODIGO, FUNCIONARIO, DATA, HORA, TIPO_MARCACAO, OBSERVACAO, HORA_SISTEMA)
 * VALUES (...)
 */
async function registrarPontoFirebird(dados: DadosPonto): Promise<ResultadoPonto> {
  try {
    const { funcionario, tipo_marcacao, data, hora, observacao } = dados;

    // Buscar próximo código disponível
    const ultimoSql = 'SELECT MAX(CODIGO) as CODIGO FROM PONTO_FUNCIONARIO';
    const ultimoResult = await executarQuery(ultimoSql);
    const proximoCodigo = (ultimoResult[0]?.CODIGO || 0) + 1;

    // Obter hora do sistema
    const horaSistema = new Date().toTimeString().slice(0, 5);

    // Garantir formato correto da data (YYYY-MM-DD para Date)
    const dataObj = new Date(data + 'T00:00:00');
    // Observação: se vazia, enviar null ao invés de espaço
    const obsProcessada = observacao && observacao.trim() ? observacao : null;

    const sql = `
      INSERT INTO PONTO_FUNCIONARIO
        (CODIGO, FUNCIONARIO, DATA, HORA, TIPO_MARCACAO, OBSERVACAO, HORA_SISTEMA)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `;

    console.log(`[Firebird INSERT] Código: ${proximoCodigo}, Func: ${funcionario}, Data: ${dataObj.toLocaleDateString('pt-BR')}, Hora: ${hora}, Tipo: ${tipo_marcacao}, Obs: ${obsProcessada === null ? 'NULL' : `"${obsProcessada}"`}`);

    await executarQuery(sql, [
      proximoCodigo,
      funcionario,
      dataObj,
      hora,
      tipo_marcacao,
      obsProcessada,
      horaSistema
    ]);

    console.log(`✅ Ponto registrado no Firebird com código: ${proximoCodigo}`);

    return {
      codigo: proximoCodigo,
      sucesso: true
    };
  } catch (erro) {
    console.error('Erro ao registrar ponto no Firebird:', erro);
    throw erro;
  }
}

/**
 * Obter histórico de pontos do funcionário em uma data
 */
async function obterHistoricoPontos(funcionario_codigo: number, data: string): Promise<any[]> {
  try {
    const dataObj = new Date(data + 'T00:00:00');
    console.log(`[obterHistoricoPontos] Buscando registros para funcionário ${funcionario_codigo}, data: ${data}, dataObj: ${dataObj.toLocaleDateString('pt-BR')}`);

    const sql = `
      SELECT CODIGO, FUNCIONARIO, DATA, HORA, TIPO_MARCACAO, OBSERVACAO
      FROM PONTO_FUNCIONARIO
      WHERE FUNCIONARIO = ? AND CAST(DATA AS DATE) = CAST(? AS DATE)
      ORDER BY HORA ASC
    `;

    const resultado = await executarQuery(sql, [funcionario_codigo, dataObj]);
    console.log(`[obterHistoricoPontos] Resultado: ${resultado?.length || 0} registros encontrados`);
    if (resultado && resultado.length > 0) {
      resultado.forEach((r: any, i: number) => {
        console.log(`  [${i}] Hora: ${r.HORA}, Tipo: ${r.TIPO_MARCACAO}`);
      });
    }
    return resultado || [];
  } catch (erro) {
    console.error('Erro ao obter histórico de pontos:', erro);
    throw erro;
  }
}

/**
 * Verificar duplicata nos últimos 10 minutos
 */
async function verificarDuplicataRecente(funcionario_codigo: number, dataRegistro: string): Promise<boolean> {
  try {
    const agora = new Date();
    const agoraEmMinutos = agora.getHours() * 60 + agora.getMinutes();
    const dezMinutosAtrasEmMinutos = agoraEmMinutos - 10;

    const dataObj = new Date(dataRegistro + 'T00:00:00');
    const sql = `
      SELECT HORA FROM PONTO_FUNCIONARIO
      WHERE FUNCIONARIO = ? AND DATA = ?
      ORDER BY HORA DESC
      ROWS 1
    `;

    const resultado = await executarQuery(sql, [funcionario_codigo, dataObj]);

    if (!resultado || resultado.length === 0) {
      return false; // Nenhum registro no dia
    }

    const ultimaHora = resultado[0].HORA;
    const [ultimaHoraH, ultimaHoraM] = ultimaHora.split(':').map(Number);
    const ultimaHoraEmMinutos = ultimaHoraH * 60 + ultimaHoraM;

    const diferenca = agoraEmMinutos - ultimaHoraEmMinutos;
    return diferenca >= 0 && diferenca < 10;
  } catch (erro) {
    console.error('Erro ao verificar duplicata recente:', erro);
    throw erro;
  }
}

/**
 * Sincronizar registros pendentes com Firebird
 */
async function sincronizarRegistrosPendentes(registros: RegistroPonto[]): Promise<SincronizacaoResult> {
  try {
    console.log(`Sincronizando ${registros.length} registros com Firebird`);

    let sincronizados = 0;
    let erros: string[] = [];

    for (const registro of registros) {
      try {
        await registrarPontoFirebird({
          funcionario: registro.funcionario_codigo,
          tipo_marcacao: registro.tipo_marcacao,
          data: registro.data,
          hora: registro.hora,
          observacao: registro.observacao
        });
        sincronizados++;
      } catch (erro: any) {
        erros.push(`Registro ${registro.id}: ${erro.message}`);
      }
    }

    return {
      sincronizados,
      erros,
      total: registros.length
    };
  } catch (erro) {
    console.error('Erro ao sincronizar com Firebird:', erro);
    throw erro;
  }
}

/**
 * Fechar conexão com Firebird
 */
function fecharConexao(): void {
  if (pool) {
    pool.detach();
    pool = null;
    console.log('Desconectado do Firebird');
  }
}

export {
  inicializarConexao,
  executarQuery,
  obterDadosFuncionario,
  buscarFuncionarioPorSenha,
  obterTiposMarcacao,
  registrarPontoFirebird,
  obterHistoricoPontos,
  verificarDuplicataRecente,
  sincronizarRegistrosPendentes,
  fecharConexao,
  firebirdConfig,
  // Types
  type Funcionario,
  type TipoMarcacao,
  type DadosPonto,
  type ResultadoPonto,
  type RegistroPonto,
  type SincronizacaoResult
};
