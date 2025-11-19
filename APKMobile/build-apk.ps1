# Script para gerar APK do Scopum usando EAS
# Arquivo: c:\ProjetosNode\APK\APKMobile\build-apk.ps1

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  Scopum - Gerador de APK" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

Set-Location $PSScriptRoot

Write-Host "Verificando dependencias..." -ForegroundColor Yellow

if (-not (Test-Path "node_modules")) {
    Write-Host ""
    Write-Host "Instalando dependencias..." -ForegroundColor Yellow
    npm install
}

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "Opcoes de Build:" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "1 - Build via EAS (Recomendado - Build na nuvem)" -ForegroundColor Green
Write-Host "2 - Build Local (Requer Android SDK instalado)" -ForegroundColor Green
Write-Host "3 - Apenas preparar projeto" -ForegroundColor Green
Write-Host ""

$choice = Read-Host "Escolha uma opcao (1-3)"

switch ($choice) {
    "1" {
        Write-Host ""
        Write-Host "Verificando login EAS..." -ForegroundColor Yellow

        # Verificar se já está logado
        $result = & eas whoami 2>&1
        if ($result -like "*Not logged in*") {
            Write-Host "Fazendo login na EAS..." -ForegroundColor Yellow
            eas login
        } else {
            Write-Host "Já logado na EAS." -ForegroundColor Green
        }

        Write-Host ""
        Write-Host "Iniciando build na nuvem..." -ForegroundColor Yellow
        Write-Host "(Isso pode levar alguns minutos)" -ForegroundColor Yellow
        Write-Host ""

        eas build --platform android --profile preview

        Write-Host ""
        Write-Host "Build completo! Verifique o link fornecido para baixar o APK." -ForegroundColor Green
        Read-Host "Pressione ENTER para sair"
    }
    "2" {
        Write-Host ""
        Write-Host "Preparando projeto para build local..." -ForegroundColor Yellow
        eas build --local --platform android --profile preview
        Write-Host ""
        Write-Host "APK gerado em: android/app/build/outputs/apk/release/" -ForegroundColor Green
        Write-Host ""
        Read-Host "Pressione ENTER para sair"
    }
    "3" {
        Write-Host ""
        Write-Host "Preparando projeto..." -ForegroundColor Yellow
        npx expo prebuild --clean
        Write-Host ""
        Write-Host "Projeto preparado. Pronto para build via Gradle." -ForegroundColor Green
        Read-Host "Pressione ENTER para sair"
    }
    default {
        Write-Host ""
        Write-Host "Opcao invalida!" -ForegroundColor Red
        Read-Host "Pressione ENTER para sair"
        exit 1
    }
}

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "Processo Finalizado!" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "Proximos passos:" -ForegroundColor Yellow
Write-Host "1. Transferir APK para o tablet" -ForegroundColor White
Write-Host "2. Habilitar instalacao de fontes desconhecidas" -ForegroundColor White
Write-Host "3. Instalar o APK no tablet" -ForegroundColor White
Write-Host ""
Read-Host "Pressione ENTER para sair"
