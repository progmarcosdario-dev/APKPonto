#!/usr/bin/env pwsh
param(
    [string]$Message = "Processando",
    [scriptblock]$Command
)

Write-Host "`n════════════════════════════════════════════════════════════" -ForegroundColor Cyan
Write-Host "⏳ $Message" -ForegroundColor Yellow
Write-Host "════════════════════════════════════════════════════════════`n" -ForegroundColor Cyan

$spinner = @('⠋','⠙','⠹','⠸','⠼','⠴','⠦','⠧','⠇','⠏')
$i = 0
$job = Start-Job -ScriptBlock $Command

while ($job.State -eq 'Running') {
    Write-Host -NoNewline "`r  $($spinner[$i % $spinner.Length]) $Message..." -ForegroundColor Cyan
    Start-Sleep -Milliseconds 100
    $i++
}

Write-Host "`r" -NoNewline
$results = Receive-Job -Job $job

if ($job.State -eq 'Completed') {
    Write-Host "✅ Concluído com sucesso!`n" -ForegroundColor Green
    $results | ForEach-Object { Write-Host $_ }
} else {
    Write-Host "❌ Erro durante a execução`n" -ForegroundColor Red
    $results | ForEach-Object { Write-Host $_ }
}

Remove-Job -Job $job
