@echo off
REM Script para iniciar Backend e Frontend automaticamente

echo Iniciando APK Ponto...
echo.

REM Inicia o Backend em uma nova janela
start "APK Ponto - Backend (3001)" cmd /k "cd /d C:\ProjetosNode\APK\BackEnd && npm start"

REM Aguarda 5 segundos para o backend iniciar
timeout /t 5 /nobreak

REM Inicia o Frontend em uma nova janela
start "APK Ponto - Frontend (3000)" cmd /k "cd /d C:\ProjetosNode\APK\frontend && npm start"

echo.
echo Ambos os servidores foram iniciados!
echo Backend: http://localhost:3001
echo Frontend: http://localhost:3000
echo.
pause
