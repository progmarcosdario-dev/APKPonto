# 📮 Scopum - Coleção Postman

Arquivo de coleção Postman para testar todas as APIs do Sistema Scopum de Controle de Ponto.

## 📥 Como Importar

### Passo 1: Baixar Postman

- Acesse: https://www.postman.com/downloads/
- Instale a versão para seu sistema operacional

### Passo 2: Importar a Coleção

1. Abra o Postman
2. Clique em **"Import"** (canto superior esquerdo)
3. Selecione a aba **"File"**
4. Navegue até: `C:\ProjetosNode\APK\Scopum-API-Postman.json`
5. Clique em **"Open"**
6. Clique em **"Import"**

### Passo 3: Verificar Variáveis

1. Clique na coleção **"Scopum - Controle de Ponto"**
2. Vá para a aba **"Variables"**
3. Verifique se `base_url` está como: `http://localhost:3001`

## 🧪 Endpoints Disponíveis

### 1️⃣ **Autenticação**

#### POST /api/auth/login

Autentica funcionário usando senha de 6 dígitos

**Request Body:**

```json
{
  "senha": "123456"
}
```

**Response (200):**

```json
{
  "sucesso": true,
  "funcionario": {
    "codigo": 1,
    "nome": "João Silva",
    "usuario_sistema": "joao"
  }
}
```

**Status Codes:**

- `200` - Autenticação bem-sucedida
- `401` - Senha inválida
- `500` - Erro ao conectar Firebird

---

### 2️⃣ **Tipos de Marcação**

#### GET /api/ponto/tipos

Retorna lista de tipos de marcação disponíveis

**Parameters:** Nenhum

**Response (200):**

```json
{
  "sucesso": true,
  "tipos": [
    {
      "codigo": 1,
      "descricao": "Entrada"
    },
    {
      "codigo": 2,
      "descricao": "Saída"
    },
    {
      "codigo": 3,
      "descricao": "Pausa"
    },
    {
      "codigo": 4,
      "descricao": "Retorno"
    }
  ]
}
```

**Status Codes:**

- `200` - Tipos retornados com sucesso
- `500` - Erro ao buscar tipos

---

### 3️⃣ **Registrar Ponto**

#### POST /api/ponto/registrar

Registra novo ponto de funcionário

**Request Body:**

```json
{
  "funcionario_codigo": 1,
  "tipo_marcacao": 1,
  "data": "2025-11-19",
  "hora": "14:30",
  "observacao": "Entrada normal"
}
```

**Response (200):**

```json
{
  "sucesso": true,
  "mensagem": "Ponto registrado com sucesso",
  "sincronizado": true,
  "ponto": {
    "id": 1,
    "funcionario_codigo": 1,
    "tipo_marcacao": 1,
    "data": "2025-11-19",
    "hora": "14:30",
    "observacao": "Entrada normal",
    "sincronizado": 1,
    "criado_em": "2025-11-19 14:30:00"
  }
}
```

**Status Codes:**

- `200` - Ponto registrado com sucesso
- `400` - Dados inválidos
- `500` - Erro ao registrar

---

### 4️⃣ **Histórico de Pontos**

#### GET /api/ponto/historico/:codigo

Retorna histórico de pontos de um funcionário

**Parameters:**

- `:codigo` - Código do funcionário (ex: 1)

**Example URL:** `http://localhost:3001/api/ponto/historico/1`

**Response (200):**

```json
{
  "sucesso": true,
  "funcionario_codigo": 1,
  "historico": [
    {
      "id": 1,
      "funcionario_codigo": 1,
      "tipo_marcacao": 1,
      "data": "2025-11-19",
      "hora": "14:30",
      "observacao": "Entrada normal",
      "sincronizado": 1,
      "criado_em": "2025-11-19 14:30:00"
    }
  ]
}
```

**Status Codes:**

- `200` - Histórico retornado com sucesso
- `404` - Funcionário não encontrado
- `500` - Erro ao buscar histórico

---

### 5️⃣ **Status de Sincronização**

#### GET /api/sync/status

Retorna status de sincronização com Firebird

**Parameters:** Nenhum

**Response (200):**

```json
{
  "sucesso": true,
  "pendentes": 0,
  "sincronizado": true,
  "mensagem": "Todos os dados estão sincronizados"
}
```

**Status Codes:**

- `200` - Status retornado com sucesso
- `500` - Erro ao buscar status

---

### 6️⃣ **Forçar Sincronização**

#### POST /api/sync/sincronizar

Força sincronização manual de registros pendentes

**Request Body:**

