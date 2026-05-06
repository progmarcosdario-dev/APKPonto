interface DadosBiometriaNormalizados {
  verificada: boolean;
  score: number;
  hash: string;
  origem: 'web' | 'mobile' | 'desconhecida';
  metodo: 'camera' | 'upload' | 'manual' | 'desconhecido';
}

interface RegistroPontoNormalizado {
  funcionario_codigo?: string;
  tipo_marcacao?: number;
  observacao: string;
  biometria: DadosBiometriaNormalizados;
  erros: string[];
}

const MAPA_TIPO_STRING_PARA_CODIGO: Record<string, number> = {
  entrada: 1,
  inicio: 1,
  inicio_expediente: 1,
  pausa: 2,
  saida_intervalo: 2,
  intervalo_saida: 2,
  retorno: 3,
  retorno_intervalo: 3,
  saida: 4,
  final: 4,
  final_expediente: 4
};

function normalizarTipoMarcacao(valor: unknown): number | undefined {
  if (valor === null || valor === undefined || valor === '') {
    return undefined;
  }

  if (typeof valor === 'number' && Number.isInteger(valor) && valor >= 1 && valor <= 4) {
    return valor;
  }

  if (typeof valor === 'string') {
    const texto = valor.trim().toLowerCase();

    if (/^[1-4]$/.test(texto)) {
      return Number(texto);
    }

    return MAPA_TIPO_STRING_PARA_CODIGO[texto];
  }

  return undefined;
}

function normalizarRegistroPontoPayload(payload: any): RegistroPontoNormalizado {
  const erros: string[] = [];

  const funcionarioRaw = payload?.funcionario_codigo ?? payload?.codigoFuncionario ?? payload?.codigo;
  const funcionario_codigo = funcionarioRaw !== undefined && funcionarioRaw !== null && funcionarioRaw !== ''
    ? String(funcionarioRaw)
    : undefined;

  if (!funcionario_codigo) {
    erros.push('Código do funcionário é obrigatório');
  }

  const tipoRaw = payload?.tipo_marcacao ?? payload?.tipo_marcacao_codigo ?? payload?.tipo;
  const tipo_marcacao = normalizarTipoMarcacao(tipoRaw);

  if (tipoRaw !== undefined && tipoRaw !== null && tipoRaw !== '' && !tipo_marcacao) {
    erros.push('Tipo de marcação inválido');
  }

  const observacaoRaw = payload?.observacao;
  const observacao = typeof observacaoRaw === 'string' ? observacaoRaw : '';

  const biometriaRaw = payload?.biometria ?? {};
  const scoreRaw = biometriaRaw?.score;
  const score = typeof scoreRaw === 'number'
    ? scoreRaw
    : (typeof scoreRaw === 'string' ? Number(scoreRaw) : 0);

  const origemRaw = typeof biometriaRaw?.origem === 'string' ? biometriaRaw.origem.toLowerCase() : 'desconhecida';
  const metodoRaw = typeof biometriaRaw?.metodo === 'string' ? biometriaRaw.metodo.toLowerCase() : 'desconhecido';

  const biometria: DadosBiometriaNormalizados = {
    verificada: biometriaRaw?.verificada === true,
    score: Number.isFinite(score) ? score : 0,
    hash: typeof biometriaRaw?.hash === 'string' ? biometriaRaw.hash : '',
    origem: origemRaw === 'web' || origemRaw === 'mobile' ? origemRaw : 'desconhecida',
    metodo: metodoRaw === 'camera' || metodoRaw === 'upload' || metodoRaw === 'manual' ? metodoRaw : 'desconhecido'
  };

  if (!biometria.verificada) {
    erros.push('Verificação biométrica obrigatória');
  }

  if (biometria.score < 0.7) {
    erros.push('Score biométrico insuficiente');
  }

  if (!biometria.hash) {
    erros.push('Hash biométrico obrigatório');
  }

  return {
    funcionario_codigo,
    tipo_marcacao,
    observacao,
    biometria,
    erros
  };
}

export { normalizarRegistroPontoPayload, normalizarTipoMarcacao };
export type { RegistroPontoNormalizado, DadosBiometriaNormalizados };
