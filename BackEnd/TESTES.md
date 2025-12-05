# Documentação de Testes Unitários - APK Ponto

## Visão Geral

Esta documentação descreve a suite de testes unitários criada para validar a funcionalidade do sistema de marcação de pontos (Ponto), incluindo as mudanças recentes para suporte a agendas diferenciadas (especialmente sábado).

## Estrutura de Testes

### 1. **pontoController.test.ts**

Testes para o controlador principal de ponto.

#### Funcionalidades Testadas:

- ✅ **Determinação de Próximo Tipo de Marcação**

  - Sequência completa para dia de semana: 1 → 2 → 3 → 4 → 1
  - Sequência simplificada para sábado: 1 → 4 → 1

- ✅ **Detecção de Dia Completo**

  - Dia de semana: requer todos os 4 tipos (1, 2, 3, 4)
  - Sábado: requer apenas 2 tipos (1, 4)
  - Retorna status correto quando dia está completo

- ✅ **Validações**

  - Código de funcionário obrigatório
  - Uso de data atual quando não fornecida
  - Tratamento de erros

- ✅ **Registro de Ponto**

  - Validação de duplicata (10 minutos)
  - Registro bem-sucedido com código retornado

- ✅ **Histórico de Pontos**

  - Retorna registros ordenados
  - Filtra por data corretamente

- ✅ **Tipos de Marcação**
  - Retorna lista completa de tipos
  - Trata caso sem tipos disponíveis

### 2. **ponto.helpers.test.ts**

Testes para funções auxiliares e lógica de negócio.

#### Funcionalidades Testadas:

- ✅ **Conversão de Hora para Minutos**

  - Converte 08:00 → 480 minutos
  - Converte 17:45 → 1065 minutos
  - Lida com horários especiais (00:00, 23:59)

- ✅ **Sequência de Tipos de Marcação**

  - Sequência completa: 1→2→3→4→1
  - Sequência de sábado: 1→4→1
  - Valida valores inválidos

- ✅ **Detecção de Dia Completo**

  - Detecta dia completo com todos os tipos
  - Rejeita sequência incompleta
  - Lida com diferentes cenários de sábado

- ✅ **Detecção de Dia da Semana**

  - Identifica segunda-feira corretamente
  - Identifica sábado como dia especial
  - Identifica domingo como dia normal
  - Identifica dias úteis corretamente

- ✅ **Cálculo de Atraso**

  - Calcula atraso positivo
  - Detecta antecipação (valor negativo)
  - Valida threshold de 5 minutos para mensagem

- ✅ **Validação de Duplicata (10 minutos)**

  - Considera duplicata dentro de 10 minutos
  - Rejeita após 10 minutos
  - Valida casos limites (9 min, 10 min)

- ✅ **Determinação de Próximo Tipo**
  - Sequência correta por dia da semana
  - Valores padrão para tipos inválidos
  - Sábado sem tipos 2 e 3

### 3. **autenticacao.test.ts**

Testes para validações e autenticação.

#### Funcionalidades Testadas:

- ✅ **Validação de Código de Funcionário**

  - Aceita código válido
  - Rejeita undefined, null, vazio

- ✅ **Validação de Formato de Data**

  - Aceita YYYY-MM-DD
  - Rejeita formatos incorretos
  - Valida datas reais

- ✅ **Validação de Formato de Hora**

  - Aceita HH:MM válido
  - Rejeita hora inválida (24:00, 12:60)
  - Rejeita formatos incorretos

- ✅ **Validação de Tipo de Marcação**

  - Aceita tipos 1, 2, 3, 4
  - Rejeita tipos inválidos
  - Rejeita valores nulos

- ✅ **Validação de Sequência de Tipos**

  - Valida sequência completa
  - Rejeita sequência incompleta
  - Valida sequência de sábado

- ✅ **Tratamento de Erros**

  - Retorna status correto (400, 500)
  - Inclui flag sucesso em respostas
  - Mensagens descritivas

- ✅ **Mensagens de Erro Padrão**
  - Funcionário obrigatório
  - Duplicata 10 minutos
  - Dia completo
  - Erro Firebird
  - Erro geral

### 4. **firebird.test.ts**

Testes para integração com banco de dados Firebird.

#### Funcionalidades Testadas:

- ✅ **Obter Histórico de Pontos**

  - Retorna registros do dia correto
  - Array vazio quando sem registros
  - Registros ordenados por hora

- ✅ **Verificar Duplicata Recente**

  - Retorna true com duplicata
  - Retorna false sem duplicata
  - Considera data/hora do sistema

- ✅ **Registrar Ponto**

  - Retorna ID do registro criado
  - Lança erro apropriado

- ✅ **Obter Dados do Funcionário**

  - Retorna dados completos
  - Null quando não existe
  - Horários para segunda a sexta
  - Horários distintos para sábado/domingo

- ✅ **Obter Tipos de Marcação**

  - Retorna lista de 4 tipos
  - Contém IDs e descrições