```json
{}
```

**Response (200):**

```json
{
  "sucesso": true,
  "sincronizados": 2,
  "mensagem": "Sincronização concluída com sucesso"
}
```

**Status Codes:**

- `200` - Sincronização realizada
- `500` - Erro ao sincronizar

---

## 🎯 Fluxo de Teste Recomendado

### Teste Completo (Order)

1. **POST /api/auth/login**

   - Insira a senha do funcionário
   - Anote o `codigo` retornado

2. **GET /api/ponto/tipos**

   - Veja os tipos disponíveis
   - Escolha um código

3. **POST /api/ponto/registrar**

   - Use o código do passo 1
   - Use um tipo do passo 2
   - Preenchha data, hora, observação

4. **GET /api/ponto/historico/:codigo**

   - Use o código do passo 1
   - Verifique se aparece o ponto registrado

5. **GET /api/sync/status**

   - Verifique se está sincronizado

6. **POST /api/sync/sincronizar** (Opcional)
   - Force sincronização se houver pendências

---

## 🔧 Pré-requisitos

- ✅ Postman instalado
- ✅ Backend rodando em `http://localhost:3001`
- ✅ Firebird conectado (ou funciona offline)

## 🚀 Iniciar Backend

```bash
cd C:\ProjetosNode\APK\BackEnd
npm start
```

Você deve ver:

```
Servidor rodando na porta 3001
Conectado ao banco de dados SQLite local
Conectado com sucesso ao banco Firebird
```

---

## 🧪 Testes Unitários (Jest)

Para executar os testes unitários:

```bash
cd C:\ProjetosNode\APK\BackEnd
npm test
```

Esperado:

```
PASS  src/__tests__/controllers/authController.test.js
PASS  src/__tests__/controllers/pontoController.test.js
PASS  src/__tests__/services/syncService.test.js

Test Suites: 3 passed, 3 total
Tests:       17 passed, 17 total
```

---

## 💡 Dicas Úteis

### Editar Variáveis

1. Clique em **Collections** → **Scopum - Controle de Ponto**
2. Vá para aba **Variables**
3. Altere `base_url` se necessário

### Exemplo de Teste com Dados Diferentes

1. Vá para **POST /api/ponto/registrar**
2. Na aba **Body**, mude:
   - `funcionario_codigo`
   - `tipo_marcacao`
   - `data`
   - `hora`

### Ver Histórico de Respostas

1. Após executar um request
2. Clique em **Console** (canto inferior)
3. Veja logs e respostas

### Testar Erros

Para testar validação de erro:

1. **Login** com senha inválida (ex: "000000")
2. **Registrar ponto** com dados inválidos
3. **Ver histórico** de funcionário inexistente

---

## 📝 Estrutura da Coleção

```
Scopum - Controle de Ponto
├── Autenticação
│   └── Login
├── Ponto - Tipos
│   └── Obter Tipos de Marcação
├── Ponto - Registro
│   └── Registrar Novo Ponto
├── Ponto - Histórico
│   └── Obter Histórico de Pontos
└── Sincronização
    ├── Status de Sincronização
    └── Forçar Sincronização
```

---

## 🐛 Troubleshooting

### Erro: "Could not get any response"

**Solução:**

- Verificar se backend está rodando
- Verificar se a porta 3001 está aberta
- Verificar se `base_url` está correto

### Erro: "Senha inválida"

**Solução:**

- Verificar SENHA_SISTEMA no Firebird
- Testar com uma senha válida da tabela FUNCIONARIOS

### Erro: "Cannot GET /api/ponto/tipos"

**Solução:**

- Verificar se endpoint é GET (não POST)
- Verificar se URL está correta

### Tipos de Marcação vazios

**Solução:**

- Verificar se tabela TIPO_MARCACAO tem dados no Firebird
- Consultar: `SELECT * FROM TIPO_MARCACAO`

---

## 📚 Documentação Completa

- Backend: `BackEnd/README.md`
- Frontend: `frontend/README.md`
- Guia: `GUIDE.md`
- Testes: `TESTING.md`

---

## ✅ Checklist de Testes

- [ ] Login bem-sucedido
- [ ] Login com senha inválida (erro)
- [ ] Obter tipos (retorna lista)
- [ ] Registrar ponto (sucesso)
- [ ] Registrar ponto com dados inválidos (erro)
- [ ] Obter histórico
- [ ] Verificar status sync
- [ ] Forçar sincronização

---

**Data:** 19/11/2025
**Versão:** 1.0.0
**Status:** ✅ Pronto para testes
