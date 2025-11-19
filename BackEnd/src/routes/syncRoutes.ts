import express, { Router, Request, Response } from 'express';
import * as syncService from '../services/syncService';

const router: Router = express.Router();

// GET /api/sync/status - Obter status de sincronização
router.get('/status', async (req: Request, res: Response): Promise<any> => {
  try {
    const status = await syncService.obterStatusSync();
    res.json({
      sucesso: true,
      ...status
    });
  } catch (erro: any) {
    res.status(500).json({
      sucesso: false,
      mensagem: 'Erro ao obter status de sincronização',
      erro: erro.message
    });
  }
});

// POST /api/sync/sincronizar - Sincronizar com Firebird
router.post('/sincronizar', async (req: Request, res: Response): Promise<any> => {
  try {
    const resultado = await syncService.sincronizarPendentes();
    res.json(resultado);
  } catch (erro: any) {
    res.status(500).json({
      sucesso: false,
      mensagem: 'Erro ao sincronizar dados',
      erro: erro.message
    });
  }
});

export default router;
