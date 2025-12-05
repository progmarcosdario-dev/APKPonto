import { Request, Response } from 'express';
import { db } from '../database/db';
import * as firebirdDb from '../database/firebird';
import logger from '../utils/logger';

// Função auxiliar: Verificar se há registro nos últimos 10 minutos (consultando Firebird)
async function verificarDuplicataRecente(funcionario_codigo: string, dataRegistro: string): Promise<boolean> {
  try {
    return await firebirdDb.verificarDuplicataRecente(parseInt(funcionario_codigo), dataRegistro);
  } catch (erro: any) {
    console.error('Erro ao verificar duplicata:', erro.message);
    throw erro;
  }
}

// Função auxiliar: Calcular atraso em minutos
async function calcularAtraso(
  funcionario_codigo: string,
  tipoMarcacao: number,
  horaRegistro: string,
  dataRegistro: string
): Promise<{ minutos: number; mensagem: string | null }> {
  return new Promise(async (resolve, reject) => {
    try {
      // Buscar dados do funcionário no Firebird
      const funcionario = await firebirdDb.obterDadosFuncionario(funcionario_codigo);

      if (!funcionario) {
        resolve({ minutos: 0, mensagem: null });
        return;
      }

      const horaRegistroEmMinutos = converterHoraParaMinutos(horaRegistro);
      let atraso = 0;
      let mensagem: string | null = null;

      // Tipo 1: Início expediente (segunda a sexta)
      if (tipoMarcacao === 1) {
        const diaAtual = new Date(dataRegistro).getDay(); // 0 = domingo, 6 = sábado
        let horaConfigurada = '';

        if (diaAtual === 0) {
          // Domingo
          horaConfigurada = funcionario.INICIO_DOMINGO;
        } else if (diaAtual === 6) {
          // Sábado
          horaConfigurada = funcionario.INICIO_SABADO;
        } else {
          // Segunda a sexta
          horaConfigurada = funcionario.INICIO_SEGUNDA_SEXTA;
        }

        if (horaConfigurada) {
          const horaConfiguradaEmMinutos = converterHoraParaMinutos(horaConfigurada);
          atraso = horaRegistroEmMinutos - horaConfiguradaEmMinutos;

          // Só exibe mensagem se atraso > 5 minutos
          if (atraso > 5) {
            mensagem = `Ponto batido com ${atraso} minutos de atraso.`;
          }
        }
      }

      // Tipo 3: Retorno de pausa (buscar do Firebird)
      else if (tipoMarcacao === 3) {
        try {
          // Buscar histórico de pontos do Firebird para obter a saída (tipo 2)
          const registrosPontos = await firebirdDb.obterHistoricoPontos(parseInt(funcionario_codigo), dataRegistro);

          console.log(`[calcularAtraso TIPO 3] Funcionário: ${funcionario_codigo}, Total registros: ${registrosPontos?.length || 0}`);

          // Encontrar o último registro de tipo 2 (saída intervalo)
          const registroSaida = registrosPontos.find((r: any) => r.TIPO_MARCACAO === 2);

          console.log(`[calcularAtraso TIPO 3] Registro saída encontrado: ${registroSaida ? 'SIM' : 'NÃO'}`);
          if (registroSaida) {
            console.log(`[calcularAtraso TIPO 3] Hora saída: ${registroSaida.HORA}`);
          }

          if (registroSaida) {
            const diaAtual = new Date(dataRegistro).getDay();
            let horaConfigurada = '';
            let horaRetornoConfigurada = '';

            if (diaAtual === 0) {
              horaConfigurada = funcionario.PAUSA_DOMINGO;
              horaRetornoConfigurada = funcionario.RETORNO_DOMINGO;
            } else if (diaAtual === 6) {
              horaConfigurada = funcionario.PAUSA_SABADO;
              horaRetornoConfigurada = funcionario.RETORNO_SABADO;
            } else {
              horaConfigurada = funcionario.PAUSA_SEGUNDA_SEXTA;
              horaRetornoConfigurada = funcionario.RETORNO_SEGUNDA_SEXTA;
            }

            console.log(`[calcularAtraso TIPO 3] Pausa conf: ${horaConfigurada}, Retorno conf: ${horaRetornoConfigurada}`);

            if (horaConfigurada && horaRetornoConfigurada) {
              const horaSaidaEmMinutos = converterHoraParaMinutos(registroSaida.HORA);
              const horaConfiguradaEmMinutos = converterHoraParaMinutos(horaConfigurada);
              const horaRetornoConfiguradaEmMinutos = converterHoraParaMinutos(horaRetornoConfigurada);

              // Calcular intervalo configurado
              const intervaloConfigurado = horaRetornoConfiguradaEmMinutos - horaConfiguradaEmMinutos;

              // Calcular intervalo real (saída até retorno)
              const intervaloReal = horaRegistroEmMinutos - horaSaidaEmMinutos;

              // Calcular atraso (diferença em relação ao intervalo)
              // Se intervaloReal > intervaloConfigurado = retorno atrasado
              // Se intervaloReal < intervaloConfigurado = retorno cedo
              atraso = intervaloReal - intervaloConfigurado;

              console.log(`[calcularAtraso TIPO 3] Hora registro em min: ${horaRegistroEmMinutos}, Hora saída em min: ${horaSaidaEmMinutos}`);
              console.log(`[calcularAtraso TIPO 3] Intervalo configurado: ${intervaloConfigurado}, Intervalo real: ${intervaloReal}`);
              console.log(`[calcularAtraso TIPO 3] Diferença: ${atraso} minutos (positivo = atrasado, negativo = cedo)`);

              // Só exibe mensagem se atraso > 5 minutos (retorno atrasado)
              if (atraso > 5) {
                mensagem = `Retorno com ${atraso} minutos de atraso.`;
                console.log(`[calcularAtraso TIPO 3] Mensagem gerada: ${mensagem}`);
              } else if (atraso < -5) {
                mensagem = `Retorno ${Math.abs(atraso)} minutos antes do horário.`;
                console.log(`[calcularAtraso TIPO 3] Retorno cedo - Sem alertas`);
              } else {
                console.log(`[calcularAtraso TIPO 3] Retorno dentro do intervalo permitido`);
              }
            } else {
              console.log(`[calcularAtraso TIPO 3] Horários não configurados`);
            }
          } else {
            console.log(`[calcularAtraso TIPO 3] Nenhum registro de saída (tipo 2) encontrado`);
          }
        } catch (erro: any) {
          console.error('Erro ao calcular atraso do tipo 3:', erro.message);
        }
      }

      // Tipo 4: Final de expediente (sem verificação de atraso)
      else if (tipoMarcacao === 4) {
        // Sem lógica de atraso para final de expediente
      }

      resolve({ minutos: Math.max(0, atraso), mensagem });
    } catch (erro: any) {
      console.error('Erro ao calcular atraso:', erro);
      resolve({ minutos: 0, mensagem: null });
    }
  });
}

