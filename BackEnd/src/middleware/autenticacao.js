const jwt = require('jsonwebtoken');

function autenticar(req, res, next) {
  const token = req.headers.authorization?.split(' ')[1];

  if (!token) {
    return res.status(401).json({
      sucesso: false,
      mensagem: 'Token não fornecido'
    });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'sua_chave_secreta');
    req.usuario = decoded;
    next();
  } catch (erro) {
    return res.status(401).json({
      sucesso: false,
      mensagem: 'Token inválido'
    });
  }
}

module.exports = {
  autenticar
};
