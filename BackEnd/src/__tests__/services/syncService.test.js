const syncService = require('../../services/syncService');
const { db } = require('../../database/db');

jest.mock('../../database/db');
jest.mock('../../database/firebird');

describe('SyncService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('registrarAcaoSync', () => {
    it('deve registrar ação de sincronização', async () => {
      db.run.mockImplementation((sql, params, callback) => {
        callback(null);
      });

      await syncService.registrarAcaoSync('ponto_funcionario', 1, 'INSERT');

      expect(db.run).toHaveBeenCalledWith(
        expect.stringContaining('INSERT OR IGNORE INTO sync_control'),
        expect.any(Array),
        expect.any(Function)
      );
    });
  });
});
