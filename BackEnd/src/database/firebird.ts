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

// Cache para tipos de marcação (muda raramente)
interface CacheConfig {
  tiposMarcacao: {
    dados: TipoMarcacao[] | null;
    timestamp: number;
    ttl: number; // 1 hora
  };
  funcionarios: Map<number, { dados: any; timestamp: number; ttl: number }>;
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
  host: process.env.FIREBIRD_HOST || '127.0.0.1',
  port: parseInt(process.env.FIREBIRD_PORT || '3050'),
  database: process.env.FIREBIRD_DATABASE || 'C:\\Apta\\Dados\\APTA.FDB',
  user: process.env.FIREBIRD_USER || 'SYSDBA',
  password: process.env.FIREBIRD_PASSWORD || 'masterkey',
  lowercase_keys: false,
  pageSize: 4096
};

// Pool de conexões
let pool: any = null;

// Cache global
const cache: CacheConfig = {
  tiposMarcacao: {
    dados: null,
    timestamp: 0,
    ttl: 3600000 // 1 hora em ms
  },
  funcionarios: new Map()
};

/**
 * Verificar se cache expirou
 */
function cacheExpirou(timestamp: number, ttl: number): boolean {
  return Date.now() - timestamp > ttl;
}

/**
 * Invalidar cache
 */
function invalidarCache(): void {
  cache.tiposMarcacao.dados = null;
  cache.tiposMarcacao.timestamp = 0;
  cache.funcionarios.clear();
  console.log('Cache invalidado');
}

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
 * Executar query no Firebird com prepared statements e timeout
 * Otimização: Usar índices com CAST para DATE
 */
