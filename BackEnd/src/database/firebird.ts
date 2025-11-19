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

    const sql = `
      INSERT INTO PONTO_FUNCIONARIO
        (CODIGO, FUNCIONARIO, DATA, HORA, TIPO_MARCACAO, OBSERVACAO, HORA_SISTEMA)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `;

    await executarQuery(sql, [
      proximoCodigo,
      funcionario,
      new Date(data),
      hora,
      tipo_marcacao,
      observacao || null,
      horaSistema
    ]);

    console.log(`Ponto registrado no Firebird com código: ${proximoCodigo}`);

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
  buscarFuncionarioPorSenha,
  obterTiposMarcacao,
  registrarPontoFirebird,
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
