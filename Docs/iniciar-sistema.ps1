# Script para iniciar Frontend e Backend automaticamente
Write-Host "========================================" -ForegroundColor Green
Write-Host "Iniciando Sistema de Controle de Ponto" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Green
Write-Host ""

# Diretório raiz do projeto
$raizProjeto = "C:\ProjetosNode\APK"

# Obter IP dinâmico (primeiro IP não loopback)
$ipAddress = (Get-NetIPAddress -AddressFamily IPv4 | Where-Object { $_.IPAddress -notmatch "^127\." -and $_.IPAddress -notmatch "^169\.254\." } | Select-Object -First 1).IPAddress
if (-not $ipAddress) {
  $ipAddress = "localhost"
}

# Iniciar Backend
Write-Host "Iniciando Backend na porta 3001..." -ForegroundColor Cyan
$backendPath = Join-Path $raizProjeto "BackEnd"
Start-Process -FilePath "powershell.exe" -ArgumentList "-NoExit", "-Command `"cd '$backendPath' ; npm start`"" -WindowStyle Normal

# Aguardar um pouco para o backend inicializar
Start-Sleep -Seconds 3

# Iniciar Frontend
Write-Host "Iniciando Frontend na porta 3000..." -ForegroundColor Cyan
$frontendPath = Join-Path $raizProjeto "frontend"
Start-Process -FilePath "powershell.exe" -ArgumentList "-NoExit", "-Command `"cd '$frontendPath' ; npm start`"" -WindowStyle Normal

Write-Host ""
Write-Host "Sistema iniciado!" -ForegroundColor Green
Write-Host ""
Write-Host "Acesse:" -ForegroundColor Yellow
Write-Host "Frontend: http://$($ipAddress):3000" -ForegroundColor White
Write-Host "Backend: http://$($ipAddress):3001" -ForegroundColor White
Write-Host ""
