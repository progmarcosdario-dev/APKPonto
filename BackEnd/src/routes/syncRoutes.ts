import express, { Router, Request, Response } from 'express';
import * as syncService from '../services/syncService';

const router: Router = express.Router();

/**
 * @swagger
 * /api/sync/status:
 *   get:
 *     tags:
 *       - Sincronização
 *     summary: Obtém status de sincronização
 *     description: Retorna o status de sincronização com o banco de dados Firebird
 *     responses:
 *       200:
 *         description: Status obtido com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 sucesso:
 *                   type: boolean
 *                   example: true
 *                 pendentes:
 *                   type: integer
 *                   example: 5
 *                 sincronizados:
 *                   type: integer
 *                   example: 145
 *                 ultima_sincronizacao:
 *                   type: string
 *                   format: date-time
 *                   example: "2024-01-15T10:30:00Z"
 *       500:
 *         description: Erro ao obter status
 */
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

/**
 * @swagger
 * /api/sync/sincronizar:
 *   post:
 *     tags:
 *       - Sincronização
 *     summary: Sincroniza registros pendentes
 *     description: Sincroniza todos os registros de ponto pendentes com o banco de dados Firebird
 *     responses:
 *       200:
 *         description: Sincronização realizada com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 sucesso:
 *                   type: boolean
 *                   example: true
 *                 sincronizados:
 *                   type: integer
 *                   example: 10
 *                 falhados:
 *                   type: integer
 *                   example: 0
 *                 mensagem:
 *                   type: string
 *                   example: "Sincronização concluída"
 *       500:
 *         description: Erro durante sincronização
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 sucesso:
 *                   type: boolean
 *                   example: false
 *                 mensagem:
 *                   type: string
 *                   example: "Erro ao sincronizar dados"
 *                 erro:
 *                   type: string
 */
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