function executarQuery(sql: string, params: any[] = [], timeoutMs: number = 60000): Promise<any> {
  return new Promise((resolve, reject) => {
    if (!pool) {
      return reject(new Error('Firebird não está conectado. Tente inicializar a conexão.'));
    }

    // Timeout para query
    const timeout = setTimeout(() => {
      reject(new Error(`Query timeout após ${timeoutMs}ms`));
    }, timeoutMs);

    pool.query(sql, params, (err: Error | null, resultado: any) => {
      clearTimeout(timeout);
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
 * Obter tipos de marcação com cache
 * Otimização: Cache em memória (1 hora)
 */
async function obterTiposMarcacao(): Promise<TipoMarcacao[]> {
  try {
    // Verificar cache
    if (
      cache.tiposMarcacao.dados &&
      !cacheExpirou(cache.tiposMarcacao.timestamp, cache.tiposMarcacao.ttl)
    ) {
      console.log('[Cache HIT] Tipos de marcação retornados do cache');
      return cache.tiposMarcacao.dados;
    }

    console.log('[Cache MISS] Buscando tipos de marcação do Firebird...');
    // Índice: RDB$INDEX com ORDER BY para melhor performance
    const sql = 'SELECT CODIGO, DESCRICAO FROM TIPO_MARCACAO ORDER BY CODIGO';
    const resultado = await executarQuery(sql);

    // Armazenar em cache
    cache.tiposMarcacao.dados = resultado || [];
    cache.tiposMarcacao.timestamp = Date.now();

    return cache.tiposMarcacao.dados as TipoMarcacao[];
  } catch (erro) {
    console.error('Erro ao obter tipos de marcação:', erro);
    throw erro;
  }
}

/**
 * Registrar ponto com invalidação de cache
 * Otimização: Prepared statements já usados
 *             Invalidar cache após INSERT
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

    // Invalidar cache após mutation
    invalidarCache();

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
 * Obter histórico de pontos com índice otimizado
 * Otimização: Índice composto (FUNCIONARIO, DATA, TIPO_MARCACAO)
 *             ORDER BY HORA DESC para pegar últimos registros primeiro
 */
async function obterHistoricoPontos(funcionario_codigo: number, data: string): Promise<any[]> {
  try {
    const dataObj = new Date(data + 'T00:00:00');
    console.log(`[obterHistoricoPontos] Buscando registros para funcionário ${funcionario_codigo}, data: ${data}`);

    // Query simplificada sem CAST
    const sql = `
      SELECT CODIGO, FUNCIONARIO, DATA, HORA, TIPO_MARCACAO, OBSERVACAO
      FROM PONTO_FUNCIONARIO
      WHERE FUNCIONARIO = ? AND DATA = ?
      ORDER BY HORA DESC
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
 * Verificar duplicata nos últimos 10 minutos com índice otimizado
 * Otimização: Índice (FUNCIONARIO, HORA DESC)
 *             ROWS 1 limita resultado a 1 linha
 */
async function verificarDuplicataRecente(funcionario_codigo: number, dataRegistro: string): Promise<boolean> {
  try {
    const agora = new Date();
    const agoraEmMinutos = agora.getHours() * 60 + agora.getMinutes();
    const dezMinutosAtrasEmMinutos = agoraEmMinutos - 10;

    const dataObj = new Date(dataRegistro + 'T00:00:00');

    // Query otimizada com índice (idx_pontos_funcionario_hora)
    // ROWS 1 força early exit
    const sql = `
      SELECT HORA FROM PONTO_FUNCIONARIO
      WHERE FUNCIONARIO = ?
        AND CAST(DATA AS DATE) = CAST(? AS DATE)
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

/**
 * Verificar se uma tabela existe no Firebird
 */
async function tabelaExiste(nome: string): Promise<boolean> {
  const resultado = await executarQuery(
    `SELECT COUNT(*) AS CNT FROM RDB$RELATIONS WHERE RDB$RELATION_NAME = ?`,
    [nome.toUpperCase()]
  );
  return Number(resultado?.[0]?.CNT ?? resultado?.[0]?.cnt ?? 0) > 0;
}

/**
 * Criar tabelas de biometria no Firebird se não existirem
 */
async function inicializarTabelasBiometria(): Promise<void> {
  const templateExiste = await tabelaExiste('BIOMETRIAS_FUNCIONARIO');
  if (!templateExiste) {
    await executarQuery(`
      CREATE TABLE BIOMETRIAS_FUNCIONARIO (
        FUNCIONARIO_CODIGO INTEGER NOT NULL PRIMARY KEY,
        HASH_BIOMETRIA VARCHAR(64) NOT NULL,
        FACE_DESCRIPTOR BLOB SUB_TYPE TEXT,
        ATUALIZADO_EM TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `, []);
    console.log('Tabela BIOMETRIAS_FUNCIONARIO criada no Firebird ✅');
  } else {
    // Adicionar coluna FACE_DESCRIPTOR se ainda não existir (migração)
    const colunaExiste = await executarQuery(
      `SELECT COUNT(*) AS CNT FROM RDB$RELATION_FIELDS WHERE RDB$RELATION_NAME = 'BIOMETRIAS_FUNCIONARIO' AND RDB$FIELD_NAME = 'FACE_DESCRIPTOR'`,
      []
    ).then((r: any[]) => Number(r?.[0]?.CNT) > 0).catch(() => false);
    if (!colunaExiste) {
      await executarQuery(`ALTER TABLE BIOMETRIAS_FUNCIONARIO ADD FACE_DESCRIPTOR BLOB SUB_TYPE TEXT`, []);
      console.log('Coluna FACE_DESCRIPTOR adicionada em BIOMETRIAS_FUNCIONARIO ✅');
    }
  }

  const statusExiste = await tabelaExiste('BIOMETRIA_STATUS_FUNCIONARIO');
  if (!statusExiste) {
    await executarQuery(`
      CREATE TABLE BIOMETRIA_STATUS_FUNCIONARIO (
        FUNCIONARIO_CODIGO INTEGER NOT NULL PRIMARY KEY,
        POSSUI_BIOMETRIA SMALLINT DEFAULT 0 NOT NULL,
        ATUALIZADO_EM TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `, []);
    console.log('Tabela BIOMETRIA_STATUS_FUNCIONARIO criada no Firebird ✅');
  }

  const auditoriaExiste = await tabelaExiste('PONTO_BIOMETRIA_AUDITORIA');
  if (!auditoriaExiste) {
    await executarQuery(`
      CREATE TABLE PONTO_BIOMETRIA_AUDITORIA (
        FUNCIONARIO_CODIGO INTEGER NOT NULL,
        HASH_BIOMETRIA VARCHAR(64) NOT NULL,
        SCORE FLOAT NOT NULL,
        ORIGEM VARCHAR(20) NOT NULL,
        METODO VARCHAR(50) NOT NULL,
        CRIADO_EM TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `, []);
    console.log('Tabela PONTO_BIOMETRIA_AUDITORIA criada no Firebird ✅');
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
  invalidarCache,
  inicializarTabelasBiometria,
  firebirdConfig,
  // Types
  type Funcionario,
  type TipoMarcacao,
  type DadosPonto,
  type ResultadoPonto,
  type RegistroPonto,
  type SincronizacaoResult
};
