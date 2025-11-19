# 📮 Como Importar Scopum Collection no Postman

## ⚡ Quick Start (1 minuto)

### Passo 1: Copie o Arquivo

```
Arquivo: C:\ProjetosNode\APK\Scopum-API-Postman.json
```

### Passo 2: Abra Postman

- Clique em **"Import"** (canto superior esquerdo)

![import-button]

### Passo 3: Selecione o Arquivo

- Tab: **File**
- Navegue até: `Scopum-API-Postman.json`
- Clique: **Open**

### Passo 4: Confirme

- Clique: **Import**

**Pronto! ✅ Coleção importada!**

---

## 📁 Estrutura da Coleção

```
Scopum - Controle de Ponto
│
├── Autenticação
│   └── POST /api/auth/login
│
├── Ponto - Tipos
│   └── GET /api/ponto/tipos
│
├── Ponto - Registro
│   └── POST /api/ponto/registrar
│
├── Ponto - Histórico
│   └── GET /api/ponto/historico/:codigo
│
└── Sincronização
    ├── GET /api/sync/status
    └── POST /api/sync/sincronizar
```

---

## 🧪 Teste Rápido

### 1️⃣ Testar Autenticação

```
POST http://localhost:3001/api/auth/login

Body:
{
  "senha": "123456"
}

Expected: 200 OK
{
  "sucesso": true,
  "funcionario": { "codigo": 1, "nome": "..." }
}
```

### 2️⃣ Testar Tipos

```
GET http://localhost:3001/api/ponto/tipos

Expected: 200 OK
{
  "sucesso": true,
  "tipos": [
    { "codigo": 1, "descricao": "Entrada" },
    { "codigo": 2, "descricao": "Saída" },
    ...
  ]
}
```

### 3️⃣ Testar Registro

```
POST http://localhost:3001/api/ponto/registrar

Body:
{
  "funcionario_codigo": 1,
  "tipo_marcacao": 1,
  "data": "2025-11-19",
  "hora": "14:30",
  "observacao": "Teste"
}

Expected: 200 OK
{
  "sucesso": true,
  "mensagem": "Ponto registrado com sucesso",
  "sincronizado": true
}
```

---

## 🎯 Casos de Uso

### Caso 1: Teste Completo

**Objetivo:** Simular fluxo completo do usuário

**Passos:**

1. POST /api/auth/login → Obter `codigo`
2. GET /api/ponto/tipos → Ver tipos disponíveis
3. POST /api/ponto/registrar → Registrar ponto
4. GET /api/ponto/historico/:codigo → Ver histórico
5. GET /api/sync/status → Verificar sincronização

### Caso 2: Teste de Erro

**Objetivo:** Validar tratamento de erro

**Testar:**

- ❌ POST /api/auth/login com senha "000000"
- ❌ POST /api/ponto/registrar com dados inválidos
- ❌ GET /api/ponto/historico/999 (inexistente)

### Caso 3: Teste de Sincronização

**Objetivo:** Validar sync

**Passos:**

1. GET /api/sync/status
2. Se há pendências, POST /api/sync/sincronizar
3. GET /api/sync/status novamente

---

## 🔧 Configuração de Variáveis

### Ver Variáveis

1. Clique: **Collections** → **Scopum - Controle de Ponto**
2. Tab: **Variables**

### Editar Base URL

```
Variable: base_url
Value:    http://localhost:3001
```

Mudar para outra porta? (ex: 3002)

```
Variable: base_url
Value:    http://localhost:3002
```

---

## 💡 Dicas Profissionais

### ✅ Usar Tests Automáticos

Adicionar validações automáticas aos requests:

1. Abra um request
2. Tab: **Tests**
3. Cole:

```javascript
pm.test("Status code é 200", function () {
  pm.response.to.have.status(200);
});

pm.test("Response tem 'sucesso'", function () {
  var jsonData = pm.response.json();
  pm.expect(jsonData.sucesso).to.equal(true);
});
```

### ✅ Usar Pre-request Scripts

Executar código antes de cada request:

1. Tab: **Pre-request Script**
2. Cole:

```javascript
console.log("Iniciando teste de " + pm.request.url);
console.log("Timestamp: " + new Date().toISOString());
```

### ✅ Usar Environments

Criar ambiente específico:

1. Clique: **Environments**
2. Novo: **Create Environment**
3. Defina variáveis por ambiente (dev, teste, produção)

---

## 🚨 Troubleshooting Postman

### Erro: "Could not get any response"

```
Problema:  Backend não está rodando
Solução:   npm start em BackEnd/
Verificar: http://localhost:3001 no navegador
```

### Erro: "Senha inválida"

```
Problema:  Senha não existe no Firebird
Solução:   Verificar FUNCIONARIOS.SENHA_SISTEMA
Query:     SELECT * FROM FUNCIONARIOS LIMIT 5
```

### Erro: "Tipo de Marcação não encontrado"

