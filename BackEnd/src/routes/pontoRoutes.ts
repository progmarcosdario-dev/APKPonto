import express, { Router } from 'express';
import { obterTiposMarcacao, registrarPonto, obterHistorico } from '../controllers/pontoController';

const router: Router = express.Router();

/**
 * @swagger
 * /api/ponto/tipos:
 *   get:
 *     tags:
 *       - Ponto
 *     summary: Obtém tipos de marcação
 *     description: Retorna lista de tipos de marcação disponíveis (Entrada, Saída, Intervalo, etc)
 *     responses:
 *       200:
 *         description: Lista de tipos obtida com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/TipoMarcacao'
 *       500:
 *         description: Erro ao obter tipos de marcação
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 sucesso:
 *                   type: boolean
 *                 erro:
 *                   type: string
 */
// GET /api/ponto/tipos - Obter tipos de marcação
router.get('/tipos', obterTiposMarcacao);

/**
 * @swagger
 * /api/ponto/registrar:
 *   post:
 *     tags:
 *       - Ponto
 *     summary: Registra um novo ponto
 *     description: Cria um novo registro de ponto (entrada, saída, intervalo, etc)
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - funcionario_codigo
 *               - tipo_marcacao_codigo
 *             properties:
 *               funcionario_codigo:
 *                 type: string
 *                 example: "001"
 *               tipo_marcacao_codigo:
 *                 type: string
 *                 example: "1"
 *               observacao:
 *                 type: string
 *                 example: "Saída para reunião"
 *     responses:
 *       201:
 *         description: Ponto registrado com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 sucesso:
 *                   type: boolean
 *                   example: true
 *                 registro_id:
 *                   type: integer
 *                   example: 123
 *       400:
 *         description: Dados inválidos
 *       500:
 *         description: Erro ao registrar ponto
 */
// POST /api/ponto/registrar - Registrar novo ponto
router.post('/registrar', registrarPonto);

/**
 * @swagger
 * /api/ponto/historico/{funcionario_codigo}:
 *   get:
 *     tags:
 *       - Ponto
 *     summary: Obtém histórico de pontos
 *     description: Retorna o histórico de registros de ponto do funcionário
 *     parameters:
 *       - in: path
 *         name: funcionario_codigo
 *         required: true
 *         schema:
 *           type: string
 *         example: "001"
 *         description: Código do funcionário
 *     responses:
 *       200:
 *         description: Histórico obtido com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/RegistroPonto'
 *       404:
 *         description: Funcionário não encontrado
 *       500:
 *         description: Erro ao obter histórico
 */
// GET /api/ponto/historico/:funcionario_codigo - Obter histórico de ponto
router.get('/historico/:funcionario_codigo', obterHistorico);

export default router;
