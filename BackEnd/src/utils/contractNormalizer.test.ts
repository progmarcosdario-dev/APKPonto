import { normalizarRegistroPontoPayload, normalizarTipoMarcacao } from './contractNormalizer';

describe('contractNormalizer', () => {
  describe('normalizarTipoMarcacao', () => {
    it('deve normalizar tipo numerico em string', () => {
      expect(normalizarTipoMarcacao('1')).toBe(1);
      expect(normalizarTipoMarcacao('4')).toBe(4);
    });

    it('deve normalizar aliases de tipo do mobile', () => {
      expect(normalizarTipoMarcacao('entrada')).toBe(1);
      expect(normalizarTipoMarcacao('pausa')).toBe(2);
      expect(normalizarTipoMarcacao('retorno')).toBe(3);
      expect(normalizarTipoMarcacao('saida')).toBe(4);
    });

    it('deve retornar undefined para tipo invalido', () => {
      expect(normalizarTipoMarcacao('desconhecido')).toBeUndefined();
      expect(normalizarTipoMarcacao(8)).toBeUndefined();
    });
  });

  describe('normalizarRegistroPontoPayload', () => {
    it('deve normalizar payload web atual', () => {
      const resultado = normalizarRegistroPontoPayload({
        funcionario_codigo: '1001',
        tipo_marcacao_codigo: '2',
        observacao: 'teste',
        biometria: {
          verificada: true,
          score: 0.91,
          hash: 'abc123',
          origem: 'web',
          metodo: 'camera'
        }
      });

      expect(resultado).toEqual({
        funcionario_codigo: '1001',
        tipo_marcacao: 2,
        observacao: 'teste',
        biometria: {
          verificada: true,
          score: 0.91,
          hash: 'abc123',
          origem: 'web',
          metodo: 'camera'
        },
        erros: []
      });
    });

    it('deve normalizar payload mobile atual', () => {
      const resultado = normalizarRegistroPontoPayload({
        codigoFuncionario: '2002',
        tipo: 'entrada',
        biometria: {
          verificada: true,
          score: '0.88',
          hash: 'hash-mobile',
          origem: 'mobile',
          metodo: 'camera'
        }
      });

      expect(resultado).toEqual({
        funcionario_codigo: '2002',
        tipo_marcacao: 1,
        observacao: '',
        biometria: {
          verificada: true,
          score: 0.88,
          hash: 'hash-mobile',
          origem: 'mobile',
          metodo: 'camera'
        },
        erros: []
      });
    });

    it('deve retornar erro quando codigo nao for informado', () => {
      const resultado = normalizarRegistroPontoPayload({
        tipo: 'entrada',
        biometria: { verificada: true, score: 0.9, hash: 'x', origem: 'web', metodo: 'camera' }
      });
      expect(resultado.erros).toContain('Código do funcionário é obrigatório');
    });

    it('deve retornar erro quando tipo informado for invalido', () => {
      const resultado = normalizarRegistroPontoPayload({
        funcionario_codigo: '123',
        tipo: 'abc',
        biometria: { verificada: true, score: 0.9, hash: 'x', origem: 'web', metodo: 'camera' }
      });
      expect(resultado.erros).toContain('Tipo de marcação inválido');
    });

    it('deve retornar erros quando biometria nao for valida', () => {
      const resultado = normalizarRegistroPontoPayload({
        funcionario_codigo: '123',
        tipo: 'entrada',
        biometria: {
          verificada: false,
          score: 0.3,
          hash: ''
        }
      });
      expect(resultado.erros).toContain('Verificação biométrica obrigatória');
      expect(resultado.erros).toContain('Score biométrico insuficiente');
      expect(resultado.erros).toContain('Hash biométrico obrigatório');
    });

    it('deve retornar erros quando biometria nao for enviada', () => {
      const resultado = normalizarRegistroPontoPayload({
        funcionario_codigo: '123',
        tipo: 'entrada'
      });
      expect(resultado.erros).toContain('Verificação biométrica obrigatória');
    });
  });
});