```
Problema:  tipo_marcacao não existe
Solução:   GET /api/ponto/tipos e use código válido
Exemplo:   "tipo_marcacao": 1 (Entrada)
```

### 401 Unauthorized

```
Problema:  Erro de autenticação
Solução:   Verificar se senha está correta
          Verificar resposta do /api/auth/login
```

---

## 📊 Fluxo Visual

```
┌─────────────────────────┐
│  Postman Import         │
└────────────┬────────────┘
             │
             ↓
┌─────────────────────────┐
│  Selecionar JSON File   │
└────────────┬────────────┘
             │
             ↓
┌─────────────────────────┐
│  Import Collection      │
└────────────┬────────────┘
             │
             ↓
┌─────────────────────────┐
│  Verificar Base URL     │
│  (http://localhost:3001)│
└────────────┬────────────┘
             │
             ↓
┌─────────────────────────┐
│  Executar Testes        │
│  POST /api/auth/login   │
│  GET /api/ponto/tipos   │
│  POST /api/ponto/...    │
│  GET /api/sync/status   │
└────────────┬────────────┘
             │
             ↓
┌─────────────────────────┐
│  ✅ Sistema Validado!   │
└─────────────────────────┘
```

---

## 🎓 Exemplos de Requests

### Exemplo 1: Autenticação com Sucesso

```bash
POST http://localhost:3001/api/auth/login
Content-Type: application/json

{
  "senha": "123456"
}

# Response:
{
  "sucesso": true,
  "funcionario": {
    "codigo": 1,
    "nome": "João Silva",
    "usuario_sistema": "joao"
  }
}
```

### Exemplo 2: Autenticação com Erro

```bash
POST http://localhost:3001/api/auth/login
Content-Type: application/json

{
  "senha": "000000"
}

# Response:
{
  "sucesso": false,
  "mensagem": "Senha inválida"
}
```

### Exemplo 3: Registrar Ponto (Online)

```bash
POST http://localhost:3001/api/ponto/registrar
Content-Type: application/json

{
  "funcionario_codigo": 1,
  "tipo_marcacao": 1,
  "data": "2025-11-19",
  "hora": "14:30:45",
  "observacao": "Entrada no escritório"
}

# Response:
{
  "sucesso": true,
  "mensagem": "Ponto registrado com sucesso",
  "sincronizado": true,
  "ponto": {
    "id": 1,
    "funcionario_codigo": 1,
    "tipo_marcacao": 1,
    "data": "2025-11-19",
    "hora": "14:30:45",
    "observacao": "Entrada no escritório",
    "sincronizado": 1,
    "criado_em": "2025-11-19 14:30:45"
  }
}
```

### Exemplo 4: Registrar Ponto (Offline)

```bash
POST http://localhost:3001/api/ponto/registrar
Content-Type: application/json

{
  "funcionario_codigo": 1,
  "tipo_marcacao": 1,
  "data": "2025-11-19",
  "hora": "14:30",
  "observacao": "Sem internet"
}

# Response (sem Firebird):
{
  "sucesso": true,
  "mensagem": "Ponto registrado localmente",
  "sincronizado": false,
  "ponto": { ... }
}
```

### Exemplo 5: Obter Histórico

```bash
GET http://localhost:3001/api/ponto/historico/1

# Response:
{
  "sucesso": true,
  "funcionario_codigo": 1,
  "historico": [
    {
      "id": 1,
      "funcionario_codigo": 1,
      "tipo_marcacao": 1,
      "data": "2025-11-19",
      "hora": "14:30:45",
      "observacao": "Entrada",
      "sincronizado": 1,
      "criado_em": "2025-11-19 14:30:45"
    },
    {
      "id": 2,
      "funcionario_codigo": 1,
      "tipo_marcacao": 2,
      "data": "2025-11-19",
      "hora": "18:30:00",
      "observacao": "Saída",
      "sincronizado": 1,
      "criado_em": "2025-11-19 18:30:00"
    }
  ]
}
```

---

## ✅ Checklist de Testes Postman

- [ ] Importar coleção
- [ ] Verificar base_url (localhost:3001)
- [ ] POST /api/auth/login (senha válida) → 200
- [ ] POST /api/auth/login (senha inválida) → 401
- [ ] GET /api/ponto/tipos → 200, retorna lista
- [ ] POST /api/ponto/registrar → 200, salva
- [ ] GET /api/ponto/historico/1 → 200, retorna histórico
- [ ] GET /api/sync/status → 200
- [ ] POST /api/sync/sincronizar → 200

---

## 📞 Suporte

**Problema?** Consulte:

1. `POSTMAN.md` - Guia completo
2. `GUIDE.md` - Guia de uso
3. `BackEnd/README.md` - Docs técnicas

**Dúvida sobre endpoint?** Veja exemplos em `Scopum-API-Postman.json`

---

**Pronto para testar! 🚀**

Data: 19/11/2025
Versão: 1.0.0
