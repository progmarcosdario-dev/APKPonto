import axios, { AxiosInstance, AxiosResponse } from 'axios';

interface DadosPonto {
  tipo: string;
  timestamp: string;
}

interface RespostaAPI {
  data: any;
  status: number;
}

// URL base do API - Alterado para localhost (será necesário configurar no ambiente)
const API_URL = 'http://localhost:3001/api';

const instanciaAPI: AxiosInstance = axios.create({
  baseURL: API_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

class APICliente {
  async obterFuncionarios(): Promise<RespostaAPI> {
    const resposta: AxiosResponse = await instanciaAPI.get('/funcionarios');
    return { data: resposta.data, status: resposta.status };
  }

  async autenticar(senha: string): Promise<RespostaAPI> {
    const resposta: AxiosResponse = await instanciaAPI.post('/auth/login', {
      senha,
    });
    return { data: resposta.data, status: resposta.status };
  }

  async registrarPonto(codigoFuncionario: string, tipo: string): Promise<RespostaAPI> {
    const resposta: AxiosResponse = await instanciaAPI.post('/ponto/registrar', {
      codigoFuncionario,
      tipo,
      timestamp: new Date().toISOString(),
    });
    return { data: resposta.data, status: resposta.status };
  }

  async sincronizar(): Promise<RespostaAPI> {
    const resposta: AxiosResponse = await instanciaAPI.post('/sync/sincronizar');
    return { data: resposta.data, status: resposta.status };
  }
}

export default new APICliente();
