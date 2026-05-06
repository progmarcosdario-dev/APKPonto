@echo off
REM ============================================================================
REM SCRIPT DE DEPLOY - APKPonto (Versão Batch)
REM ============================================================================
REM Este script prepara o projeto para distribuição ao cliente
REM Duplo-clique para executar
REM ============================================================================

setlocal enabledelayedexpansion
cls

color 0B
title DEPLOY - APKPonto Sistema de Ponto

echo.
echo ========================================================================
echo  DEPLOY - APKPonto Sistema de Ponto
echo ========================================================================
echo.

REM ============================================================================
REM PASSO 1: LIMPAR PASTAS
REM ============================================================================

echo [1/2] Limpando pastas desnecessarias...
echo.

if exist "c:\ProjetosNode\APK\frontend\node_modules" (
    echo   Removendo: Frontend node_modules
    rmdir /s /q "c:\ProjetosNode\APK\frontend\node_modules" 2>nul
    echo   Ok
)

if exist "c:\ProjetosNode\APK\frontend\build" (
    echo   Removendo: Frontend build
    rmdir /s /q "c:\ProjetosNode\APK\frontend\build" 2>nul
    echo   Ok
)

if exist "c:\ProjetosNode\APK\BackEnd\node_modules" (
    echo   Removendo: Backend node_modules
    rmdir /s /q "c:\ProjetosNode\APK\BackEnd\node_modules" 2>nul
    echo   Ok
)

if exist "c:\ProjetosNode\APK\BackEnd\dist" (
    echo   Removendo: Backend dist
    rmdir /s /q "c:\ProjetosNode\APK\BackEnd\dist" 2>nul
    echo   Ok
)

if exist "c:\ProjetosNode\APK\BackEnd\coverage" (
    echo   Removendo: Backend coverage
    rmdir /s /q "c:\ProjetosNode\APK\BackEnd\coverage" 2>nul
    echo   Ok
)

echo.
echo   Limpeza concluida
echo.

REM ============================================================================
REM PASSO 2: CRIAR ZIP
REM ============================================================================

echo [2/2] Empacotando projeto...
echo.

REM Remover ZIP anterior se existir
if exist "c:\ProjetosNode\APK-Deploy.zip" (
    echo   Removendo ZIP anterior...
    del "c:\ProjetosNode\APK-Deploy.zip" /q
    echo   Ok
)

echo   Criando arquivo ZIP (isto pode levar alguns segundos)...

REM Usar PowerShell para criar o ZIP (compatível com Windows 10+)
powershell -Command "Compress-Archive -Path 'c:\ProjetosNode\APK' -DestinationPath 'c:\ProjetosNode\APK-Deploy.zip' -Force -ErrorAction Stop" 2>nul

if exist "c:\ProjetosNode\APK-Deploy.zip" (
    echo   Ok - ZIP criado com sucesso

    REM Obter tamanho do arquivo
    for %%A in ("c:\ProjetosNode\APK-Deploy.zip") do set "tamanho=%%~zA"
    set /a tamanhoMB=!tamanho! / 1048576

    echo.
    echo   Arquivo: c:\ProjetosNode\APK-Deploy.zip
    echo   Tamanho: !tamanhoMB! MB
) else (
    echo   ERRO: Falha ao criar ZIP
    pause
    exit /b 1
)

echo.
echo ========================================================================
echo  INSTRUCOES PARA O CLIENTE
echo ========================================================================
echo.

echo PASSO 1: EXTRAIR O ARQUIVO ZIP
echo ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
echo Execute no PowerShell (como Administrador):
echo.
echo     Expand-Archive -Path APK-Deploy.zip -DestinationPath c:\ProjetosNode
echo.
echo.

echo PASSO 2: INSTALAR DEPENDENCIAS
echo ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
echo Execute os comandos abaixo NO POWERSHELL (como Administrador):
echo.
echo     cd c:\ProjetosNode\APK\BackEnd
echo     npm install
echo.
echo     cd c:\ProjetosNode\APK\frontend
echo     npm install
echo.
echo.

echo PASSO 3: COMPILAR PROJETOS
echo ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
echo Execute os comandos abaixo:
echo.
echo     cd c:\ProjetosNode\APK\BackEnd
echo     npm run build
echo.
echo     cd c:\ProjetosNode\APK\frontend
echo     npm run build
echo.
echo.

echo PASSO 4: VERIFICAR CONFIGURACAO DO FIREBIRD
echo ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
echo Edite o arquivo: c:\ProjetosNode\APK\BackEnd\.env
echo.
echo Verifique se as configuracoes estao CORRETAS:
echo     FIREBIRD_HOST=127.0.0.1
echo     FIREBIRD_PORT=3050
echo     FIREBIRD_DATABASE=C:\Apta\Dados\APTA.FDB
echo     FIREBIRD_USER=SYSDBA
echo     FIREBIRD_PASSWORD=masterkey
echo.
echo IMPORTANTE: Se o Firebird estiver em outro servidor, atualize FIREBIRD_HOST
echo.
echo.

echo PASSO 5: INICIAR OS SERVIDORES
echo ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
echo Abra DOIS PowerShells (como Administrador):
echo.
echo TERMINAL 1 - BACKEND:
echo     cd c:\ProjetosNode\APK\BackEnd
echo     npm start
echo.
echo TERMINAL 2 - FRONTEND:
echo     cd c:\ProjetosNode\APK\frontend
echo     npm start
echo.
echo.

echo PASSO 6: ACESSAR A APLICACAO
echo ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
echo Abra o navegador e acesse:
echo     http://localhost:3000
echo.
echo A aplicacao deve carregar com o logo do Scopum
echo.
echo.

echo ========================================================================
echo.
echo Deploy concluido com sucesso!
echo.
echo Arquivo pronto para distribuicao: c:\ProjetosNode\APK-Deploy.zip
echo.
echo ========================================================================
echo.

pause
