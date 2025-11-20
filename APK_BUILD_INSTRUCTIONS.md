# 📱 Instruções para Gerar APK - Scopum Controle de Ponto

## Pré-requisitos ✅

Você já tem instalado:

- ✅ Node.js
- ✅ Android SDK em `D:\Android\Sdk`
- ✅ Prebuild completado

## Opção 1: Build via EAS (Recomendado) ☁️

### Passo 1: Criar Conta Expo

1. Acesse: https://expo.dev
2. Clique em "Sign up"
3. Preencha com:
   - Email: seu_email@gmail.com
   - Username: progmarcosdario
   - Password: ScopumAPK2025!

### Passo 2: Login no EAS CLI

```powershell
cd C:\ProjetosNode\APK\APKMobile
eas login
# Usar as credenciais criadas acima
```

### Passo 3: Gerar APK na Nuvem

```powershell
eas build --platform android --profile preview
```

**Resultado:**

- ✅ Link para download do APK será fornecido
- ✅ APK pronto para instalar no tablet

---

## Opção 2: Build Local com Gradle 💻

### Passo 1: Iniciar Build

```powershell
cd C:\ProjetosNode\APK\APKMobile\android
.\gradlew.bat assembleRelease
```

### Passo 2: Aguardar Conclusão

- ⏱️ Pode levar 5-15 minutos na primeira execução
- ☕ Tempo para tomar café!

### Passo 3: Localizar APK

Após conclusão, o APK estará em:

```
C:\ProjetosNode\APK\APKMobile\android\app\build\outputs\apk\release\app-release.apk
```

---

## Opção 3: Build via Android Studio 📲

Se preferir uma abordagem visual:

1. Abra Android Studio
2. Selecione: **File → Open** → `C:\ProjetosNode\APK\APKMobile`
3. Aguarde o Gradle sincronizar
4. Clique em: **Build → Generate Signed Bundle/APK**
5. Selecione: **APK**
6. Siga o wizard

---

## 📤 Transferir APK para Tablet

### Via USB

```powershell
# Copiar APK para pasta compartilhada
Copy-Item "C:\ProjetosNode\APK\APKMobile\android\app\build\outputs\apk\release\app-release.apk" "E:\" -Force
```

### Via Email/Cloud

1. Enviar arquivo por email
2. Ou fazer upload no Google Drive
3. Baixar no tablet

### Via Airdrop/Compartilhamento Local

- Se na mesma rede WiFi, usar aplicativo como ShareIt

---

## 📱 Instalar no Tablet (Android)

### Passo 1: Habilitar Instalação de Fontes Desconhecidas

1. Abra **Configurações**
2. Vá para **Segurança** (ou **Aplicativos**)
3. Ative **"Permitir instalação de apps de fontes desconhecidas"**

### Passo 2: Instalar APK

1. Localize o arquivo `app-release.apk`
2. Toque no arquivo
3. Clique em **"Instalar"**
4. Aguarde a conclusão

### Passo 3: Executar App

1. Procure por "Scopum" na lista de apps
2. Toque para abrir
3. ✅ Pronto para usar!

---

## 🔧 Troubleshooting

### Build falhou com erro de SDK

```powershell
# Atualizar Android SDK
cd D:\Android\Sdk\tools\bin
.\sdkmanager --list
```

### APK muito grande?

- Normal: 50-150 MB com todas as dependências

### App fecha ao abrir?

- Verifique se o backend está rodando em `http://localhost:3001`
- Para production, configure IP correto no arquivo `api/api.ts`

---

## 📋 Checklist Final

- [ ] Node.js instalado (`node --version`)
- [ ] Android SDK configurado (`echo $env:ANDROID_HOME`)
- [ ] Prebuild completado
- [ ] Backend testado (funciona em http://localhost:3000)
- [ ] APK gerado com sucesso
- [ ] Arquivo transferido para tablet
- [ ] Fontes desconhecidas habilitadas no tablet
- [ ] APK instalado e funcionando

---

## 💡 Dicas Importantes

1. **Para Production**: Configure a URL do backend com IP fixo ou domínio
2. **Versionamento**: Sempre aumente a versão no `app.json` antes de novo build
3. **Assinatura**: Para Play Store, é necessário keystore assinado
4. **Tamanho**: Use `--release` para otimizar tamanho do APK

---

**Precisa de ajuda?** Me chame! 🚀
