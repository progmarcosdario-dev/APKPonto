# Sistema de Controle de Ponto - Backend

Backend desenvolvido com Node.js e Express para gerenciar registros de ponto de funcionários com sincronização entre banco local SQLite e Firebird.

## Arquitetura

O sistema utiliza uma arquitetura de sincronização bidirecional:

- **SQLite Local**: Armazena dados em tempo real (offline-first)
- **Firebird Remoto**: Banco de dados central da empresa
- **Sistema de Sincronização**: Sincroniza dados quando há conexão

## Estrutura do Projeto

```
BackEnd/
├── src/
│   ├── index.js                      # Servidor principal
│   ├── controllers/
│   │   ├── authController.js         # Autenticação
│   │   └── pontoController.js        # Registros de ponto
│   ├── routes/
│   │   ├── authRoutes.js             # Rotas /api/auth
│   │   ├── pontoRoutes.js            # Rotas /api/ponto
│   │   └── syncRoutes.js             # Rotas /api/sync
│   ├── services/
│   │   └── syncService.js            # Lógica de sincronização
│   ├── middleware/
│   │   └── autenticacao.js           # JWT middleware
│   └── database/
│       ├── db.js                     # SQLite
│       └── firebird.js               # Firebird
├── package.json
├── .env
└── .gitignore
```

## Instalação e Execução

```bash
# 1. Instalar dependências
cd BackEnd
npm install

# 2. Configurar variáveis de ambiente (.env)
# Editar os dados do Firebird

# 3. Modo desenvolvimento
npm run dev

# 4. Modo produção
npm start
```

## Endpoints da API

### Autenticação

```
POST /api/auth/login
Body: { "email": "agnaldo@test.com", "senha": "123456" }
Response: { "token": "...", "funcionario": {...} }
```

### Registros de Ponto

```
POST /api/ponto/registrar
Headers: Authorization: Bearer <token>
Body: { "funcionario_id": 1, "tipo_ponto": "INICIO_EXPEDIENTE", "observacao": "..." }

GET /api/ponto/historico/:funcionario_id
Headers: Authorization: Bearer <token>
Query: ?data=YYYY-MM-DD
```

### Sincronização

```
GET /api/sync/status
POST /api/sync/sincronizar
Headers: Authorization: Bearer <token>
```

## Tipos de Ponto

- `INICIO_EXPEDIENTE`
- `SAIDA_INTERVALO`
- `RETORNO_INTERVALO`
- `FINAL_EXPEDIENTE`

## Variáveis de Ambiente (.env)

```
PORT=3001
NODE_ENV=development
JWT_SECRET=sua_chave_secreta

# SQLite Local
DATABASE_PATH=./src/database/ponto.db

# Firebird Remoto
FIREBIRD_HOST=localhost
FIREBIRD_PORT=3050
FIREBIRD_DATABASE=C:\\data\\ponto.fdb
FIREBIRD_USER=SYSDBA
FIREBIRD_PASSWORD=masterkey
```

## Fluxo de Funcionamento

1. **Autenticação Local**: Valida senha contra SQLite
2. **Registro de Ponto**: Grava imediatamente no SQLite
3. **Marcação de Sincronização**: Marca como "não sincronizado"
4. **Sincronização Automática**: Quando há conexão com Firebird
5. **Atualização de Status**: Marca como "sincronizado"

## Próximas Etapas

- [ ] Autossincronização periódica
- [ ] Tratamento de conflitos
- [ ] Logs detalhados
- [ ] Testes unitários
- [ ] Validações avançadas
