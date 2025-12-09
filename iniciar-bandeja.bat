@echo off
REM Iniciar Frontend e Backend totalmente invisível
REM Este arquivo pode ser adicionado à inicialização do Windows

cd /d "%~dp0"
start "" wscript.exe "%~dp0iniciar-com-bandeja-invisivel.vbs"

exit /b 0
