# Script PowerShell para iniciar Frontend e Backend com ícone na bandeja

Add-Type -AssemblyName System.Windows.Forms
Add-Type -AssemblyName System.Drawing

# Criar formulário invisível
$form = New-Object System.Windows.Forms.Form
$form.Text = "Scopum - Controle de Ponto"
$form.Icon = [System.Drawing.SystemIcons]::Application
$form.ShowInTaskbar = $false
$form.WindowState = [System.Windows.Forms.FormWindowState]::Minimized
$form.Opacity = 0

# Criar ícone na bandeja
$notifyIcon = New-Object System.Windows.Forms.NotifyIcon
$notifyIcon.Icon = [System.Drawing.SystemIcons]::Application
$notifyIcon.Visible = $true
$notifyIcon.Text = "Scopum - Sistema Rodando"

# Menu de contexto
$contextMenu = New-Object System.Windows.Forms.ContextMenu

# Menu Item 1: Ver Logs do Backend
$item1 = New-Object System.Windows.Forms.MenuItem
$item1.Text = "Ver Logs do Backend"
$item1.Add_Click({
    Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd 'C:\ProjetosNode\APK\BackEnd'" -WindowStyle Normal
})
$contextMenu.MenuItems.Add($item1) | Out-Null

# Menu Item 2: Ver Logs do Frontend
$item2 = New-Object System.Windows.Forms.MenuItem
$item2.Text = "Ver Logs do Frontend"
$item2.Add_Click({
    Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd 'C:\ProjetosNode\APK\frontend'" -WindowStyle Normal
})
$contextMenu.MenuItems.Add($item2) | Out-Null

# Separador
$sep1 = New-Object System.Windows.Forms.MenuItem
$sep1.Text = "-"
$contextMenu.MenuItems.Add($sep1) | Out-Null

# Menu Item 3: Abrir Frontend
$item3 = New-Object System.Windows.Forms.MenuItem
$item3.Text = "Abrir Frontend"
$item3.Add_Click({
    [System.Diagnostics.Process]::Start("http://localhost:3000")
})
$contextMenu.MenuItems.Add($item3) | Out-Null

# Menu Item 4: Abrir Backend (API Docs)
$item4 = New-Object System.Windows.Forms.MenuItem
$item4.Text = "Abrir Backend (API)"
$item4.Add_Click({
    [System.Diagnostics.Process]::Start("http://localhost:3001/api-docs")
})
$contextMenu.MenuItems.Add($item4) | Out-Null

# Separador
$sep2 = New-Object System.Windows.Forms.MenuItem
$sep2.Text = "-"
$contextMenu.MenuItems.Add($sep2) | Out-Null

# Menu Item 5: Sair
$item5 = New-Object System.Windows.Forms.MenuItem
$item5.Text = "Sair"
$item5.Add_Click({
    Stop-Process -Name "node" -Force -ErrorAction SilentlyContinue
    $form.Close()
})
$contextMenu.MenuItems.Add($item5) | Out-Null

$notifyIcon.ContextMenu = $contextMenu

# Iniciar Backend
Write-Host "Iniciando Backend..."
Start-Process -FilePath "powershell.exe" -ArgumentList "-NoExit", "-Command", "cd 'C:\ProjetosNode\APK\BackEnd'; npm start" -WindowStyle Hidden

# Aguardar inicialização
Start-Sleep -Seconds 3

# Iniciar Frontend
Write-Host "Iniciando Frontend..."
Start-Process -FilePath "powershell.exe" -ArgumentList "-NoExit", "-Command", "cd 'C:\ProjetosNode\APK\frontend'; npm start" -WindowStyle Hidden

Write-Host "Sistema iniciado! Clique no icone na bandeja."

# Manter script rodando
[System.Windows.Forms.Application]::Run($form)
