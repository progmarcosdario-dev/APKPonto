const express = require('express');
const router = express.Router();
const pontoController = require('../controllers/pontoController');

// GET /api/ponto/tipos - Obter tipos de marcação
router.get('/tipos', pontoController.obterTiposMarcacao);

// POST /api/ponto/registrar - Registrar novo ponto
router.post('/registrar', pontoController.registrarPonto);

// GET /api/ponto/historico/:funcionario_codigo - Obter histórico de ponto
router.get('/historico/:funcionario_codigo', pontoController.obterHistorico);

module.exports = router;
