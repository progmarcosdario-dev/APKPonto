import express, { Express, Request, Response } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { db, initialize } from './database/db';
import * as firebirdDb from './database/firebird';
import authRoutes from './routes/authRoutes';
import pontoRoutes from './routes/pontoRoutes';
import syncRoutes from './routes/syncRoutes';

dotenv.config();

const app: Express = express();

// Middleware
app.use(cors());
app.use(express.json());

// Inicializar banco de dados local
initialize();

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
app.get('/', (req: Request, res: Response) => {
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
app.get('/api/health', (req: Request, res: Response) => {
  res.json({ status: 'OK', message: 'Servidor funcionando' });
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`Servidor rodando na porta ${PORT} ✅`);
});