// Função auxiliar: Converter hora HH:MM para minutos
function converterHoraParaMinutos(hora: string): number {
  const [horas, minutos] = hora.split(':').map(Number);
  return horas * 60 + minutos;
}

// Função auxiliar: Determinar próximo tipo de marcação automaticamente
async function determinarProxTipoMarcacao(funcionario_codigo: string, dataRegistro: string): Promise<number> {
  try {
    const registros = await firebirdDb.obterHistoricoPontos(parseInt(funcionario_codigo), dataRegistro);

    console.log(`[determinarProxTipoMarcacao] Funcionário ${funcionario_codigo}, Data: ${dataRegistro}, Registros: ${registros?.length || 0}`);

    // Se não há registros, começa com tipo 1 (Início expediente)
    if (!registros || registros.length === 0) {
      console.log(`[determinarProxTipoMarcacao] Nenhum registro encontrado, retornando tipo 1 (Início expediente)`);
      return 1;
    }

    const diaAtual = new Date(dataRegistro).getDay(); // 0 = domingo, 6 = sábado
    const ultimoRegistro = registros[registros.length - 1];
    const ultimoTipo = ultimoRegistro.TIPO_MARCACAO;

    // Para sábado (6): sequência simplificada 1 -> 4 -> 1
    if (diaAtual === 6) {
      const sequenciaSabado: { [key: number]: number } = {
        1: 4, // Início -> Final expediente (sem pausa)
        4: 1  // Final expediente -> Início (novo dia)
      };
      const proximoTipo = sequenciaSabado[ultimoTipo] || 1;
      console.log(`[determinarProxTipoMarcacao] Sábado - Último tipo: ${ultimoTipo}, Próximo tipo: ${proximoTipo}`);
      return proximoTipo;
    }

    // Para outros dias (segunda a sexta e domingo): sequência completa 1 -> 2 -> 3 -> 4 -> 1
    const sequencia: { [key: number]: number } = {
      1: 2, // Início -> Saída intervalo
      2: 3, // Saída intervalo -> Retorno intervalo
      3: 4, // Retorno intervalo -> Final expediente
      4: 1  // Final expediente -> Início expediente (novo dia)
    };

    const proximoTipo = sequencia[ultimoTipo] || 1;
    console.log(`[determinarProxTipoMarcacao] Último tipo: ${ultimoTipo}, Próximo tipo: ${proximoTipo}`);
    return proximoTipo;
  } catch (erro: any) {
    console.error('Erro ao determinar próximo tipo:', erro.message);
    throw erro;
  }
}

