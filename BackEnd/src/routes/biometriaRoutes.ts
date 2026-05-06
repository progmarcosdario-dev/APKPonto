import express, { Router } from 'express';
import { cadastrarBiometria, validarBiometria } from '../controllers/biometriaController';

const router: Router = express.Router();

router.post('/cadastrar', cadastrarBiometria);
router.post('/validar', validarBiometria);

export default router;
