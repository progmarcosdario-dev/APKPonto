' Script VBScript para iniciar Frontend e Backend totalmente invisível
' Este arquivo roda sem mostrar nenhuma janela

Dim objShell, strPath, backendPath, frontendPath, WshShell

Set objShell = CreateObject("WScript.Shell")
Set WshShell = CreateObject("WScript.Shell")

strPath = "C:\ProjetosNode\APK"
backendPath = strPath & "\BackEnd"
frontendPath = strPath & "\frontend"

' Iniciar Backend (totalmente invisível)
objShell.Run "cmd /c cd """ & backendPath & """ && npm start", 0, False

' Aguardar 3 segundos
WScript.Sleep 3000

' Iniciar Frontend (totalmente invisível)
objShell.Run "cmd /c cd """ & frontendPath & """ && npm start", 0, False

' Mensagem de conclusão (opcional - descomentar se quiser)
' WshShell.Popup "Sistema iniciado!", 3, "Scopum", 64
