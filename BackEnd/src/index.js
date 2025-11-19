const express = require('express');
const cors = require('cors');
require('dotenv').config();
const db = require('./database/db');
const firebirdDb = require('./database/firebird');
const authRoutes = require('./routes/authRoutes');
const pontoRoutes = require('./routes/pontoRoutes');
const syncRoutes = require('./routes/syncRoutes');

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Inicializar banco de dados local
db.initialize();

// Inicializar conexão com Firebird
firebirdDb.inicializarConexao()
  .then(() => {
    console.log('Firebird conectado com sucesso');
  })
  .catch((erro) => {
    console.warn('Aviso: Firebird não disponível no momento:', erro.message);
    console.log('Sistema funcionará em modo offline');
  });

// Rotas
app.use('/api/auth', authRoutes);
app.use('/api/ponto', pontoRoutes);
app.use('/api/sync', syncRoutes);

// Rota raiz - Status da API
app.get('/', (req, res) => {
  res.json({
    sucesso: true,
    app: 'Scopum - Controle de Ponto',
    versao: '1.0.0',
    status: 'API Funcional ✅',
    timestamp: new Date().toISOString(),
    endpoints: {
      autenticacao: 'POST /api/auth/login',
      pontos: 'GET /api/ponto/tipos, POST /api/ponto/registrar, GET /api/ponto/historico/:codigo',
      sincronizacao: 'GET /api/sync/status, POST /api/sync/sincronizar',
      saude: 'GET /api/health'
    },
    documentacao: {
      guia: 'Veja README.md',
      postman: 'Scopum-API-Postman.json'
    }
  });
});

// Rota de teste
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', message: 'Servidor funcionando' });
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`Servidor rodando na porta ${PORT}`);
});
