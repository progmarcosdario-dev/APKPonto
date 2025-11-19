# Apta - Controle de Ponto | Guia de Uso

## Status Atual

✅ **Backend**: Rodando em `http://localhost:3001`
✅ **Frontend**: Rodando em `http://localhost:3000`
✅ **SQLite Local**: Conectado
✅ **Firebird Remote**: Conectado ao C:\Apta\Dados\APTA.FDB

## Fluxo de Uso

### 1. Tela Inicial (Menu)

- Aplicação carrega com tela inicial "Apta"
- Botão "Ponto" inicia o processo de registro

### 2. Autenticação (Password)

- Diálogo modal para inserir senha de 6 dígitos
- Senha é validada contra o banco Firebird (tabela FUNCIONARIOS, campo SENHA_SISTEMA)
- Após validação: retorna dados do funcionário (código, nome)

**Funcionários de Teste disponíveis no Firebird:**

- Use qualquer SENHA_SISTEMA válida da tabela FUNCIONARIOS
- Exemplo: Se há um funcionário com SENHA_SISTEMA = "123456"

### 3. Registro de Ponto (Ponto Registration)

Após autenticação, formulário com campos:

**Tipo de Marcação** (obtido de TIPO_MARCACAO)

- Radio buttons com opções dinâmicas
- Valores típicos: Entrada, Saída, Pausa, Retorno

**Data**

- Campo date com padrão de hoje
- Editável para registrar pontos retroativos

**Hora**

- Campo time com padrão da hora atual
- HH:MM format

**Observação**

- Campo textarea opcional
- Para notas adicionais (atraso, justificativa, etc.)

**Submissão**

- Botão "Confirmar" envia para POST /api/ponto/registrar
- Dados salvos localmente (SQLite)
- Tentativa automática de sincronização com Firebird
- Status: sincronizado ou pendente (offline)

### 4. Confirmação (Success Modal)

- Modal com confirmação "Ponto Registrado com Sucesso"
- Exibe mensagem da API
- Botão OK retorna à tela inicial

## Endpoints API Utilizados

### Autenticação

```
POST /api/auth/login
Body: { senha: "123456" }
Response: {
  sucesso: true,
  funcionario: {
    codigo: 1,
    nome: "João Silva",
    usuario_sistema: "joao"
  }
}
```

### Obter Tipos de Marcação

```
GET /api/ponto/tipos
Response: {
  sucesso: true,
  tipos: [
    { codigo: 1, descricao: "Entrada" },
    { codigo: 2, descricao: "Saída" },
    { codigo: 3, descricao: "Pausa" },
    { codigo: 4, descricao: "Retorno" }
  ]
}
```

### Registrar Ponto

```
POST /api/ponto/registrar
Body: {
  funcionario_codigo: 1,
  tipo_marcacao: 1,
  data: "2025-11-19",
  hora: "14:30",
  observacao: "Entrada normal"
}
Response: {
  sucesso: true,
  mensagem: "Ponto registrado com sucesso",
  sincronizado: true,
  ponto: { ... dados salvos ... }
}
```

## Estrutura de Bancos de Dados

### SQLite Local (C:\ProjetosNode\APK\BackEnd\database.db)

Tabelas espelho do Firebird para operação offline:

- `funcionarios` - Cópia de FUNCIONARIOS
- `tipo_marcacao` - Cópia de TIPO_MARCACAO
- `ponto_funcionario` - Registros de ponto locais
- `sync_control` - Controle de sincronização

### Firebird Remote (C:\Apta\Dados\APTA.FDB)

Tabelas principais:

- `FUNCIONARIOS` - Dados do funcionário (CODIGO, NOME, USUARIO_SISTEMA, SENHA_SISTEMA)
- `TIPO_MARCACAO` - Tipos de ponto (CODIGO, DESCRICAO)
- `PONTO_FUNCIONARIO` - Histórico de pontos (CODIGO, FUNCIONARIO, DATA, HORA, TIPO_MARCACAO, OBSERVACAO, HORA_SISTEMA)

## Comportamento Offline

Se o Firebird não estiver disponível:

1. Ponto registrado localmente (SQLite)
2. Campo `sincronizado: false` marcado
3. Mensagem de alerta ao usuário (opcional)
4. Tentativa automática de sincronização quando reconectado

## Teste Rápido

1. **Abrir http://localhost:3000**

   - Deve ver tela com "Apta" e botão "Ponto"

2. **Clicar em "Ponto"**

   - Abre diálogo de senha

3. **Inserir senha**

   - Exemplo: "123456" (ajuste conforme FUNCIONARIOS do seu Firebird)

4. **Após autenticação**

   - Formulário de registro com opções dinâmicas

5. **Preencher e confirmar**

   - Deve ver modal de sucesso

6. **Clicar OK**
   - Retorna ao menu inicial

## Troubleshooting

### "Erro ao conectar. Verifique a conexão com o servidor"

- Verificar se backend está rodando: `npm start` em BackEnd/
- Verificar porta 3001 está disponível

### "Senha inválida"

- Verificar SENHA_SISTEMA no banco FUNCIONARIOS
- Firebird: `SELECT * FROM FUNCIONARIOS`

### "Não foi possível carregar tipos de marcação"

- Verificar endpoint `/api/ponto/tipos`
- Verificar se tipos existem em TIPO_MARCACAO

### Tipos de Marcação não aparecem

- Consultar backend logs
- Verificar dados em TIPO_MARCACAO
- Firebird: `SELECT * FROM TIPO_MARCACAO`

## Estrutura de Diretórios

```
C:\ProjetosNode\APK\
├── BackEnd/                 # Servidor Node.js + Express
│   ├── src/
│   ├── database.db         # SQLite local
│   ├── package.json
│   └── .env                # Config Firebird
├── frontend/               # Aplicação React
│   ├── src/
│   │   ├── components/
│   │   │   ├── Menu.js
│   │   │   ├── PasswordInput.js
│   │   │   ├── PontoRegistration.js
│   │   │   └── SuccessModal.js
│   │   └── styles/
│   ├── public/
│   ├── package.json
│   └── README.md
└── README.md               # Este arquivo
```

## Próximas Melhorias

- [ ] Armazenamento local (localStorage) para modo offline completo
- [ ] Sincronização background automática
- [ ] Histórico de pontos registrados
- [ ] Edição/Cancelamento de pontos
- [ ] Notificações de sincronização
- [ ] Dark mode
- [ ] Suporte a múltiplos idiomas
- [ ] Integração com PWA para instalação no mobile

## Suporte

Para dúvidas ou problemas, consulte:

- Backend: `BackEnd/README.md`
- Frontend: `frontend/README.md`
