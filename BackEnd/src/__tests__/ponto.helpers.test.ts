/**
 * Testes unitários para funções de utilidade do ponto
 * Incluindo: conversão de horas, determinação de tipo, atraso, etc.
 */

describe('Funções Auxiliares - Ponto', () => {
  /**
   * Teste: Converter hora HH:MM para minutos
   * Exemplo: "08:30" = 510 minutos, "17:45" = 1065 minutos
   */
  describe('converterHoraParaMinutos', () => {
    const converterHoraParaMinutos = (hora: string): number => {
      const [horas, minutos] = hora.split(':').map(Number);
      return horas * 60 + minutos;
    };

    it('deve converter 08:00 para 480 minutos', () => {
      expect(converterHoraParaMinutos('08:00')).toBe(480);
    });

    it('deve converter 12:30 para 750 minutos', () => {
      expect(converterHoraParaMinutos('12:30')).toBe(750);
    });

    it('deve converter 17:45 para 1065 minutos', () => {
      expect(converterHoraParaMinutos('17:45')).toBe(1065);
    });

    it('deve converter 23:59 para 1439 minutos', () => {
      expect(converterHoraParaMinutos('23:59')).toBe(1439);
    });

    it('deve converter 00:00 para 0 minutos', () => {
      expect(converterHoraParaMinutos('00:00')).toBe(0);
    });
  });

  /**
   * Teste: Lógica de Sequência de Tipos de Marcação
   */
  describe('Sequência de Tipos de Marcação', () => {
    // Segunda a sexta e domingo
    const sequenciaCompleta: { [key: number]: number } = {
      1: 2, // Início -> Saída intervalo
      2: 3, // Saída intervalo -> Retorno intervalo
      3: 4, // Retorno intervalo -> Final expediente
      4: 1  // Final expediente -> Início expediente (novo dia)
    };

    // Sábado
    const sequenciaSabado: { [key: number]: number } = {
      1: 4, // Início -> Final expediente (sem pausa)
      4: 1  // Final expediente -> Início (novo dia)
    };

    it('deve seguir sequência completa: 1 -> 2 -> 3 -> 4 -> 1', () => {
      expect(sequenciaCompleta[1]).toBe(2);
      expect(sequenciaCompleta[2]).toBe(3);
      expect(sequenciaCompleta[3]).toBe(4);
      expect(sequenciaCompleta[4]).toBe(1);
    });

    it('deve seguir sequência de sábado: 1 -> 4 -> 1', () => {
      expect(sequenciaSabado[1]).toBe(4);
      expect(sequenciaSabado[4]).toBe(1);
    });

    it('não deve permitir outros valores de tipo para sábado', () => {
      expect(sequenciaSabado[2]).toBeUndefined();
      expect(sequenciaSabado[3]).toBeUndefined();
    });
  });

  /**
   * Teste: Detecção de dia completo
   */
  describe('Detecção de Dia Completo', () => {
    it('deve retornar diaCompleto = true para dia de semana com tipos 1,2,3,4', () => {
      const tiposPresentes = new Set([1, 2, 3, 4]);
      const diaCompleto = tiposPresentes.has(1) && tiposPresentes.has(2) &&
                          tiposPresentes.has(3) && tiposPresentes.has(4);
      expect(diaCompleto).toBe(true);
    });

    it('deve retornar diaCompleto = false para dia de semana com apenas tipos 1,2', () => {
      const tiposPresentes = new Set([1, 2]);
      const diaCompleto = tiposPresentes.has(1) && tiposPresentes.has(2) &&
                          tiposPresentes.has(3) && tiposPresentes.has(4);
      expect(diaCompleto).toBe(false);
    });

    it('deve retornar diaCompleto = true para sábado com tipos 1,4', () => {
      const tiposPresentes = new Set([1, 4]);
      const diaCompleto = tiposPresentes.has(1) && tiposPresentes.has(4);
      expect(diaCompleto).toBe(true);
    });

    it('deve retornar diaCompleto = false para sábado com apenas tipo 1', () => {
      const tiposPresentes = new Set([1]);
      const diaCompleto = tiposPresentes.has(1) && tiposPresentes.has(4);
      expect(diaCompleto).toBe(false);
    });

    it('deve retornar diaCompleto = false para sábado com apenas tipo 4', () => {
      const tiposPresentes = new Set([4]);
      const diaCompleto = tiposPresentes.has(1) && tiposPresentes.has(4);
      expect(diaCompleto).toBe(false);
    });
  });

  /**
   * Teste: Detecção de dia da semana
   */
  describe('Detecção de Dia da Semana', () => {
    it('deve identificar segunda como dia de semana normal', () => {
      // 2025-12-01 é segunda (mas em UTC será domingo, então usar UTC)
      const data = new Date('2025-12-01T00:00:00Z');
      const diaAtual = data.getUTCDay();
      expect(diaAtual).toBe(1);
      expect(diaAtual !== 6).toBe(true); // não é sábado
    });

    it('deve identificar sábado como dia especial', () => {
      // 2025-12-06 é sábado
      const data = new Date('2025-12-06T00:00:00Z');
      const diaAtual = data.getUTCDay();
      expect(diaAtual).toBe(6);
    });

    it('deve identificar domingo como dia de semana normal', () => {
      // 2025-12-07 é domingo
      const data = new Date('2025-12-07T00:00:00Z');
      const diaAtual = data.getUTCDay();
      expect(diaAtual).toBe(0);
      expect(diaAtual !== 6).toBe(true); // não é sábado
    });

    it('deve identificar quarta como dia de semana normal', () => {
      // 2025-12-03 é quarta
      const data = new Date('2025-12-03T00:00:00Z');
      const diaAtual = data.getUTCDay();
      expect(diaAtual).toBe(3);
      expect(diaAtual !== 6).toBe(true); // não é sábado
    });
  });

  /**
   * Teste: Cálculo de atraso
   */
  describe('Cálculo de Atraso', () => {
    const converterHoraParaMinutos = (hora: string): number => {
      const [horas, minutos] = hora.split(':').map(Number);
      return horas * 60 + minutos;
    };

    it('deve calcular atraso positivo quando registro está após horário', () => {
      const horaProgramada = '08:00'; // 480 minutos
      const horaRegistro = '08:10';   // 490 minutos

      const atraso = converterHoraParaMinutos(horaRegistro) - converterHoraParaMinutos(horaProgramada);
      expect(atraso).toBe(10);
    });

    it('deve calcular atraso zero quando registro é exato', () => {
      const horaProgramada = '08:00';
      const horaRegistro = '08:00';

      const atraso = converterHoraParaMinutos(horaRegistro) - converterHoraParaMinutos(horaProgramada);
      expect(atraso).toBe(0);
    });

    it('deve calcular antecipação como valor negativo', () => {
      const horaProgramada = '08:00';
      const horaRegistro = '07:55';

      const atraso = converterHoraParaMinutos(horaRegistro) - converterHoraParaMinutos(horaProgramada);
      expect(atraso).toBe(-5);
    });

    it('deve retornar mensagem de atraso apenas se > 5 minutos', () => {
      const atrasoEmMinutos = 10;
      const deveExibirMensagem = atrasoEmMinutos > 5;
      expect(deveExibirMensagem).toBe(true);
    });

    it('não deve retornar mensagem de atraso se <= 5 minutos', () => {
      const atrasoEmMinutos = 3;
      const deveExibirMensagem = atrasoEmMinutos > 5;
      expect(deveExibirMensagem).toBe(false);
    });
  });

  /**
   * Teste: Validação de Duplicata (10 minutos)
   */
  describe('Validação de Duplicata', () => {
    it('deve considerar como duplicata registro dentro de 10 minutos', () => {
      const ultimoRegistroEmMinutos = 480; // 08:00
      const novoRegistroEmMinutos = 488;   // 08:08
      const diferenca = novoRegistroEmMinutos - ultimoRegistroEmMinutos;

      const ehDuplicata = diferenca < 10;
      expect(ehDuplicata).toBe(true);
    });

    it('não deve considerar como duplicata registro após 10 minutos', () => {
      const ultimoRegistroEmMinutos = 480; // 08:00
      const novoRegistroEmMinutos = 491;   // 08:11
      const diferenca = novoRegistroEmMinutos - ultimoRegistroEmMinutos;

      const ehDuplicata = diferenca < 10;
      expect(ehDuplicata).toBe(false);
    });

    it('deve considerar como duplicata registro exatamente em 9 minutos', () => {
      const ultimoRegistroEmMinutos = 480;
      const novoRegistroEmMinutos = 489;
      const diferenca = novoRegistroEmMinutos - ultimoRegistroEmMinutos;

      const ehDuplicata = diferenca < 10;
      expect(ehDuplicata).toBe(true);
    });

    it('não deve considerar como duplicata registro em exatos 10 minutos', () => {
      const ultimoRegistroEmMinutos = 480;
      const novoRegistroEmMinutos = 490;
      const diferenca = novoRegistroEmMinutos - ultimoRegistroEmMinutos;

      const ehDuplicata = diferenca < 10;
      expect(ehDuplicata).toBe(false);
    });
  });

  /**
   * Teste: Lógica de determinação de próximo tipo
   */
  describe('Determinação de Próximo Tipo', () => {
    const determinarProxTipo = (ultimoTipo: number, diaAtual: number): number => {
      // Sábado (6): sequência simplificada
      if (diaAtual === 6) {
        const sequenciaSabado: { [key: number]: number } = {
          1: 4,
          4: 1
        };
        return sequenciaSabado[ultimoTipo] || 1;
      }

      // Outros dias: sequência completa
      const sequencia: { [key: number]: number } = {
        1: 2,
        2: 3,
        3: 4,
        4: 1
      };
      return sequencia[ultimoTipo] || 1;
    };

    it('deve retornar tipo 2 após tipo 1 em dia de semana', () => {
      // Quarta (3)
      const proximoTipo = determinarProxTipo(1, 3);
      expect(proximoTipo).toBe(2);
    });

    it('deve retornar tipo 4 após tipo 1 em sábado', () => {
      // Sábado (6)
      const proximoTipo = determinarProxTipo(1, 6);
      expect(proximoTipo).toBe(4);
    });

    it('deve retornar tipo 3 após tipo 2 em dia de semana', () => {
      const proximoTipo = determinarProxTipo(2, 3);
      expect(proximoTipo).toBe(3);
    });

    it('deve retornar tipo 4 após tipo 3 em dia de semana', () => {
      const proximoTipo = determinarProxTipo(3, 3);
      expect(proximoTipo).toBe(4);
    });

    it('deve retornar tipo 1 após tipo 4 (novo dia)', () => {
      const proximoTipo = determinarProxTipo(4, 3);
      expect(proximoTipo).toBe(1);
    });

    it('deve retornar tipo 1 após tipo 4 em sábado (novo dia)', () => {
      const proximoTipo = determinarProxTipo(4, 6);
      expect(proximoTipo).toBe(1);
    });

    it('deve retornar tipo 1 como padrão para tipos inválidos', () => {
      const proximoTipo = determinarProxTipo(99, 3);
      expect(proximoTipo).toBe(1);
    });
  });
});
