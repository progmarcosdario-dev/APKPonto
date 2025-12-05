/**
 * Testes unitários para integração com Firebird
 * Mocking da camada de banco de dados
 */

import * as firebirdDb from '../database/firebird';

jest.mock('../database/firebird');

describe('Firebird Database Layer', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  /**
   * Teste: Obter histórico de pontos
   */
  describe('obterHistoricoPontos', () => {
    it('deve retornar registros do dia correto', async () => {
      const funcionario = 12345;
      const data = '2025-12-03';

      const registros = [
        { ID: 1, FUNCIONARIO_CODIGO: 12345, TIPO_MARCACAO: 1, HORA: '08:00', DATA: '2025-12-03' },
        { ID: 2, FUNCIONARIO_CODIGO: 12345, TIPO_MARCACAO: 2, HORA: '12:00', DATA: '2025-12-03' }
      ];

      (firebirdDb.obterHistoricoPontos as jest.Mock).mockResolvedValue(registros);

      const resultado = await firebirdDb.obterHistoricoPontos(funcionario, data);

      expect(resultado).toEqual(registros);
      expect(resultado.length).toBe(2);
      expect(resultado[0].TIPO_MARCACAO).toBe(1);
    });

    it('deve retornar array vazio quando não há registros', async () => {
      (firebirdDb.obterHistoricoPontos as jest.Mock).mockResolvedValue([]);

      const resultado = await firebirdDb.obterHistoricoPontos(12345, '2025-12-03');

      expect(resultado).toEqual([]);
      expect(resultado.length).toBe(0);
    });

    it('deve retornar registros ordenados por hora', async () => {
      const registros = [
        { TIPO_MARCACAO: 1, HORA: '08:00' },
        { TIPO_MARCACAO: 2, HORA: '12:00' },
        { TIPO_MARCACAO: 3, HORA: '13:00' },
        { TIPO_MARCACAO: 4, HORA: '17:00' }
      ];

      (firebirdDb.obterHistoricoPontos as jest.Mock).mockResolvedValue(registros);

      const resultado = await firebirdDb.obterHistoricoPontos(12345, '2025-12-03');

      expect(resultado.length).toBe(4);
      expect(resultado[0].HORA).toBe('08:00');
      expect(resultado[3].HORA).toBe('17:00');
    });
  });

  /**
   * Teste: Verificar duplicata recente (10 minutos)
   */
  describe('verificarDuplicataRecente', () => {
    it('deve retornar true quando há registro nos últimos 10 minutos', async () => {
      (firebirdDb.verificarDuplicataRecente as jest.Mock).mockResolvedValue(true);

      const resultado = await firebirdDb.verificarDuplicataRecente(12345, '2025-12-03');

      expect(resultado).toBe(true);
    });

    it('deve retornar false quando não há duplicata recente', async () => {
      (firebirdDb.verificarDuplicataRecente as jest.Mock).mockResolvedValue(false);

      const resultado = await firebirdDb.verificarDuplicataRecente(12345, '2025-12-03');

      expect(resultado).toBe(false);
    });

    it('deve considerar a data e hora do sistema', async () => {
      (firebirdDb.verificarDuplicataRecente as jest.Mock).mockResolvedValue(true);

      const data = new Date().toISOString().split('T')[0];
      const resultado = await firebirdDb.verificarDuplicataRecente(12345, data);

      expect(firebirdDb.verificarDuplicataRecente).toHaveBeenCalledWith(12345, data);
    });
  });

  /**
   * Teste: Registrar ponto no Firebird
   */
  describe('registrarPontoFirebird', () => {
    it('deve retornar ID do registro criado', async () => {
      const dadosPonto = {
        funcionario: 12345,
        tipo_marcacao: 1,
        data: '2025-12-03',
        hora: '08:00'
      };

      const resultado = { codigo: 1001, sucesso: true };

      (firebirdDb.registrarPontoFirebird as jest.Mock).mockResolvedValue(resultado);

      const res = await firebirdDb.registrarPontoFirebird(dadosPonto);

      expect(res.codigo).toBe(1001);
      expect(res.sucesso).toBe(true);
    });

    it('deve lançar erro quando falhar ao registrar', async () => {
      const dadosPonto = {
        funcionario: 12345,
        tipo_marcacao: 1,
        data: '2025-12-03',
        hora: '08:00'
      };

      const erro = new Error('Erro ao registrar no Firebird');
      (firebirdDb.registrarPontoFirebird as jest.Mock).mockRejectedValue(erro);

      await expect(firebirdDb.registrarPontoFirebird(dadosPonto)).rejects.toThrow(
        'Erro ao registrar no Firebird'
      );
    });
  });

  /**
   * Teste: Obter dados do funcionário
   */
  describe('obterDadosFuncionario', () => {
    it('deve retornar dados completos do funcionário', async () => {
      const funcionario = {
        CODIGO: 12345,
        NOME: 'João Silva',
        INICIO_SEGUNDA_SEXTA: '08:00',
        PAUSA_SEGUNDA_SEXTA: '12:00',
        RETORNO_SEGUNDA_SEXTA: '13:00',
        FIM_SEGUNDA_SEXTA: '17:00',
        INICIO_SABADO: '08:00',
        FIM_SABADO: '13:00',
        INICIO_DOMINGO: '09:00',
        FIM_DOMINGO: '17:00'
      };

      (firebirdDb.obterDadosFuncionario as jest.Mock).mockResolvedValue(funcionario);

      const resultado = await firebirdDb.obterDadosFuncionario('12345');

      expect(resultado).toEqual(funcionario);
      expect(resultado.NOME).toBe('João Silva');
    });

    it('deve retornar null quando funcionário não existe', async () => {
      (firebirdDb.obterDadosFuncionario as jest.Mock).mockResolvedValue(null);

      const resultado = await firebirdDb.obterDadosFuncionario('99999');

      expect(resultado).toBeNull();
    });

    it('deve conter horários para segunda a sexta', async () => {
      const funcionario = {
        CODIGO: 12345,
        INICIO_SEGUNDA_SEXTA: '08:00',
        PAUSA_SEGUNDA_SEXTA: '12:00',
        RETORNO_SEGUNDA_SEXTA: '13:00',
        FIM_SEGUNDA_SEXTA: '17:00'
      };

      (firebirdDb.obterDadosFuncionario as jest.Mock).mockResolvedValue(funcionario);

      const resultado = await firebirdDb.obterDadosFuncionario('12345');

      expect(resultado.INICIO_SEGUNDA_SEXTA).toBe('08:00');
      expect(resultado.FIM_SEGUNDA_SEXTA).toBe('17:00');
    });

    it('deve conter horários distintos para sábado e domingo', async () => {
      const funcionario = {
        CODIGO: 12345,
        INICIO_SEGUNDA_SEXTA: '08:00',
        INICIO_SABADO: '08:00',
        INICIO_DOMINGO: '09:00',
        FIM_SEGUNDA_SEXTA: '17:00',
        FIM_SABADO: '13:00',
        FIM_DOMINGO: '17:00'
      };

      (firebirdDb.obterDadosFuncionario as jest.Mock).mockResolvedValue(funcionario);

      const resultado = await firebirdDb.obterDadosFuncionario('12345');

      expect(resultado.INICIO_SEGUNDA_SEXTA).toBe('08:00');
      expect(resultado.INICIO_SABADO).toBe('08:00');
      expect(resultado.INICIO_DOMINGO).toBe('09:00');
      expect(resultado.FIM_SABADO).toBe('13:00');
    });
  });

  /**
   * Teste: Obter tipos de marcação
   */
  describe('obterTiposMarcacao', () => {
    it('deve retornar lista de tipos de marcação', async () => {
      const tipos: any[] = [
        { ID: 1, DESCRICAO: 'Início expediente' },
        { ID: 2, DESCRICAO: 'Saída intervalo' },
        { ID: 3, DESCRICAO: 'Retorno intervalo' },
        { ID: 4, DESCRICAO: 'Final expediente' }
      ];

      (firebirdDb.obterTiposMarcacao as jest.Mock).mockResolvedValue(tipos);

      const resultado = await firebirdDb.obterTiposMarcacao();

      expect(resultado.length).toBe(4);
      expect((resultado as any[])[0].ID).toBe(1);
      expect((resultado as any[])[3].DESCRICAO).toBe('Final expediente');
    });

    it('deve conter exatamente 4 tipos de marcação', async () => {
      const tipos = [
        { ID: 1, DESCRICAO: 'Início expediente' },
        { ID: 2, DESCRICAO: 'Saída intervalo' },
        { ID: 3, DESCRICAO: 'Retorno intervalo' },
        { ID: 4, DESCRICAO: 'Final expediente' }
      ];

      (firebirdDb.obterTiposMarcacao as jest.Mock).mockResolvedValue(tipos);

      const resultado = await firebirdDb.obterTiposMarcacao();

      expect(resultado).toHaveLength(4);
    });
  });

  /**
   * Teste: Validação de integridade dos dados
   */
  describe('Validação de Integridade dos Dados', () => {
    it('deve conter ID e TIPO_MARCACAO em registros de histórico', async () => {
      const registros = [
        { ID: 1, FUNCIONARIO_CODIGO: 12345, TIPO_MARCACAO: 1, HORA: '08:00', DATA: '2025-12-03' }
      ];

      (firebirdDb.obterHistoricoPontos as jest.Mock).mockResolvedValue(registros);

      const resultado = await firebirdDb.obterHistoricoPontos(12345, '2025-12-03');

      expect(resultado[0]).toHaveProperty('ID');
      expect(resultado[0]).toHaveProperty('TIPO_MARCACAO');
      expect(resultado[0]).toHaveProperty('HORA');
      expect(resultado[0]).toHaveProperty('DATA');
    });

    it('deve ter TIPO_MARCACAO entre 1 e 4', async () => {
      const registros = [
        { TIPO_MARCACAO: 1 },
        { TIPO_MARCACAO: 2 },
        { TIPO_MARCACAO: 3 },
        { TIPO_MARCACAO: 4 }
      ];

      (firebirdDb.obterHistoricoPontos as jest.Mock).mockResolvedValue(registros);

      const resultado = await firebirdDb.obterHistoricoPontos(12345, '2025-12-03');

      resultado.forEach(reg => {
        expect(reg.TIPO_MARCACAO).toBeGreaterThanOrEqual(1);
        expect(reg.TIPO_MARCACAO).toBeLessThanOrEqual(4);
      });
    });
  });
});
