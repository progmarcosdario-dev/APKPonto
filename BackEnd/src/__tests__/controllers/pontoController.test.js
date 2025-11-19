const pontoController = require('../../controllers/pontoController');
const firebirdDb = require('../../database/firebird');
const { db } = require('../../database/db');

jest.mock('../../database/firebird');
jest.mock('../../database/db', () => ({
  db: {
    run: jest.fn((sql, params, callback) => {
      callback(null);
    }),
    all: jest.fn((sql, params, callback) => {
      callback(null, []);
    })
  }
}));

describe('PontoController', () => {
  let req, res;

  beforeEach(() => {
    req = {
      body: {},
      params: {}
    };
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn()
    };
    jest.clearAllMocks();
  });

  describe('obterTiposMarcacao', () => {
    it('deve retornar lista de tipos de marcação', async () => {
      const tipos = [
        { CODIGO: 1, DESCRICAO: 'INICIO EXPEDIENTE' },
        { CODIGO: 2, DESCRICAO: 'SAIDA INTERVALO' }
      ];
      firebirdDb.obterTiposMarcacao.mockResolvedValue(tipos);

      await pontoController.obterTiposMarcacao(req, res);

      expect(res.json).toHaveBeenCalledWith({
        sucesso: true,
        tipos: tipos
      });
    });

    it('deve retornar erro se Firebird falhar', async () => {
      firebirdDb.obterTiposMarcacao.mockRejectedValue(
        new Error('Firebird falhou')
      );

      await pontoController.obterTiposMarcacao(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          sucesso: false
        })
      );
    });
  });

  describe('registrarPonto', () => {
    it('deve retornar erro se funcionario_codigo não for fornecido', async () => {
      req.body = {
        tipo_marcacao: 1,
        observacao: 'teste'
      };

      await pontoController.registrarPonto(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        sucesso: false,
        mensagem: 'Código do funcionário e tipo de marcação são obrigatórios'
      });
    });

    it('deve retornar erro se tipo_marcacao não for fornecido', async () => {
      req.body = {
        funcionario_codigo: 1,
        observacao: 'teste'
      };

      await pontoController.registrarPonto(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        sucesso: false,
        mensagem: 'Código do funcionário e tipo de marcação são obrigatórios'
      });
    });

    it('deve registrar ponto com sucesso e sincronizar com Firebird', async () => {
      req.body = {
        funcionario_codigo: 1,
        tipo_marcacao: 1,
        observacao: 'teste'
      };
      firebirdDb.registrarPontoFirebird.mockResolvedValue({
        codigo: 123,
        sucesso: true
      });
      db.run.mockImplementation((sql, params, callback) => {
        if (callback) callback(null);
      });

      await pontoController.registrarPonto(req, res);

      expect(db.run).toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          sucesso: true
        })
      );
    });

    it('deve registrar localmente se Firebird não estiver disponível', async () => {
      req.body = {
        funcionario_codigo: 1,
        tipo_marcacao: 1,
        observacao: 'teste'
      };
      firebirdDb.registrarPontoFirebird.mockRejectedValue(
        new Error('Firebird indisponível')
      );

      await pontoController.registrarPonto(req, res);

      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          sucesso: true,
          sincronizado: false
        })
      );
    });
  });

  describe('obterHistorico', () => {
    it('deve retornar histórico de pontos do funcionário', async () => {
      req.params = { funcionario_codigo: '1' };
      req.query = {};
      const registros = [
        {
          id: 1,
          funcionario_codigo: 1,
          tipo_marcacao: 1,
          data: '2025-11-19',
          hora: '08:00',
          sincronizado: 1
        }
      ];
      db.all.mockImplementation((sql, params, callback) => {
        if (callback) callback(null, registros);
      });

      await pontoController.obterHistorico(req, res);

      expect(res.json).toHaveBeenCalledWith({
        sucesso: true,
        registros: registros
      });
    });

    it('deve retornar erro ao buscar histórico', async () => {
      req.params = { funcionario_codigo: '1' };
      req.query = {};
      db.all.mockImplementation((sql, params, callback) => {
        if (callback) callback(new Error('Erro no banco'));
      });

      await pontoController.obterHistorico(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({
        sucesso: false,
        mensagem: 'Erro ao buscar histórico'
      });
    });
  });
});
