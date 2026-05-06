// Cliente de API para comunicação com o servidor backend
// URL configurada para rede local (tablet e PC na mesma rede)

// Detectar host dinamicamente
const getApiBaseUrl = (): string => {
  const hostname = window.location.hostname;
  const port = '3001';

  // Se estiver em localhost/127.0.0.1, usa localhost
  if (hostname === 'localhost' || hostname === '127.0.0.1') {
    return `http://localhost:${port}/api`;
  }

  // Caso contrário, usa o host atual
  return `http://${hostname}:${port}/api`;
};

const API_BASE_URL = getApiBaseUrl();

// Interface para registros pendentes offline
interface DadosBiometria {
  verificada: boolean;
  score: number;
  hash: string;
  origem: 'web' | 'mobile';
  metodo: 'camera' | 'upload' | 'manual';
}

interface RegistroPendente {
  id?: number;
  funcionario_codigo: string;
  tipo_marcacao_codigo: string;
  observacao?: string;
  biometria?: DadosBiometria;
}

// Abrir IndexedDB para armazenamento offline
function abrirBancoDados(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open('scopum-db', 1);

    request.onerror = () => reject(request.error);
    request.onsuccess = () => resolve(request.result);

    request.onupgradeneeded = (event) => {
      const db = (event.target as IDBOpenDBRequest).result;
      if (!db.objectStoreNames.contains('pending-registros')) {
        db.createObjectStore('pending-registros', { keyPath: 'id', autoIncrement: true });
      }
    };
  });
}

// Salvar registro pendente para sincronização offline
async function salvarRegistroPendente(registro: RegistroPendente): Promise<void> {
  try {
    const db = await abrirBancoDados();
    const transaction = db.transaction(['pending-registros'], 'readwrite');
    const store = transaction.objectStore('pending-registros');
    await new Promise((resolve, reject) => {
      const request = store.add(registro);
      request.onerror = () => reject(request.error);
      request.onsuccess = () => resolve(request.result);
    });
    console.log('[API] Registro salvo para sincronização offline:', registro);
  } catch (error) {
    console.error('[API] Falha ao salvar registro pendente:', error);
  }
}

// Cliente de API estilo Axios
class ClienteAPI {
  async post(endpoint: string, dados: any) {
    try {
      const response = await fetch(`${API_BASE_URL}${endpoint}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(dados),
      });

      const dadosResponse = await response.json();

      if (!response.ok) {
        throw new Error(dadosResponse.mensagem || 'Erro na requisição');
      }

      return { data: dadosResponse, status: response.status };
    } catch (error) {
      console.error('[API] Erro na requisição POST:', error);
      throw error;
    }
  }

  async get(endpoint: string) {
    try {
      const response = await fetch(`${API_BASE_URL}${endpoint}`);
      const dados = await response.json();

      if (!response.ok) {
        throw new Error(dados.mensagem || 'Erro na requisição');
      }

      return { data: dados, status: response.status };
    } catch (error) {
      console.error('[API] Erro na requisição GET:', error);
      throw error;
    }
  }

  // Métodos específicos
  async autenticar(funcionario_codigo: string, senha: string) {
    return this.post('/auth/login', { funcionario_codigo, senha });
  }

  async obterTipos() {
    try {
      const response = await this.get('/ponto/tipos');
      return response.data;
    } catch (error) {
      console.error('[API] Falha ao buscar tipos:', error);
      return [];
    }
  }

  async registrarPonto(
    funcionario_codigo: string,
    tipo_marcacao_codigo: string,
    observacao?: string,
    biometria?: DadosBiometria
  ) {
    const registro = {
      funcionario_codigo,
      tipo_marcacao_codigo,
      observacao,
      biometria,
    };

    try {
      const response = await this.post('/ponto/registrar', registro);
      return response.data;
    } catch (error) {
      // Salvar para sincronização offline se a requisição de rede falhar
      await salvarRegistroPendente(registro as any);
      console.error('[API] Falha ao registrar ponto:', error);
      return {
        sucesso: false,
        mensagem: 'Erro de conexão. O registro será sincronizado quando a conexão for restaurada.',
        offline: true,
      };
    }
  }

  async obterHistorico(funcionario_codigo: string) {
    try {
      const response = await this.get(`/ponto/historico/${funcionario_codigo}`);
      return response.data;
    } catch (error) {
      console.error('[API] Falha ao buscar histórico:', error);
      return [];
    }
  }

  async validarBiometria(funcionario_codigo: string, face_base64: string) {
    return this.post('/biometria/validar', { funcionario_codigo, face_base64 });
  }

  async cadastrarBiometria(funcionario_codigo: string, face_base64: string) {
    return this.post('/biometria/cadastrar', { funcionario_codigo, face_base64 });
  }

  async obterStatusSync() {
    try {
      const response = await this.get('/sync/status');
      return response.data;
    } catch (error) {
      console.error('[API] Falha ao buscar status de sincronização:', error);
      return { sucesso: false, offline: true };
    }
  }

  async sincronizar() {
    return this.post('/sync/sincronizar', {});
  }

  async solicitarSincronizacaoSegundo() {
    if ('serviceWorker' in navigator && 'SyncManager' in window) {
      try {
        const registration = await navigator.serviceWorker.ready;
        // @ts-ignore
        await registration.sync.register('sync-ponto-registros');
        console.log('[API] Sincronização em segundo plano solicitada');
      } catch (error) {
        console.warn('[API] Sincronização em segundo plano não suportada:', error);
      }
    }
  }
}

const API = new ClienteAPI();

export default API;
