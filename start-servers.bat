@echo off
REM Script para iniciar Backend e Frontend simultaneamente
REM Apta - Controle de Ponto

echo.
echo ========================================
echo APTA - Controle de Ponto
echo Iniciando Servidores...
echo ========================================
echo.

REM Abrir Backend em novo console
echo Iniciando Backend em localhost:3001...
start "Apta Backend" cmd /k "cd BackEnd && npm start"

REM Aguardar um pouco para o backend iniciar
timeout /t 5 /nobreak

REM Abrir Frontend em novo console
echo Iniciando Frontend em localhost:3000...
start "Apta Frontend" cmd /k "cd frontend && npm start"

echo.
echo ========================================
echo Servidores iniciados!
echo Backend:  http://localhost:3001
echo Frontend: http://localhost:3000
echo ========================================
echo.

timeout /t 3
