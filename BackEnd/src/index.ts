import express, { Express, Request, Response } from 'express';
import cors from 'cors';
import swaggerUi from 'swagger-ui-express';
import { db, initialize } from './database/db';
import * as firebirdDb from './database/firebird';
import authRoutes from './routes/authRoutes';
import pontoRoutes from './routes/pontoRoutes';
import syncRoutes from './routes/syncRoutes';
import logger from './utils/logger';
import swaggerSpecs from './swagger/swaggerConfig';

const app: Express = express();

// Middleware
app.use(cors());
app.use(express.json());

// Middleware de logging
app.use((req: Request, res: Response, next) => {
  logger.info(`${req.method} ${req.path}`, { ip: req.ip });
  next();
});

// Inicializar banco de dados local
initialize();
logger.info('Banco de dados SQLite inicializado');

// Inicializar conexão com Firebird
firebirdDb.inicializarConexao()
  .then(() => {
    logger.info('Firebird conectado com sucesso');
  })
  .catch((erro) => {
    logger.warn('Aviso: Firebird não disponível no momento', { erro: erro.message });
    logger.info('Sistema funcionará em modo offline');
  });

// Rotas
app.use('/api/auth', authRoutes);
app.use('/api/ponto', pontoRoutes);
app.use('/api/sync', syncRoutes);

// Swagger Documentation
app.use('/api-docs', swaggerUi.serve);
app.get('/api-docs', swaggerUi.setup(swaggerSpecs, { swaggerOptions: { persistAuthorization: true } }));

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

// Health Check Endpoint - Monitoramento
app.get('/api/health', async (req: Request, res: Response) => {
  try {
    const startTime = Date.now();

    // Verificar conexão com Firebird
    const firebaseStatus = await firebirdDb.obterTiposMarcacao()
      .then(() => ({ status: 'healthy', latency: Date.now() - startTime }))
      .catch(() => ({ status: 'unhealthy', latency: Date.now() - startTime }));

    const uptime = process.uptime();
    const memoryUsage = process.memoryUsage();

    res.json({
      status: 'healthy',
      timestamp: new Date().toISOString(),
      uptime: `${Math.floor(uptime / 60)}m ${Math.floor(uptime % 60)}s`,
      version: '1.0.0',
      database: {
        firebird: firebaseStatus.status,
        latency: `${firebaseStatus.latency}ms`
      },
      memory: {
        heap: `${Math.round(memoryUsage.heapUsed / 1024 / 1024)}MB / ${Math.round(memoryUsage.heapTotal / 1024 / 1024)}MB`,
        rss: `${Math.round(memoryUsage.rss / 1024 / 1024)}MB`
      },
      node: {
        version: process.version,
        platform: process.platform,
        pid: process.pid
      }
    });
  } catch (error: any) {
    res.status(503).json({
      status: 'unhealthy',
      error: error.message,
      timestamp: new Date().toISOString()
    });
  }
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  logger.info(`Servidor rodando na porta ${PORT} ✅`);
});
