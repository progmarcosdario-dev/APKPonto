/**
 * Script de Otimização de Queries - Firebird
 * Cria índices para melhorar performance
 *
 * Executar em: isql.exe ou Software de gerenciamento Firebird
 */

-- =====================================================
-- ÍNDICES PARA PONTOS
-- =====================================================

-- Índice para buscar histórico por funcionário e data
CREATE INDEX idx_pontos_funcionario_data ON PONTOS (FUNCIONARIO_CODIGO, DATA DESC);

-- Índice para verificar duplicata (últimos 10 minutos)
CREATE INDEX idx_pontos_funcionario_hora ON PONTOS (FUNCIONARIO_CODIGO, HORA DESC);

-- Índice para tipos de marcação (consultado frequentemente)
CREATE INDEX idx_pontos_tipo ON PONTOS (TIPO_MARCACAO);

-- Índice composto para queries de status do dia
CREATE INDEX idx_pontos_dia_completo ON PONTOS (
    FUNCIONARIO_CODIGO,
    DATA,
    TIPO_MARCACAO
);

-- =====================================================
-- ÍNDICES PARA FUNCIONÁRIOS
-- =====================================================

-- Índice para login por código
CREATE INDEX idx_funcionario_codigo_ativo ON FUNCIONARIOS (CODIGO, ATIVO);

-- Índice para ordenação
CREATE INDEX idx_funcionario_nome ON FUNCIONARIOS (NOME);

-- =====================================================
-- QUERIES OTIMIZADAS
-- =====================================================

-- Query 1: Obter histórico do dia (com índice)
-- ANTES: Scan completo da tabela
-- DEPOIS: Uso de índice idx_pontos_funcionario_data
SELECT
    ID,
    FUNCIONARIO_CODIGO,
    TIPO_MARCACAO,
    HORA,
    DATA
FROM PONTOS
WHERE
    FUNCIONARIO_CODIGO = ?
    AND CAST(DATA AS DATE) = CAST(? AS DATE)
ORDER BY HORA DESC;

-- Query 2: Verificar duplicata (com índice)
-- ANTES: Scan completo
-- DEPOIS: Índice idx_pontos_funcionario_hora com limit
SELECT COUNT(*) as duplicatas
FROM PONTOS
WHERE
    FUNCIONARIO_CODIGO = ?
    AND CAST(DATA AS DATE) = CAST(? AS DATE)
    AND DATEDIFF(MINUTE, HORA, ?) < 10;

-- Query 3: Obter tipos do dia (com índice composto)
-- ANTES: Múltiplos scans
-- DEPOIS: Índice idx_pontos_dia_completo
SELECT DISTINCT
    TIPO_MARCACAO
FROM PONTOS
WHERE
    FUNCIONARIO_CODIGO = ?
    AND CAST(DATA AS DATE) = CAST(? AS DATE)
ORDER BY TIPO_MARCACAO;

-- Query 4: Autenticação (com índice)
-- ANTES: Scan completo
-- DEPOIS: Índice idx_funcionario_codigo_ativo
SELECT
    CODIGO,
    NOME,
    SENHA,
    INICIO_SEGUNDA_SEXTA,
    PAUSA_SEGUNDA_SEXTA,
    RETORNO_SEGUNDA_SEXTA,
    FIM_SEGUNDA_SEXTA,
    INICIO_SABADO,
    PAUSA_SABADO,
    RETORNO_SABADO,
    FIM_SABADO,
    INICIO_DOMINGO,
    PAUSA_DOMINGO,
    RETORNO_DOMINGO,
    FIM_DOMINGO
FROM FUNCIONARIOS
WHERE
    CODIGO = ?
    AND ATIVO = 1;

-- =====================================================
-- ANÁLISE DE PERFORMANCE
-- =====================================================

-- Ver plano de execução (Firebird)
-- Executar antes de otimizar:
EXPLAIN PLAN
SET
    STATEMENT_ID = 'original' FOR
SELECT *
FROM PONTOS
WHERE
    FUNCIONARIO_CODIGO = 12345
    AND CAST(DATA AS DATE) = '2025-12-05';

-- Executar após criar índice:
EXPLAIN PLAN
SET
    STATEMENT_ID = 'otimizado' FOR
SELECT *
FROM PONTOS
WHERE
    FUNCIONARIO_CODIGO = 12345
    AND CAST(DATA AS DATE) = '2025-12-05';

-- =====================================================
-- ESTATÍSTICAS DE ÍNDICES
-- =====================================================

-- Recalcular estatísticas de índices
-- Firebird: SET STATISTICS (após muitos inserts/updates)
SET STATISTICS IDX_PONTOS_FUNCIONARIO_DATA;

SET STATISTICS IDX_PONTOS_FUNCIONARIO_HORA;

SET STATISTICS IDX_PONTOS_TIPO;

SET STATISTICS IDX_PONTOS_DIA_COMPLETO;

SET STATISTICS IDX_FUNCIONARIO_CODIGO_ATIVO;

SET STATISTICS IDX_FUNCIONARIO_NOME;

-- =====================================================
-- MONITORAMENTO
-- =====================================================

-- Encontrar queries lentas (> 5 segundos)
SELECT
    MON$SQL_TEXT,
    MON$EXEC_TIME,
    MON$FETCH_TIME,
    MON$STAT_ID
FROM MON$STATEMENTS
WHERE
    MON$EXEC_TIME > 5000000 -- 5 segundos em microsegundos
ORDER BY MON$EXEC_TIME DESC;

-- Ver índices usados
SELECT I.RDB$INDEX_NAME, I.RDB$RELATION_NAME, I.RDB$STATISTICS, I.RDB$UNIQUE_FLAG
FROM RDB$INDICES I
WHERE
    I.RDB$SYSTEM_FLAG = 0
ORDER BY I.RDB$RELATION_NAME;

-- =====================================================
-- NOTAS DE IMPLEMENTAÇÃO
-- =====================================================

/*
1. IMPLEMENTAR EM TypeScript (firebird.ts):
- Garantir que CAST(DATA AS DATE) seja sempre usado
- Usar prepared statements
- Adicionar timeouts em queries

2. CACHE:
- Cache de TIPOS_MARCACAO (muda raramente)
- Cache de FUNCIONARIOS (válido por 1 hora)
- Invalidar cache em mutations

3. CONEXÃO POOLING:
- Min: 5 conexões
- Max: 20 conexões
- Timeout: 30s

4. MONITORAMENTO:
- Tempo médio de query
- Queries lentas (> 100ms)
- Conexões ativas
- Memory usage

5. TUNING:
- PAGE_BUFFERS: 8192 (padrão)
- Aumentar se servidor tiver RAM
- Executar SWEEP regularmente
*/
