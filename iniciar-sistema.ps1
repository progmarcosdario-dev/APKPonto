# Script para iniciar Frontend e Backend automaticamente
Write-Host "========================================" -ForegroundColor Green
Write-Host "Iniciando Sistema de Controle de Ponto" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Green
Write-Host ""

# Diretório raiz do projeto
$raizProjeto = "C:\ProjetosNode\APK"

# Iniciar Backend
Write-Host "🔧 Iniciando Backend na porta 3001..." -ForegroundColor Cyan
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$raizProjeto\BackEnd'; npm start" -WindowStyle Normal

# Aguardar um pouco para o backend inicializar
Start-Sleep -Seconds 3

# Iniciar Frontend
Write-Host "🌐 Iniciando Frontend na porta 3000..." -ForegroundColor Cyan
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$raizProjeto\frontend'; npm start" -WindowStyle Normal

Write-Host ""
Write-Host "✅ Sistema iniciado!" -ForegroundColor Green
Write-Host ""
Write-Host "Acesse:" -ForegroundColor Yellow
Write-Host "Frontend: http://192.168.1.76:3000" -ForegroundColor White
Write-Host "Backend: http://192.168.1.76:3001" -ForegroundColor White
Write-Host ""
