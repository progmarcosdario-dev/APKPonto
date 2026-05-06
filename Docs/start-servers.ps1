#!/usr/bin/env pwsh
<#
.SYNOPSIS
    Script para iniciar Backend e Frontend do Apta - Controle de Ponto

.DESCRIPTION
    Inicia simultâneamente:
    - Backend Node.js/Express na porta 3001
    - Frontend React na porta 3000

.EXAMPLE
    .\start-servers.ps1
#>

param(
    [switch]$NoOpen
)

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "APTA - Controle de Ponto" -ForegroundColor Green
Write-Host "Iniciando Servidores..." -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Função para iniciar processo em background
function Start-Server {
    param(
        [string]$Name,
        [string]$Path,
        [string]$Command,
        [int]$Port
    )

    Write-Host "Iniciando $Name em localhost:$Port..." -ForegroundColor Yellow

    $scriptBlock = [scriptblock]::Create("Set-Location '$Path'; $Command")
    Start-Process pwsh -ArgumentList "-NoExit", "-Command", $scriptBlock -WindowStyle Normal
}

# Obter caminho da raiz do projeto
$rootPath = Get-Location

# Iniciar Backend
Start-Server -Name "Backend" -Path "$rootPath\BackEnd" -Command "npm start" -Port 3001

# Aguardar um pouco para o backend iniciar
Write-Host "Aguardando Backend iniciar..." -ForegroundColor Gray
Start-Sleep -Seconds 5

# Iniciar Frontend
Start-Server -Name "Frontend" -Path "$rootPath\frontend" -Command "npm start" -Port 3000

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "Servidores iniciados!" -ForegroundColor Green
Write-Host "Backend:  http://localhost:3001" -ForegroundColor Green
Write-Host "Frontend: http://localhost:3000" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

if (-not $NoOpen) {
    Write-Host "Abrindo frontend no navegador..." -ForegroundColor Yellow
    Start-Sleep -Seconds 3
    Start-Process "http://localhost:3000"
}

Write-Host "Pressione CTRL+C para sair dos servidores" -ForegroundColor Yellow
