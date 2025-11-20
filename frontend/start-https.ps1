# Script para gerar certificados auto-assinados e iniciar servidor HTTPS

$certDir = "C:\ProjetosNode\APK\frontend\.certs"
$keyPath = "$certDir\key.pem"
$certPath = "$certDir\cert.pem"

# Criar pasta de certificados
if (!(Test-Path $certDir)) {
  New-Item -ItemType Directory -Force -Path $certDir | Out-Null
  Write-Host "✓ Pasta de certificados criada" -ForegroundColor Green
}

# Gerar certificado auto-assinado com openssl
if (!(Test-Path $keyPath) -or !(Test-Path $certPath)) {
  Write-Host "Gerando certificados auto-assinados..." -ForegroundColor Yellow

  try {
    # Tentar usar openssl
    $opensslPath = Get-Command openssl -ErrorAction SilentlyContinue

    if ($opensslPath) {
      openssl req -x509 -newkey rsa:2048 -keyout $keyPath -out $certPath -days 365 -nodes -subj "/CN=localhost" 2>$null
      Write-Host "✓ Certificados gerados com sucesso!" -ForegroundColor Green
    }
    else {
      Write-Host "✗ OpenSSL não encontrado. Iniciando em HTTP..." -ForegroundColor Red
    }
  }
  catch {
    Write-Host "✗ Erro ao gerar certificados: $_" -ForegroundColor Red
  }
}

# Iniciar servidor
Write-Host ""
Write-Host "Iniciando servidor..." -ForegroundColor Cyan

if ((Test-Path $keyPath) -and (Test-Path $certPath)) {
  Write-Host "✓ HTTPS ativado" -ForegroundColor Green
  Write-Host "  https://192.168.1.76:3000" -ForegroundColor Cyan
  Write-Host "  https://localhost:3000" -ForegroundColor Cyan
}
else {
  Write-Host "⚠ HTTPS não disponível (usando HTTP)" -ForegroundColor Yellow
}

Write-Host ""

# Mudar para diretório
cd C:\ProjetosNode\APK\frontend

# Iniciar servidor
node server-https.js
