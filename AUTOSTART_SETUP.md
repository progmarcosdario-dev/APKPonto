# Automatizar inicialização do APK Ponto no Windows

## 🚀 Opção 1: Inicialização Rápida Manual

### Scripts criados:

1. **start-all.bat** - Inicia backend E frontend

   ```bash
   C:\ProjetosNode\APK\start-all.bat
   ```

2. **start-backend.bat** - Inicia apenas backend

   ```bash
   C:\ProjetosNode\APK\start-backend.bat
   ```

3. **start-frontend.bat** - Inicia apenas frontend
   ```bash
   C:\ProjetosNode\APK\start-frontend.bat
   ```

---

## 🔧 Opção 2: Inicialização Automática no Boot

### Método 1: Criar Atalho na Pasta Startup (Recomendado - Mais Simples)

1. Abra o Windows Explorer
2. Navegue para: `C:\Users\[SeuUsuário]\AppData\Roaming\Microsoft\Windows\Start Menu\Programs\Startup`
3. Crie um atalho para `C:\ProjetosNode\APK\start-all.bat`
   - Clique direito → Nova → Atalho
   - Cole o caminho: `C:\ProjetosNode\APK\start-all.bat`
   - Nome: "APK Ponto"

**Resultado**: Ao ligar o PC, os servidores iniciarão automaticamente em 2 janelas cmd

---

### Método 2: Usar Task Scheduler (Mais Controle)

1. Abra **Agendador de Tarefas** (Task Scheduler)

   - Win + R → `taskschd.msc`

2. Clique em **Criar Tarefa**

3. Configure:

   - **Nome**: "Iniciar APK Ponto"
   - **Descrição**: "Inicia Backend e Frontend automaticamente"
   - **Aba Geral**: Marque "Executar quer o usuário esteja ou não conectado"

4. **Aba Gatilhos**:

   - Clique em "Novo"
   - **Início da tarefa**: "Na inicialização"
   - Clique OK

5. **Aba Ações**:

   - Clique em "Novo"
   - **Ação**: "Iniciar um programa"
   - **Programa/script**: `C:\ProjetosNode\APK\start-all.bat`
   - Clique OK

6. Clique em "OK" para salvar

**Resultado**: Servidores iniciarão automaticamente quando o PC ligar

---

### Método 3: PowerShell Script (Mais Avançado)

Se preferir um controle mais fino, crie um arquivo PS1:

```powershell
# start-apk.ps1
$BackendPath = "C:\ProjetosNode\APK\BackEnd"
$FrontendPath = "C:\ProjetosNode\APK\frontend"

# Inicia Backend
Start-Process -FilePath "cmd.exe" -ArgumentList "/k", "cd /d $BackendPath && npm start" `
    -WindowStyle Normal

# Aguarda 5 segundos
Start-Sleep -Seconds 5

# Inicia Frontend
Start-Process -FilePath "cmd.exe" -ArgumentList "/k", "cd /d $FrontendPath && npm start" `
    -WindowStyle Normal

Write-Host "APK Ponto iniciado!"
Write-Host "Backend: http://localhost:3001"
Write-Host "Frontend: http://localhost:3000"
```

E execute no Task Scheduler:

- **Programa**: `powershell.exe`
- **Argumentos**: `-NoProfile -ExecutionPolicy Bypass -File "C:\ProjetosNode\APK\start-apk.ps1"`

---

## ✅ Recomendação

**Use o Método 1 (Atalho na Startup)** - É o mais simples e funciona perfeitamente!

### Passos rápidos:

1. Crie atalho para `C:\ProjetosNode\APK\start-all.bat`
2. Mova para a Pasta Startup
3. Pronto! No próximo boot, tudo iniciará automaticamente

---

## 📝 Verificação

Após reiniciar o PC:

- [ ] Backend inicia em http://localhost:3001
- [ ] Frontend inicia em http://localhost:3000
- [ ] Duas janelas cmd aparecem

---

## 🛑 Para Desativar

Se quiser desativar a inicialização automática:

- **Método 1**: Delete o atalho da pasta Startup
- **Método 2**: Desabilite a tarefa no Task Scheduler
- **Método 3**: Delete o arquivo PS1
