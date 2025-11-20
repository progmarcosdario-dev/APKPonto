#!/usr/bin/env pwsh

# Script de Build Local com Feedback Visual
Write-Host "╔════════════════════════════════════════════════════════════╗" -ForegroundColor Cyan
Write-Host "║           APK BUILD LOCAL - SCOPUM PONTO                   ║" -ForegroundColor Cyan
Write-Host "╚════════════════════════════════════════════════════════════╝" -ForegroundColor Cyan

Write-Host "`n[1/4] Verificando configuracoes..." -ForegroundColor Yellow

$sdkPath = "D:\Android\Sdk"
$projectPath = "c:\ProjetosNode\APK\APKMobile"

if (Test-Path $sdkPath) {
  Write-Host "  ✅ Android SDK: $sdkPath" -ForegroundColor Green
}
else {
  Write-Host "  ❌ Android SDK nao encontrada!" -ForegroundColor Red
  exit 1
}

if (Test-Path $projectPath) {
  Write-Host "  ✅ Projeto: $projectPath" -ForegroundColor Green
}
else {
  Write-Host "  ❌ Projeto nao encontrado!" -ForegroundColor Red
  exit 1
}

Write-Host "`n[2/4] Executando build..." -ForegroundColor Yellow
Write-Host "  ⏳ Processando..." -ForegroundColor Cyan

Push-Location $projectPath
npm run build:android
Pop-Location

Write-Host "`n╔════════════════════════════════════════════════════════════╗" -ForegroundColor Green
Write-Host "║                    BUILD CONCLUIDO                         ║" -ForegroundColor Green
Write-Host "╚════════════════════════════════════════════════════════════╝" -ForegroundColor Green