// Obter tipos de marcação
async function obterTiposMarcacao(req: Request, res: Response): Promise<any> {
  try {
    logger.info('Buscando tipos de marcação');
    const tipos = await firebirdDb.obterTiposMarcacao();
    logger.info('Tipos de marcação obtidos com sucesso', { quantidade: tipos?.length });
    res.json({
      sucesso: true,
      tipos: tipos || []
    });
  } catch (erro: any) {
    logger.error('Erro ao obter tipos de marcação', { erro: erro.message });
    res.status(500).json({
      sucesso: false,
      mensagem: 'Erro ao obter tipos de marcação',
      erro: erro.message
    });
  }
}

// Registrar ponto - Com validação e auto-seleção de tipo
async function registrarPonto(req: Request, res: Response): Promise<any> {
  const { funcionario_codigo } = req.body;

  if (!funcionario_codigo) {
    return res.status(400).json({
      sucesso: false,
      mensagem: 'Código do funcionário é obrigatório'
    });
  }

  try {
    // Usar data/hora do cliente ou gerar automaticamente
    const agora = new Date();
    const dataRegistro = agora.toISOString().split('T')[0];
    const horaRegistro = agora.toTimeString().slice(0, 5);

    // VALIDAÇÃO 1: Verificar duplicata nos últimos 10 minutos (consultando Firebird)
    // Para agora vamos verificar no SQLite também se houver (cache local)
    const temDuplicataRecente = await verificarDuplicataRecente(funcionario_codigo, dataRegistro);
    if (temDuplicataRecente) {
      return res.status(400).json({
        sucesso: false,
        mensagem: 'Você já bateu o ponto nos últimos 10 minutos',
        erro: 'DUPLICATA_10_MINUTOS'
      });
    }

    // DETERMINAÇÃO DO TIPO: Auto-selecionar o tipo
    const tipoMarcacao = await determinarProxTipoMarcacao(funcionario_codigo, dataRegistro);
    console.log(`[pontoController] Tipo de marcação auto-selecionado: ${tipoMarcacao}`);

    console.log(`[pontoController] Dados recebidos: func=${funcionario_codigo}, tipo=${tipoMarcacao}, data=${dataRegistro}, hora=${horaRegistro}`);

    // Calcular atraso (se houver)
    const { minutos: minutosAtraso, mensagem: mensagemAtraso } = await calcularAtraso(
      funcionario_codigo,
      tipoMarcacao,
      horaRegistro,
      dataRegistro
    );

    // GRAVAR DIRETO NO FIREBIRD (ÚNICA FONTE DE VERDADE)
    try {
      const resultado = await firebirdDb.registrarPontoFirebird({
        funcionario: parseInt(funcionario_codigo),
        tipo_marcacao: tipoMarcacao,
        data: dataRegistro,
        hora: horaRegistro,
        observacao: ''
      });

      console.log(`[pontoController] Ponto registrado no Firebird com sucesso. Código: ${resultado.codigo}`);
      console.log(`[pontoController] Mensagem de atraso: ${mensagemAtraso}`);
      console.log(`[pontoController] Minutosatraso: ${minutosAtraso}`);

      return res.status(201).json({
        sucesso: true,
        mensagem: 'Ponto registrado com sucesso',
        codigo_ponto: resultado.codigo,
        tipo_marcacao: tipoMarcacao,
        atraso: mensagemAtraso ? { minutos: minutosAtraso, mensagem: mensagemAtraso } : null
      });
    } catch (firebaseErr: any) {
      console.error(`[pontoController] Erro ao gravar no Firebird:`, firebaseErr.message);

      return res.status(500).json({
        sucesso: false,
        mensagem: 'Erro ao registrar ponto no Firebird',
        erro: firebaseErr.message
      });
    }
  } catch (erro: any) {
    console.error(`[pontoController] Erro geral:`, erro.message);
    res.status(500).json({
      sucesso: false,
      mensagem: 'Erro ao registrar ponto',
      erro: erro.message
    });
  }
}

