import express, { Router } from 'express';
import { validarSenha } from '../controllers/authController';

const router: Router = express.Router();

// POST /api/auth/login
router.post('/login', validarSenha);

export default router;
