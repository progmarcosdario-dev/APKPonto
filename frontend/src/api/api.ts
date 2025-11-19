// API client for communicating with the backend server
const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:3001/api';

// Pending records for offline support
interface PendingRecord {
  id?: number;
  funcionario_codigo: string;
  tipo_marcacao_codigo: string;
  observacao?: string;
}

// Open IndexedDB for offline storage
function openDatabase(): Promise<IDBDatabase> {
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

// Save pending record for offline sync
async function savePendingRecord(record: PendingRecord): Promise<void> {
  try {
    const db = await openDatabase();
    const transaction = db.transaction(['pending-registros'], 'readwrite');
    const store = transaction.objectStore('pending-registros');
    await new Promise((resolve, reject) => {
      const request = store.add(record);
      request.onerror = () => reject(request.error);
      request.onsuccess = () => resolve(request.result);
    });
    console.log('[API] Record saved for offline sync:', record);
  } catch (error) {
    console.error('[API] Failed to save pending record:', error);
  }
}

// Axios-style API client
class APIClient {
  async post(endpoint: string, data: any) {
    try {
      const response = await fetch(`${API_BASE_URL}${endpoint}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });

      const responseData = await response.json();

      if (!response.ok) {
        throw new Error(responseData.mensagem || 'Request failed');
      }

      return { data: responseData, status: response.status };
    } catch (error) {
      console.error('[API] POST request failed:', error);
      throw error;
    }
  }

  async get(endpoint: string) {
    try {
      const response = await fetch(`${API_BASE_URL}${endpoint}`);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.mensagem || 'Request failed');
      }

      return { data, status: response.status };
    } catch (error) {
      console.error('[API] GET request failed:', error);
      throw error;
    }
  }

  // Specific methods
  async login(funcionario_codigo: string, senha: string) {
    return this.post('/auth/login', { funcionario_codigo, senha });
  }

  async getTipos() {
    try {
      const response = await this.get('/ponto/tipos');
      return response.data;
    } catch (error) {
      console.error('[API] Failed to fetch tipos:', error);
      return [];
    }
  }

  async registrarPonto(
    funcionario_codigo: string,
    tipo_marcacao_codigo: string,
    observacao?: string
  ) {
    const record = {
      funcionario_codigo,
      tipo_marcacao_codigo,
      observacao,
    };

    try {
      const response = await this.post('/ponto/registrar', record);
      return response.data;
    } catch (error) {
      // Save for offline sync if network request fails
      await savePendingRecord(record as any);
      console.error('[API] Failed to register ponto:', error);
      return {
        sucesso: false,
        mensagem: 'Erro de conexão. O registro será sincronizado quando a conexão for restaurada.',
        offline: true,
      };
    }
  }

  async getHistorico(funcionario_codigo: string) {
    try {
      const response = await this.get(`/ponto/historico/${funcionario_codigo}`);
      return response.data;
    } catch (error) {
      console.error('[API] Failed to fetch historico:', error);
      return [];
    }
  }

  async getSyncStatus() {
    try {
      const response = await this.get('/sync/status');
      return response.data;
    } catch (error) {
      console.error('[API] Failed to fetch sync status:', error);
      return { sucesso: false, offline: true };
    }
  }

  async sincronizar() {
    return this.post('/sync/sincronizar', {});
  }

  async requestBackgroundSync() {
    if ('serviceWorker' in navigator && 'SyncManager' in window) {
      try {
        const registration = await navigator.serviceWorker.ready;
        // @ts-ignore
        await registration.sync.register('sync-ponto-registros');
        console.log('[API] Background sync requested');
      } catch (error) {
        console.warn('[API] Background sync not supported:', error);
      }
    }
  }
}

const API = new APIClient();

export default API;
