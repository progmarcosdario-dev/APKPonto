# Apta - Controle de Ponto de Funcionários

Sistema moderno e responsivo para controle de ponto de funcionários com sincronização offline/online.

## 🎯 Características

✅ **Autenticação Segura** - Validação de senha contra Firebird
✅ **Offline First** - Funciona sem conexão com banco remoto
✅ **Sincronização Automática** - Sincroniza com Firebird quando reconectado
✅ **Interface Responsiva** - Funciona em desktop e mobile
✅ **Tipos de Marcação Dinâmicos** - Carregados do banco de dados
✅ **Histórico de Pontos** - Registro completo de marcações
✅ **API RESTful** - Backend escalável com Express.js

## 🏗️ Arquitetura

### Estrutura de Pastas

```
APK/
├── BackEnd/                    # Servidor Node.js/Express
│   ├── src/
│   │   ├── index.js           # Servidor principal
│   │   ├── controllers/       # Controllers (autenticação, ponto)
│   │   ├── routes/            # Rotas da API
│   │   ├── services/          # Serviços (sincronização)
│   │   ├── middleware/        # Middleware (autenticação JWT)
│   │   └── database/          # Conexões (SQLite, Firebird)
│   ├── __tests__/             # Testes unitários (Jest)
│   ├── database.db            # SQLite local
│   ├── .env                   # Configuração Firebird
│   ├── package.json
│   └── README.md
│
├── frontend/                  # Aplicação React
│   ├── src/
│   │   ├── components/        # 4 telas principais
│   │   │   ├── Menu.js
│   │   │   ├── PasswordInput.js
│   │   │   ├── PontoRegistration.js
│   │   │   └── SuccessModal.js
│   │   ├── styles/            # CSS por componente
│   │   ├── api/               # Serviços de API
│   │   ├── App.js             # App principal
│   │   └── index.js
│   ├── public/
│   ├── package.json
│   └── README.md
│
├── GUIDE.md                   # Guia de uso detalhado
├── start-servers.bat          # Script para iniciar (Windows CMD)
├── start-servers.ps1          # Script para iniciar (PowerShell)
└── README.md                  # Este arquivo
```

## 🚀 Início Rápido

### Pré-requisitos

