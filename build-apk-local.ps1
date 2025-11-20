# Script para fazer build local do APK com Java 17
# Configura variáveis de ambiente e executa o Gradle

Write-Host "=== Build Local do APK ===" -ForegroundColor Cyan
Write-Host "Configurando Java 17..." -ForegroundColor Yellow

# Configurar Java 17
$env:JAVA_HOME = "C:\Program Files\java\jdk-17"
$env:Path = "$env:JAVA_HOME\bin;$env:Path"

# Verificar Java
Write-Host "Versão do Java:" -ForegroundColor Green
& java -version

# Navegar para diretório do projeto
cd C:\ProjetosNode\APK\APKMobile

Write-Host "`nExecutando gradlew assembleRelease..." -ForegroundColor Yellow
Write-Host "Isso pode levar 5-10 minutos na primeira vez..." -ForegroundColor Yellow

# Executar build
.\android\gradlew.bat -p android assembleRelease

# Verificar se o build foi bem-sucedido
if ($LASTEXITCODE -eq 0) {
  Write-Host "`n=== BUILD CONCLUÍDO COM SUCESSO ===" -ForegroundColor Green
  Write-Host "APK gerado em: C:\ProjetosNode\APK\APKMobile\android\app\build\outputs\apk\release\app-release.apk" -ForegroundColor Green
}
else {
  Write-Host "`n=== BUILD FALHOU ===" -ForegroundColor Red
  Write-Host "Verifique os erros acima." -ForegroundColor Red
}
