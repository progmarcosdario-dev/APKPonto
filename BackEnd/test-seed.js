/**
 * Script de Teste - Insere funcionário de teste no Firebird
 * Uso: node test-seed.js
 */

const firebird = require('node-firebird');

const firebirdConfig = {
  host: process.env.FIREBIRD_HOST || 'localhost',
  port: process.env.FIREBIRD_PORT || 3050,
  database: process.env.FIREBIRD_DATABASE || 'C:\\Apta\\Dados\\APTA.FDB',
  user: process.env.FIREBIRD_USER || 'SYSDBA',
  password: process.env.FIREBIRD_PASSWORD || 'masterkey',
  lowercase_keys: false,
  pageSize: 4096
};

async function inserirFuncionarioTeste() {
  return new Promise((resolve, reject) => {
    firebird.attach(firebirdConfig, (err, db) => {
      if (err) {
        console.error('Erro ao conectar ao Firebird:', err);
        reject(err);
        return;
      }

      console.log('✅ Conectado ao Firebird');

      // Atualizar/Inserir funcionário de teste
      const sqlUpdate = `
        UPDATE FUNCIONARIOS SET SENHA_SISTEMA = '123456' WHERE CODIGO = 1
      `;

      db.query(sqlUpdate, [], (err, result) => {
        if (err && err.message.includes('PK')) {
          // Se não existe, inserir
          const sqlInsert = `
            INSERT INTO FUNCIONARIOS (CODIGO, NOME, SENHA_SISTEMA, USUARIO_SISTEMA)
            VALUES (?, ?, ?, ?)
          `;
          db.query(sqlInsert, [1, 'Teste Scopum', '123456', 'teste'], (err2, result2) => {
            if (err2) {
              console.error('Erro ao inserir:', err2.message);
              db.detach();
              reject(err2);
              return;
            }
            console.log('✅ Funcionário de teste inserido com sucesso!');
            handleSuccess(db);
          });
        } else {
          console.log('✅ Senha de teste atualizada com sucesso!');
        console.log('   CODIGO: 1');
        console.log('   NOME: Teste Scopum');
        console.log('   SENHA_SISTEMA: 123456');

        // Consultar para verificar
        db.query('SELECT CODIGO, NOME FROM FUNCIONARIOS WHERE SENHA_SISTEMA = ?', ['123456'],
          (err, result) => {
            if (result && result.length > 0) {
              console.log('\n✅ Verificação:');
              result.forEach(f => {
                console.log(`   - ${f.CODIGO}: ${f.NOME}`);
              });
            }
            db.detach();
            resolve();
          }
        );
      });
    });
  });
}

// Executar
inserirFuncionarioTeste()
  .then(() => {
    console.log('\n✅ Script concluído com sucesso!');
    process.exit(0);
  })
  .catch((err) => {
    console.error('\n❌ Erro:', err.message);
    process.exit(1);
  });
