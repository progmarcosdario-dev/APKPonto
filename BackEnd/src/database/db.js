const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const dbPath = path.join(__dirname, 'ponto.db');
const db = new sqlite3.Database(dbPath, (err) => {
  if (err) {
    console.error('Erro ao conectar ao banco de dados local:', err);
  } else {
    console.log('Conectado ao banco de dados SQLite local');
  }
});

// Função para inicializar o banco de dados
function initialize() {
  db.serialize(() => {
    // Tabela de funcionários (cache local espelhando Firebird)
    db.run(`
      CREATE TABLE IF NOT EXISTS funcionarios (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        codigo_firebird INTEGER NOT NULL UNIQUE,
        nome TEXT NOT NULL,
        ativo BOOLEAN DEFAULT 1,
        criado_em DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Tabela de tipos de marcação (cache)
    db.run(`
      CREATE TABLE IF NOT EXISTS tipo_marcacao (
        codigo INTEGER PRIMARY KEY,
        descricao TEXT NOT NULL
      )
    `);

    // Tabela de registros de ponto (espelhando PONTO_FUNCIONARIO)
    db.run(`
      CREATE TABLE IF NOT EXISTS ponto_funcionario (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        funcionario_codigo INTEGER NOT NULL,
        tipo_marcacao INTEGER NOT NULL,
        data TEXT NOT NULL,
        hora TEXT NOT NULL,
        observacao TEXT,
        sincronizado BOOLEAN DEFAULT 0,
        id_firebird INTEGER,
        data_criacao DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (funcionario_codigo) REFERENCES funcionarios(codigo_firebird)
      )
    `);

    // Tabela de controle de sincronização
    db.run(`
      CREATE TABLE IF NOT EXISTS sync_control (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        tabela TEXT NOT NULL,
        registro_id INTEGER NOT NULL,
        acao TEXT NOT NULL,
        data_criacao DATETIME DEFAULT CURRENT_TIMESTAMP,
        sincronizado BOOLEAN DEFAULT 0,
        UNIQUE(tabela, registro_id, acao)
      )
    `, (err) => {
      if (!err) {
        console.log('Tabelas do banco local criadas/verificadas');
      }
    });
  });
}

module.exports = {
  db,
  initialize
};
