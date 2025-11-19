import express, { Router } from 'express';
import { validarSenha } from '../controllers/authController';

const router: Router = express.Router();

/**
 * @swagger
 * /api/auth/login:
 *   post:
 *     tags:
 *       - Autenticação
 *     summary: Autentica um funcionário
 *     description: Valida as credenciais do funcionário (código e senha)
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - funcionario_codigo
 *               - senha
 *             properties:
 *               funcionario_codigo:
 *                 type: string
 *                 example: "001"
 *                 description: Código do funcionário
 *               senha:
 *                 type: string
 *                 example: "1234"
 *                 description: Senha de acesso
 *     responses:
 *       200:
 *         description: Autenticação bem-sucedida
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 sucesso:
 *                   type: boolean
 *                   example: true
 *                 mensagem:
 *                   type: string
 *                   example: "Autenticação bem-sucedida"
 *                 funcionario_codigo:
 *                   type: string
 *                   example: "001"
 *                 funcionario_nome:
 *                   type: string
 *                   example: "João da Silva"
 *       401:
 *         description: Autenticação falhou
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
 *                   example: "Senha inválida"
 *       500:
 *         description: Erro interno do servidor
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 sucesso:
 *                   type: boolean
 *                   example: false
 *                 erro:
 *                   type: string
 *                   example: "Erro ao processar autenticação"
 */
// POST /api/auth/login
router.post('/login', validarSenha);

export default router;
