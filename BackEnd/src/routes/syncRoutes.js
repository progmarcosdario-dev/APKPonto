const express = require('express');
const router = express.Router();
const syncService = require('../services/syncService');

// GET /api/sync/status - Obter status de sincronização
router.get('/status', async (req, res) => {
  try {
    const status = await syncService.obterStatusSync();
    res.json({
      sucesso: true,
      ...status
    });
  } catch (erro) {
    res.status(500).json({
      sucesso: false,
      mensagem: 'Erro ao obter status de sincronização',
      erro: erro.message
    });
  }
});

// POST /api/sync/sincronizar - Sincronizar com Firebird
router.post('/sincronizar', async (req, res) => {
  try {
    const resultado = await syncService.sincronizarPendentes();
    res.json(resultado);
  } catch (erro) {
    res.status(500).json({
      sucesso: false,
      mensagem: 'Erro ao sincronizar dados',
      erro: erro.message
    });
  }
});

module.exports = router;
