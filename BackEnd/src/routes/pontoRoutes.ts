import express, { Router } from 'express';
import { obterTiposMarcacao, registrarPonto, obterHistorico } from '../controllers/pontoController';

const router: Router = express.Router();

// GET /api/ponto/tipos - Obter tipos de marcação
router.get('/tipos', obterTiposMarcacao);

// POST /api/ponto/registrar - Registrar novo ponto
router.post('/registrar', registrarPonto);

// GET /api/ponto/historico/:funcionario_codigo - Obter histórico de ponto
router.get('/historico/:funcionario_codigo', obterHistorico);

export default router;