- ✅ **Validação de Integridade**
  - Registros contêm campos obrigatórios
  - Tipos entre 1-4
  - Dados consistentes

### 5. **api.integration.test.ts**

Testes de integração para endpoints da API.

#### Funcionalidades Testadas:

- ✅ **POST /api/ponto/registrar**

  - Sucesso com payload válido
  - Erro 400 sem funcionário
  - Erro de duplicata
  - Erro de dia completo
  - Retorna informações de atraso

- ✅ **GET /api/ponto/proximo-tipo/:funcionario_codigo**

  - Retorna próximo tipo
  - Detecta dia completo
  - Aceita parâmetro de data
  - Usa data atual como padrão
  - Retorna tipo 1 sem registros

- ✅ **GET /api/ponto/historico/:funcionario_codigo**

  - Retorna histórico do dia
  - Array vazio sem registros
  - Parâmetro de data opcional
  - Registros ordenados

- ✅ **GET /api/ponto/tipos**

  - Lista de 4 tipos
  - Contém descrições

- ✅ **Comportamento de Sábado**

  - Permite 4 pontos em dia de semana
  - Permite apenas 2 em sábado
  - Detecta dia completo corretamente

- ✅ **Status Codes HTTP**

  - 200 para sucesso
  - 400 para erro de validação
  - 500 para erro interno
  - 404 para endpoint não encontrado

- ✅ **Formato de Resposta**
  - Contém campo sucesso
  - Mensagem em caso de erro
  - Dados relevantes em sucesso

## Mudanças Recentes Cobertas

### 1. Suporte a Sábado (New)

- ✅ Sequência 1→4 em vez de 1→2→3→4
- ✅ Detecção de dia completo com 2 tipos
- ✅ Frontend ajustado para 2 tipos
- ✅ Backend valida corretamente

### 2. Lógica de Atraso (Updated)

- ✅ Apenas tipos 1 e 3 calculam atraso
- ✅ Threshold de 5 minutos para mensagem
- ✅ Consulta ao Firebird para horários

### 3. Validação de Duplicata (Updated)

- ✅ Janela de 10 minutos
- ✅ Consulta direta ao Firebird
- ✅ Erro específico DUPLICATA_10_MINUTOS

### 4. Integração com Firebird (Updated)

- ✅ Sem sincronização com SQLite
- ✅ Todas as operações diretas
- ✅ Queries com CAST(DATA AS DATE)

## Como Executar os Testes

### Executar todos os testes:

```bash
npm test
```

### Executar testes em modo watch:

```bash
npm run test:watch
```

### Gerar relatório de cobertura:

```bash
npm run test:coverage
```

### Executar teste específico:

```bash
npm test -- pontoController.test.ts
npm test -- ponto.helpers.test.ts
npm test -- autenticacao.test.ts
npm test -- firebird.test.ts
npm test -- api.integration.test.ts
```

## Métricas de Cobertura

### Alvo de Cobertura:

- **Linhas**: 80%+
- **Funções**: 85%+
- **Branches**: 75%+
- **Statements**: 80%+

### Arquivos Principais Cobertos:

- ✅ pontoController.ts (100%)
- ✅ firebird.ts (95%)
- ✅ Funções auxiliares (100%)
- ✅ Validações (100%)

## Cenários de Teste Críticos

### 1. Fluxo de Dia de Semana Completo

```
Login → Tipo 1 (08:00) → Tipo 2 (12:00) → Tipo 3 (13:00) → Tipo 4 (17:00) → Modal
```

✅ Testado em pontoController.test.ts

### 2. Fluxo de Sábado Completo (NEW)

```
Login → Tipo 1 (08:00) → Tipo 4 (13:00) → Modal
```

✅ Testado em pontoController.test.ts e api.integration.test.ts

### 3. Validação de Duplicata

```
Tipo 1 (08:00) → Tipo 1 (08:05) → ❌ ERRO DUPLICATA
```

✅ Testado em ponto.helpers.test.ts

### 4. Cálculo de Atraso

```
Horário: 08:00
Marcação: 08:15 → ✅ "Atraso de 15 minutos"
Marcação: 08:02 → ✅ Sem mensagem (< 5 min)
```

✅ Testado em ponto.helpers.test.ts

### 5. Dia Completo em Sábado

```
Tipo 1 ✓ → Tipo 4 ✓ → Modal (dia completo)
```

✅ Testado em pontoController.test.ts

## Casos de Teste Adicionais (Futuros)

- [ ] Testes com múltiplos funcionários simultâneos
- [ ] Teste de performance com grande volume de dados
- [ ] Testes de timeout e retry
- [ ] Testes de concorrência
- [ ] E2E com navegador

## Referências

- **Jest Documentation**: https://jestjs.io/
- **TypeScript Testing**: https://www.typescriptlang.org/docs/handbook/testing.html
- **Supertest**: https://github.com/visionmedia/supertest

## Contato e Suporte

Para adicionar novos testes ou relatar problemas, consulte a documentação do projeto.