// Obter próximo tipo de marcação recomendado
async function obterProximoTipo(req: Request, res: Response): Promise<any> {
  const { funcionario_codigo } = req.params;
  const { data } = req.query;

  if (!funcionario_codigo) {
    return res.status(400).json({
      sucesso: false,
      mensagem: 'Código do funcionário é obrigatório'
    });
  }

  try {
    const dataRegistro = (data as string) || new Date().toISOString().split('T')[0];
    const registros = await firebirdDb.obterHistoricoPontos(parseInt(funcionario_codigo), dataRegistro);

    // Verificar se já completou o dia
    const tiposPresentes = new Set(registros.map((r: any) => r.TIPO_MARCACAO));
    const diaAtual = new Date(dataRegistro).getDay(); // 0 = domingo, 6 = sábado

    // Sábado precisa apenas de 2 tipos (1 e 4)
    // Outros dias precisam de 4 tipos (1, 2, 3, 4)
    const diaCompleto = diaAtual === 6
      ? tiposPresentes.has(1) && tiposPresentes.has(4)
      : tiposPresentes.has(1) && tiposPresentes.has(2) && tiposPresentes.has(3) && tiposPresentes.has(4);

    if (diaCompleto) {
      return res.json({
        sucesso: true,
        diaCompleto: true,
        mensagem: 'Você já bateu todos os pontos do dia',
        tipo_marcacao: null
      });
    }

    const proximoTipo = await determinarProxTipoMarcacao(funcionario_codigo, dataRegistro);

    res.json({
      sucesso: true,
      diaCompleto: false,
      tipo_marcacao: proximoTipo,
      descricao: {
        1: 'Início expediente',
        2: 'Saída intervalo',
        3: 'Retorno intervalo',
        4: 'Final expediente'
      }[proximoTipo] || 'Tipo desconhecido'
    });
  } catch (erro: any) {
    res.status(500).json({
      sucesso: false,
      mensagem: 'Erro ao determinar próximo tipo',
      erro: erro.message
    });
  }
}

// Obter histórico de ponto do Firebird
async function obterHistorico(req: Request, res: Response): Promise<any> {
  const { funcionario_codigo } = req.params;
  const { data } = req.query;

  if (!funcionario_codigo) {
    return res.status(400).json({
      sucesso: false,
      mensagem: 'Código do funcionário é obrigatório'
    });
  }

  try {
    const dataRegistro = (data as string) || new Date().toISOString().split('T')[0];
    const registros = await firebirdDb.obterHistoricoPontos(parseInt(funcionario_codigo), dataRegistro);

    res.json({
      sucesso: true,
      registros: registros || []
    });
  } catch (erro: any) {
    res.status(500).json({
      sucesso: false,
      mensagem: 'Erro ao buscar histórico',
      erro: erro.message
    });
  }
}

export {
  obterTiposMarcacao,
  registrarPonto,
  obterHistorico,
  obterProximoTipo
};
