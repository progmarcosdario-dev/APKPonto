# Teste Completo da Aplicação Apta

## 📋 Checklist de Testes

### ✅ Backend

- [x] Servidor inicia em localhost:3001
- [x] SQLite conecta e cria tabelas
- [x] Firebird conecta com sucesso
- [x] 17 testes unitários passando (100%)
- [x] Endpoints retornam dados corretos

### ✅ Frontend

- [x] Servidor React inicia em localhost:3000
- [x] Componentes carregam sem erros
- [x] CSS responsivo aplicado
- [x] Animações funcionam

## 🧪 Teste Passo a Passo

### 1. Iniciar Servidores

**Windows CMD:**

```bash
cd C:\ProjetosNode\APK
start-servers.bat
```

**PowerShell:**

```bash
cd C:\ProjetosNode\APK
.\start-servers.ps1
```

**Manual:**

```bash
# Terminal 1
cd C:\ProjetosNode\APK\BackEnd && npm start

# Terminal 2 (outro prompt)
cd C:\ProjetosNode\APK\frontend && npm start
```

**Resultado esperado:**

```
Backend:  "Servidor rodando na porta 3001"
Frontend: "Compiled successfully!"
```

### 2. Verificar Conectividade

**Backend:**

```bash
curl http://localhost:3001/api/ponto/tipos
```

Esperado: Lista de tipos de marcação em JSON

**Frontend:**

```
Abrir http://localhost:3000 no navegador
```

Esperado: Tela inicial com "Apta" e botão "Ponto"

### 3. Testar Fluxo Completo

#### Passo 1: Menu Inicial

- [ ] Aplicação carrega
- [ ] Titulo "Apta" visível
- [ ] Botão "Ponto" disponível

#### Passo 2: Autenticação

- [ ] Clicar "Ponto"
- [ ] Diálogo de senha aparece
- [ ] Inserir: `123456` (ou senha válida do seu Firebird)
- [ ] Clique "OK"

**Se falhar:** "Senha inválida"

- Verificar senha na tabela FUNCIONARIOS do Firebird
- Query: `SELECT CODIGO, NOME, SENHA_SISTEMA FROM FUNCIONARIOS LIMIT 5`

#### Passo 3: Registro de Ponto

- [ ] Após autenticação, formulário aparece
- [ ] Nome do funcionário exibido
- [ ] Tipos de Marcação carregados (radios)
- [ ] Data com valor de hoje
- [ ] Hora com valor atual
- [ ] Campo Observação vazio

**Tipos esperados:**

```
○ Entrada
○ Saída
○ Pausa
○ Retorno
```

#### Passo 4: Preenchimento do Formulário

- [ ] Selecionar tipo: "Entrada"
- [ ] Data: deixar como hoje
- [ ] Hora: deixar como atual (ou mudar)
- [ ] Observação: "Teste de entrada normal"
- [ ] Clique "Confirmar"

#### Passo 5: Confirmação

- [ ] Modal "Ponto Registrado com Sucesso" aparece
- [ ] Animação checkmark visível
- [ ] Clique "OK"

#### Passo 6: Retorno ao Menu

- [ ] Volta para tela inicial "Apta"
- [ ] Pronto para novo registro

## 🔍 Verificações de Dados

### No Backend (Terminal)

```bash
# Verificar if ponto foi inserido no SQLite
sqlite3 BackEnd\database.db "SELECT * FROM ponto_funcionario LIMIT 1;"
```

Esperado:

```
id|funcionario_codigo|tipo_marcacao|data|hora|observacao|sincronizado|criado_em
1|1|1|2025-11-19|14:30|Teste entrada|1|2025-11-19 14:30:00
```

### No Firebird (DBeaver)

```sql
-- Verificar se foi sincronizado
SELECT * FROM PONTO_FUNCIONARIO
WHERE FUNCIONARIO = (SELECT CODIGO FROM FUNCIONARIOS LIMIT 1)
ORDER BY DATA DESC
LIMIT 1;
```

## 🧪 Testes de Erro

### Teste 1: Senha Inválida

1. Clique "Ponto"
2. Inserir: "000000" (senha inválida)
3. Clique "OK"

- [ ] Erro "Senha inválida" aparece
- [ ] Diálogo permanece aberto
- [ ] Pode tentar novamente

### Teste 2: Sem Digitação

1. Clique "Ponto"
2. Deixar campo vazio
3. Botão "OK" está desabilitado

- [ ] Botão não clicável com menos de 6 dígitos
- [ ] Força completar entrada

### Teste 3: Sem Conexão Backend

1. Parar backend (Ctrl+C em terminal)
2. No frontend, tentar autenticar

- [ ] Erro "Erro ao conectar..."
- [ ] Mensagem amigável
- [ ] Sem crash da aplicação

### Teste 4: Offline

1. Desconectar Firebird (ou parar o backend)
2. Completar fluxo até registro

- [ ] Ponto salvo localmente (SQLite)
- [ ] Mensagem sobre sincronização pendente (futuro)
- [ ] Retorna ao menu normalmente

## 📊 Testes de Performance

### Tempo de Carregamento

- [ ] Frontend carrega em < 3s
- [ ] Tipos de marcação carregam em < 1s
- [ ] Autenticação responde em < 2s

### Responsividade Mobile

Abrir http://localhost:3000 com:

- [ ] Chrome DevTools mobile (F12)
- [ ] Redimensionar para 375px (iPhone)
- [ ] Testar todos os componentes
- [ ] Botões clicáveis com dedo
- [ ] Textos legíveis

## 🔐 Testes de Segurança

- [ ] Senha não aparece em console logs
- [ ] Dados sensíveis não em localStorage (por enquanto)
- [ ] CORS funciona corretamente
- [ ] Sem XSS vulnerabilities

## 📝 Log de Testes

Preencher com resultado dos testes:

```
Data: 19/11/2025
Testador: [Nome]

Fluxo Completo: [ ] PASSOU [ ] FALHOU
├─ Menu: [ ] OK
├─ Autenticação: [ ] OK (senha testada: ________)
├─ Registro: [ ] OK
├─ Confirmação: [ ] OK
└─ Retorno: [ ] OK

Erros encontrados:
- (nenhum) / (listar)

Observações:
- (nenhuma) / (listar)
```

## 🚀 Próximos Testes

- [ ] Teste com múltiplos funcionários
- [ ] Teste com tipos diferentes
- [ ] Teste de sincronização pendente
- [ ] Teste de histórico
- [ ] Teste de edição de ponto
- [ ] Teste de cancelamento

## 📞 Suporte

Se encontrar problemas:

1. **Verificar console do navegador** (F12)

   - Ir para aba "Console"
   - Procurar por erros vermelhos

2. **Verificar terminal backend**

   - Procurar por "erro" ou "error"
   - Verificar se Firebird está conectado

3. **Testar endpoints com Postman/Insomnia**

   - POST http://localhost:3001/api/auth/login
   - GET http://localhost:3001/api/ponto/tipos
   - POST http://localhost:3001/api/ponto/registrar

4. **Verificar bancos de dados**
   - SQLite: `sqlite3 BackEnd\database.db`
   - Firebird: DBeaver ou Flamerobin

---

**Status**: Sistema completo pronto para teste
**Data**: 19/11/2025
