const firebird = require('node-firebird');

firebird.attach({
  host: 'localhost',
  port: 3050,
  database: 'C:\\Apta\\Dados\\APTA.FDB',
  user: 'SYSDBA',
  password: 'masterkey'
}, (err, db) => {
  if (err) {
    console.error('Erro ao conectar:', err);
    process.exit(1);
  }

  const sql = `SELECT CODIGO, FUNCIONARIO, DATA, HORA, TIPO_MARCACAO, OBSERVACAO, HORA_SISTEMA
               FROM PONTO_FUNCIONARIO
               WHERE CODIGO = 11405`;

  db.query(sql, [], (err, result) => {
    if (err) {
      console.error('Erro na query:', err);
    } else {
      console.log('\n=== Registro 11405 ===');
      if (result && result[0]) {
        console.log('CODIGO:', result[0].CODIGO);
        console.log('FUNCIONARIO:', result[0].FUNCIONARIO);
        console.log('DATA:', result[0].DATA);
        console.log('HORA:', result[0].HORA);
        console.log('TIPO_MARCACAO:', result[0].TIPO_MARCACAO);
        console.log('OBSERVACAO:', JSON.stringify(result[0].OBSERVACAO));
        console.log('HORA_SISTEMA:', result[0].HORA_SISTEMA);
      } else {
        console.log('Nenhum registro encontrado');
      }
    }
    db.detach();
    process.exit(0);
  });
});
