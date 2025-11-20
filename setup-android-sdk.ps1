# Script para detectar e configurar Android SDK automaticamente

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "🔧 Configurador Android SDK" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan

# Procurar SDK em locais comuns
$possiblePaths = @(
  "$env:LOCALAPPDATA\Android\Sdk",
  "$env:USERPROFILE\AppData\Local\Android\Sdk",
  "C:\Android\sdk",
  "$env:ANDROID_HOME"
)

Write-Host "`n🔍 Procurando Android SDK..." -ForegroundColor Yellow

$sdkPath = $null
foreach ($path in $possiblePaths) {
  if (Test-Path $path) {
    $sdkPath = $path
    Write-Host "✅ SDK encontrada em: $sdkPath" -ForegroundColor Green
    break
  }
}

if (-not $sdkPath) {
  Write-Host "❌ Android SDK não encontrada nos locais padrão" -ForegroundColor Red
  Write-Host "`n💡 Por favor, conclua a instalação via Android Studio e tente novamente" -ForegroundColor Yellow
  exit 1
}

# Criar local.properties
$localPropertiesPath = "c:\ProjetosNode\APK\APKMobile\android\local.properties"
$localPropertiesContent = "sdk.dir=$($sdkPath.Replace('\', '/'))`nndk.dir=$($sdkPath.Replace('\', '/'))\ndk"

Write-Host "`n📝 Criando local.properties..." -ForegroundColor Yellow
$localPropertiesContent | Out-File -FilePath $localPropertiesPath -Encoding UTF8
Write-Host "✅ local.properties criado em:" -ForegroundColor Green
Write-Host "   $localPropertiesPath" -ForegroundColor Green

# Verificar componentes da SDK
Write-Host "`n📦 Verificando componentes da SDK..." -ForegroundColor Yellow
$platforms = Get-ChildItem "$sdkPath\platforms" -ErrorAction SilentlyContinue -Directory
$buildTools = Get-ChildItem "$sdkPath\build-tools" -ErrorAction SilentlyContinue -Directory

if ($platforms) {
  Write-Host "   ✅ Plataformas encontradas:" -ForegroundColor Green
  $platforms | ForEach-Object { Write-Host "      • $_" -ForegroundColor Cyan }
}
else {
  Write-Host "   ❌ Nenhuma plataforma encontrada" -ForegroundColor Red
}

if ($buildTools) {
  Write-Host "   ✅ Build Tools encontrados:" -ForegroundColor Green
  $buildTools | ForEach-Object { Write-Host "      • $_" -ForegroundColor Cyan }
}
else {
  Write-Host "   ❌ Nenhum build tools encontrado" -ForegroundColor Red
}

# Configurar variáveis de ambiente
Write-Host "`n🌍 Configurando variáveis de ambiente..." -ForegroundColor Yellow
[Environment]::SetEnvironmentVariable("ANDROID_HOME", $sdkPath, "User")
[Environment]::SetEnvironmentVariable("ANDROID_SDK_ROOT", $sdkPath, "User")

Write-Host "✅ ANDROID_HOME = $sdkPath" -ForegroundColor Green
Write-Host "✅ ANDROID_SDK_ROOT = $sdkPath" -ForegroundColor Green

Write-Host "`n========================================" -ForegroundColor Green
Write-Host "✅ Configuração concluída com sucesso!" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Green
Write-Host "`n💡 Próximo passo: Execute 'npm install' em APKMobile e depois faça o build" -ForegroundColor Yellow
