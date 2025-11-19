const authController = require('../../controllers/authController');
const firebirdDb = require('../../database/firebird');
const { db } = require('../../database/db');

// Mock do firebird
jest.mock('../../database/firebird');

// Mock do database
jest.mock('../../database/db', () => ({
  db: {
    run: jest.fn((sql, params, callback) => {
      callback(null);
    })
  }
}));

describe('AuthController', () => {
  let req, res;

  beforeEach(() => {
    req = {
      body: {}
    };
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn()
    };
    jest.clearAllMocks();
  });

  describe('validarSenha', () => {
    it('deve retornar erro se senha não for fornecida', async () => {
      req.body = { senha: '' };

      await authController.validarSenha(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        sucesso: false,
        mensagem: 'Senha é obrigatória'
      });
    });

    it('deve retornar erro se senha não tiver 6 dígitos', async () => {
      req.body = { senha: '12345' };

      await authController.validarSenha(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        sucesso: false,
        mensagem: 'Senha deve ter 6 dígitos'
      });
    });

    it('deve retornar erro se funcionário não existir', async () => {
      req.body = { senha: '123456' };
      firebirdDb.buscarFuncionarioPorSenha.mockResolvedValue(null);

      await authController.validarSenha(req, res);

      expect(res.status).toHaveBeenCalledWith(401);
      expect(res.json).toHaveBeenCalledWith({
        sucesso: false,
        mensagem: 'Senha inválida'
      });
    });

    it('deve retornar dados do funcionário se autenticação for bem-sucedida', async () => {
      req.body = { senha: '123456' };
      const funcionario = {
        CODIGO: 1,
        NOME: 'Agnaldo',
        USUARIO_SISTEMA: 'agnaldo'
      };
      firebirdDb.buscarFuncionarioPorSenha.mockResolvedValue(funcionario);

      await authController.validarSenha(req, res);

      expect(res.json).toHaveBeenCalledWith({
        sucesso: true,
        mensagem: 'Autenticação realizada com sucesso',
        funcionario: {
          codigo: 1,
          nome: 'Agnaldo',
          usuario_sistema: 'agnaldo'
        }
      });
    });

    it('deve cachear funcionário no SQLite local', async () => {
      req.body = { senha: '123456' };
      const funcionario = {
        CODIGO: 1,
        NOME: 'Agnaldo',
        USUARIO_SISTEMA: 'agnaldo'
      };
      firebirdDb.buscarFuncionarioPorSenha.mockResolvedValue(funcionario);

      await authController.validarSenha(req, res);

      expect(db.run).toHaveBeenCalled();
      expect(db.run.mock.calls[0][0]).toContain('INSERT OR REPLACE INTO funcionarios');
    });

    it('deve retornar erro se Firebird não responder', async () => {
      req.body = { senha: '123456' };
      firebirdDb.buscarFuncionarioPorSenha.mockRejectedValue(
        new Error('Firebird indisponível')
      );

      await authController.validarSenha(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          sucesso: false,
          mensagem: 'Erro ao validar senha'
        })
      );
    });
  });
});
