@echo off
REM Script para gerar APK do Scopum usando EAS
REM Arquivo: c:\ProjetosNode\APK\APKMobile\build-apk.bat

echo.
echo ========================================
echo   Scopum - Gerador de APK
echo ========================================
echo.

cd /d "%~dp0"

echo Verificando dependencias...
if not exist "node_modules" (
    echo.
    echo Instalando dependencias...
    call npm install
)

echo.
echo ========================================
echo Opcoes de Build:
echo ========================================
echo.
echo 1 - Build via EAS (Recomendado - Build na nuvem)
echo 2 - Build Local (Requer Android SDK instalado)
echo 3 - Apenas preparar projeto
echo.

set /p choice="Escolha uma opcao (1-3): "

if "%choice%"=="1" (
    echo.
    echo Fazendo login na EAS...
    call eas login
    echo.
    echo Iniciando build na nuvem...
    echo (Isso pode levar alguns minutos)
    echo.
    call eas build --platform android --profile preview
    echo.
    echo Build completo! Verifique o link fornecido para baixar o APK.
    pause
) else if "%choice%"=="2" (
    echo.
    echo Preparando projeto para build local...
    call eas build --local --platform android --profile preview
    echo.
    echo APK gerado em: android/app/build/outputs/apk/release/
    echo.
    pause
) else if "%choice%"=="3" (
    echo.
    echo Preparando projeto...
    call npx expo prebuild --clean
    echo.
    echo Projeto preparado. Pronto para build via Gradle.
    pause
) else (
    echo.
    echo Opcao invalida!
    pause
    exit /b 1
)

echo.
echo ========================================
echo Processo Finalizado!
echo ========================================
echo.
echo Proximos passos:
echo 1. Transferir APK para o tablet
echo 2. Habilitar instalacao de fontes desconhecidas
echo 3. Instalar o APK no tablet
echo.
pause
