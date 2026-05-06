import { criarHashBiometria } from '../services/biometriaService';

jest.mock('../database/db', () => ({
  db: {
    get: jest.fn(),
    run: jest.fn()
  }
}));

import { db } from '../database/db';

jest.mock('../utils/logger');

describe('biometriaService', () => {
  describe('criarHashBiometria', () => {
    it('deve gerar hash sha256 a partir de string base64', () => {
      const hash = criarHashBiometria('abc123base64==');
      expect(typeof hash).toBe('string');
      expect(hash.length).toBe(64);
    });

    it('deve remover prefixo data:image/ antes de gerar hash', () => {
      const base64 = 'abc123';
      const hashSemPrefixo = criarHashBiometria(base64);
      const hashComPrefixo = criarHashBiometria(`data:image/jpeg;base64,${base64}`);
      expect(hashSemPrefixo).toBe(hashComPrefixo);
    });

    it('deve retornar hashes diferentes para imagens diferentes', () => {
      const hash1 = criarHashBiometria('imagem1');
      const hash2 = criarHashBiometria('imagem2');
      expect(hash1).not.toBe(hash2);
    });

    it('deve retornar o mesmo hash para a mesma imagem', () => {
      const hash1 = criarHashBiometria('imagemfixa==');
      const hash2 = criarHashBiometria('imagemfixa==');
      expect(hash1).toBe(hash2);
    });
  });

  describe('verificarBiometria', () => {
    const { verificarBiometria } = jest.requireActual('../services/biometriaService');

    it('deve retornar verificada=false quando nao ha template cadastrado', async () => {
      (db.get as jest.Mock).mockImplementation((_sql: string, _params: any[], cb: Function) => {
        cb(null, null);
      });

      const resultado = await verificarBiometria(12345, 'face-base64');
      expect(resultado.verificada).toBe(false);
      expect(resultado.motivo).toBe('BIOMETRIA_NAO_CADASTRADA');
    });

    it('deve retornar verificada=true quando hash corresponde ao template', async () => {
      const base64 = 'face-correta';
      const { criarHashBiometria: calcularHash } = jest.requireActual('../services/biometriaService');
      const hashEsperado = calcularHash(base64);

      (db.get as jest.Mock).mockImplementation((_sql: string, _params: any[], cb: Function) => {
        cb(null, { hash_biometria: hashEsperado });
      });

      const resultado = await verificarBiometria(12345, base64);
      expect(resultado.verificada).toBe(true);
      expect(resultado.score).toBeGreaterThan(0.9);
    });

    it('deve retornar verificada=false quando hash nao corresponde', async () => {
      (db.get as jest.Mock).mockImplementation((_sql: string, _params: any[], cb: Function) => {
        cb(null, { hash_biometria: 'hash-de-outro-funcionario' });
      });

      const resultado = await verificarBiometria(12345, 'face-errada');
      expect(resultado.verificada).toBe(false);
      expect(resultado.motivo).toBe('FACE_NAO_CORRESPONDE');
    });
  });

  describe('registrarTemplateBiometrico', () => {
    const { registrarTemplateBiometrico } = jest.requireActual('../services/biometriaService');

    it('deve persistir hash calculado corretamente', async () => {
      (db.run as jest.Mock).mockImplementation((_sql: string, _params: any[], cb: Function) => {
        cb(null);
      });

      const resultado = await registrarTemplateBiometrico(12345, 'nova-face==');
      expect(typeof resultado.hash).toBe('string');
      expect(resultado.hash.length).toBe(64);
    });
  });
});
