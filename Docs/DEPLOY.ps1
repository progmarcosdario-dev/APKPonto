# ============================================================================
# SCRIPT DE DEPLOY - APKPonto
# ============================================================================
# Este script prepara o projeto para distribuição ao cliente
# Uso: .\DEPLOY.ps1
# ============================================================================

param(
    [Parameter(Mandatory=$false)]
    [ValidateSet("Limpar", "Empacotar", "Ambos")]
    [string]$Acao = "Ambos"
)

# Cores para output
$Verde = @{ ForegroundColor = "Green" }
$Amarelo = @{ ForegroundColor = "Yellow" }
$Vermelho = @{ ForegroundColor = "Red" }
$Azul = @{ ForegroundColor = "Cyan" }

Write-Host "`n" + "="*70 -@Azul
Write-Host " DEPLOY - APKPonto Sistema de Ponto" -@Azul
Write-Host "="*70 -@Azul

# ============================================================================
# FUNÇÃO: Limpar pastas desnecessárias
# ============================================================================
function Limpar-Projeto {
    Write-Host "`n[1/2] Limpando pastas desnecessárias..." -@Amarelo

    $pastas = @(
        @{ Caminho = "c:\ProjetosNode\APK\frontend\node_modules"; Nome = "Frontend node_modules" },
        @{ Caminho = "c:\ProjetosNode\APK\frontend\build"; Nome = "Frontend build" },
        @{ Caminho = "c:\ProjetosNode\APK\BackEnd\node_modules"; Nome = "Backend node_modules" },
        @{ Caminho = "c:\ProjetosNode\APK\BackEnd\dist"; Nome = "Backend dist" },
        @{ Caminho = "c:\ProjetosNode\APK\BackEnd\coverage"; Nome = "Backend coverage" }
    )

    foreach ($pasta in $pastas) {
        if (Test-Path $pasta.Caminho) {
            Write-Host "   ⏳ Removendo: $($pasta.Nome)" -@Amarelo
            Remove-Item -Recurse -Force $pasta.Caminho | Out-Null
            Write-Host "   ✓ Removido: $($pasta.Nome)" -@Verde
        } else {
            Write-Host "   - Não encontrado: $($pasta.Nome)" -@Amarelo
        }
    }

    Write-Host "`n   ✓ Limpeza concluída" -@Verde
}

# ============================================================================
# FUNÇÃO: Criar arquivo ZIP
# ============================================================================
function Empacotar-Projeto {
    Write-Host "`n[2/2] Empacotando projeto..." -@Amarelo

    $origemPath = "c:\ProjetosNode\APK"
    $destino = "c:\ProjetosNode\APK-Deploy.zip"

    # Remover ZIP anterior se existir
    if (Test-Path $destino) {
        Write-Host "   ⏳ Removendo ZIP anterior..." -@Amarelo
        Remove-Item $destino -Force | Out-Null
        Write-Host "   ✓ ZIP anterior removido" -@Verde
    }

    # Criar novo ZIP
    Write-Host "   ⏳ Criando arquivo ZIP (isto pode levar alguns segundos)..." -@Amarelo

    try {
        # Usar Compress-Archive com -Force para sobrescrever
        Compress-Archive -Path $origemPath -DestinationPath $destino -Force -ErrorAction Stop

        # Obter tamanho do arquivo
        $tamanhoMB = [math]::Round((Get-Item $destino).Length / 1MB, 2)

        Write-Host "   ✓ ZIP criado com sucesso" -@Verde
        Write-Host "   📦 Arquivo: $destino" -@Azul
        Write-Host "   📏 Tamanho: $tamanhoMB MB" -@Azul
    } catch {
        Write-Host "   ✗ Erro ao criar ZIP: $_" -@Vermelho
        exit 1
    }
}

# ============================================================================
# FUNÇÃO: Gerar instruções para o cliente
# ============================================================================
function Gerar-Instruções {
    Write-Host "`n" + "="*70 -@Azul
    Write-Host " INSTRUÇÕES PARA O CLIENTE" -@Azul
    Write-Host "="*70 -@Azul

    Write-Host @"
📋 PASSO 1: EXTRAIR O ARQUIVO ZIP
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Execute no PowerShell (como Administrador):

    Expand-Archive -Path APK-Deploy.zip -DestinationPath c:\ProjetosNode


📋 PASSO 2: INSTALAR DEPENDÊNCIAS
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Execute os comandos abaixo NO POWERSHELL (como Administrador):

    cd c:\ProjetosNode\APK\BackEnd
    npm install

    cd c:\ProjetosNode\APK\frontend
    npm install


📋 PASSO 3: COMPILAR PROJETOS
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Execute os comandos abaixo:

    cd c:\ProjetosNode\APK\BackEnd
    npm run build

    cd c:\ProjetosNode\APK\frontend
    npm run build


📋 PASSO 4: VERIFICAR CONFIGURAÇÃO DO FIREBIRD
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Edite o arquivo: c:\ProjetosNode\APK\BackEnd\.env

Verifique se as configurações estão CORRETAS:
    FIREBIRD_HOST=127.0.0.1
    FIREBIRD_PORT=3050
    FIREBIRD_DATABASE=C:\Apta\Dados\APTA.FDB
    FIREBIRD_USER=SYSDBA
    FIREBIRD_PASSWORD=masterkey

⚠️  IMPORTANTE: Se o Firebird estiver em outro servidor, atualize FIREBIRD_HOST


📋 PASSO 5: INICIAR OS SERVIDORES
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Abra DOIS PowerShells (como Administrador):

🔵 TERMINAL 1 - BACKEND:
    cd c:\ProjetosNode\APK\BackEnd
    npm start

🔵 TERMINAL 2 - FRONTEND:
    cd c:\ProjetosNode\APK\frontend
    npm start


📋 PASSO 6: ACESSAR A APLICAÇÃO
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Abra o navegador e acesse:
    http://localhost:3000

✓ A aplicação deve carregar com o logo do Scopum


❓ PROBLEMAS?
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

❌ "npm: comando não encontrado"
   → Instale Node.js de https://nodejs.org (versão LTS recomendada)
   → Reinicie o PowerShell após instalar

❌ "Firebird não consegue conectar"
   → Verifique se Firebird está rodando no Serviço do Windows
   → Verifique se FIREBIRD_PORT está correto (padrão: 3050)
   → Teste com IBExpert: netstat -ano | findstr :3050

❌ "Porta 3000 ou 3001 já em uso"
   → Feche outros terminais do projeto
   → Ou execute: netstat -ano | findstr :3000 para encontrar o processo

"@ -@Amarelo

    Write-Host "`n" + "="*70 -@Azul
}

# ============================================================================
# EXECUÇÃO PRINCIPAL
# ============================================================================

try {
    # Executar ações conforme parâmetro
    switch ($Acao) {
        "Limpar" {
            Limpar-Projeto
        }
        "Empacotar" {
            Empacotar-Projeto
        }
        "Ambos" {
            Limpar-Projeto
            Empacotar-Projeto
        }
    }

    # Gerar instruções
    Gerar-Instruções

    Write-Host "`n✓ Deploy concluído com sucesso!" -@Verde
    Write-Host "`n📦 Arquivo pronto para distribuição: c:\ProjetosNode\APK-Deploy.zip`n" -@Verde

} catch {
    Write-Host "`n✗ Erro durante o deploy: $_" -@Vermelho
    exit 1
}