- Node.js v20+ (https://nodejs.org)
- npm v10+
- Firebird 2.5+ com banco APTA.FDB configurado
- Windows (PowerShell ou CMD)

### Instalação

1. **Clonar/Descompactar o projeto**

```bash
cd C:\ProjetosNode\APK
```

2. **Instalar dependências do Backend**

```bash
cd BackEnd
npm install
```

3. **Instalar dependências do Frontend**

```bash
cd ..\frontend
npm install
```

### Configuração

1. **Configurar Backend** (BackEnd/.env)

```env
FIREBIRD_DATABASE=C:\Apta\Dados\APTA.FDB
FIREBIRD_USER=SYSDBA
FIREBIRD_PASSWORD=masterkey
FIREBIRD_PORT=3050
```

2. **Inicia servidores**

#### Opção 1: Scripts Automáticos

```bash
# Windows CMD
cd C:\ProjetosNode\APK
start-servers.bat

# PowerShell
.\start-servers.ps1
```

#### Opção 2: Manual (dois terminais)

**Terminal 1 - Backend:**

```bash
cd BackEnd
npm start
# Rodará em http://localhost:3001
```

**Terminal 2 - Frontend:**

```bash
cd frontend
npm start
# Rodará em http://localhost:3000
```

3. **Acessar a aplicação**

- Abrir http://localhost:3000 no navegador

## 📱 Fluxo da Aplicação

```
Tela Inicial (Menu)
    ↓ [Clica em "Ponto"]
Autenticação (Password Input)
    ↓ [Insere senha de 6 dígitos]
    ↓ [Valida contra Firebird]
Registro de Ponto (Form)
    ↓ [Seleciona tipo, data, hora, observação]
    ↓ [Confirma registro]
Confirmação (Success Modal)
    ↓ [Clica OK]
Retorna ao Menu
```

## 🔌 API Endpoints

### Autenticação

```
POST /api/auth/login
Body: { senha: "123456" }
Response: { sucesso: true, funcionario: { codigo, nome, usuario_sistema } }
```

### Tipos de Marcação

```
GET /api/ponto/tipos
Response: { sucesso: true, tipos: [{ codigo, descricao }, ...] }
```

### Registrar Ponto

```
POST /api/ponto/registrar
Body: { funcionario_codigo, tipo_marcacao, data, hora, observacao }
Response: { sucesso: true, mensagem, sincronizado, ponto }
```

### Histórico

```
GET /api/ponto/historico/:codigo
Response: { sucesso: true, historico: [{ ... }, ...] }
```

### Sincronização

```
GET /api/sync/status
POST /api/sync/sincronizar
```

## 🗄️ Banco de Dados

### Firebird Remote (APTA.FDB)

**Tabelas principais:**

- `FUNCIONARIOS` - Dados do funcionário
- `TIPO_MARCACAO` - Tipos de ponto
- `PONTO_FUNCIONARIO` - Histórico de pontos

### SQLite Local (database.db)

**Tabelas espelho (offline-first):**

- `funcionarios`
- `tipo_marcacao`
- `ponto_funcionario`
- `sync_control` - Controle de sincronização

## 🧪 Testes

### Backend

```bash
cd BackEnd
npm test
```

17 testes unitários com 100% de cobertura.

### Frontend

```bash
cd frontend
npm test
```

## 📦 Dependências Principais

### Backend

- **Express** 4.18.2 - Framework web
- **SQLite3** 5.1.6 - Banco local
- **node-firebird** 0.8.6 - Connector Firebird
- **jsonwebtoken** 9.0.0 - JWT auth
- **bcryptjs** 2.4.3 - Password hashing
- **Jest** 29.7.0 - Testing

### Frontend

- **React** 19.2.0 - UI framework
- **axios** 1.13.2 - HTTP client
- **react-router-dom** 7.9.6 - Routing
- **react-scripts** 5.0.1 - Build tools

## 🎨 Design

Inspirado em: https://www.impactoequipamentos.com.br/

- Paleta: Gradiente roxo (#667eea → #764ba2)
- Responsivo para mobile e desktop
- Animações suaves
- Acessibilidade implementada

## 🔒 Segurança

- Validação de senha contra Firebird
- JWT para autenticação (futuro)
- CORS habilitado
- Entrada sanitizada

## 📝 Documentação

- **BackEnd/README.md** - Documentação backend
- **frontend/README.md** - Documentação frontend
- **GUIDE.md** - Guia de uso detalhado
- **Este arquivo** - Overview geral

## 🐛 Troubleshooting

### Porta em uso

```bash
# Mudar porta no BackEnd/.env ou backend código
# Mudar porta no frontend/.env
```

### Firebird não conecta

- Verificar se APTA.FDB existe em C:\Apta\Dados\
- Verificar credenciais em .env
- Usar DBeaver para testar conexão Firebird

### Tipos de Marcação não carregam

- Verificar se TIPO_MARCACAO tem dados
- Consultar logs do backend

## 🚀 Deploy Futuro

- [ ] Docker container
- [ ] Cloud deployment (Heroku, AWS)
- [ ] PWA para mobile
- [ ] CI/CD pipeline

## 📞 Suporte

Para dúvidas ou bugs:

1. Consulte o GUIDE.md
2. Verifique os logs (BackEnd/npm ou browser console)
3. Teste endpoints com Postman
4. Verifique banco de dados com DBeaver

## 📄 Licença

Projeto interno - Apta Sistemas

---

**Status**: ✅ Pronto para uso
**Última atualização**: 19/11/2025
