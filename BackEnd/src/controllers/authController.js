const { db } = require('../database/db');
const firebirdDb = require('../database/firebird');

// Validar senha do funcionário
async function validarSenha(req, res) {
  const { senha } = req.body;

  if (!senha) {
    return res.status(400).json({
      sucesso: false,
      mensagem: 'Senha é obrigatória'
    });
  }

  if (senha.length !== 6) {
    return res.status(400).json({
      sucesso: false,
      mensagem: 'Senha deve ter 6 dígitos'
    });
  }

  try {
    // Buscar funcionário no Firebird usando SENHA_SISTEMA
    const funcionario = await firebirdDb.buscarFuncionarioPorSenha(senha);

    if (!funcionario) {
      return res.status(401).json({
        sucesso: false,
        mensagem: 'Senha inválida'
      });
    }

    // Armazenar localmente no SQLite para modo offline
    db.run(
      `INSERT OR REPLACE INTO funcionarios (id, codigo_firebird, nome, ativo)
       VALUES (?, ?, ?, 1)`,
      [funcionario.CODIGO, funcionario.CODIGO, funcionario.NOME],
      (err) => {
        if (err) {
          console.error('Erro ao cachejar funcionário:', err);
        }
      }
    );

    res.json({
      sucesso: true,
      mensagem: 'Autenticação realizada com sucesso',
      funcionario: {
        codigo: funcionario.CODIGO,
        nome: funcionario.NOME,
        usuario_sistema: funcionario.USUARIO_SISTEMA
      }
    });
  } catch (erro) {
    console.error('Erro na autenticação:', erro);
    res.status(500).json({
      sucesso: false,
      mensagem: 'Erro ao validar senha',
      erro: erro.message
    });
  }
}

module.exports = {
  validarSenha
};
